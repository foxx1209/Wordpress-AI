/**
 * Dev Inspector WebSocket Server
 * ViteプラグインのロジックをスタンドアロンのWebSocketサーバーに変換
 */
const fs = require("fs");
const path = require("path");
const { globSync } = require("glob");
const { exec } = require("child_process");
const { WebSocketServer } = require("ws");

function startServer(options = {}) {
  const { projectRoot, port = 54321, scssDir = "", htmlDirs = [], editor = "antigravity", remMode = "css-var" } = options;

  // エディタコマンドのマッピング
  const editorCommands = {
    antigravity: (target) => `/Applications/Antigravity.app/Contents/Resources/app/bin/antigravity -r -g "${target}"`,
    cursor: (target) => `cursor -g "${target}"`,
    code: (target) => `code -g "${target}"`,
  };
  const getEditorCmd = editorCommands[editor] || editorCommands.antigravity;

  // SCSSファイルのルートを自動検出
  function findStylesRoot() {
    if (scssDir) return path.resolve(projectRoot, scssDir);
    // 一般的なSCSSディレクトリを検索
    const candidates = [
      "src/assets/styles",
      "src/styles",
      "assets/styles",
      "styles",
      "scss",
      "src/scss",
      "wp-content/themes",
      ".",
    ];
    for (const c of candidates) {
      const p = path.resolve(projectRoot, c);
      if (fs.existsSync(p)) {
        const scssFiles = globSync("**/*.{css,scss}", { cwd: p, absolute: true });
        if (scssFiles.length > 0) {
          console.log(`  📂 SCSS root: ${p} (${scssFiles.length} files)`);
          return p;
        }
      }
    }
    console.log(`  📂 SCSS root: ${projectRoot} (fallback)`);
    return projectRoot;
  }

  // HTMLファイルを検索
  function findHtmlFiles() {
    const dirs = htmlDirs.length > 0
      ? htmlDirs.map(d => path.resolve(projectRoot, d))
      : [projectRoot];
    const files = [];
    for (const dir of dirs) {
      if (fs.existsSync(dir)) {
        files.push(...globSync("**/*.html", { cwd: dir, absolute: true, ignore: ["node_modules/**", "dist/**", "vendor/**"] }));
        files.push(...globSync("**/*.php", { cwd: dir, absolute: true, ignore: ["node_modules/**", "dist/**", "vendor/**"] }));
      }
    }
    return files;
  }

  const stylesRoot = findStylesRoot();

  function getScssFiles() {
    return globSync("**/*.{css,scss}", { cwd: stylesRoot, absolute: true });
  }

  // WebSocket サーバー起動
  const wss = new WebSocketServer({ port });

  wss.on("connection", (ws) => {
    console.log("  🔌 Inspector connected");

    // 接続直後にサーバー設定をクライアントに送信
    send(ws, "inspector:config", { remMode });

    ws.on("message", (raw) => {
      let msg;
      try { msg = JSON.parse(raw); } catch { return; }
      const { type, data } = msg;

      switch (type) {
        case "inspector:save":
          handleSave(ws, data);
          break;
        case "inspector:get-props":
          handleGetProps(ws, data);
          break;
        case "inspector:delete-prop":
          handleDeleteProp(ws, data);
          break;
        case "inspector:add-prop":
          handleAddProp(ws, data);
          break;
        case "inspector:add-class":
          handleAddClass(ws, data);
          break;
        case "inspector:open-file":
          handleOpenFile(data);
          break;
        case "inspector:open-html":
          handleOpenHtml(ws, data);
          break;
        case "inspector:insert-br":
          handleInsertBr(ws, data);
          break;
        case "inspector:update-text":
          handleUpdateText(ws, data);
          break;
        case "inspector:get-html":
          handleGetHtml(ws, data);
          break;
        default:
          break;
      }
    });

    ws.on("close", () => {
      console.log("  🔌 Inspector disconnected");
    });
  });

  function send(ws, type, data) {
    if (ws.readyState === 1) {
      ws.send(JSON.stringify({ type, data }));
    }
  }

  // === ハンドラ ===

  function handleSave(ws, data) {
    const { changes } = data;
    if (!changes || !Array.isArray(changes) || changes.length === 0) {
      send(ws, "inspector:save-result", { success: false, message: "変更がありません" });
      return;
    }

    const scssFiles = getScssFiles();
    const results = [];

    for (const change of changes) {
      const { selector, property, value } = change;
      const classMatch = selector.match(/\.([a-zA-Z0-9_-]+)/);
      if (!classMatch) {
        results.push({ selector, property, success: false, message: "クラス名が見つかりません" });
        continue;
      }
      const className = classMatch[1];
      const pseudo = change.pseudo || null; // 'before' or 'after'
      const shorthandPart = change.shorthandPart || null; // 'start' or 'end'
      const nestedTag = change.nestedTag || null; // 'span', 'a', etc.
      const result = findAndReplace(scssFiles, className, property, value, change.mq, pseudo, shorthandPart, nestedTag);
      results.push({ selector, property, ...result });
    }

    const successCount = results.filter((r) => r.success).length;
    send(ws, "inspector:save-result", {
      success: successCount > 0,
      message: `${successCount}/${results.length} 件を保存しました`,
      results,
    });
    console.log(`  💾 Save: ${successCount}/${results.length}`);
    results.forEach(r => {
      if (r.success) console.log(`    ✅ ${r.file}: ${r.property}: ${r.oldValue} → ${r.newValue}`);
      else console.log(`    ❌ ${r.selector || "?"} ${r.property}: ${r.message}`);
    });
  }

  function handleGetProps(ws, data) {
    const { className, nestedTag } = data;
    if (!className) { send(ws, "inspector:props-result", { props: [] }); return; }

    const scssFiles = getScssFiles();
    const bemPart = className.includes("__") ? className.split("__").pop() : null;

    for (const scssFile of scssFiles) {
      const content = fs.readFileSync(scssFile, "utf-8");
      const patterns = [new RegExp(`\\.${escapeRegex(className)}\\s*\\{`, "g")];
      if (bemPart) patterns.push(new RegExp(`&__${escapeRegex(bemPart)}\\s*\\{`, "g"));

      for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const block = extractBlock(content, match.index);
          if (!block) continue;

          let targetContent;
          if (nestedTag) {
            // ネストされたタグブロック（例: span { ... }）を検索
            const nestedRegex = new RegExp(`(?:^|\\n)(\\s*)${escapeRegex(nestedTag)}\\s*\\{`, "g");
            const nestedMatch = nestedRegex.exec(block.text);
            if (!nestedMatch) continue;
            const nestedBlock = extractBlock(block.text, nestedMatch.index + (nestedMatch[0].startsWith("\n") ? 1 : 0));
            if (!nestedBlock) continue;
            targetContent = getTopLevelContent(nestedBlock.text);
          } else {
            targetContent = getTopLevelContent(block.text);
          }

          const propRegex = /([\w-]+)\s*:\s*([^;]+);/g;
          const props = [];
          let pm;
          while ((pm = propRegex.exec(targetContent)) !== null) {
            const propName = pm[1].trim();
            const propValue = pm[2].trim();
            if (!propName.startsWith("$") && !propName.startsWith("@") && !propName.startsWith("//")) {
              props.push({ property: propName, scssValue: propValue });
            }
          }

          // @include mq("md") 内のプロパティ
          const mqProps = [];
          const mqRegex = /@include\s+mq\s*\(\s*["']md["']\s*\)\s*\{/g;
          let mqMatch2;
          while ((mqMatch2 = mqRegex.exec(block.text)) !== null) {
            let depth = 0, mqStart = -1, mqEnd = -1;
            for (let i = mqMatch2.index + mqMatch2[0].length - 1; i < block.text.length; i++) {
              if (block.text[i] === "{") { if (depth === 0) mqStart = i; depth++; }
              else if (block.text[i] === "}") { depth--; if (depth === 0) { mqEnd = i + 1; break; } }
            }
            if (mqStart !== -1 && mqEnd !== -1) {
              const mqBlock = block.text.substring(mqStart, mqEnd);
              const mqPropRegex = /([\w-]+)\s*:\s*([^;]+);/g;
              let mpm;
              while ((mpm = mqPropRegex.exec(mqBlock)) !== null) {
                const pn = mpm[1].trim();
                const pv = mpm[2].trim();
                if (!pn.startsWith("$") && !pn.startsWith("@") && !pn.startsWith("//")) {
                  mqProps.push({ property: pn, scssValue: pv });
                }
              }
            }
          }

          // 疑似要素（&::before, &::after）のプロパティ抽出
          const pseudoProps = {};
          const pseudoMqProps = {};
          const pseudoTypes = ["before", "after"];
          for (const pseudo of pseudoTypes) {
            const pseudoRegex = new RegExp(`&::${pseudo}\\s*\\{`, "g");
            let pseudoMatch;
            while ((pseudoMatch = pseudoRegex.exec(block.text)) !== null) {
              const pseudoBlock = extractBlock(block.text, pseudoMatch.index);
              if (!pseudoBlock) continue;
              const pseudoContent = getTopLevelContent(pseudoBlock.text);
              const pRegex = /([\w-]+)\s*:\s*([^;]+);/g;
              const pProps = [];
              let pp;
              while ((pp = pRegex.exec(pseudoContent)) !== null) {
                const pn = pp[1].trim();
                const pv = pp[2].trim();
                if (!pn.startsWith("$") && !pn.startsWith("@") && !pn.startsWith("//")) {
                  pProps.push({ property: pn, scssValue: pv });
                }
              }
              if (pProps.length > 0) {
                pseudoProps[pseudo] = pProps;
              }

              // 疑似要素内の @include mq("md") プロパティ
              const pseudoMqRegex = /@include\s+mq\s*\(\s*["']md["']\s*\)\s*\{/g;
              let pseudoMqMatch;
              while ((pseudoMqMatch = pseudoMqRegex.exec(pseudoBlock.text)) !== null) {
                let depth = 0, mqStart = -1, mqEnd = -1;
                for (let i = pseudoMqMatch.index + pseudoMqMatch[0].length - 1; i < pseudoBlock.text.length; i++) {
                  if (pseudoBlock.text[i] === "{") { if (depth === 0) mqStart = i; depth++; }
                  else if (pseudoBlock.text[i] === "}") { depth--; if (depth === 0) { mqEnd = i + 1; break; } }
                }
                if (mqStart !== -1 && mqEnd !== -1) {
                  const mqBlock = pseudoBlock.text.substring(mqStart, mqEnd);
                  const mqPropRegex = /([\w-]+)\s*:\s*([^;]+);/g;
                  const mqPProps = [];
                  let mpm;
                  while ((mpm = mqPropRegex.exec(mqBlock)) !== null) {
                    const pn = mpm[1].trim();
                    const pv = mpm[2].trim();
                    if (!pn.startsWith("$") && !pn.startsWith("@") && !pn.startsWith("//")) {
                      mqPProps.push({ property: pn, scssValue: pv });
                    }
                  }
                  if (mqPProps.length > 0) {
                    pseudoMqProps[pseudo] = mqPProps;
                  }
                }
              }
            }
          }

          if (props.length > 0 || mqProps.length > 0 || Object.keys(pseudoProps).length > 0 || Object.keys(pseudoMqProps).length > 0) {
            const beforeBlock = content.substring(0, block.start);
            const blockLine = beforeBlock.split("\n").length;
            const expandedProps = expandLogicalShorthands(props);
            const expandedMqProps = expandLogicalShorthands(mqProps);
            send(ws, "inspector:props-result", { props: expandedProps, mqProps: expandedMqProps, pseudoProps, pseudoMqProps, className, scssFile, scssLine: blockLine });
            return;
          }
        }
      }
    }
    send(ws, "inspector:props-result", { props: [], className });
  }

  function handleDeleteProp(ws, data) {
    const { className, property } = data;
    if (!className || !property) {
      send(ws, "inspector:delete-result", { success: false, message: "パラメータ不足" });
      return;
    }
    const scssFiles = getScssFiles();
    const bemPart = className.includes("__") ? className.split("__").pop() : null;

    for (const scssFile of scssFiles) {
      let content = fs.readFileSync(scssFile, "utf-8");
      const patterns = [new RegExp(`\\.${escapeRegex(className)}\\s*\\{`, "g")];
      if (bemPart) patterns.push(new RegExp(`&__${escapeRegex(bemPart)}\\s*\\{`, "g"));

      for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const block = extractBlock(content, match.index);
          if (!block) continue;
          const propLineRegex = new RegExp(`^[ \\t]*${escapeRegex(property)}\\s*:[^;]+;[ \\t]*\\n?`, "m");
          const topLevel = getTopLevelContent(block.text);
          if (!propLineRegex.test(topLevel)) continue;
          const newBlockText = block.text.replace(propLineRegex, "");
          const newContent = content.substring(0, block.start) + newBlockText + content.substring(block.end);
          fs.writeFileSync(scssFile, newContent, "utf-8");
          const relPath = path.relative(projectRoot, scssFile);
          console.log(`  🗑️ Delete: ${relPath}: ${className} → ${property}`);
          send(ws, "inspector:delete-result", { success: true, message: `${property} を削除しました`, file: relPath });
          return;
        }
      }
    }
    send(ws, "inspector:delete-result", { success: false, message: `${property} が見つかりません` });
  }

  function handleAddProp(ws, data) {
    const { className, property, value, mq } = data;
    if (!className || !property) {
      send(ws, "inspector:add-result", { success: false, message: "パラメータ不足" });
      return;
    }
    const scssFiles = getScssFiles();
    const bemPart = className.includes("__") ? className.split("__").pop() : null;

    for (const scssFile of scssFiles) {
      let content = fs.readFileSync(scssFile, "utf-8");
      const patterns = [new RegExp(`\\.${escapeRegex(className)}\\s*\\{`, "g")];
      if (bemPart) patterns.push(new RegExp(`&__${escapeRegex(bemPart)}\\s*\\{`, "g"));

      for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const block = extractBlock(content, match.index);
          if (!block) continue;
          const lines = block.text.split("\n");
          let indent = "  ";
          for (const line of lines) {
            const m = line.match(/^(\s+)\S/);
            if (m) { indent = m[1]; break; }
          }

          if (mq) {
            // SP用: @include mq("md") ブロック内に挿入
            const mqRegex = /@include\s+mq\s*\(\s*["']md["']\s*\)\s*\{/g;
            const mqMatch2 = mqRegex.exec(block.text);
            if (mqMatch2) {
              // 既存mqブロック内の末尾（}の直前）に挿入
              let depth = 0, mqEnd = -1;
              for (let i = mqMatch2.index + mqMatch2[0].length - 1; i < block.text.length; i++) {
                if (block.text[i] === "{") depth++;
                else if (block.text[i] === "}") { depth--; if (depth === 0) { mqEnd = i; break; } }
              }
              if (mqEnd !== -1) {
                const mqIndent = indent + "  ";
                const before = block.text.substring(0, mqEnd);
                const needsNewline = !before.endsWith("\n");
                const newLine = (needsNewline ? "\n" : "") + `${mqIndent}${property}: ${value};\n${indent}`;
                const newBlockText = before + newLine + block.text.substring(mqEnd);
                const newContent = content.substring(0, block.start) + newBlockText + content.substring(block.end);
                fs.writeFileSync(scssFile, newContent, "utf-8");
                const relPath = path.relative(projectRoot, scssFile);
                console.log(`  ➕ Add(SP): ${relPath}: ${className} → ${property}: ${value}`);
                send(ws, "inspector:add-result", { success: true, message: `${property}: ${value} を追加 (SP)`, file: relPath });
                return;
              }
            } else {
              // mqブロックがないなら新規作成
              const insertPos = block.text.lastIndexOf("}");
              const before = block.text.substring(0, insertPos);
              const needsNewline = !before.endsWith("\n");
              const mqIndent = indent + "  ";
              const newMqBlock = (needsNewline ? "\n" : "") + `\n${indent}@include mq("md") {\n${mqIndent}${property}: ${value};\n${indent}}\n`;
              const newBlockText = before + newMqBlock + block.text.substring(insertPos);
              const newContent = content.substring(0, block.start) + newBlockText + content.substring(block.end);
              fs.writeFileSync(scssFile, newContent, "utf-8");
              const relPath = path.relative(projectRoot, scssFile);
              console.log(`  ➕ Add(SP new mq): ${relPath}: ${className} → ${property}: ${value}`);
              send(ws, "inspector:add-result", { success: true, message: `${property}: ${value} を追加 (SP・mq新規作成)`, file: relPath });
              return;
            }
          } else {
            // PC用: 通常の挿入（mqブロックの前に）
            const mqMatch = block.text.match(/\n(\s*@include\s+mq\s*\()/);
            let insertPos;
            if (mqMatch) {
              insertPos = block.text.indexOf(mqMatch[0]);
            } else {
              insertPos = block.text.lastIndexOf("}");
            }
            const before = block.text.substring(0, insertPos);
            const needsNewline = before.length > 0 && !before.endsWith("\n");
            const newLine = (needsNewline ? "\n" : "") + `${indent}${property}: ${value};\n`;
            const newBlockText = before + newLine + block.text.substring(insertPos);
            const newContent = content.substring(0, block.start) + newBlockText + content.substring(block.end);
            fs.writeFileSync(scssFile, newContent, "utf-8");
            const relPath = path.relative(projectRoot, scssFile);
            console.log(`  ➕ Add: ${relPath}: ${className} → ${property}: ${value}`);
            send(ws, "inspector:add-result", { success: true, message: `${property}: ${value} を追加`, file: relPath });
            return;
          }
        }
      }
    }
    // クラスがSCSSに存在しない場合、同じBEMブロックのSCSSファイルを見つけて新規作成
    // ベースクラス候補を生成: item2→item, item--accent→item, featureText3→featureText
    const baseCandidates = [];
    // 1. 末尾の数字を除去
    const noDigits = className.replace(/\d+$/, '');
    if (noDigits !== className) baseCandidates.push(noDigits);
    // 2. --modifier を除去
    const noMod = className.replace(/--[^_]+$/, '');
    if (noMod !== className) baseCandidates.push(noMod);
    // 3. BEMブロックプレフィックス（p-facility__card → p-facility）で同じファイル内の任意のクラスを探す
    const bemBlock = className.split("__")[0]; // p-facility

    for (const scssFile of scssFiles) {
      let content = fs.readFileSync(scssFile, "utf-8");

      // まずベースクラス候補で検索
      for (const base of baseCandidates) {
        const basePattern = new RegExp(`\\.${escapeRegex(base)}\\s*\\{`, "g");
        let match = basePattern.exec(content);
        if (match) {
          const block = extractBlock(content, match.index);
          if (!block) continue;
          const lineStart = content.lastIndexOf("\n", match.index);
          const lineIndent = lineStart >= 0 ? content.substring(lineStart + 1, match.index).match(/^(\s*)/)[1] : "";
          const propIndent = lineIndent + "  ";
          let newBlock;
          if (mq) {
            const mqIndent = propIndent + "  ";
            newBlock = `\n\n${lineIndent}.${className} {\n\n${propIndent}@include mq("md") {\n${mqIndent}${property}: ${value};\n${propIndent}}\n${lineIndent}}`;
          } else {
            newBlock = `\n\n${lineIndent}.${className} {\n${propIndent}${property}: ${value};\n${lineIndent}}`;
          }
          const insertPos = block.end;
          const newContent = content.substring(0, insertPos) + newBlock + content.substring(insertPos);
          fs.writeFileSync(scssFile, newContent, "utf-8");
          const relPath = path.relative(projectRoot, scssFile);
          console.log(`  ➕ AutoCreate+Add: ${relPath}: .${className} { ${property}: ${value} }`);
          send(ws, "inspector:add-result", { success: true, message: `${className} を作成 + ${property}: ${value} を追加`, file: relPath });
          return;
        }
      }

      // ベースが見つからない場合、BEMブロックプレフィックスでファイルを特定
      const blockPattern = new RegExp(`\\.${escapeRegex(bemBlock)}[_\\s{]`);
      if (blockPattern.test(content)) {
        // このファイル内の最後のBEMブロッククラスの後に挿入
        const allClassPattern = new RegExp(`\\.${escapeRegex(bemBlock)}[\\w-]*\\s*\\{`, "g");
        let lastMatch = null;
        let m;
        while ((m = allClassPattern.exec(content)) !== null) {
          lastMatch = m;
        }
        if (lastMatch) {
          const block = extractBlock(content, lastMatch.index);
          if (block) {
            const lineStart = content.lastIndexOf("\n", lastMatch.index);
            const lineIndent = lineStart >= 0 ? content.substring(lineStart + 1, lastMatch.index).match(/^(\s*)/)[1] : "";
            const propIndent = lineIndent + "  ";
            let newBlock;
            if (mq) {
              const mqIndent = propIndent + "  ";
              newBlock = `\n\n${lineIndent}.${className} {\n\n${propIndent}@include mq("md") {\n${mqIndent}${property}: ${value};\n${propIndent}}\n${lineIndent}}`;
            } else {
              newBlock = `\n\n${lineIndent}.${className} {\n${propIndent}${property}: ${value};\n${lineIndent}}`;
            }
            const insertPos = block.end;
            const newContent = content.substring(0, insertPos) + newBlock + content.substring(insertPos);
            fs.writeFileSync(scssFile, newContent, "utf-8");
            const relPath = path.relative(projectRoot, scssFile);
            console.log(`  ➕ AutoCreate+Add(BEM): ${relPath}: .${className} { ${property}: ${value} }`);
            send(ws, "inspector:add-result", { success: true, message: `${className} を作成 + ${property}: ${value} を追加`, file: relPath });
            return;
          }
        }
      }
    }
    send(ws, "inspector:add-result", { success: false, message: `${className} が見つかりません` });
  }

  function handleAddClass(ws, data) {
    const { oldClassList, newClass, matchIndex = 0 } = data;
    if (!oldClassList || !newClass) {
      send(ws, "inspector:add-class-result", { success: false, message: "パラメータ不足" });
      return;
    }

    const htmlFiles = findHtmlFiles();
    const firstClass = oldClassList.split(/\s+/)[0];
    let globalCount = 0;

    for (const htmlFile of htmlFiles) {
      let content = fs.readFileSync(htmlFile, "utf-8");
      const classRegex = new RegExp(`class="([^"]*\\b${escapeRegex(firstClass)}\\b[^"]*)"`, "g");
      let match;
      let newContent = content;
      let offset = 0;
      let found = false;

      while ((match = classRegex.exec(content)) !== null) {
        if (globalCount === matchIndex) {
          const oldAttr = match[0];
          const oldClasses = match[1];
          if (oldClasses.includes(newClass)) {
            send(ws, "inspector:add-class-result", { success: false, message: "既に存在: " + newClass });
            return;
          }
          const newAttr = `class="${oldClasses} ${newClass}"`;
          const pos = match.index + offset;
          newContent = newContent.substring(0, pos) + newAttr + newContent.substring(pos + oldAttr.length);
          offset += newAttr.length - oldAttr.length;
          found = true;
          break;
        }
        globalCount++;
      }

      if (found) {
        fs.writeFileSync(htmlFile, newContent, "utf-8");
        const relPath = path.relative(projectRoot, htmlFile);
        console.log(`  🏷️ AddClass: ${relPath}: ${firstClass}[${matchIndex}] → +${newClass}`);

        // SCSSブロックも自動生成
        const scssResult = addScssBlock(firstClass, newClass);
        const scssMsg = scssResult ? ` + SCSS作成` : "";

        send(ws, "inspector:add-class-result", { success: true, message: `${newClass} を追加${scssMsg}`, file: relPath });
        return;
      }
    }
    send(ws, "inspector:add-class-result", { success: false, message: "該当要素が見つかりません" });
  }

  // 元のクラスのSCSSブロック直下に新しいクラスの空ブロックを挿入
  function addScssBlock(originalClass, newClass) {
    const scssFiles = getScssFiles();
    const bemPart = originalClass.includes("__") ? originalClass.split("__").pop() : null;
    const newBemPart = newClass.includes("__") ? newClass.split("__").pop() : null;

    for (const scssFile of scssFiles) {
      let content = fs.readFileSync(scssFile, "utf-8");
      const patterns = [new RegExp(`\\.${escapeRegex(originalClass)}\\s*\\{`, "g")];
      if (bemPart) patterns.push(new RegExp(`&__${escapeRegex(bemPart)}\\s*\\{`, "g"));

      for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const block = extractBlock(content, match.index);
          if (!block) continue;

          // 既に新クラスのブロックが存在するか確認
          const newClassPatterns = [
            new RegExp(`\\.${escapeRegex(newClass)}\\s*\\{`),
          ];
          if (newBemPart) newClassPatterns.push(new RegExp(`&__${escapeRegex(newBemPart)}\\s*\\{`));
          const alreadyExists = newClassPatterns.some(p => p.test(content));
          if (alreadyExists) {
            console.log(`  ⏭️ SCSS already exists: ${newClass}`);
            return false;
          }

          // インデントを検出
          const lineStart = content.lastIndexOf("\n", match.index);
          const lineIndent = lineStart >= 0 ? content.substring(lineStart + 1, match.index).match(/^(\s*)/)[1] : "";

          // BEM記法で挿入する場合（&__part）
          let newBlockSelector;
          if (bemPart && match[0].includes("&__")) {
            newBlockSelector = `&__${newBemPart}`;
          } else {
            newBlockSelector = `.${newClass}`;
          }

          // 元ブロックの直後に挿入
          const insertPos = block.end;
          const newBlock = `\n\n${lineIndent}${newBlockSelector} {\n${lineIndent}}`;
          const newContent = content.substring(0, insertPos) + newBlock + content.substring(insertPos);
          fs.writeFileSync(scssFile, newContent, "utf-8");
          const relPath = path.relative(projectRoot, scssFile);
          console.log(`  📝 SCSS block created: ${relPath}: ${newBlockSelector}`);
          return true;
        }
      }
    }
    return false;
  }

  function handleOpenFile(data) {
    const { file, line } = data;
    if (!file) return;
    const target = line ? `${file}:${line}` : file;
    exec(getEditorCmd(target), (err) => {
      if (err) console.log("  ⚠️ エディタが開けません:", err.message);
    });
    console.log(`  📂 Open: ${target}`);
  }

  function handleOpenHtml(ws, data) {
    const { className, src } = data;
    const htmlFiles = findHtmlFiles();

    // 検索キーワードのリストを作る（クラス名、srcパス）
    const searchTerms = [];
    if (className) searchTerms.push(className);
    if (src) {
      // srcのファイル名部分で検索（パスが変わっても見つかるように）
      const srcFilename = src.split("/").pop();
      if (srcFilename) searchTerms.push(srcFilename);
      // フルパスでも検索
      searchTerms.push(src);
    }

    if (searchTerms.length === 0) return;

    for (const term of searchTerms) {
      for (const htmlFile of htmlFiles) {
        const content = fs.readFileSync(htmlFile, "utf-8");
        const idx = content.indexOf(term);
        if (idx === -1) continue;
        const line = content.substring(0, idx).split("\n").length;
        const target = `${htmlFile}:${line}`;
        exec(getEditorCmd(target), (err) => {
          if (err) console.log("  ⚠️ エディタが開けません:", err.message);
        });
        console.log(`  📂 OpenHTML: ${htmlFile}:${line}`);
        return;
      }
    }
    console.log(`  ⚠️ OpenHTML: 該当なし (terms: ${searchTerms.join(", ")})`);
  }

  function handleInsertBr(ws, data) {
    const { className, textContent, position, brType, matchIndex = 0 } = data;
    console.log(`  🔍 InsertBR request: class="${className}", pos=${position}, brType="${brType}", matchIndex=${matchIndex}`);
    console.log(`  🔍 textContent: "${textContent ? textContent.substring(0, 50) : 'null'}..."`);
    if (!textContent || position < 0) {
      send(ws, "inspector:insert-br-result", { success: false, message: "パラメータ不足" });
      return;
    }

    // brタグを生成
    let brTag;
    switch (brType) {
      case "u-sp": brTag = '<br class="u-sp" />'; break;
      case "u-pc": brTag = '<br class="u-pc" />'; break;
      default: brTag = '<br />'; break;
    }

    const htmlFiles = findHtmlFiles();
    const beforeText = textContent.substring(0, position);
    const afterText = textContent.substring(position);
    console.log(`  🔍 before: "${beforeText.slice(-8)}", after: "${afterText.slice(0, 8)}"`);

    // matchIndex番目のclassNameの出現位置を特定して、その周辺のみ検索
    let globalCount = 0;
    for (const htmlFile of htmlFiles) {
      let content = fs.readFileSync(htmlFile, "utf-8");

      // classNameで要素の範囲を絞る
      if (className) {
        if (!content.includes(className)) continue;
        // matchIndex番目の出現箇所を見つける
        let classPos = -1;
        let searchFrom = 0;
        while (searchFrom < content.length) {
          const idx = content.indexOf(className, searchFrom);
          if (idx === -1) break;
          if (globalCount === matchIndex) {
            classPos = idx;
            break;
          }
          globalCount++;
          searchFrom = idx + 1;
        }
        if (classPos === -1) continue;
      }
      console.log(`  🔍 Searching in: ${path.relative(projectRoot, htmlFile)}`);

      // テキスト前後の文字列を使って、HTMLタグをまたいで検索
      // 前テキストの末尾5文字 + 後テキストの先頭5文字で挿入位置を特定
      const beforeChunk = beforeText.slice(-8);
      const afterChunk = afterText.slice(0, 8);

      if (beforeChunk && afterChunk) {
        // 前後の文字列がある場合：その間にBRを挿入
        const beforeEsc = beforeChunk.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s*(?:<[^>]*>\\s*)*");
        const afterEsc = afterChunk.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s*(?:<[^>]*>\\s*)*");
        const pattern = new RegExp("(" + beforeEsc + ")(\\s*)(" + afterEsc + ")");
        const match = pattern.exec(content);
        if (match) {
          const insertAt = match.index + match[1].length;
          const skipWhitespace = match[2].length;
          const newContent = content.substring(0, insertAt) + brTag + content.substring(insertAt + skipWhitespace);
          fs.writeFileSync(htmlFile, newContent, "utf-8");
          const relPath = path.relative(projectRoot, htmlFile);
          console.log(`  🔄 InsertBR: ${relPath}: "${beforeChunk}|${afterChunk}" → ${brTag}`);
          send(ws, "inspector:insert-br-result", { success: true, message: `${brTag} を挿入しました` });
          return;
        }
      } else if (beforeChunk) {
        // テキスト末尾にBR挿入
        const beforeEsc = beforeChunk.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s*(?:<[^>]*>\\s*)*");
        const pattern = new RegExp("(" + beforeEsc + ")");
        const match = pattern.exec(content);
        if (match) {
          const insertAt = match.index + match[1].length;
          const newContent = content.substring(0, insertAt) + brTag + content.substring(insertAt);
          fs.writeFileSync(htmlFile, newContent, "utf-8");
          const relPath = path.relative(projectRoot, htmlFile);
          console.log(`  🔄 InsertBR: ${relPath}: end of "${beforeChunk}" → ${brTag}`);
          send(ws, "inspector:insert-br-result", { success: true, message: `${brTag} を挿入しました` });
          return;
        }
      } else if (afterChunk) {
        // テキスト先頭にBR挿入
        const afterEsc = afterChunk.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s*(?:<[^>]*>\\s*)*");
        const pattern = new RegExp("(" + afterEsc + ")");
        const match = pattern.exec(content);
        if (match) {
          const insertAt = match.index;
          const newContent = content.substring(0, insertAt) + brTag + content.substring(insertAt);
          fs.writeFileSync(htmlFile, newContent, "utf-8");
          const relPath = path.relative(projectRoot, htmlFile);
          console.log(`  🔄 InsertBR: ${relPath}: before "${afterChunk}" → ${brTag}`);
          send(ws, "inspector:insert-br-result", { success: true, message: `${brTag} を挿入しました` });
          return;
        }
      }
    }
    send(ws, "inspector:insert-br-result", { success: false, message: "該当テキストが見つかりません" });
  }

  // HTML内テキスト検索用エスケープ（正規表現の特殊文字をエスケープ）
  function escapeRegex2(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s*(?:<[^>]*>\\s*)*");
  }

  function handleUpdateText(ws, data) {
    const { className, oldHtml, newHtml, matchIndex = 0 } = data;
    if (!oldHtml || newHtml === undefined) {
      send(ws, "inspector:update-text-result", { success: false, message: "パラメータ不足" });
      return;
    }

    const htmlFiles = findHtmlFiles();
    let globalCount = 0;

    for (const htmlFile of htmlFiles) {
      let content = fs.readFileSync(htmlFile, "utf-8");

      // classNameでファイルを絞り、matchIndex番目の出現位置以降で検索
      if (className && content.indexOf(className) === -1) continue;

      let searchAfter = 0;
      if (className) {
        let searchFrom = 0;
        while (searchFrom < content.length) {
          const classIdx = content.indexOf(className, searchFrom);
          if (classIdx === -1) break;
          if (globalCount === matchIndex) {
            searchAfter = classIdx;
            break;
          }
          globalCount++;
          searchFrom = classIdx + 1;
        }
        if (globalCount < matchIndex) continue;
      }

      // 1. まず直接マッチを試みる（従来通り）
      const idx = content.indexOf(oldHtml, searchAfter);
      if (idx !== -1) {
        const newContent = content.substring(0, idx) + newHtml + content.substring(idx + oldHtml.length);
        fs.writeFileSync(htmlFile, newContent, "utf-8");
        const relPath = path.relative(projectRoot, htmlFile);
        console.log(`  ✏️ UpdateHTML (exact): ${relPath}`);
        send(ws, "inspector:update-text-result", { success: true, message: "HTMLを更新しました" });
        return;
      }

      // 2. インデント差異を吸収して検索
      // oldHtmlの行を正規化（各行のleading whitespaceを除去）して検索パターンを作成
      const oldLines = oldHtml.split("\n");
      const normalizedOld = oldLines.map(l => l.trim()).filter(l => l.length > 0);

      if (normalizedOld.length === 0) continue;

      // ファイル内容を行ごとに分割して、normalizedOldパターンにマッチする箇所を検索
      const contentLines = content.split("\n");
      let foundStart = -1;
      let foundEnd = -1;
      let baseIndent = "";

      for (let i = 0; i < contentLines.length; i++) {
        if (i < getLineNumber(content, searchAfter) - 2) continue; // matchIndex位置以降

        const trimmed = contentLines[i].trim();
        if (trimmed === normalizedOld[0]) {
          // 最初の行が見つかった。続く行も一致するか確認
          let allMatch = true;
          let ni = 0;
          let ci = i;
          while (ni < normalizedOld.length && ci < contentLines.length) {
            const ct = contentLines[ci].trim();
            if (ct.length === 0) { ci++; continue; } // 空行はスキップ
            if (ct !== normalizedOld[ni]) { allMatch = false; break; }
            ni++;
            ci++;
          }
          if (allMatch && ni === normalizedOld.length) {
            foundStart = i;
            foundEnd = ci;
            // ベースインデントを検出（最初の非空行から）
            const indentMatch = contentLines[i].match(/^(\s*)/);
            baseIndent = indentMatch ? indentMatch[1] : "";
            break;
          }
        }
      }

      if (foundStart !== -1 && foundEnd !== -1) {
        // newHtmlをbaseIndentでインデントして挿入
        const newLines = newHtml.split("\n");
        // 新HTMLの最小インデントを検出
        const newNonEmpty = newLines.filter(l => l.trim().length > 0);
        let minIndent = Infinity;
        newNonEmpty.forEach(l => {
          const m = l.match(/^(\s*)/);
          if (m) minIndent = Math.min(minIndent, m[1].length);
        });
        if (!isFinite(minIndent)) minIndent = 0;

        // 再インデント
        const reindented = newLines.map(l => {
          if (l.trim().length === 0) return "";
          const stripped = l.slice(minIndent);
          return baseIndent + stripped;
        }).join("\n");

        // 元の行を置換
        const before = contentLines.slice(0, foundStart).join("\n");
        const after = contentLines.slice(foundEnd).join("\n");
        const newContent = before + (before.length > 0 ? "\n" : "") + reindented + (after.length > 0 ? "\n" : "") + after;

        fs.writeFileSync(htmlFile, newContent, "utf-8");
        const relPath = path.relative(projectRoot, htmlFile);
        console.log(`  ✏️ UpdateHTML (indent-normalized): ${relPath}`);
        send(ws, "inspector:update-text-result", { success: true, message: "HTMLを更新しました" });
        return;
      }
    }
    send(ws, "inspector:update-text-result", { success: false, message: "該当HTMLが見つかりません" });
  }

  // 文字位置から行番号を返すヘルパー
  function getLineNumber(content, charIdx) {
    return content.substring(0, charIdx).split("\n").length;
  }

  function handleGetHtml(ws, data) {
    const { className, matchIndex = 0 } = data;
    if (!className) {
      send(ws, "inspector:get-html-result", { success: false, message: "クラス名が必要です" });
      return;
    }

    const htmlFiles = findHtmlFiles();
    let globalCount = 0;
    for (const htmlFile of htmlFiles) {
      const content = fs.readFileSync(htmlFile, "utf-8");
      // クラス名の全出現箇所を走査
      let searchFrom = 0;
      while (true) {
        const classIdx = content.indexOf(className, searchFrom);
        if (classIdx === -1) break;
        searchFrom = classIdx + 1;

        if (globalCount < matchIndex) {
          globalCount++;
          continue;
        }

      // クラス名を含む開きタグの開始位置を見つける
      let tagStart = content.lastIndexOf("<", classIdx);
      if (tagStart === -1) { globalCount++; continue; }

      // 開きタグの終了位置を見つける
      let tagEnd = content.indexOf(">", classIdx);
      if (tagEnd === -1) continue;
      tagEnd++; // >を含む

      // タグ名を取得
      const tagMatch = content.substring(tagStart).match(/^<(\w+)/);
      if (!tagMatch) continue;
      const tagName = tagMatch[1];

      // 対応する閉じタグを見つける（ネスト考慮）
      let depth = 1;
      let pos = tagEnd;
      const openRe = new RegExp(`<${tagName}[\\s>]`, "gi");
      const closeTag = `</${tagName}>`;
      while (depth > 0 && pos < content.length) {
        const nextOpen = content.indexOf(`<${tagName}`, pos);
        const nextClose = content.toLowerCase().indexOf(closeTag.toLowerCase(), pos);
        if (nextClose === -1) break;
        if (nextOpen !== -1 && nextOpen < nextClose) {
          // 同じタグのネスト
          const afterOpen = content[nextOpen + tagName.length + 1];
          if (afterOpen === " " || afterOpen === ">" || afterOpen === "/") {
            depth++;
          }
          pos = nextOpen + 1;
        } else {
          depth--;
          if (depth === 0) {
            // 開きタグの後から閉じタグの前までが内容
            const innerHtml = content.substring(tagEnd, nextClose);
            const relPath = path.relative(projectRoot, htmlFile);
            send(ws, "inspector:get-html-result", {
              success: true,
              html: innerHtml,
              file: relPath,
              startIdx: tagEnd,
              endIdx: nextClose,
              filePath: htmlFile,
            });
            return;
          }
          pos = nextClose + closeTag.length;
        }
      }
      globalCount++;
      } // end while
    }
    send(ws, "inspector:get-html-result", { success: false, message: "該当クラスが見つかりません" });
  }

  // === ヘルパー関数 ===

  function findAndReplace(scssFiles, className, property, newValue, mq, pseudo, shorthandPart, nestedTag) {
    const bemPart = className.includes("__") ? className.split("__").pop() : null;
    const reverseInfo = SHORTHAND_REVERSE[property];

    for (const scssFile of scssFiles) {
      let content = fs.readFileSync(scssFile, "utf-8");
      const lines = content.split("\n");

      // nestedTag対応: 親クラスブロック内のタグブロックでプロパティを置換
      if (nestedTag) {
        const selectorPatterns = [new RegExp(`\\.${escapeRegex(className)}\\s*\\{`)];
        if (bemPart) selectorPatterns.push(new RegExp(`&__${escapeRegex(bemPart)}\\s*\\{`));

        for (const selectorRegex of selectorPatterns) {
          let match;
          const globalRegex = new RegExp(selectorRegex.source, "g");
          while ((match = globalRegex.exec(content)) !== null) {
            const block = extractBlock(content, match.index);
            if (!block) continue;

            // ブロック内でネストされたタグ（例: span { ... }）を検索
            const nestedRegex = new RegExp(`(?:^|\\n)(\\s*)${escapeRegex(nestedTag)}\\s*\\{`, "g");
            const nestedMatch = nestedRegex.exec(block.text);
            if (!nestedMatch) continue;

            const nestedStartInBlock = nestedMatch.index + (nestedMatch[0].startsWith("\n") ? 1 : 0);
            const nestedBlock = extractBlock(block.text, nestedStartInBlock);
            if (!nestedBlock) continue;

            // ネストブロック内のプロパティを置換
            const propRegex = new RegExp(`(${escapeRegex(property)}\\s*:\\s*)([^;]+)(;)`);
            const propMatch = propRegex.exec(nestedBlock.text);
            if (!propMatch) continue;

            const oldValue = propMatch[2].trim();
            const newNestedBlock = nestedBlock.text.replace(propRegex, `$1${newValue}$3`);
            const newBlockText = block.text.substring(0, nestedBlock.start) + newNestedBlock + block.text.substring(nestedBlock.end);
            const newContent = content.substring(0, block.start) + newBlockText + content.substring(block.end);
            fs.writeFileSync(scssFile, newContent, "utf-8");
            return { success: true, oldValue, newValue, file: path.relative(projectRoot, scssFile) };
          }
        }
        continue;
      }

      // 1. Try exact property match
      let result = tryReplace(content, lines, new RegExp(`\\.${escapeRegex(className)}\\s*\\{`), property, newValue, mq, pseudo, shorthandPart);
      if (result) {
        fs.writeFileSync(scssFile, result.newContent, "utf-8");
        return { success: true, oldValue: result.oldValue, newValue, file: path.relative(projectRoot, scssFile) };
      }

      // 2. If reverse-mapped (e.g. padding-block-start → padding-block), try shorthand
      if (reverseInfo) {
        const partType = reverseInfo.index === 0 ? 'start' : 'end';
        result = tryReplace(content, lines, new RegExp(`\\.${escapeRegex(className)}\\s*\\{`), reverseInfo.shorthand, newValue, mq, pseudo, partType);
        if (result) {
          fs.writeFileSync(scssFile, result.newContent, "utf-8");
          return { success: true, oldValue: result.oldValue, newValue, file: path.relative(projectRoot, scssFile) };
        }
      }

      // 3. BEM part search
      if (bemPart) {
        result = tryReplace(content, lines, new RegExp(`&__${escapeRegex(bemPart)}\\s*\\{`), property, newValue, mq, pseudo, shorthandPart);
        if (result) {
          fs.writeFileSync(scssFile, result.newContent, "utf-8");
          return { success: true, oldValue: result.oldValue, newValue, file: path.relative(projectRoot, scssFile) };
        }
        if (reverseInfo) {
          const partType = reverseInfo.index === 0 ? 'start' : 'end';
          result = tryReplace(content, lines, new RegExp(`&__${escapeRegex(bemPart)}\\s*\\{`), reverseInfo.shorthand, newValue, mq, pseudo, partType);
          if (result) {
            fs.writeFileSync(scssFile, result.newContent, "utf-8");
            return { success: true, oldValue: result.oldValue, newValue, file: path.relative(projectRoot, scssFile) };
          }
        }
      }
    }
    return { success: false, message: `SCSSファイル内に .${className}${pseudo ? '::' + pseudo : ''}${nestedTag ? ' ' + nestedTag : ''} の ${property} が見つかりません` };
  }

  function tryReplace(content, lines, selectorRegex, property, newValue, mq, pseudo, shorthandPart) {
    let match;
    const regex = new RegExp(selectorRegex.source, "g");

    while ((match = regex.exec(content)) !== null) {
      const block = extractBlock(content, match.index);
      if (!block) continue;

      // 疑似要素の場合: &::before / &::after ブロック内を検索
      if (pseudo) {
        const pseudoRegex = new RegExp(`&::${escapeRegex(pseudo)}\\s*\\{`, "g");
        let pseudoMatch;
        while ((pseudoMatch = pseudoRegex.exec(block.text)) !== null) {
          const pseudoBlock = extractBlock(block.text, pseudoMatch.index);
          if (!pseudoBlock) continue;

          if (mq) {
            // 疑似要素内の @include mq("md") ブロック内を検索
            const mqRegex = /@include\s+mq\s*\(\s*["']md["']\s*\)\s*\{/g;
            let mqMatch;
            while ((mqMatch = mqRegex.exec(pseudoBlock.text)) !== null) {
              let depth = 0, mqStart = -1, mqEnd = -1;
              for (let i = mqMatch.index + mqMatch[0].length - 1; i < pseudoBlock.text.length; i++) {
                if (pseudoBlock.text[i] === "{") { if (depth === 0) mqStart = i; depth++; }
                else if (pseudoBlock.text[i] === "}") { depth--; if (depth === 0) { mqEnd = i + 1; break; } }
              }
              if (mqStart === -1 || mqEnd === -1) continue;
              const mqBlock = pseudoBlock.text.substring(mqStart, mqEnd);
              const propRegex = new RegExp(`(${escapeRegex(property)}\\s*:\\s*)([^;]+)(;)`);
              const propMatch = propRegex.exec(mqBlock);
              if (!propMatch) continue;
              const oldValue = propMatch[2].trim();
              const newMqBlock = mqBlock.replace(propRegex, `$1${newValue}$3`);
              const newPseudoBlock = pseudoBlock.text.substring(0, mqStart) + newMqBlock + pseudoBlock.text.substring(mqEnd);
              const newBlockText = block.text.substring(0, pseudoBlock.start) + newPseudoBlock + block.text.substring(pseudoBlock.end);
              const newContent = content.substring(0, block.start) + newBlockText + content.substring(block.end);
              return { newContent, oldValue };
            }
          } else {
            // 疑似要素のトップレベルプロパティを検索
            const topLevel = getTopLevelContent(pseudoBlock.text);
            const propRegex = new RegExp(`(${escapeRegex(property)}\\s*:\\s*)([^;]+)(;)`);
            const propMatch = propRegex.exec(topLevel);
            if (!propMatch) continue;
            const oldValue = propMatch[2].trim();
            const newPseudoBlock = replaceTopLevelProperty(pseudoBlock.text, property, newValue);
            if (newPseudoBlock === pseudoBlock.text) continue;
            const newBlockText = block.text.substring(0, pseudoBlock.start) + newPseudoBlock + block.text.substring(pseudoBlock.end);
            const newContent = content.substring(0, block.start) + newBlockText + content.substring(block.end);
            return { newContent, oldValue };
          }
        }
        continue;
      }

      if (mq) {
        const mqRegex = /@include\s+mq\s*\(["']md["']\s*\)\s*\{/g;
        let mqMatch;
        while ((mqMatch = mqRegex.exec(block.text)) !== null) {
          let depth = 0, mqStart = -1, mqEnd = -1;
          for (let i = mqMatch.index + mqMatch[0].length - 1; i < block.text.length; i++) {
            if (block.text[i] === "{") { if (depth === 0) mqStart = i; depth++; }
            else if (block.text[i] === "}") { depth--; if (depth === 0) { mqEnd = i + 1; break; } }
          }
          if (mqStart === -1 || mqEnd === -1) continue;
          const mqBlock = block.text.substring(mqStart, mqEnd);
          const propRegex = new RegExp(`(${escapeRegex(property)}\\s*:\\s*)([^;]+)(;)`);
          const propMatch = propRegex.exec(mqBlock);
          if (!propMatch) continue;
          const oldValue = propMatch[2].trim();
          let finalNewValue = newValue;
          if (shorthandPart) {
            const parts = splitShorthandValue(oldValue);
            if (parts.length >= 2) {
              parts[shorthandPart === 'start' ? 0 : 1] = newValue;
              finalNewValue = parts.join(' ');
            }
          }
          const newMqBlock = mqBlock.replace(propRegex, `$1${finalNewValue}$3`);
          const newBlockText = block.text.substring(0, mqStart) + newMqBlock + block.text.substring(mqEnd);
          const newContent = content.substring(0, block.start) + newBlockText + content.substring(block.end);
          return { newContent, oldValue };
        }
      } else {
        const topLevelProps = getTopLevelContent(block.text);
        const propRegex = new RegExp(`(${escapeRegex(property)}\\s*:\\s*)([^;]+)(;)`);
        const propMatch = propRegex.exec(topLevelProps);
        if (!propMatch) continue;
        const oldValue = propMatch[2].trim();
        let finalNewValue = newValue;
        if (shorthandPart) {
          const parts = splitShorthandValue(oldValue);
          if (parts.length >= 2) {
            parts[shorthandPart === 'start' ? 0 : 1] = newValue;
            finalNewValue = parts.join(' ');
          }
        }
        const newBlockText = replaceTopLevelProperty(block.text, property, finalNewValue);
        if (newBlockText === block.text) continue;
        const newContent = content.substring(0, block.start) + newBlockText + content.substring(block.end);
        return { newContent, oldValue };
      }
    }
    return null;
  }

  console.log(`  ✅ WebSocket server listening on ws://localhost:${port}`);
}

// === ユーティリティ関数 ===

function getTopLevelContent(blockText) {
  let result = "";
  let depth = 0;
  for (let i = 0; i < blockText.length; i++) {
    if (blockText[i] === "{") { depth++; if (depth === 1) continue; }
    else if (blockText[i] === "}") { depth--; if (depth === 0) continue; }
    if (depth === 1) result += blockText[i];
  }
  return result;
}

function replaceTopLevelProperty(blockText, property, newValue) {
  let depth = 0;
  const propPattern = `${property}\\s*:\\s*`;
  const regex = new RegExp(propPattern);
  let i = 0;
  while (i < blockText.length) {
    if (blockText[i] === "{") depth++;
    else if (blockText[i] === "}") depth--;
    if (depth === 1) {
      const remaining = blockText.substring(i);
      const match = remaining.match(regex);
      if (match && match.index === 0) {
        const propPrefix = match[0];
        const afterProp = blockText.substring(i + propPrefix.length);
        const semicolonIdx = afterProp.indexOf(";");
        if (semicolonIdx !== -1) {
          return blockText.substring(0, i) + propPrefix + newValue + afterProp.substring(semicolonIdx);
        }
      }
    }
    i++;
  }
  return blockText;
}

// Logical shorthand → individual property mapping
const LOGICAL_SHORTHANDS = {
  'padding-block': ['padding-block-start', 'padding-block-end'],
  'margin-block': ['margin-block-start', 'margin-block-end'],
  'padding-inline': ['padding-inline-start', 'padding-inline-end'],
  'margin-inline': ['margin-inline-start', 'margin-inline-end'],
};

// Reverse mapping: individual property → shorthand info
const SHORTHAND_REVERSE = {};
for (const [shorthand, [startProp, endProp]] of Object.entries(LOGICAL_SHORTHANDS)) {
  SHORTHAND_REVERSE[startProp] = { shorthand, index: 0 };
  SHORTHAND_REVERSE[endProp] = { shorthand, index: 1 };
}

// Split CSS shorthand value respecting parentheses: "rem(80) rem(60)" → ["rem(80)", "rem(60)"]
function splitShorthandValue(value) {
  const parts = [];
  let current = '';
  let depth = 0;
  for (const ch of value) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === ' ' && depth === 0 && current.trim()) {
      parts.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

// Expand logical shorthand props into individual CSS property names
function expandLogicalShorthands(props) {
  const expanded = [];
  for (const p of props) {
    if (LOGICAL_SHORTHANDS[p.property]) {
      const parts = splitShorthandValue(p.scssValue);
      if (parts.length >= 2) {
        const [startProp, endProp] = LOGICAL_SHORTHANDS[p.property];
        expanded.push({ property: startProp, scssValue: parts[0] });
        expanded.push({ property: endProp, scssValue: parts[1] });
      } else {
        expanded.push(p); // Single value, no split
      }
    } else {
      expanded.push(p);
    }
  }
  return expanded;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractBlock(content, startIndex) {
  let braceCount = 0, blockStart = -1, blockEnd = -1;
  for (let i = startIndex; i < content.length; i++) {
    if (content[i] === "{") { if (braceCount === 0) blockStart = i; braceCount++; }
    else if (content[i] === "}") { braceCount--; if (braceCount === 0) { blockEnd = i + 1; break; } }
  }
  if (blockStart === -1 || blockEnd === -1) return null;
  return { start: blockStart, end: blockEnd, text: content.substring(blockStart, blockEnd) };
}

module.exports = { startServer };

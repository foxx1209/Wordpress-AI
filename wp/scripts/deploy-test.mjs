#!/usr/bin/env node
/**
 * テスト環境へ dist/ を FTP アップロード（lftp）
 * Usage:
 *   npm run deploy:test
 *   npm run deploy:test -- --dry-run
 *   npm run deploy:test -- --no-build
 */
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const noBuild = args.includes("--no-build");

const loadJson = (path) => {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8"));
};

const loadEnvFile = () => {
  const path = join(root, ".env");
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return out;
};

const decodeFileZillaPassword = (encoded) => {
  try {
    return Buffer.from(encoded, "base64").toString("utf8");
  } catch {
    return "";
  }
};

const loadFromFileZilla = (siteName) => {
  const xmlPath = join(homedir(), "Library/Application Support/FileZilla/sitemanager.xml");
  if (!existsSync(xmlPath)) {
    console.error(`[deploy:test] FileZilla 設定が見つかりません: ${xmlPath}`);
    process.exit(1);
  }
  const xml = readFileSync(xmlPath, "utf8");
  const blocks = xml.split("<Server>").slice(1);
  for (const block of blocks) {
    const name = block.match(/<Name>([^<]*)<\/Name>/)?.[1];
    if (name !== siteName) continue;
    const host = block.match(/<Host>([^<]*)<\/Host>/)?.[1] ?? "";
    const user = block.match(/<User>([^<]*)<\/User>/)?.[1] ?? "";
    const passEnc = block.match(/<Pass(?: encoding="base64")?>([^<]*)<\/Pass>/)?.[1] ?? "";
    return {
      host,
      user,
      password: decodeFileZillaPassword(passEnc),
    };
  }
  console.error(`[deploy:test] FileZilla にサイト "${siteName}" がありません`);
  process.exit(1);
};

const configPath = join(root, ".deploy-test.json");
const fileConfig = loadJson(configPath) ?? {};
const env = loadEnvFile();

let host = fileConfig.host || env.FTP_HOST;
let user = fileConfig.user || env.FTP_USER;
let password = fileConfig.password || env.FTP_PASS;
const remotePath = (fileConfig.remotePath || env.FTP_REMOTE_PATH || "").replace(/\/?$/, "/");
const localPath = resolve(root, fileConfig.localPath || "dist");
const sslVerify = fileConfig.sslVerify !== false;

if (fileConfig.filezillaSiteName) {
  const fz = loadFromFileZilla(fileConfig.filezillaSiteName);
  host = host || fz.host;
  user = user || fz.user;
  password = password || fz.password;
}

if (!host || !user || !password || !remotePath) {
  console.error(`[deploy:test] 設定不足です。
1. .deploy-test.json.example を .deploy-test.json にコピーして編集
   または .env に FTP_* / WP_* を設定
2. docs/ai/workflows/deploy-test.md を参照`);
  process.exit(1);
}

if (!existsSync(localPath)) {
  console.error(`[deploy:test] ローカルパスがありません: ${localPath}`);
  console.error("先に npm run build を実行してください（--no-build 時は dist が必要）");
  process.exit(1);
}

if (!noBuild && !dryRun) {
  console.log("[deploy:test] npm run build …");
  const build = spawnSync("npm", ["run", "build"], { cwd: root, stdio: "inherit", shell: true });
  if (build.status !== 0) process.exit(build.status ?? 1);
}

const lftpCheck = spawnSync("which", ["lftp"], { encoding: "utf8" });
if (lftpCheck.status !== 0) {
  console.error("[deploy:test] lftp がありません。brew install lftp");
  process.exit(1);
}

const sslCmd = sslVerify ? "" : "set ssl:verify-certificate no; ";
const lftpScript = `${sslCmd}mirror --reverse --verbose ${localPath} ${remotePath}; quit`;

const cmdDisplay = `lftp -u "${user},***" ${host} -e "${lftpScript}"`;

console.log("[deploy:test] 接続先:", host);
console.log("[deploy:test] ローカル:", localPath);
console.log("[deploy:test] リモート:", remotePath);

if (dryRun) {
  console.log("\n[dry-run]", cmdDisplay);
  process.exit(0);
}

const result = spawnSync("lftp", ["-u", `${user},${password}`, host, "-e", lftpScript], {
  stdio: "inherit",
});

if (result.status !== 0) {
  console.error("[deploy:test] アップロード失敗");
  process.exit(result.status ?? 1);
}

console.log("[deploy:test] 完了。ブラウザのキャッシュをクリアして確認してください。");

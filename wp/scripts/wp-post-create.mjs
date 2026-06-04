#!/usr/bin/env node
/**
 * JSON から WordPress 投稿を一括作成（wp-env 必須）
 * Usage: node scripts/wp-post-create.mjs post-data/posts-sample.json
 */
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const input = process.argv[2];
if (!input) {
  console.error("Usage: npm run wp:post:create -- post-data/posts-sample.json");
  process.exit(1);
}

const posts = JSON.parse(readFileSync(input, "utf8"));
if (!Array.isArray(posts)) {
  console.error("[wp-post-create] JSON は配列である必要があります");
  process.exit(1);
}

const runWp = (args) => {
  const result = spawnSync("npx", ["wp-env", "run", "cli", "wp", ...args], {
    stdio: "pipe",
    encoding: "utf8",
  });
  return result;
};

let ok = 0;
let fail = 0;

console.log(`[wp-post-create] ${posts.length} 件を作成します...\n`);

for (let i = 0; i < posts.length; i++) {
  const post = posts[i];
  const title = post.title;
  if (!title) {
    console.warn(`[wp-post-create] [${i + 1}] title がありません — スキップ`);
    fail++;
    continue;
  }

  const args = [
    "post",
    "create",
    `--post_title=${title}`,
    `--post_status=${post.status || "publish"}`,
    `--post_type=${post.postType || "post"}`,
    "--porcelain",
  ];

  if (post.content) {
    args.push(`--post_content=${post.content}`);
  }
  if (post.author) {
    args.push(`--post_author=${post.author}`);
  }

  console.log(`[wp-post-create] [${i + 1}/${posts.length}] ${title}`);
  const result = runWp(args);

  if (result.status !== 0) {
    console.error(result.stderr || result.stdout);
    fail++;
    continue;
  }

  const id = (result.stdout || "").trim();
  ok++;

  if (post.tags && id) {
    runWp(["post", "term", "set", id, "post_tag", ...String(post.tags).split(",")]);
  }

  if (post.categories && id) {
    const cats = Array.isArray(post.categories)
      ? post.categories.map(String)
      : String(post.categories).split(",");
    runWp(["post", "term", "set", id, "category", ...cats]);
  }

  console.log(`[wp-post-create]   ✓ ID: ${id}\n`);
}

console.log("=== 作成結果 ===");
console.log(`[wp-post-create] 成功: ${ok} / 失敗: ${fail}`);
if (fail > 0) process.exit(1);

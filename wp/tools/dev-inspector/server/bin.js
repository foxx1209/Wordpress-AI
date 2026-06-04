#!/usr/bin/env node
/**
 * Dev Inspector CLI サーバー
 * Usage: node bin.js [projectRoot] [--port=54321] [--scss-dir=src/styles] [--editor=antigravity|cursor|code] [--rem-mode=css-var|scss]
 */
const { startServer } = require("./index.js");

const args = process.argv.slice(2);
let projectRoot = process.cwd();
let port = 54321;
let scssDir = "";
let htmlDirs = [];
let editor = "antigravity";
let remMode = "css-var";

for (const arg of args) {
  if (arg.startsWith("--port=")) {
    port = parseInt(arg.split("=")[1], 10);
  } else if (arg.startsWith("--scss-dir=")) {
    scssDir = arg.split("=")[1];
  } else if (arg.startsWith("--html-dir=")) {
    htmlDirs.push(arg.split("=")[1]);
  } else if (arg.startsWith("--editor=")) {
    editor = arg.split("=")[1];
  } else if (arg.startsWith("--rem-mode=")) {
    remMode = arg.split("=")[1];
  } else if (!arg.startsWith("--")) {
    projectRoot = require("path").resolve(arg);
  }
}

console.log(`
  ╔══════════════════════════════════════════╗
  ║      🔍 Dev Inspector Server            ║
  ╠══════════════════════════════════════════╣
  ║  Project: ${projectRoot.slice(-30).padEnd(30)} ║
  ║  Port:    ${String(port).padEnd(30)} ║
  ║  SCSS:    ${(scssDir || '自動検出').padEnd(30)} ║
  ║  Editor:  ${editor.padEnd(30)} ║
  ║  rem:     ${remMode.padEnd(30)} ║
  ╚══════════════════════════════════════════╝
`);

startServer({ projectRoot, port, scssDir, htmlDirs, editor, remMode });

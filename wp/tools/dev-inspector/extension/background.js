/**
 * Dev Inspector - Background Service Worker
 * ツールバーアイコンクリック or ショートカットキーでcontent.jsをアクティブタブに注入
 * ページリロード時に自動復帰
 */

// Inspectorが有効なタブを追跡
const activeTabs = new Set();

async function toggleInspector(tab) {
  try {
    // 既に注入済みかチェック
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => !!window.__devInspectorLoaded,
    });

    if (results[0]?.result) {
      // 既に注入済みなら終了コマンドを送る
      activeTabs.delete(tab.id);
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          if (window.__devInspectorDestroy) window.__devInspectorDestroy();
          else window.__devInspectorLoaded = false;
        },
      });
      return;
    }

    // content.js を注入
    activeTabs.add(tab.id);
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });
  } catch (err) {
    console.error("[Dev Inspector] Injection failed:", err);
  }
}

async function injectInspector(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.js"],
    });
  } catch (err) {
    console.error("[Dev Inspector] Re-injection failed:", err);
  }
}

// ツールバーアイコンクリック（Alt+Q）
chrome.action.onClicked.addListener(toggleInspector);

// Alt+I ショートカット
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-inspector") {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) toggleInspector(tab);
  }
});

// ページリロード時に自動で再注入
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "complete" && activeTabs.has(tabId)) {
    // リロード完了後に少し待ってから再注入
    setTimeout(() => injectInspector(tabId), 500);
  }
});

// タブが閉じられたら追跡を解除
chrome.tabs.onRemoved.addListener((tabId) => {
  activeTabs.delete(tabId);
});

// background.js

let isEnabled = false;

chrome.action.onClicked.addListener((tab) => {
  isEnabled = !isEnabled;

  if (isEnabled) {
    chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ["styles.css"]
    });
    chrome.action.setIcon({ path: "icons/icon-enabled.png" });
  } else {
    chrome.scripting.removeCSS({
      target: { tabId: tab.id },
      files: ["styles.css"]
    });
    chrome.action.setIcon({ path: "icons/icon-disabled.png" });
  }
});
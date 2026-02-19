// Background service worker

chrome.runtime.onInstalled.addListener(() => {
    console.log('PromptTune Extension Installed');
});

// Future: Handle context menu events or keep-alive logic here.

document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('api-key');
    const modelNameInput = document.getElementById('model-name');
    const saveBtn = document.getElementById('save-btn');
    const statusMsg = document.getElementById('status-msg');

    // Load existing settings
    chrome.storage.sync.get(['geminiApiKey', 'geminiModel'], (result) => {
        if (result.geminiApiKey) {
            apiKeyInput.value = result.geminiApiKey;
        }
        if (result.geminiModel) {
            modelNameInput.value = result.geminiModel;
        } else {
            modelNameInput.value = 'gemini-2.5-flash';
        }
    });

    saveBtn.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        const modelName = modelNameInput.value.trim() || 'gemini-2.5-flash';

        chrome.storage.sync.set({ geminiApiKey: apiKey, geminiModel: modelName }, () => {
            statusMsg.textContent = 'Settings saved successfully!';
            setTimeout(() => {
                statusMsg.textContent = '';
            }, 2500);
        });
    });
});

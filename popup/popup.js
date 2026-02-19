document.addEventListener('DOMContentLoaded', () => {
    const promptInput = document.getElementById('prompt-input');
    const enhanceBtn = document.getElementById('enhance-btn');
    const btnText = enhanceBtn.querySelector('.btn-text');
    const loader = enhanceBtn.querySelector('.loader');
    const resultContainer = document.getElementById('result-container');
    const enhancedPromptText = document.getElementById('enhanced-prompt');
    const copyBtn = document.getElementById('copy-btn');
    const retryBtn = document.getElementById('retry-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const historyBtn = document.getElementById('history-btn');
    const historyView = document.getElementById('history-view');
    const closeHistoryBtn = document.getElementById('close-history-btn');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const errorMsg = document.getElementById('error-msg');

    // Load state
    loadSession();

    // Event Listeners
    promptInput.addEventListener('input', () => {
        saveSession(promptInput.value);
    });

    settingsBtn.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });

    historyBtn.addEventListener('click', () => {
        loadHistory();
        historyView.classList.remove('hidden');
    });

    closeHistoryBtn.addEventListener('click', () => {
        historyView.classList.add('hidden');
    });

    clearHistoryBtn.addEventListener('click', () => {
        chrome.storage.local.remove('promptHistory', () => {
            loadHistory();
        });
    });

    enhanceBtn.addEventListener('click', async () => {
        const text = promptInput.value.trim();
        if (!text) return;

        setLoading(true);
        hideError();
        resultContainer.classList.add('hidden');

        try {
            const { apiKey, model } = await getSettings();
            if (!apiKey) {
                throw new Error('Please set your API Key in Settings.');
            }

            const enhancedText = await generateEnhancedPrompt(text, apiKey, model);
            enhancedPromptText.textContent = enhancedText;
            resultContainer.classList.remove('hidden');

            // Save to history
            saveToHistory(text, enhancedText);

        } catch (err) {
            showError(err.message);
        } finally {
            setLoading(false);
        }
    });

    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(enhancedPromptText.textContent).then(() => {
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          Copied!
        `;
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
            }, 1500);
        });
    });

    retryBtn.addEventListener('click', () => {
        enhanceBtn.click();
    });

    function setLoading(isLoading) {
        enhanceBtn.disabled = isLoading;
        if (isLoading) {
            btnText.classList.add('hidden');
            loader.classList.remove('hidden');
        } else {
            btnText.classList.remove('hidden');
            loader.classList.add('hidden');
        }
    }

    function showError(msg) {
        errorMsg.textContent = msg;
        errorMsg.classList.remove('hidden');
    }

    function hideError() {
        errorMsg.classList.add('hidden');
    }

    async function getSettings() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(['geminiApiKey', 'geminiModel'], (result) => {
                resolve({
                    apiKey: result.geminiApiKey,
                    model: result.geminiModel || 'gemini-2.5-flash'
                });
            });
        });
    }

    async function generateEnhancedPrompt(originalPrompt, apiKey, model) {
        const systemInstruction = `You are an expert prompt engineer. Your goal is to rewrite the user's vague prompt into a highly effective, professional, and detailed prompt suitable for a large language model.
      
      Follow these rules:
      1. Be specific and clear.
      2. Add context if implied.
      3. Specify the desired format of the output.
      4. Do not include any introductory text like "Here is the enhanced prompt:". Just output the prompt itself.
      5. Avoid violating and guardrails concerning similarity to third-party content.
      6. Do NOT use markdown formatting (like **bold** or *italic*). Output plain text only.
      User's vague prompt: "${originalPrompt}"`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: systemInstruction
                    }]
                }]
            })
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                throw new Error(`API Error: ${response.status}`);
            }
            throw new Error(errorData.error?.message || `API Request Failed: ${response.status}`);
        }

        const data = await response.json();
        const enhanced = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!enhanced) {
            throw new Error('No response from AI.');
        }

        // Remove any asterisks that might have been included despite instructions
        return enhanced.replace(/\*/g, '').trim();
    }

    // --- Session Persistence ---
    function saveSession(text) {
        chrome.storage.local.set({ 'sessionInput': text });
    }

    function loadSession() {
        chrome.storage.local.get(['sessionInput'], (result) => {
            if (result.sessionInput) {
                promptInput.value = result.sessionInput;
            }
        });
    }

    // --- History Management ---
    function saveToHistory(original, enhanced) {
        chrome.storage.local.get(['promptHistory'], (result) => {
            const history = result.promptHistory || [];
            const newEntry = {
                original,
                enhanced,
                timestamp: Date.now()
            };
            history.unshift(newEntry);

            // Keep last 50
            if (history.length > 50) {
                history.pop();
            }

            chrome.storage.local.set({ 'promptHistory': history });
        });
    }

    function loadHistory() {
        historyList.innerHTML = '';
        chrome.storage.local.get(['promptHistory'], (result) => {
            const history = result.promptHistory || [];

            if (history.length === 0) {
                historyList.innerHTML = '<div class="empty-state">No history yet.</div>';
                return;
            }

            history.forEach(item => {
                const el = document.createElement('div');
                el.className = 'history-item';
                el.innerHTML = `
                    <div class="history-prompt"><strong>Original:</strong> ${escapeHtml(item.original)}</div>
                    <div class="history-enhanced">${escapeHtml(item.enhanced)}</div>
                    <span class="history-date">${new Date(item.timestamp).toLocaleString()}</span>
                `;
                el.addEventListener('click', () => {
                    promptInput.value = item.original;
                    enhancedPromptText.textContent = item.enhanced;
                    resultContainer.classList.remove('hidden');
                    historyView.classList.add('hidden');
                    saveSession(item.original); // Update session
                });
                historyList.appendChild(el);
            });
        });
    }

    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }
});

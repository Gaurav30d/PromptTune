document.addEventListener('DOMContentLoaded', () => {
    const promptInput = document.getElementById('prompt-input');
    const enhanceBtn = document.getElementById('enhance-btn');
    const btnText = enhanceBtn.querySelector('.btn-text');
    const loader = enhanceBtn.querySelector('.loader');
    const resultContainer = document.getElementById('result-container');
    const enhancedRole = document.getElementById('enhanced-role');
    const enhancedGoal = document.getElementById('enhanced-goal');
    const enhancedBackstory = document.getElementById('enhanced-backstory');
    const enhancedConstraints = document.getElementById('enhanced-constraints');
    const copyBtn = document.getElementById('copy-btn');
    const retryBtn = document.getElementById('retry-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const historyBtn = document.getElementById('history-btn');
    const historyView = document.getElementById('history-view');
    const closeHistoryBtn = document.getElementById('close-history-btn');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const errorMsg = document.getElementById('error-msg');
    const roleCount = document.getElementById('role-count');
    const goalCount = document.getElementById('goal-count');
    const backstoryCount = document.getElementById('backstory-count');
    const constraintsCount = document.getElementById('constraints-count');

    function updateCharCounts() {
        if (enhancedRole) roleCount.textContent = `${enhancedRole.value.length} chars`;
        if (enhancedGoal) goalCount.textContent = `${enhancedGoal.value.length} chars`;
        if (enhancedBackstory) backstoryCount.textContent = `${enhancedBackstory.value.length} chars`;
        if (enhancedConstraints) constraintsCount.textContent = `${enhancedConstraints.value.length} chars`;
    }

    [enhancedRole, enhancedGoal, enhancedBackstory, enhancedConstraints].forEach(el => {
        if (el) el.addEventListener('input', updateCharCounts);
    });

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

            const enhancedData = await generateEnhancedPrompt(text, apiKey, model);
            
            enhancedRole.value = enhancedData.role;
            enhancedGoal.value = enhancedData.goal;
            enhancedBackstory.value = enhancedData.backstory;
            enhancedConstraints.value = enhancedData.constraints.join('\n');
            
            updateCharCounts();
            resultContainer.classList.remove('hidden');

            // Save to history
            saveToHistory(text, enhancedData);

        } catch (err) {
            showError(err.message);
        } finally {
            setLoading(false);
        }
    });

    // Handle individual copy buttons
    document.querySelectorAll('.copy-section-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const textarea = document.getElementById(targetId);
            if (!textarea) return;

            const textToCopy = textarea.value.trim();
            if (!textToCopy) return;

            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalHTML = btn.innerHTML;
                btn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                `;
                btn.classList.add('copied');
                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.classList.remove('copied');
                }, 1500);
            });
        });
    });

    function getFullPromptText() {
        const role = enhancedRole.value.trim();
        const goal = enhancedGoal.value.trim();
        const backstory = enhancedBackstory.value.trim();
        const constraintsText = enhancedConstraints.value.trim();

        let fullPrompt = '';
        if (role) {
            fullPrompt += `# Role\n${role}\n\n`;
        }
        if (goal) {
            fullPrompt += `# Goal\n${goal}\n\n`;
        }
        if (backstory) {
            fullPrompt += `# Backstory\n${backstory}\n\n`;
        }
        if (constraintsText) {
            fullPrompt += `# Constraints\n`;
            const lines = constraintsText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            lines.forEach(line => {
                if (line.startsWith('-') || line.startsWith('*')) {
                    fullPrompt += `${line}\n`;
                } else {
                    fullPrompt += `- ${line}\n`;
                }
            });
        }
        return fullPrompt.trim();
    }

    copyBtn.addEventListener('click', () => {
        const textToCopy = getFullPromptText();
        if (!textToCopy) return;

        navigator.clipboard.writeText(textToCopy).then(() => {
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
        const systemInstruction = `You are an expert prompt engineer.
Your task is to take a vague user prompt and expand/enhance it into a structured, highly effective system prompt using the Role-Goal-Backstory-Constraints framework.

Here is the vague prompt to analyze and enhance:
"${originalPrompt}"

Deconstruct the user's intent and generate:
1. role: A highly specific, authoritative role or persona the AI should adopt.
2. goal: A detailed description of the objective to be achieved, including specific outputs and quality requirements.
3. backstory: The contextual background, reasoning, target audience, or scenario details that explain why this is being done and help ground the AI's response.
4. constraints: A list of strict rules, stylistic boundaries, technical limitations, format requirements, or pitfalls to avoid.

Produce a JSON response conforming strictly to the requested schema.`;

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
                }],
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "OBJECT",
                        properties: {
                            role: { type: "STRING" },
                            goal: { type: "STRING" },
                            backstory: { type: "STRING" },
                            constraints: {
                                type: "ARRAY",
                                items: { type: "STRING" }
                            }
                        },
                        required: ["role", "goal", "backstory", "constraints"]
                    }
                }
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

        try {
            const parsed = JSON.parse(enhanced);
            return {
                role: parsed.role || '',
                goal: parsed.goal || '',
                backstory: parsed.backstory || '',
                constraints: Array.isArray(parsed.constraints) ? parsed.constraints : []
            };
        } catch (e) {
            console.error('Failed to parse Gemini response as JSON:', e);
            // Fallback parsing
            return {
                role: 'AI Assistant',
                goal: enhanced.replace(/\*/g, '').trim(),
                backstory: 'Generated from legacy response.',
                constraints: []
            };
        }
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
                let displayEnhanced = '';
                if (typeof item.enhanced === 'object' && item.enhanced !== null) {
                    const roleStr = item.enhanced.role ? `Role: ${item.enhanced.role}` : '';
                    const goalStr = item.enhanced.goal ? `Goal: ${item.enhanced.goal}` : '';
                    displayEnhanced = [roleStr, goalStr].filter(s => s).join(' | ');
                    if (!displayEnhanced) {
                        displayEnhanced = 'Structured Prompt';
                    }
                } else {
                    displayEnhanced = item.enhanced || '';
                }

                const el = document.createElement('div');
                el.className = 'history-item';
                el.innerHTML = `
                    <div class="history-prompt"><strong>Original:</strong> ${escapeHtml(item.original)}</div>
                    <div class="history-enhanced">${escapeHtml(displayEnhanced)}</div>
                    <span class="history-date">${new Date(item.timestamp).toLocaleString()}</span>
                `;
                el.addEventListener('click', () => {
                    promptInput.value = item.original;
                    
                    if (typeof item.enhanced === 'object' && item.enhanced !== null) {
                        enhancedRole.value = item.enhanced.role || '';
                        enhancedGoal.value = item.enhanced.goal || '';
                        enhancedBackstory.value = item.enhanced.backstory || '';
                        enhancedConstraints.value = Array.isArray(item.enhanced.constraints) 
                            ? item.enhanced.constraints.join('\n') 
                            : (item.enhanced.constraints || '');
                    } else {
                        // Legacy string format fallback
                        enhancedRole.value = 'AI Assistant';
                        enhancedGoal.value = item.enhanced || '';
                        enhancedBackstory.value = 'Loaded from legacy history.';
                        enhancedConstraints.value = '';
                    }

                    updateCharCounts();
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

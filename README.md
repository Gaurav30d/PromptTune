# PromptTune - AI Prompt Enhancer

PromptTune is a Chrome Extension designed to help users transform vague ideas into professional, high-quality prompts for Large Language Models (LLMs) like Gemini, ChatGPT, and Claude. It leverages the Google Gemini API to rewrite and enhance user inputs.

## Project Overview

-   **Name**: PromptTune
-   **Version**: 1.0
-   **Manifest Version**: 3
-   **Description**: Transform vague ideas into professional, high-quality prompts for LLMs.

## Key Features

1.  **AI-Powered Enhancement**: Uses Google's Gemini API to rewrite prompts for clarity, context, and specificity.
2.  **Customizable Settings**: Users can provide their own Gemini API Key and specify the model version (e.g., `gemini-2.5-flash`).
3.  **History Management**: Local storage of prompt history (last 50 items) allows users to revisit previous enhancements.
4.  **Session Persistence**: The input field retains text even if the popup is closed, preventing data loss.
5.  **Clipboard Integration**: One-click copy functionality for the enhanced prompt.
6.  **Privacy-Focused**: API keys are stored in `chrome.storage.sync` (encrypted by Chrome), and history is stored locally on the device.

## Tech Stack

-   **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+)
-   **Extension Framework**: Chrome Extension Manifest V3
-   **API Integration**: Google Gemini API (`generativelanguage.googleapis.com`)
-   **Storage**:
    -   `chrome.storage.sync`: For syncing settings (API Key, Model Name) across devices.
    -   `chrome.storage.local`: For storing prompt history and session state.
-   **Icons/Assets**: PNG/SVG

## System Architecture

The extension follows a standard Chrome Extension architecture with the following components:

### 1. Popup (`popup/`)
The main user interface that appears when clicking the extension icon.
-   **`popup.html`**: Defines the structure of the UI (Input area, buttons, result display, history view).
-   **`popup.css`**: Styles the UI with a modern, clean aesthetic (Variables for colors, responsive layout).
-   **`popup.js`**:
    -   Handles user interactions (clicks, input).
    -   Manages application state (loading, errors).
    -   Communicates with the **Gemini API** directly from the client side.
    -   Read/Writes to `chrome.storage` for history and session management.
    -   Implementes the "Prompt Engineering" system instruction to guide the AI's output.

### 2. Options Page (`options/`)
A dedicated page for configuring extension settings.
-   **`options.html`**: Form interface for API Key and Model Name.
-   **`options.js`**: Saves and retrieves settings using `chrome.storage.sync`.

### 3. Background Script (`background.js`)
A service worker that runs in the background.
-   Currently minimal usage (logs installation event).
-   Prepared for future expansion (e.g., context menu integration).

### 4. Manifest (`manifest.json`)
The configuration file that defines permissions and entry points.
-   **Permissions**:
    -   `storage`: For saving settings and history.
    -   `activeTab`: (Standard permission, though not strictly used for DOM manipulation in the current version).
-   **Host Permissions**:
    -   `https://generativelanguage.googleapis.com/*`: Allow direct API calls to Google's servers.

## Development & Contribution

Follow these steps to set up the project locally and contribute changes:

### 1. Clone the Repository
```bash
git clone https://github.com/Gaurav30d/PromptTune.git
cd PromptTune
```

### 2. Setup in Chrome
Since this is a vanilla JavaScript project, there is no build step (npm install/build is not required).
1.  Open Chrome and navigate to `chrome://extensions/`.
2.  Enable **Developer mode** (top right toggle).
3.  Click **Load unpacked**.
4.  Select the `PromptTune` folder you just cloned.

### 3. Making Changes
-   Edit files in your preferred code editor (VS Code recommended).
-   Reload the extension in `chrome://extensions/` to see changes.
-   **Note**: Changes to `background.js` or `manifest.json` usually require a full reload of the extension. Changes to popup files apply immediately upon reopening the popup.

### 4. Pushing Changes to GitHub
Once you are happy with your changes, follow these standard Git commands:

```bash
# check which files have changed
git status

# add files to the staging area
git add . 

# commit your changes with a descriptive message
git commit -m "Describe your changes here"

# push to the repository
git push origin main
```

## Data Flow

1.  **User Input**: User types a draft prompt in the popup.
2.  **Enhancement Request**:
    -   `popup.js` retrieves the API Key and Model from `chrome.storage.sync`.
    -   Constructs a request with a specific "System Instruction" to act as an expert prompt engineer.
    -   Sends a POST request to the Gemini API.
3.  **Response Handling**:
    -   Gemini API returns the enhanced text.
    -   `popup.js` displays the result and saves the pair (original + enhanced) to `chrome.storage.local`.
4.  **History**: Users can view past interactions, loaded from `chrome.storage.local`.

## Project Structure

```
PromptTune/
├── manifest.json        # Extension configuration
├── background.js        # Service worker
├── assets/              # Icons and images
├── popup/               # Main UI
│   ├── popup.html
│   ├── popup.css
│   └── popup.js         # Core logic & API calls
└── options/             # Settings page
    ├── options.html
    └── options.js
```

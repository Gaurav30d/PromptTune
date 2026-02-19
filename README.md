<<<<<<< HEAD
# PromptTune
=======
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

## Setup & Installation

1.  **Clone the repository**.
2.  **Open Chrome Extensions**: Go to `chrome://extensions/`.
3.  **Enable Developer Mode**: Toggle the switch in the top right.
4.  **Load Unpacked**: Click the button and select the project directory (`PromptTune/`).
5.  **Configure**:
    -   Click the extension icon.
    -   Go to **Settings** (gear icon).
    -   Enter your **Gemini API Key** (get one from Google AI Studio).
    -   (Optional) Set a model name (default: `gemini-2.5-flash`).
6.  **Use**: Type a vague prompt and click "Enhance Prompt".

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
>>>>>>> 9e6abbd (Initial commit for PromptTune extension)

# PromptTune - AI Prompt Enhancer

PromptTune is a Chrome Extension designed to help users transform vague ideas into professional, high-quality prompts for Large Language Models (LLMs) like Gemini, ChatGPT, and Claude. It leverages the Google Gemini API to rewrite and enhance user inputs.

## Project Overview

-   **Name**: PromptTune
-   **Version**: 1.0
-   **Manifest Version**: 3
-   **Description**: Transform vague ideas into professional, high-quality prompts for LLMs.

## Key Features

1.  **RPG Prompt Framework**: Transforms vague ideas into structured prompts with clear **Role**, **Goal**, **Backstory**, and **Constraints** cards.
2.  **Interactive Tuning**: Fully editable text cards let you fine-tune details directly in the popup before copying.
3.  **Character Counts**: Real-time length indicators dynamically display the character size of each prompt block.
4.  **Flexible Clipboard Actions**: Copy individual sections (just the role, just constraints, etc.) or copy the unified prompt in Markdown format.
5.  **Customizable settings**: Easily configure your own Gemini API Key and specify the target model (e.g., `gemini-2.5-flash`).
6.  **History Management**: Stores your previous 50 queries locally with automatic backward-compatibility for legacy formats.
7.  **Privacy-First**: API keys and history are stored securely within Chrome local storage, keeping your credentials off third-party servers.

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

## Installation & Setup

Follow these steps to install and set up PromptTune in your Chrome browser:

### 1. Download or Clone the Extension
Clone this repository to your local machine:
```bash
git clone https://github.com/Gaurav30d/PromptTune.git
cd PromptTune
```
*(Alternatively, you can download the repository as a ZIP file and extract it.)*

### 2. Load the Extension in Chrome
Since this project uses vanilla HTML/CSS/JS, no compilation or `npm install` is required:
1.  Open Google Chrome and navigate to `chrome://extensions/`.
2.  Enable **Developer mode** using the toggle switch in the top-right corner.
3.  Click the **Load unpacked** button in the top-left corner.
4.  Select the `PromptTune` folder you cloned or extracted (the directory containing `manifest.json`).

### 3. Add your Gemini API Key
To utilize the AI capabilities of PromptTune:
1.  Get a free API Key from [Google AI Studio](https://aistudio.google.com/).
2.  Click the **PromptTune** icon in your extension bar.
3.  Click the **Settings** (gear) icon in the top-right of the popup.
4.  Paste your API key, select your desired model (e.g. `gemini-2.5-flash`), and click **Save Settings**.

## Development & Contribution

Follow these steps if you want to make changes or contribute to the project:

### 1. Making Changes
-   Edit files in your preferred code editor (VS Code recommended).
-   Reload the extension in `chrome://extensions/` to see changes.
-   **Note**: Changes to `background.js` or `manifest.json` usually require a full reload of the extension. Changes to popup files apply immediately upon reopening the popup.

### 2. Pushing Changes to GitHub
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

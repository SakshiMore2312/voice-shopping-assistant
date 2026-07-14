# VoiceCart 🎙️🛒 - Enterprise Voice Shopping Assistant

**VoiceCart** is a professional, enterprise-grade shopping list web application that processes voice commands to manage shopping lists hands-free. Built using **React (Vite)** and **Vanilla CSS** with a clean slate design system, it uses the native **Web Speech API** for speech recognition and the **SpeechSynthesis API** for text-to-speech feedback.

---

## 🛠️ Tech Stack & Design
*   **Framework**: React (Vite)
*   **Styling**: Vanilla CSS (Slate/Indigo enterprise theme, optimized typography, keyboard focus outlines, high-contrast states)
*   **Speech Services**: Browser-Native Web Speech API (zero external cloud costs)
*   **State Management**: React Hooks (`useState`, `useCallback`, `useMemo`) synchronized with `localStorage`
*   **Zero Dependencies**: Minimal setup utilizing only React and native browser capabilities.

---

## 📐 Architecture & Rationale (200-Word Interview Write-up)
> Our solution implements a browser-native, client-side architecture using React (Vite) and Vanilla CSS, eliminating backend latency and API costs. Speech recognition is powered by the browser's Web Speech API (`SpeechRecognition`), supporting multilingual audio streams (English, Hindi, Spanish). A custom rule-based Natural Language Processing (NLP) parser extracts verbs, quantities, organic preferences, and price filters using token-matching regex patterns. The application uses the `SpeechSynthesis` API to provide real-time audio confirmations, making it hands-free and accessible. State management relies on React's hook architecture (`useSpeechRecognition`, `useCallback`) synchronized with `localStorage` for offline persistence. To optimize UX, the app uses an enterprise-grade slate dashboard, a live status bar, a collapsible developer command console showing structured JSON intents, and a dynamic inventory substitution system that handles out-of-stock items interactively (via voice confirmation prompts). This architecture delivers a responsive, production-quality assistant requiring zero external server dependencies.

---

## 🎙️ Sample Voice Commands

### 🇬🇧 English
* **Add Items**: *"Add 3 bottles of water"*, *"I need some chocolate cookies"*, *"Add organic eggs"*
* **Remove Items**: *"Remove white bread"*, *"Delete cookies"*
* **Search / Filter**: *"Find potato chips"*, *"Find toothpaste under 5 dollars"*
* **Clear**: *"Clear my list"*

### 🇮🇳 Hindi (हिन्दी)
* **Add Items**: *"तीन सेब जोड़ें"*, *"दूध डालो"*, *"पानी जोड़ो"*
* **Remove Items**: *"सेब हटाओ"*, *"दूध निकालें"*
* **Search / Filter**: *"चॉकलेट खोजें"*, *"चिप्स पाँच रुपये से कम"*
* **Clear**: *"सूची साफ करें"*

### 🇪🇸 Spanish (Español)
* **Add Items**: *"Añadir dos de leche"*, *"Necesito tres manzanas"*
* **Remove Items**: *"Quitar pan"*, *"Elimina galletas"*
* **Search**: *"Buscar chocolate"*, *"Refresco menos de 5 dólares"*
* **Clear**: *"Limpiar lista"*

---

## 🏃 How to Run Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18.0.0 or higher recommended).

### Steps
1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd voice-shopping-assistant
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`. Make sure to **grant microphone permissions** when prompted!

4. **Build for production**:
   ```bash
   npm run build
   ```
   This creates a static production bundle in the `dist/` directory, ready to be hosted on Vercel, Netlify, or GitHub Pages.

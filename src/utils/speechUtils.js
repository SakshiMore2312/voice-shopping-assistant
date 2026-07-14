// Web Speech Synthesis (TTS) Helper with Callback Hooks to Prevent Feedback Loops

export const speakText = (text, lang = "en-US", onStart = null, onEnd = null) => {
  if (!window.speechSynthesis) {
    console.warn("Speech Synthesis not supported in this browser.");
    if (onStart) onStart();
    if (onEnd) onEnd();
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  
  // Match a suitable system voice
  const voices = window.speechSynthesis.getVoices();
  let voice = null;

  if (lang.startsWith("hi")) {
    voice = voices.find(v => v.lang.includes("hi-IN") || v.lang.includes("hi"));
  } else if (lang.startsWith("es")) {
    voice = voices.find(v => v.lang.includes("es-ES") || v.lang.includes("es"));
  } else {
    // English default
    voice = voices.find(v => v.lang.includes("en-US") || v.lang.includes("en"));
  }

  if (voice) {
    utterance.voice = voice;
  }

  utterance.pitch = 1.0;
  utterance.rate = 1.05; // Natural conversational rate

  // Attach event hooks
  if (onStart) {
    utterance.onstart = () => {
      onStart();
    };
  }

  if (onEnd) {
    utterance.onend = () => {
      onEnd();
    };
    utterance.onerror = (e) => {
      console.warn("Speech Synthesis utterance error:", e);
      onEnd(); // Recover by triggering end callback
    };
  }

  window.speechSynthesis.speak(utterance);
};

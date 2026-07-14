import { useState, useEffect, useRef } from "react";

export const useSpeechRecognition = ({ onResult, lang = "en-US" }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState(null);
  
  const recognitionRef = useRef(null);
  const onResultRef = useRef(onResult);

  // Keep callback ref updated to prevent re-initializing recognition on callback change
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    // Check browser compatibility
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Stop when the user stops speaking
    recognition.interimResults = true; // Show words in progress
    recognition.lang = lang;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setTranscript("");
      setInterimTranscript("");
    };

    recognition.onresult = (event) => {
      let interimText = "";
      let finalText = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript;
        } else {
          interimText += event.results[i][0].transcript;
        }
      }

      setInterimTranscript(interimText);
      if (finalText) {
        setTranscript(finalText);
        if (onResultRef.current) {
          onResultRef.current(finalText);
        }
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      
      // Handle blocked permission separately for better UX
      if (event.error === "not-allowed") {
        setError("Microphone access was denied. Please check site permissions.");
      } else if (event.error !== "no-speech") {
        setError(`Speech Error: ${event.error}`);
      }
      
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    // Cleanup: stop recognition if active and remove ref
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.warn("Failed to abort speech recognition on cleanup:", e);
        }
      }
    };
  }, [lang]);

  const startListening = () => {
    if (!recognitionRef.current) return;
    try {
      setTranscript("");
      setInterimTranscript("");
      recognitionRef.current.start();
    } catch (e) {
      console.warn("Speech recognition is already running:", e);
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (e) {
      console.warn("Failed to stop speech recognition:", e);
    }
  };

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    supported: !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  };
};

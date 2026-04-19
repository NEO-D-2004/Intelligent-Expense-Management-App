import { Capacitor } from '@capacitor/core';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

// Types for Web Speech API
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

const { webkitSpeechRecognition, SpeechRecognition: WebSpeechRecognition } = window as unknown as IWindow;
const SpeechRecognitionConstructor = WebSpeechRecognition || webkitSpeechRecognition;

// Keep a reference to the active web recognition instance so we can stop it
let webRecognitionInstance: any = null;

export const isVoiceSupported = () => {
    if (Capacitor.isNativePlatform()) return true;
    return !!SpeechRecognitionConstructor && 'speechSynthesis' in window;
};

export const startListening = async (
    onResult: (text: string) => void,
    onError: (error: string) => void,
    onEnd: () => void
) => {
    if (Capacitor.isNativePlatform()) {
        try {
            const hasPerm = await SpeechRecognition.checkPermissions();
            if (hasPerm.speechRecognition !== 'granted') {
                await SpeechRecognition.requestPermissions();
            }

            // Clean up any old listeners
            await SpeechRecognition.removeAllListeners();
            
            // Listen for continuous transcription updates
            SpeechRecognition.addListener('partialResults', (data: any) => {
                if (data.matches && data.matches.length > 0) {
                    onResult(data.matches[0]);
                }
            });

            // Start native listening. Using popup: true is often more reliable on Android 
            // for auto-stopping after speech, giving a clear Google Voice UI.
            await SpeechRecognition.start({
                language: 'en-US',
                maxResults: 1,
                prompt: 'Speak your expense details',
                partialResults: true,
                popup: true,
            });
            
            // For popup: true, the start() promise resolves when the popup closes (speech finished)
            onEnd();

        } catch (e: any) {
            console.error("Native Speech Error:", e);
            onError(e.message || "Native microphone error");
            onEnd();
        }
        return;
    }

    // --- Web Implementation ---
    if (!SpeechRecognitionConstructor) {
        onError("Voice recognition is not supported in this browser.");
        return;
    }

    if (webRecognitionInstance) {
        try { webRecognitionInstance.stop(); } catch(e) {}
    }

    const recognition = new SpeechRecognitionConstructor();
    recognition.continuous = false;
    recognition.interimResults = true;
    webRecognitionInstance = recognition;

    let finalTranscript = '';

    recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        onResult(finalTranscript || interimTranscript);
    };

    recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
            onError("Microphone access denied. Please enable it in permissions.");
        } else if (event.error !== 'no-speech') {
            onError("Voice recognition error: " + event.error);
        }
    };

    recognition.onend = () => {
        webRecognitionInstance = null;
        onEnd();
    };

    try {
        recognition.start();
    } catch (e) {
        console.error("Failed to start speech recognition:", e);
        onError("Could not start microphone.");
        webRecognitionInstance = null;
        onEnd();
    }
};

export const stopListening = async () => {
    if (Capacitor.isNativePlatform()) {
        try {
            await SpeechRecognition.stop();
        } catch (e) {}
    } else {
        if (webRecognitionInstance) {
            try { webRecognitionInstance.stop(); } catch(e) {}
        }
    }
};

export const speakText = async (text: string) => {
    const cleanText = text
        .replace(/[\u{1F600}-\u{1F6FF}]/gu, '') // Emoticons
        .replace(/[\u{2600}-\u{26FF}]/gu, '') // Misc symbols
        .replace(/[\u{2700}-\u{27BF}]/gu, '') // Dingbats
        .replace(/[*_~`#]/g, '') // Markdown
        .trim();

    if (!cleanText) return;

    if (Capacitor.isNativePlatform()) {
        try {
            await stopSpeaking();
            await TextToSpeech.speak({
                text: cleanText,
                lang: 'en-US',
                rate: 1.0,
                pitch: 1.0,
                volume: 1.0,
            });
        } catch (e) {
            console.error("Native TTS Error:", e);
        }
        return;
    }

    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = window.speechSynthesis.getVoices();
    const googleVoice = voices.find(v => v.name.includes('Google'));
    if (googleVoice) utterance.voice = googleVoice;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
};

export const stopSpeaking = async () => {
    if (Capacitor.isNativePlatform()) {
        try {
            await TextToSpeech.stop();
        } catch(e) {}
    } else {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    }
};

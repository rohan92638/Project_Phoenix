import React, { useState } from 'react';
import { parseVoiceTransaction } from '../services/api';
import { MdMic, MdMicOff } from "react-icons/md";

const VoiceButton = ({ onVoiceProcessed }) => {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // const parseTextLocally = (text) => {
    //     const lower = text.toLowerCase();

    //     // extract amount
    //     const amountMatch = lower.match(/\d+/);
    //     const amount = amountMatch ? parseInt(amountMatch[0]) : '';

    //     // category detection
    //     let category = 'Other';
    //     if (lower.includes('food') || lower.includes('groceries')) category = 'Food & Dining';
    //     else if (lower.includes('rent')) category = 'Rent';
    //     else if (lower.includes('movie') || lower.includes('entertainment')) category = 'Entertainment';
    //     else if (lower.includes('travel') || lower.includes('uber')) category = 'Transportation';
    //     else if (lower.includes('shopping')) category = 'Shopping';

    //     return {
    //         amount,
    //         description: text,
    //         category
    //     };
    // };

    // 🔹 Optional fallback (keep minimal)
    const fallbackParser = (text) => ({
        amount: '',
        description: text,
        category: 'Other',
        transaction_type: 'EXPENSE',
        confidence: 0
    });

    //const startListening = () => {
    const startListening = () => {
        if (isListening || isProcessing) return;
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Voice not supported in this browser");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN';
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);

        recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;
            console.log("User said:", transcript);
            setIsListening(false);
            setIsProcessing(true);

            try {
                // 🔥 CALL YOUR BACKEND AI
                const parsed = await parseVoiceTransaction(transcript);

                onVoiceProcessed(parsed);

            } catch (error) {
                console.error("AI failed:", error);

                // fallback only if backend fails
                const fallback = fallbackParser(transcript);
                onVoiceProcessed(fallback);
            }

            setIsProcessing(false);
        };

        // 🔥 USE LOCAL PARSER
        //     const parsed = parseTextLocally(transcript);

        //     onVoiceProcessed(parsed);

        //     setIsListening(false);
        // };

        //recognition.onerror = () => setIsListening(false);
        recognition.onerror = (event) => {
            console.error("Speech error:", event.error);
            setIsListening(false);
            setIsProcessing(false);
        };

        recognition.start();
    };

    return (
        <button
            type="button"
            onClick={startListening}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg
    ${isListening
                    ? 'bg-red-500 animate-pulse text-white scale-105'
                    : 'bg-gradient-to-br from-[#ffb59e] to-[#ff571a] text-[#2a0a0a] hover:scale-105 shadow-[0_10px_25px_rgba(255,87,26,0.4)]'
                }`}
        >
            {isListening ? <MdMicOff size={26} /> : <MdMic size={26} />}
        </button>
    );
};

export default VoiceButton;
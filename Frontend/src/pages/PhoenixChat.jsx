import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sendChatMessage, sendVoiceMessage } from '../services/api';
import { MdMic, MdMicOff, MdSend, MdArrowBack, MdVolumeUp, MdVolumeOff } from "react-icons/md";

const PhoenixChat = () => {
    const [messages, setMessages] = useState([
        { role: 'ai', text: "Hello! I am Phoenix AI, your personal finance assistant. Ask me anything about your spending, budget, or ask for financial advice!" }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Voice & Audio state
    const [isRecording, setIsRecording] = useState(false);
    const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(true);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const messagesEndRef = useRef(null);

    // Unique session ID for memory tracking
    const [sessionId] = useState(() => 'session_' + Math.random().toString(36).substring(2, 9));

    // Auto-scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ── TEXT SUBMISSION ──────────────────────────────────────────────
    const handleSendText = async (e) => {
        e?.preventDefault();
        if (!inputText.trim() || isLoading) return;

        const userMsg = inputText.trim();
        setInputText('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            const res = await sendChatMessage(userMsg, sessionId, voiceOutputEnabled);
            handleAiResponse(res);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I had trouble connecting to the server.", isError: true }]);
        } finally {
            setIsLoading(false);
        }
    };

    // ── VOICE RECORDING ──────────────────────────────────────────────
    const toggleRecording = async () => {
        if (isRecording) {
            // Stop recording
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        } else {
            // Start recording
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream);
                audioChunksRef.current = [];

                mediaRecorderRef.current.ondataavailable = (event) => {
                    if (event.data.size > 0) audioChunksRef.current.push(event.data);
                };

                mediaRecorderRef.current.onstop = async () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    stream.getTracks().forEach(track => track.stop()); // release mic
                    
                    setIsLoading(true);
                    setMessages(prev => [...prev, { role: 'user', text: "🎙️ [Voice Audio Sent]" }]);
                    
                    try {
                        const res = await sendVoiceMessage(audioBlob, sessionId);
                        
                        // Replace the placeholder with the actual transcript
                        setMessages(prev => {
                            const newMsgs = [...prev];
                            newMsgs[newMsgs.length - 1] = { role: 'user', text: `🎙️ "${res.transcript}"` };
                            return newMsgs;
                        });

                        handleAiResponse(res);
                    } catch (error) {
                        console.error("Voice error:", error);
                        setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I couldn't process your voice.", isError: true }]);
                    } finally {
                        setIsLoading(false);
                    }
                };

                mediaRecorderRef.current.start();
                setIsRecording(true);
            } catch (err) {
                console.error("Mic access denied:", err);
                alert("Please allow microphone access to use voice chat.");
            }
        }
    };

    // ── HANDLE AI RESPONSE & AUDIO PLAYBACK ──────────────────────────
    const handleAiResponse = (res) => {
        setMessages(prev => [...prev, { role: 'ai', text: res.reply }]);
        
        if (res.audio_base64 && voiceOutputEnabled) {
            try {
                const audio = new Audio("data:audio/mp3;base64," + res.audio_base64);
                audio.play();
            } catch (err) {
                console.error("Failed to play audio:", err);
            }
        }
    };

    return (
        <div className="min-h-screen bg-background font-body pb-20 md:pb-0 flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#1d0c26]/80 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-4">
                    <Link to="/finance-tracker" className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-primary hover:text-background transition-colors">
                        <MdArrowBack size={24} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-headline font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Phoenix AI</h1>
                        <p className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span> Online
                        </p>
                    </div>
                </div>
                <button 
                    onClick={() => setVoiceOutputEnabled(!voiceOutputEnabled)}
                    className={`p-2 rounded-full transition-colors ${voiceOutputEnabled ? 'bg-primary/20 text-primary' : 'bg-surface-container text-on-surface-variant'}`}
                    title={voiceOutputEnabled ? "Voice Output ON" : "Voice Output OFF"}
                >
                    {voiceOutputEnabled ? <MdVolumeUp size={24} /> : <MdVolumeOff size={24} />}
                </button>
            </header>

            {/* Chat Messages */}
            <main className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto w-full">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl ${
                            msg.role === 'user' 
                                ? 'bg-gradient-to-br from-primary to-[#ff571a] text-[#fff9ef] rounded-br-sm shadow-[0_5px_15px_rgba(255,87,26,0.3)]' 
                                : msg.isError
                                    ? 'bg-red-500/20 border border-red-500 text-red-200 rounded-bl-sm'
                                    : 'bg-surface-container-high border border-white/5 text-on-surface rounded-bl-sm shadow-md'
                        }`}>
                            <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                        </div>
                    </div>
                ))}
                
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-surface-container-high p-4 rounded-2xl rounded-bl-sm flex gap-2 items-center">
                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                            <span className="w-2 h-2 bg-tertiary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>

            {/* Input Area */}
            <div className="p-4 bg-[#1d0c26]/95 backdrop-blur-lg border-t border-white/5 sticky bottom-0">
                <div className="max-w-4xl mx-auto flex gap-2 items-end">
                    
                    {/* Voice Recording Button */}
                    <button
                        onClick={toggleRecording}
                        className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg ${
                            isRecording
                                ? 'bg-red-500 animate-pulse text-white scale-105'
                                : 'bg-surface-container-high text-on-surface hover:text-primary hover:bg-primary/10 border border-white/5'
                        }`}
                    >
                        {isRecording ? <MdMicOff size={28} /> : <MdMic size={28} />}
                    </button>

                    {/* Text Input */}
                    <form onSubmit={handleSendText} className="flex-1 flex bg-surface-container-high border border-white/5 rounded-2xl overflow-hidden focus-within:border-primary/50 transition-colors shadow-inner">
                        <textarea
                            rows={1}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendText();
                                }
                            }}
                            placeholder={isRecording ? "Listening..." : "Ask about your finances..."}
                            disabled={isRecording}
                            className="flex-1 bg-transparent text-on-surface placeholder:text-on-surface-variant p-4 resize-none outline-none text-sm md:text-base max-h-32"
                        />
                        <button 
                            type="submit"
                            disabled={!inputText.trim() || isLoading}
                            className="px-4 text-primary disabled:text-on-surface-variant/50 hover:bg-primary/10 transition-colors flex items-center justify-center"
                        >
                            <MdSend size={24} />
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
};

export default PhoenixChat;

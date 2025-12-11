import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaTimes, FaRobot } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

// Ganti nama file gambar Anda di sini
const MASCOT_IMAGE = "/images/mascot.png";

export default function TeacherAssistant({ user, className = "bottom-6" }) {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { id: 1, sender: 'bot', text: `Halo ${user.name}! 👋 Saya NetBot. Ada yang bisa dibantu?` }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), sender: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await axios.post(route('chatbot.ask'), { message: userMsg.text });
            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: response.data.reply }]);
        } catch (error) {
            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: "Maaf, koneksi terputus." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        // WRAPPER UTAMA (YANG MENANGANI DRAG)
        <motion.div
            drag
            dragMomentum={false}
            // Tambahkan dragElastic agar terasa lebih natural
            dragElastic={0.1}
            className={`fixed right-6 z-[100] flex flex-col items-end ${className}`}
        >

            {/* JENDELA CHAT */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20, originY: 1, originX: 1 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="bg-white w-80 md:w-96 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden mb-3 flex flex-col"
                        style={{ height: '500px', maxHeight: '60vh' }}
                        // Stop propagation agar klik di chat tidak dianggap drag
                        onPointerDownCapture={(e) => e.stopPropagation()}
                    >
                        <div className="bg-net-blue p-4 flex justify-between items-center text-white cursor-grab active:cursor-grabbing">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <FaRobot size={16} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">NetBot AI</h3>
                                    <div className="flex items-center gap-1 text-[10px] opacity-80">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm text-left ${
                                        msg.sender === 'user'
                                            ? 'bg-net-blue text-white rounded-br-none'
                                            : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
                                    }`}>
                                        <div className={`prose prose-sm max-w-none prose-p:mb-1 ${msg.sender === 'user' ? 'prose-invert' : ''}`}>
                                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isTyping && <div className="text-xs text-slate-400 italic ml-2">NetBot sedang mengetik...</div>}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2">
                            <input
                                type="text" value={input} onChange={(e) => setInput(e.target.value)}
                                placeholder="Tanya materi..."
                                className="flex-1 border-slate-200 rounded-full px-4 py-2 text-sm focus:ring-net-blue focus:border-net-blue"
                            />
                            <button type="submit" className="bg-net-teal text-white w-9 h-9 rounded-full flex items-center justify-center shadow hover:bg-teal-600 transition">
                                <FaPaperPlane size={12} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- TOMBOL MASKOT (HANDLE) --- */}
            {/* Gunakan div biasa dengan cursor grab */}
            <div
                className="relative group cursor-grab active:cursor-grabbing"
                onClick={() => setIsOpen(!isOpen)}
            >
                {/* Bubble Chat */}
                {!isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="absolute right-full mr-4 top-2 bg-white px-4 py-2 rounded-xl rounded-tr-none shadow-lg border border-slate-100 whitespace-nowrap pointer-events-none"
                    >
                        <p className="text-xs font-bold text-slate-700 text-center">Bingung? <br />Yuk tanya NetBot!</p>
                    </motion.div>
                )}

                {/* Notifikasi Merah */}
                {!isOpen && (
                    <span className="absolute top-0 right-0 flex h-4 w-4 z-20 pointer-events-none">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
                    </span>
                )}

                {/* GAMBAR MASKOT */}
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full bg-white shadow-xl flex items-center justify-center border-4 transition-colors duration-300 ${isOpen ? 'border-net-teal bg-blue-50' : 'border-white'}`}>
                    <img
                        src={MASCOT_IMAGE}
                        alt="Bot"
                        className="w-full h-full object-cover rounded-full select-none pointer-events-none" // <--- PERBAIKAN DISINI
                        draggable="false" // <--- DAN DISINI
                    />
                </div>
            </div>

        </motion.div>
    );
}

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPaperPlane, FaTimes, FaRobot } from "react-icons/fa";
import axios from "axios";
import ReactMarkdown from "react-markdown";

// URL Maskot (Bisa diganti dengan gambar lain)
const MASCOT_IMAGE = "/images/mascot.png";

export default function TeacherAssistant({ user }) {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: "bot",
            text: `Halo ${user.name}! 👋 Saya NetBot, asisten belajarmu. Ada yang bisa saya bantu tentang materi jaringan?`,
        },
    ]);
    const [isTyping, setIsTyping] = useState(false);

    // Auto scroll ke pesan terbawah
    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages, isOpen]);

    // --- OTAK CHATBOT (LOGIC SEDERHANA) ---
    // const generateReply = (text) => {
    //     const lowerText = text.toLowerCase();

    //     if (lowerText.includes("ip") || lowerText.includes("address")) {
    //         return "IP Address adalah identitas unik perangkat dalam jaringan. Ingat versi IPv4 terdiri dari 32 bit ya!";
    //     }
    //     if (lowerText.includes("subnet") || lowerText.includes("mask")) {
    //         return "Subnetting itu teknik memecah jaringan besar menjadi kecil. Kuncinya ada di Subnet Mask (contoh: 255.255.255.0).";
    //     }
    //     if (lowerText.includes("vlsm")) {
    //         return "VLSM (Variable Length Subnet Mask) itu cara efisien membagi IP sesuai kebutuhan host, jadi tidak ada IP yang terbuang percuma.";
    //     }
    //     if (lowerText.includes("biner") || lowerText.includes("binary")) {
    //         return "Bilangan biner cuma punya angka 0 dan 1. Komputer cuma ngerti bahasa ini loh.";
    //     }
    //     if (lowerText.includes("lupa") && lowerText.includes("password")) {
    //         return "Kalau lupa password, silakan lapor ke Pak Guru di kelas untuk direset ya.";
    //     }
    //     if (lowerText.includes("halo") || lowerText.includes("hai")) {
    //         return "Halo juga! Semangat belajarnya ya! 🚀";
    //     }
    //     if (
    //         lowerText.includes("makasih") ||
    //         lowerText.includes("terima kasih")
    //     ) {
    //         return "Sama-sama! Senang bisa membantu.";
    //     }

    //     return "Maaf, NetBot belum mengerti itu. Coba tanya tentang 'IP Address', 'Subnetting', atau 'VLSM'.";
    // };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        // 1. Tampilkan pesan user segera
        const userMsg = { id: Date.now(), sender: "user", text: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsTyping(true); // Animasi mengetik nyala

        try {
            // 2. Kirim request ke Backend Laravel
            const response = await axios.post(route("chatbot.ask"), {
                message: userMsg.text,
            });

            const replyText = response.data.reply;

            // 3. Tampilkan balasan AI
            const botMsg = {
                id: Date.now() + 1,
                sender: "bot",
                text: replyText,
            };
            setMessages((prev) => [...prev, botMsg]);
        } catch (error) {
            console.error("Chatbot Error:", error);
            const errorMsg = {
                id: Date.now() + 1,
                sender: "bot",
                text: "Waduh, koneksi internetmu sepertinya kurang stabil. NetBot tidak bisa terhubung ke server.",
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsTyping(false); // Matikan animasi
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end pointer-events-none">
            {/* JENDELA CHAT */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="pointer-events-auto bg-white w-80 md:w-96 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden mb-4 flex flex-col"
                        style={{ maxHeight: "500px", height: "60vh" }}
                    >
                        {/* Header Chat */}
                        <div className="bg-net-blue p-4 flex justify-between items-center text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <FaRobot size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">
                                        NetBot Assistant
                                    </h3>
                                    <div className="flex items-center gap-1 text-[10px] opacity-80">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>{" "}
                                        Online
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/70 hover:text-white transition"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Area Pesan */}
                        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${
                                        msg.sender === "user"
                                            ? "justify-end"
                                            : "justify-start"
                                    }`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm text-left ${
                                            msg.sender === "user"
                                                ? "bg-net-blue text-white rounded-br-none"
                                                : "bg-white text-slate-700 border border-slate-200 rounded-bl-none"
                                        }`}
                                    >
                                        {/* Kita bungkus ReactMarkdown dengan div, dan taruh className di div ini */}
                                        <div
                                            className={`prose prose-sm max-w-none prose-p:mb-2 prose-ul:list-disc prose-ul:ml-4 prose-ol:list-decimal prose-ol:ml-4 ${
                                                msg.sender === "user"
                                                    ? "prose-invert"
                                                    : ""
                                            }`}
                                        >
                                            <ReactMarkdown
                                                components={{
                                                    a: ({ node, ...props }) => (
                                                        <a
                                                            {...props}
                                                            className="underline font-bold"
                                                            target="_blank"
                                                        />
                                                    ),
                                                    strong: ({
                                                        node,
                                                        ...props
                                                    }) => (
                                                        <strong
                                                            {...props}
                                                            className="font-bold inherit"
                                                        />
                                                    ),
                                                }}
                                            >
                                                {msg.text}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-none flex gap-1">
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form
                            onSubmit={handleSend}
                            className="p-3 bg-white border-t border-slate-100 flex gap-2"
                        >
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Tanya sesuatu..."
                                className="flex-1 border-slate-200 rounded-full px-4 py-2 text-sm focus:ring-net-blue focus:border-net-blue bg-slate-50"
                            />
                            <button
                                type="submit"
                                className="bg-net-teal text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-teal-600 transition shadow-lg shadow-teal-100"
                            >
                                <FaPaperPlane size={14} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MASKOT BUTTON */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="pointer-events-auto relative group"
            >
                {/* Bubble Chat "Butuh Bantuan?" (Muncul kalau chat tertutup) */}
                {!isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="absolute right-full mr-4 top-2 bg-white px-3 py-1.5 rounded-xl shadow-md border border-slate-100 whitespace-nowrap text-xs font-bold text-slate-600"
                    >
                        Yuk tanya NetBot!
                        {/* Segitiga bubble */}
                        <div className="absolute top-1/2 -right-1 w-3 h-3 bg-white border-t border-r border-slate-100 transform rotate-45 -translate-y-1/2"></div>
                    </motion.div>
                )}

                {/* Gambar Maskot */}
                <div
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-full bg-white shadow-xl flex items-center justify-center border-4 transition-colors duration-300 ${
                        isOpen ? "border-net-teal bg-blue-50" : "border-white"
                    }`}
                >
                    <img
                        src={MASCOT_IMAGE}
                        alt="Bot Mascot"
                        className="w-full h-full object-cover transform scale-110"
                    />
                </div>

                {/* Badge Notifikasi (Merah) */}
                {!isOpen && (
                    <span className="absolute top-0 right-0 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
                    </span>
                )}
            </motion.button>
        </div>
    );
}

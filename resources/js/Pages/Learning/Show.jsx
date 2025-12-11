import React, { useState, useEffect } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    FaArrowLeft,
    FaCheckCircle,
    FaDesktop,
    FaListUl,
    FaTimesCircle,
    FaChevronRight,
    FaRedo,
    FaBookOpen,
    FaInfoCircle,
    FaChevronLeft
} from "react-icons/fa";
import TeacherAssistant from "@/Components/TeacherAssistant";
import SubnetVisualizerWrapper from "@/Components/Visualizer/SubnetVisualizerWrapper";
import confetti from "canvas-confetti";
import axios from 'axios';
import { motion, AnimatePresence } from "framer-motion";

export default function Show({ auth, lesson, next_lesson_url }) {
    // --- STATE ---
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [quizStatus, setQuizStatus] = useState("idle");
    const [showSimInstructions, setShowSimInstructions] = useState(true);

    const currentModule = lesson.modules[currentModuleIndex];
    const isLastModule = currentModuleIndex === lesson.modules.length - 1;
    const isSimulator = currentModule.type === 'simulator_vlsm' || currentModule.type === 'simulator_flsm';

    // --- 1. START TIMER ---
    useEffect(() => {
        axios.post(route('learning.start', lesson.id)).catch(console.error);
    }, []);

    // Reset state
    useEffect(() => {
        setSelectedOption(null);
        setQuizStatus("idle");
        if (isSimulator) setShowSimInstructions(true);
    }, [currentModuleIndex]);

    // --- LOGIC KUIS ---
    const handleOptionClick = (option) => {
        if (quizStatus === "correct") return;
        setSelectedOption(option);

        let quizData = currentModule.data;
        if (typeof quizData === 'string') try { quizData = JSON.parse(quizData); } catch(e){}

        const correctAnswer = quizData?.answer;

        if (option === correctAnswer) {
            setQuizStatus("correct");
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } else {
            setQuizStatus("incorrect");
            axios.post(route('learning.fail', lesson.id));
        }
    };

    // --- LOGIC NEXT ---
    const handleNext = () => {
        if (currentModule.type === "quiz" && quizStatus !== "correct") {
            alert("Selesaikan kuis dengan jawaban benar dulu ya!");
            return;
        }

        if (!isLastModule) {
            setCurrentModuleIndex((prev) => prev + 1);
        } else {
            if (confirm("Yakin ingin menyelesaikan level ini?")) {
                router.post(route("learning.complete", lesson.id));
            }
        }
    };

    const backLink = lesson.week?.course?.slug
        ? route('course.map', lesson.week.course.slug)
        : route('dashboard');

    let moduleConfig = {};
    try {
        if (currentModule.data && typeof currentModule.data === 'string') {
            moduleConfig = JSON.parse(currentModule.data);
        } else if (currentModule.data) {
            moduleConfig = currentModule.data;
        }
    } catch (e) {}

    return (
        <div className="h-screen flex flex-col bg-slate-50 font-sans overflow-hidden text-slate-800 relative">
            <Head title={lesson.title} />

            {/* HEADER (Fixed) */}
            <header className="h-16 bg-white flex items-center justify-between px-6 border-b border-slate-200 shrink-0 z-30 shadow-sm relative">
                <div className="flex items-center gap-4">
                    <Link href={backLink} className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-net-blue hover:text-white transition">
                        <FaArrowLeft />
                    </Link>
                    <div>
                        <h1 className="font-bold text-lg leading-tight text-slate-800">{lesson.title}</h1>
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                             <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold uppercase text-[10px]">
                                {currentModule.type.replace('_', ' ')}
                            </span>
                            <span>• Modul {currentModuleIndex + 1} / {lesson.modules.length}</span>
                        </div>
                    </div>
                </div>

                <div className="hidden md:flex flex-col w-1/3">
                    <div className="flex justify-between text-xs mb-1 text-slate-500 font-bold">
                        <span>Progress Belajar</span>
                        <span>{Math.round(((currentModuleIndex + 1) / lesson.modules.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-net-teal h-full transition-all duration-500" style={{ width: `${((currentModuleIndex + 1) / lesson.modules.length) * 100}%` }}></div>
                    </div>
                </div>
            </header>

            {/* CONTENT AREA */}
            <div className="flex-1 relative overflow-hidden bg-slate-100 h-full">

                {/* --- MODE SIMULATOR (FULLSCREEN) --- */}
                {isSimulator ? (
                    <div className="w-full h-full relative flex flex-col">
                        <div className="flex-1 relative z-0">
                            <SubnetVisualizerWrapper
                                moduleType={currentModule.type} // Kirim tipe (simulator_vlsm / simulator_flsm)
                                config={(() => {
                                    try {
                                        return typeof currentModule.data === 'string'
                                            ? JSON.parse(currentModule.data)
                                            : currentModule.data;
                                    } catch (e) { return {}; }
                                })()}
                            />
                        </div>

                        {/* === PANDUAN LAB (DRAGGABLE WRAPPER) === */}
                        {/* Wrapper ini yang menyimpan posisi X/Y */}
                        <motion.div
                            drag
                            dragMomentum={false} // Agar diam saat dilepas
                            // Posisi awal
                            initial={{ x: 20, y: 20 }}
                            className="absolute z-20"
                        >
                            <AnimatePresence mode="wait">
                                {showSimInstructions ? (
                                    // KONDISI 1: PANEL TERBUKA
                                    <motion.div
                                        key="panel"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="w-80 bg-white/95 backdrop-blur shadow-2xl rounded-xl border border-slate-200 flex flex-col max-h-[500px]"
                                    >
                                        {/* Header (Handle Drag) */}
                                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-blue-50/50 rounded-t-xl cursor-grab active:cursor-grabbing">
                                            <h3 className="font-bold text-slate-700 flex items-center gap-2 select-none">
                                                <FaBookOpen className="text-net-blue"/> Panduan Lab
                                            </h3>
                                            {/* Stop Propagation di tombol tutup biar ga dikira nge-drag */}
                                            <button onPointerDownCapture={(e) => e.stopPropagation()} onClick={() => setShowSimInstructions(false)} className="text-slate-400 hover:text-red-500">
                                                <FaTimesCircle />
                                            </button>
                                        </div>

                                        {/* Konten (Stop Propagation biar bisa scroll/select text) */}
                                        <div
                                            className="p-5 overflow-y-auto text-sm text-slate-600 space-y-3 prose prose-sm cursor-auto"
                                            onPointerDownCapture={(e) => e.stopPropagation()}
                                        >
                                            <div dangerouslySetInnerHTML={{ __html: currentModule.content || "<p>Ikuti langkah simulasi di area kerja.</p>" }} />
                                        </div>
                                    </motion.div>
                                ) : (
                                    // KONDISI 2: TOMBOL MINIMIZE (ICON)
                                    <motion.button
                                        key="button"
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0 }}
                                        onClick={() => setShowSimInstructions(true)}
                                        className="bg-white p-3 rounded-full shadow-lg text-net-blue hover:scale-110 transition border border-blue-100 cursor-grab active:cursor-grabbing"
                                        title="Buka Panduan"
                                    >
                                        <FaInfoCircle size={24} />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </motion.div>
                        {/* ========================================= */}

                        {/* Footer Simulator */}
                        <div className="absolute bottom-0 w-full h-20 bg-gradient-to-t from-white via-white/90 to-transparent flex items-center justify-between px-8 z-10 pointer-events-none">
                             {/* ... (Isi Footer Tetap Sama) ... */}
                             <div className="pointer-events-auto">
                                <button onClick={() => setCurrentModuleIndex(prev => Math.max(0, prev - 1))} disabled={currentModuleIndex === 0} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition bg-white/80 px-4 py-2 rounded-lg shadow-sm border border-slate-200">
                                    <FaChevronLeft /> Sebelumnya
                                </button>
                            </div>
                            <div className="pointer-events-auto">
                                <button onClick={handleNext} className="flex items-center gap-2 px-8 py-3 bg-net-blue text-white font-bold rounded-full shadow-xl hover:bg-blue-700 transition transform">
                                    {isLastModule ? 'Selesai Level' : 'Lanjut Materi'} <FaChevronRight />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    // ... (Bagian Layout B / Teks Tetap Sama) ...
                    <div className="h-full w-full overflow-y-auto custom-scrollbar relative">

                        {/* Wrapper Center */}
                        <div className="min-h-full flex justify-center pb-40 pt-6"> {/* pb-40 agar konten paling bawah tidak ketutup footer & chatbot */}
                            <div className="w-full max-w-4xl bg-white shadow-xl border border-slate-200 rounded-2xl p-8 md:p-12 animate-fade-in-up mx-4">

                                {/* 1. MATERI BACAAN */}
                                <div className="prose prose-lg max-w-none prose-slate
                                    prose-headings:text-net-blue
                                    prose-a:text-blue-600
                                    prose-img:rounded-xl prose-img:shadow-lg prose-img:mx-auto prose-img:max-h-[500px] prose-img:object-contain">

                                    <div dangerouslySetInnerHTML={{ __html: currentModule.content }} />
                                </div>

                                {/* 2. KUIS (JIKA ADA) */}
                                {currentModule.type === 'quiz' && (() => {
                                    let qData = currentModule.data;
                                    if (typeof qData === 'string') try { qData = JSON.parse(qData); } catch(e){}

                                    return (
                                        <div className="mt-12 pt-10 border-t border-slate-100">
                                            <div className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-200">
                                                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                                                    <span className="bg-net-teal text-white w-8 h-8 flex items-center justify-center rounded-full text-sm">?</span>
                                                    Uji Pemahaman
                                                </h3>
                                                <p className="text-lg font-medium text-slate-700 mb-6">{qData?.question}</p>

                                                <div className="grid gap-3">
                                                    {qData?.options?.map((opt, idx) => {
                                                        let btnClass = "bg-white border-2 border-slate-200 text-slate-600 hover:border-net-blue hover:text-net-blue hover:bg-blue-50";
                                                        let icon = <div className="w-6 h-6 rounded-full border-2 border-slate-300 text-xs flex items-center justify-center text-slate-400">{String.fromCharCode(65 + idx)}</div>;

                                                        if (selectedOption === opt) {
                                                            if (quizStatus === 'correct') {
                                                                btnClass = "bg-green-50 border-2 border-green-500 text-green-700";
                                                                icon = <FaCheckCircle className="text-green-500 text-xl" />;
                                                            } else if (quizStatus === 'incorrect') {
                                                                btnClass = "bg-red-50 border-2 border-red-500 text-red-700";
                                                                icon = <FaTimesCircle className="text-red-500 text-xl" />;
                                                            } else {
                                                                btnClass = "bg-blue-50 border-2 border-net-blue text-net-blue";
                                                            }
                                                        }

                                                        return (
                                                            <button
                                                                key={idx}
                                                                onClick={() => handleOptionClick(opt)}
                                                                disabled={quizStatus === 'correct'}
                                                                className={`w-full text-left px-5 py-4 rounded-xl transition-all font-medium flex justify-between items-center ${btnClass}`}
                                                            >
                                                                <span className="text-lg">{opt}</span>
                                                                {icon}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* === 3. FOOTER NAVIGASI (Sticky - Hanya muncul di Mode Baca) === */}
            {!isSimulator && (
                <div className="h-20 bg-white border-t border-slate-200 flex items-center justify-between px-8 shrink-0 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                     <button
                        onClick={() => setCurrentModuleIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentModuleIndex === 0}
                        className="flex items-center gap-2 text-slate-400 hover:text-slate-600 disabled:opacity-30 font-bold transition"
                    >
                        <FaChevronLeft /> Sebelumnya
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={currentModule.type === 'quiz' && quizStatus !== 'correct'}
                        className={`flex items-center gap-2 px-8 py-3 font-bold rounded-full shadow-lg transition-all transform hover:-translate-y-1 active:scale-95
                            ${currentModule.type === 'quiz' && quizStatus !== 'correct'
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                : 'bg-gradient-to-r from-net-blue to-blue-600 text-white shadow-blue-200 hover:shadow-blue-300'
                            }
                        `}
                    >
                        {isLastModule ? 'Selesai Level' : 'Lanjut Materi'} <FaChevronRight />
                    </button>
                </div>
            )}

            {/* === 4. CHATBOT DRAGGABLE (Posisi Default Di Atas Footer) === */}
            <TeacherAssistant user={auth?.user || { name: 'Siswa' }} className="bottom-28" />
        </div>
    );
}

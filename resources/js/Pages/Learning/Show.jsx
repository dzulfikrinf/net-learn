import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import {
    FaArrowLeft,
    FaCheckCircle,
    FaDesktop,
    FaListUl,
    FaTimesCircle,
    FaChevronRight,
    FaRedo,
} from "react-icons/fa";
import TeacherAssistant from "@/Components/TeacherAssistant";
import SubnetVisualizerWrapper from "@/Components/Visualizer/SubnetVisualizerWrapper";
import confetti from "canvas-confetti";
import ReactMarkdown from "react-markdown";

export default function Show({ auth, lesson, next_lesson_url }) {
    // --- STATE ---
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [quizStatus, setQuizStatus] = useState("idle");
    const [isFullscreen, setIsFullscreen] = useState(false);

    const currentModule = lesson.modules[currentModuleIndex];
    const isLastModule = currentModuleIndex === lesson.modules.length - 1;

    // --- PERBAIKAN DISINI: Parsing JSON Manual (Jaga-jaga kalau Laravel kirim string) ---
    let quizData = currentModule.data;
    try {
        if (typeof quizData === "string") {
            quizData = JSON.parse(quizData);
        }
    } catch (e) {
        console.error("Gagal parsing data kuis", e);
        quizData = {}; // Fallback biar gak error layar putih
    }

    // Reset state setiap kali pindah modul
    useEffect(() => {
        setSelectedOption(null);
        setQuizStatus("idle");
    }, [currentModuleIndex]);

    // --- LOGIC: CEK JAWABAN KUIS ---
    const handleOptionClick = (option) => {
        if (quizStatus === "correct") return;
        setSelectedOption(option);
        const correctAnswer = quizData?.answer;

        if (option === correctAnswer) {
            setQuizStatus("correct");
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } else {
            setQuizStatus("incorrect");
        }
    };

    // --- LOGIC: PINDAH SLIDE ---
    const handleNext = () => {
        if (currentModule.type === "quiz" && quizStatus !== "correct") {
            alert("Selesaikan kuis dengan jawaban benar dulu ya!");
            return;
        }

        if (!isLastModule) {
            setCurrentModuleIndex((prev) => prev + 1);
        } else {
            if (confirm("Yakin ingin menyelesaikan level ini?")) {
                router.post(
                    route("learning.complete", lesson.id),
                    {},
                    {
                        onSuccess: () => {},
                    }
                );
            }
        }
    };

    console.log("Data Modul Saat Ini:", currentModule);
    console.log("Isi Data Kuis:", currentModule.data);

    return (
        // 1. CONTAINER UTAMA (Layar Penuh, Tidak Scroll di Body)
        <div className="h-screen flex flex-col bg-slate-50 font-sans overflow-hidden text-slate-800 relative">
            <Head title={lesson.title} />

            {/* 2. HEADER (Fixed Height) */}
            <header className="h-16 bg-white flex items-center justify-between px-6 border-b border-slate-200 shrink-0 z-30 shadow-sm">
                <div className="flex items-center gap-4">
                    <Link
                        href={route("dashboard")}
                        className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-net-blue hover:text-white transition"
                    >
                        <FaArrowLeft />
                    </Link>
                    <div>
                        <h1 className="font-bold text-lg leading-tight text-slate-800">
                            {lesson.title}
                        </h1>
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold">
                                Modul {currentModuleIndex + 1} /{" "}
                                {lesson.modules.length}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="hidden md:flex flex-col w-1/3">
                    <div className="flex justify-between text-xs mb-1 text-slate-500 font-bold">
                        <span>Progress Belajar</span>
                        <span>
                            {Math.round(
                                ((currentModuleIndex + 1) /
                                    lesson.modules.length) *
                                    100
                            )}
                            %
                        </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div
                            className="bg-net-teal h-full transition-all duration-500"
                            style={{
                                width: `${
                                    ((currentModuleIndex + 1) /
                                        lesson.modules.length) *
                                    100
                                }%`,
                            }}
                        ></div>
                    </div>
                </div>
            </header>

            {/* 3. KONTEN SPLIT SCREEN (Flex Row, Mengisi Sisa Tinggi) */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative h-full">
                {/* --- KOLOM KIRI: MATERI (Scrollable Independen) --- */}
                <div
                    className={`
                        h-full overflow-y-auto bg-white border-r border-slate-200 z-20 transition-all duration-300
                        ${
                            isFullscreen
                                ? "hidden"
                                : "w-full md:w-[35%] lg:w-[30%] shrink-0"
                        }
                    `}
                >
                    <div className="p-6 pb-24">
                        {" "}
                        {/* pb-24 biar konten bawah gak ketutup di HP */}
                        <span className="inline-block px-3 py-1 rounded text-xs font-bold bg-blue-50 text-net-blue mb-6 uppercase tracking-wide border border-blue-100">
                            {currentModule.type}
                        </span>
                        <div className="prose prose-slate prose-sm max-w-none">
                            {/* Render Materi Teks / Kuis */}
                            {currentModule.type !== "simulator_vlsm" && (
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: currentModule.content,
                                    }}
                                />
                            )}

                            {/* Instruksi Khusus Simulator */}
                            {currentModule.type === "simulator_vlsm" && (
                                <div>
                                    <h3 className="font-bold text-lg mb-4">
                                        Panduan Laboratorium
                                    </h3>
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-slate-700 space-y-2">
                                        <p>
                                            <strong>1. Input Data:</strong>{" "}
                                            Masukkan IP Network Induk dan jumlah
                                            host yang dibutuhkan tiap ruangan.
                                        </p>
                                        <p>
                                            <strong>2. Mulai Hitung:</strong>{" "}
                                            Klik tombol Mulai untuk memproses.
                                        </p>
                                        <p>
                                            <strong>
                                                3. Langkah Demi Langkah:
                                            </strong>{" "}
                                            Ikuti panduan visualisasi untuk
                                            melihat bagaimana blok IP dibagi.
                                        </p>
                                        <p>
                                            <strong>4. Hasil Akhir:</strong>{" "}
                                            Lihat topologi jaringan yang
                                            terbentuk.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Tombol Navigasi Mobile Only */}
                        <div className="md:hidden mt-8 pt-4 border-t">
                            <button
                                onClick={handleNext}
                                className="w-full py-3 bg-net-blue text-white font-bold rounded-lg"
                            >
                                {isLastModule ? "Selesai" : "Selanjutnya"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- KOLOM KANAN: INTERAKTIF (Scrollable Independen & Sticky Footer) --- */}
                <div
                    className={`
                    ${
                        isFullscreen
                            ? "w-full"
                            : "hidden md:flex md:w-[65%] lg:w-[70%]"
                    }
                    h-full bg-slate-50 flex flex-col relative transition-all duration-300
                `}
                >
                    {/* Tombol Fullscreen Floating */}
                    <div className="absolute top-4 right-4 z-40">
                        <button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="bg-white p-2 rounded-lg shadow-sm border border-slate-200 text-slate-500 hover:text-net-blue transition"
                            title="Toggle Fullscreen"
                        >
                            {isFullscreen ? <FaListUl /> : <FaDesktop />}
                        </button>
                    </div>

                    {/* AREA KANVAS SIMULATOR (Mengisi ruang, Scrollable jika konten panjang) */}
                    <div className="flex-1 overflow-y-auto relative p-0">
                        <div className="min-h-full flex flex-col">
                            {/* LOGIKA TAMPILAN BERDASARKAN TIPE */}
                            {currentModule.type === "text" ||
                            currentModule.type === "quiz" ? (
                                // Tampilan Placeholder untuk Text/Quiz
                                <div className="flex-1 flex items-center justify-center p-8">
                                    {currentModule.type === "quiz" ? (
                                        // TAMPILAN KUIS
                                        <div className="w-full max-w-lg bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
                                            <h3 className="text-net-blue font-bold mb-4 text-xl border-b border-slate-100 pb-4">
                                                Kuis Pemahaman
                                            </h3>
                                            <p className="mb-6 text-lg font-medium text-slate-700">
                                                {quizData?.question}
                                            </p>
                                            <div className="space-y-3">
                                                {quizData?.options?.map(
                                                    (opt, idx) => {
                                                        let btnClass =
                                                            "bg-slate-50 border-transparent text-slate-600 hover:bg-blue-50 hover:border-net-blue";
                                                        let icon = null;
                                                        if (
                                                            selectedOption ===
                                                            opt
                                                        ) {
                                                            if (
                                                                quizStatus ===
                                                                "correct"
                                                            ) {
                                                                btnClass =
                                                                    "bg-green-100 border-green-500 text-green-800 ring-2 ring-green-200";
                                                                icon = (
                                                                    <FaCheckCircle className="text-green-600" />
                                                                );
                                                            } else if (
                                                                quizStatus ===
                                                                "incorrect"
                                                            ) {
                                                                btnClass =
                                                                    "bg-red-100 border-red-500 text-red-800 ring-2 ring-red-200";
                                                                icon = (
                                                                    <FaTimesCircle className="text-red-600" />
                                                                );
                                                            }
                                                        }
                                                        return (
                                                            <button
                                                                key={idx}
                                                                onClick={() =>
                                                                    handleOptionClick(
                                                                        opt
                                                                    )
                                                                }
                                                                disabled={
                                                                    quizStatus ===
                                                                    "correct"
                                                                }
                                                                className={`w-full text-left px-5 py-4 rounded-xl border transition font-medium group flex justify-between items-center ${btnClass}`}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <span className="inline-block w-6 font-bold text-slate-400">
                                                                        {String.fromCharCode(
                                                                            65 +
                                                                                idx
                                                                        )}
                                                                        .
                                                                    </span>{" "}
                                                                    {opt}
                                                                </div>
                                                                {icon}
                                                            </button>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        // TAMPILAN PLACEHOLDER TEXT
                                        <div className="text-center text-slate-400">
                                            <FaDesktop
                                                size={64}
                                                className="mx-auto mb-4 opacity-20"
                                            />
                                            <p className="text-lg font-medium">
                                                Area Baca
                                            </p>
                                            <p className="text-sm">
                                                Silakan baca materi di panel
                                                sebelah kiri.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // TAMPILAN SIMULATOR (Langsung Render Wrapper)
                                // Tanpa padding, tanpa margin, full width & height
                                <SubnetVisualizerWrapper />
                            )}
                        </div>
                    </div>

                    {/* FOOTER NAVIGASI (Sticky di Bawah Kanan) */}
                    {/* Ini yang bikin tombol tidak terbang menutupi konten */}
                    <div className="h-20 bg-white border-t border-slate-200 flex items-center justify-end px-8 shrink-0 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                        <button
                            onClick={handleNext}
                            disabled={
                                currentModule.type === "quiz" &&
                                quizStatus !== "correct"
                            }
                            className={`flex items-center gap-2 px-6 py-3 font-bold rounded-full shadow-lg transition transform hover:-translate-y-1
                                ${
                                    currentModule.type === "quiz" &&
                                    quizStatus !== "correct"
                                        ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                                        : "bg-net-blue text-white shadow-blue-200 hover:bg-blue-700"
                                }
                            `}
                        >
                            {isLastModule ? "Selesai Level" : "Lanjut Materi"}{" "}
                            <FaChevronRight size={12} />
                        </button>
                    </div>
                </div>
            </div>

            {/* CHATBOT (Fixed di atas segalanya) */}
            <div className="fixed bottom-40 right-6 z-[100] pointer-events-none">
                <div className="pointer-events-auto">
                    <TeacherAssistant user={auth?.user || { name: "Siswa" }} />
                </div>
            </div>
        </div>
    );
}

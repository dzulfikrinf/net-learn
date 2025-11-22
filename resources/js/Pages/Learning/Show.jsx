import React, { useState, useEffect } from "react";
import { Head, Link } from "@inertiajs/react";
import {
    FaArrowLeft,
    FaCheckCircle,
    FaDesktop,
    FaTimesCircle,
    FaChevronRight,
    FaRedo,
} from "react-icons/fa";
import confetti from "canvas-confetti"; // Opsional: Efek konfeti kalau benar (npm install canvas-confetti dulu kalo mau)
import VlsmSimulator from "@/Components/VlsmSimulator";

export default function Show({ lesson, next_lesson_url }) {
    // --- STATE ---
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null); // Jawaban yg dipilih user
    const [quizStatus, setQuizStatus] = useState("idle"); // 'idle', 'correct', 'incorrect'

    const currentModule = lesson.modules[currentModuleIndex];
    const isLastModule = currentModuleIndex === lesson.modules.length - 1;

    // Reset state setiap kali pindah modul/slide
    useEffect(() => {
        setSelectedOption(null);
        setQuizStatus("idle");
    }, [currentModuleIndex]);

    // --- LOGIC: CEK JAWABAN KUIS ---
    const handleOptionClick = (option) => {
        if (quizStatus === "correct") return; // Kalau sudah benar, gak bisa klik lagi

        setSelectedOption(option);

        // Ambil kunci jawaban dari database (JSON)
        const correctAnswer = currentModule.data?.answer;

        if (option === correctAnswer) {
            setQuizStatus("correct");
            // Efek Hore (Opsional)
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } else {
            setQuizStatus("incorrect");
        }
    };

    // --- LOGIC: PINDAH SLIDE ---
    const handleNext = () => {
        // Validasi: Kalau ini Kuis, harus jawab benar dulu baru boleh lanjut!
        if (currentModule.type === "quiz" && quizStatus !== "correct") {
            alert("Selesaikan kuis dengan jawaban benar dulu ya!");
            return;
        }

        if (!isLastModule) {
            setCurrentModuleIndex((prev) => prev + 1);
        } else {
            // TODO: Nanti di sini kita kirim request ke Backend untuk simpan progress
            alert("Level Selesai! XP Ditambahkan.");
            window.location.href = next_lesson_url;
        }
    };

    return (
        <div className="h-screen flex flex-col bg-slate-50 font-sans overflow-hidden text-slate-800">
            <Head title={lesson.title} />

            {/* HEADER */}
            <header className="h-16 bg-white flex items-center justify-between px-6 border-b border-slate-200 shrink-0 z-20">
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

            {/* MAIN SPLIT SCREEN */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* KIRI: MATERI */}
                <div className="w-full md:w-1/2 p-8 overflow-y-auto bg-white border-r border-slate-200 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
                    <div className="max-w-2xl mx-auto">
                        <span className="inline-block px-3 py-1 rounded text-xs font-bold bg-blue-50 text-net-blue mb-6 uppercase tracking-wide border border-blue-100">
                            {currentModule.type}
                        </span>
                        <div className="prose prose-slate prose-lg max-w-none">
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: currentModule.content,
                                }}
                            />
                        </div>
                        {/* Mobile Next Button */}
                        <div className="md:hidden mt-8 pt-8 border-t border-slate-100">
                            <button
                                onClick={handleNext}
                                className="w-full py-3 bg-net-blue text-white font-bold rounded-lg shadow-lg active:scale-95 transition"
                            >
                                {isLastModule ? "Selesai" : "Selanjutnya"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* KANAN: INTERAKTIF */}
                <div className="hidden md:flex w-1/2 bg-slate-100 relative flex-col p-4 h-full">
                    <div className="flex-1 flex items-center justify-center relative">
                        <div
                            className="absolute inset-0 opacity-50"
                            style={{
                                backgroundImage:
                                    "radial-gradient(#cbd5e1 2px, transparent 2px)",
                                backgroundSize: "24px 24px",
                            }}
                        ></div>

                        <div className="z-10 w-full max-w-md">
                            {/* TIPE: TEXT (BACAAN SAJA) */}
                            {currentModule.type === "text" && (
                                <div className="text-center text-slate-400">
                                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-200">
                                        <FaDesktop
                                            size={40}
                                            className="text-slate-300"
                                        />
                                    </div>
                                    <p className="font-medium text-slate-600">
                                        Baca materi di sebelah kiri.
                                    </p>
                                    <p className="text-sm text-slate-400">
                                        Klik tombol lanjut jika sudah paham.
                                    </p>
                                </div>
                            )}

                            {/* TIPE: KUIS (INTERAKTIF) */}
                            {currentModule.type === "quiz" && (
                                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
                                    <h3 className="text-net-blue font-bold mb-4 text-xl border-b border-slate-100 pb-4">
                                        Kuis Pemahaman
                                    </h3>
                                    <p className="mb-6 text-lg font-medium text-slate-700">
                                        {currentModule.data?.question}
                                    </p>

                                    <div className="space-y-3">
                                        {currentModule.data?.options?.map(
                                            (opt, idx) => {
                                                // Logic Mewarnai Tombol
                                                let btnClass =
                                                    "bg-slate-50 border-transparent text-slate-600 hover:bg-blue-50 hover:border-net-blue";
                                                let icon = null;

                                                // Jika tombol ini dipilih
                                                if (selectedOption === opt) {
                                                    if (
                                                        quizStatus === "correct"
                                                    ) {
                                                        btnClass =
                                                            "bg-green-100 border-green-500 text-green-800 ring-2 ring-green-200"; // Benar
                                                        icon = (
                                                            <FaCheckCircle className="text-green-600" />
                                                        );
                                                    } else if (
                                                        quizStatus ===
                                                        "incorrect"
                                                    ) {
                                                        btnClass =
                                                            "bg-red-100 border-red-500 text-red-800 ring-2 ring-red-200"; // Salah
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
                                                        } // Disable kalau sudah benar
                                                        className={`w-full text-left px-5 py-4 rounded-xl border transition font-medium group flex justify-between items-center ${btnClass}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="inline-block w-6 font-bold text-slate-400">
                                                                {String.fromCharCode(
                                                                    65 + idx
                                                                )}
                                                                .
                                                            </span>
                                                            {opt}
                                                        </div>
                                                        {icon}
                                                    </button>
                                                );
                                            }
                                        )}
                                    </div>

                                    {/* Pesan Feedback */}
                                    {quizStatus === "incorrect" && (
                                        <div className="mt-4 text-center text-red-500 font-bold text-sm animate-pulse flex items-center justify-center gap-2">
                                            <FaRedo /> Jawaban salah, coba lagi!
                                        </div>
                                    )}
                                    {quizStatus === "correct" && (
                                        <div className="mt-4 text-center text-green-600 font-bold text-sm animate-bounce">
                                            🎉 Jawaban Benar! Silakan lanjut.
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TIPE: SIMULATOR */}
                            {currentModule.type === "simulator_vlsm" && (
                                // Container Simulator Full Height
                                <div className="w-full h-full bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
                                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            Interactive Lab
                                        </span>
                                        <span className="text-xs bg-net-teal text-white px-2 py-0.5 rounded">
                                            VLSM Mode
                                        </span>
                                    </div>

                                    {/* Render Komponen VLSM Disini */}
                                    <div className="flex-1 relative">
                                        <VlsmSimulator />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* FOOTER KANAN */}
                    <div className="h-20 border-t border-slate-200 bg-white/80 backdrop-blur flex items-center justify-end px-8">
                        <button
                            onClick={handleNext}
                            // Disable tombol lanjut jika kuis belum benar (opsional, bisa dihapus disabled-nya kalau mau longgar)
                            disabled={
                                currentModule.type === "quiz" &&
                                quizStatus !== "correct"
                            }
                            className={`flex items-center gap-2 px-8 py-3 font-bold rounded-xl shadow-lg transition transform
                                ${
                                    currentModule.type === "quiz" &&
                                    quizStatus !== "correct"
                                        ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                                        : "bg-net-blue text-white shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1"
                                }
                            `}
                        >
                            {isLastModule ? "Selesai Level" : "Lanjut Materi"}{" "}
                            <FaChevronRight size={12} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

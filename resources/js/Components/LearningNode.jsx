import React from 'react';
import { Link } from '@inertiajs/react';
import { FaBook, FaCode, FaCheck, FaLock, FaStar } from 'react-icons/fa';

export default function LearningNode({ lesson, isLast }) {
    // Logic Status (Sementara kita pakai logic sederhana)
    // Nanti diintegrasikan dengan data real 'user_progress'
    const isLocked = lesson.week_id > 1;
    const isActive = !isLocked; // Anggap level minggu 1 aktif semua

    let bgClass = "bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed"; // Locked
    let Icon = FaLock;
    let glowClass = "";

    if (isActive) {
        // Style untuk Level yang sedang aktif (Warna Biru/Teal)
        bgClass = "bg-net-blue border-blue-700 text-white cursor-pointer hover:-translate-y-1 active:translate-y-1 active:border-b-0";
        Icon = lesson.type === 'quiz' ? FaStar : FaBook;
        glowClass = "shadow-[0_0_20px_rgba(64,112,173,0.4)]"; // Glow Biru
    }

    return (
        <div className="flex flex-col items-center relative z-10">

            {/* GARIS KABEL PENGHUBUNG KE BAWAH */}
            {!isLast && (
                <div className="absolute top-10 bottom-[-4rem] w-2 bg-slate-200 -z-10 rounded-full">
                    {/* Efek 'cairan' mengalir jika aktif (Opsional) */}
                    {isActive && <div className="w-full h-1/2 bg-blue-200 mx-auto rounded-full"></div>}
                </div>
            )}

            {/* WRAPPER TOMBOL (Supaya bisa ada Floating Label di samping) */}
            <div className="relative group my-6">

                {/* Label Judul (Muncul di Samping/Tooltip) */}
                <div className="absolute left-24 top-4 w-48 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block">
                    <div className="bg-white px-3 py-2 rounded-xl shadow-lg border border-slate-100 text-sm font-bold text-slate-700">
                        {lesson.title}
                        <div className="text-xs text-orange-500 font-normal">+{lesson.xp_reward} XP</div>
                        {/* Segitiga penunjuk */}
                        <div className="absolute top-3 -left-2 w-4 h-4 bg-white transform rotate-45 border-l border-b border-slate-100"></div>
                    </div>
                </div>

                {/* TOMBOL NODE UTAMA (Bentuk Hexagon/Squircle) */}
                <Link
                    href={isLocked ? '#' : route('learning.show', lesson.slug)}
                    className={`w-20 h-20 flex items-center justify-center rounded-3xl border-b-[6px] transition-all duration-200 ${bgClass} ${glowClass}`}
                >
                    <Icon size={28} />
                </Link>

                {/* BADGE "START" (Hanya muncul di level aktif paling bawah/next) */}
                {isActive && (
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm uppercase tracking-wider border border-white">
                            Start
                        </span>
                    </div>
                )}
            </div>

            {/* Judul Mobile (Muncul di bawah tombol kalau di HP) */}
            <div className="md:hidden text-center mb-8 max-w-[150px]">
                <div className="text-xs font-bold text-slate-700">{lesson.title}</div>
            </div>
        </div>
    );
}

import React from 'react';
import { Link } from '@inertiajs/react';
import { FaBook, FaCode, FaCheck, FaLock, FaStar } from 'react-icons/fa';

export default function LearningNode({ lesson, isLast }) {
    const status = lesson.status_user || 'locked'; // Default locked

    const isCompleted = status === 'completed';
    const isUnlocked = status === 'unlocked';
    const isLocked = status === 'locked';

    const isActive = isUnlocked;
    // -------------------------------------------

    let bgClass = "bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed"; // Default Locked
    let Icon = FaLock;
    let glowClass = "";

    if (isCompleted) {
        // HIJAU (Selesai)
        bgClass = "bg-green-500 border-green-700 text-white cursor-pointer hover:-translate-y-1";
        Icon = FaCheck;
        glowClass = "shadow-[0_0_15px_rgba(34,197,94,0.4)]";
    } else if (isUnlocked) {
        // BIRU (Sedang Aktif / Next)
        bgClass = "bg-net-blue border-blue-700 text-white cursor-pointer hover:-translate-y-1 animate-bounce-slow";
        Icon = lesson.type === 'quiz' ? FaStar : FaBook;
        glowClass = "shadow-[0_0_20px_rgba(64,112,173,0.4)]";
    }

    return (
        <div className="flex flex-col items-center relative z-10">

            {/* GARIS KABEL PENGHUBUNG KE BAWAH */}
            {!isLast && (
                <div className="absolute top-10 bottom-[-4rem] w-2 bg-slate-200 -z-10 rounded-full overflow-hidden">
                    {/* Efek 'cairan' mengalir HANYA jika level ini sudah selesai (mengalir ke bawah) */}
                    {isCompleted && <div className="w-full h-full bg-green-400 mx-auto rounded-full opacity-50"></div>}

                    {/* Atau jika sedang aktif (biru mengalir sedikit) */}
                    {isActive && <div className="w-full h-1/2 bg-net-blue mx-auto rounded-full opacity-30 blur-sm"></div>}
                </div>
            )}

            {/* WRAPPER TOMBOL */}
            <div className="relative group my-6">

                {/* Label Judul (Tooltip Desktop) */}
                <div className="absolute left-24 top-4 w-48 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block z-20">
                    <div className="bg-white px-3 py-2 rounded-xl shadow-lg border border-slate-100 text-sm font-bold text-slate-700 relative">
                        {lesson.title}
                        <div className="text-xs text-orange-500 font-normal">+{lesson.xp_reward} XP</div>
                        {/* Segitiga penunjuk */}
                        <div className="absolute top-3 -left-2 w-4 h-4 bg-white transform rotate-45 border-l border-b border-slate-100"></div>
                    </div>
                </div>

                {/* TOMBOL NODE UTAMA */}
                <Link
                    href={isLocked ? '#' : route('learning.show', lesson.slug)}
                    className={`w-20 h-20 flex items-center justify-center rounded-3xl border-b-[6px] transition-all duration-200 ${bgClass} ${glowClass}`}
                >
                    <Icon size={28} />
                </Link>

                {/* BADGE "START" (Hanya muncul di level yg sedang dikerjakan/unlocked) */}
                {isActive && (
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 z-20">
                        <span className="bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md uppercase tracking-wider border-2 border-white animate-pulse">
                            Start
                        </span>
                    </div>
                )}
            </div>

            {/* Judul Mobile */}
            <div className="md:hidden text-center mb-8 max-w-[150px]">
                <div className={`text-xs font-bold ${isActive ? 'text-net-blue' : 'text-slate-600'}`}>
                    {lesson.title}
                </div>
            </div>
        </div>
    );
}

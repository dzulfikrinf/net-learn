import React from 'react';
import { Link } from '@inertiajs/react';
import { FaLock, FaPlay, FaMedal, FaCheck } from 'react-icons/fa';

export default function LearningNode({ lesson, isLast, position = 'center', nextPosition = 'center' }) {
    const status = lesson.status_user || 'locked';
    const isCompleted = status === 'completed';
    const isUnlocked = status === 'unlocked';
    const isActive = isUnlocked;

    // --- 1. LOGIKA POSISI (HANYA ANGKA 0-100) ---
    // Jangan pakai tanda %, cukup angkanya saja.
    // Left = 25, Center = 50, Right = 75
    const getX = (pos) => {
        if (pos === 'left') return 25;
        if (pos === 'right') return 75;
        return 50;
    };

    const currentX = getX(position);
    const nextX = getX(nextPosition);

    // --- 2. LOGIKA WARNA & STYLE ---
    let btnClass = "bg-white border-4 border-slate-200 shadow-sm";
    let iconClass = "text-slate-300";
    let Icon = FaLock;
    let strokeColor = "#cbd5e1";
    let lineStyle = "stroke-dashed";

    if (isCompleted) {
        btnClass = "bg-gradient-to-b from-green-400 to-green-600 border-4 border-green-200 shadow-xl shadow-green-200/50 z-10 scale-110";
        iconClass = "text-white drop-shadow-md text-2xl";
        Icon = FaCheck;
        strokeColor = "#4ade80";
        lineStyle = "";
    } else if (isUnlocked) {
        btnClass = "bg-gradient-to-b from-blue-400 to-blue-600 border-4 border-blue-200 shadow-xl shadow-blue-200/50 scale-110 z-10 animate-bounce-slow";
        iconClass = "text-white drop-shadow-md text-xl pl-1";
        Icon = FaPlay;
        strokeColor = "#cbd5e1";
    }

    const linkHref = status !== 'locked' ? route('learning.show', lesson.slug) : '#';

    return (
        <div className="relative w-full h-36 flex justify-center">

            {/* === 3. KABEL SVG (Menggunakan Koordinat Angka) === */}
            {!isLast && (
                <svg
                    className="absolute top-10 left-0 w-full h-36 -z-10 pointer-events-none"
                    // viewBox membuat angka 0-100 menjadi relatif terhadap lebar layar
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                >
                    <path
                        // Disini kita pakai angka murni (currentX), bukan persen
                        d={`M ${currentX} 15 C ${currentX} 60, ${nextX} 40, ${nextX} 100`}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth="1.5" // Karena viewBox kecil (100), strokeWidth juga kecil
                        vectorEffect="non-scaling-stroke"
                        strokeLinecap="round"
                        className={`transition-all duration-1000 ${lineStyle === 'stroke-dashed' ? 'opacity-40' : 'opacity-100'}`}
                        strokeDasharray={lineStyle === 'stroke-dashed' ? "4,4" : "none"}
                    />

                    {isActive && (
                        <circle r="1" fill="#60a5fa">
                            <animateMotion
                                dur="1.5s"
                                repeatCount="indefinite"
                                path={`M ${currentX} 15 C ${currentX} 60, ${nextX} 40, ${nextX} 100`}
                            />
                        </circle>
                    )}
                </svg>
            )}

            {/* === 4. TOMBOL NODE (Menggunakan CSS Persen) === */}
            <div
                className="absolute top-0 transition-all duration-500 z-10"
                // Di sini kita tambahkan '%' secara manual agar CSS mengerti
                style={{ left: `${currentX}%`, transform: 'translateX(-50%)' }}
            >
                <div className="relative group">
                    <Link
                        href={linkHref}
                        className={`
                            w-20 h-20 rounded-full flex items-center justify-center
                            transition-all duration-300 ease-in-out relative
                            ${btnClass}
                            ${status === 'locked' ? 'cursor-not-allowed opacity-80 hover:bg-slate-50' : 'hover:scale-115 cursor-pointer'}
                        `}
                    >
                        <Icon className={`${iconClass} transition-transform duration-300 group-hover:rotate-12`} />
                        <div className="absolute top-2 right-4 w-3 h-3 bg-white opacity-30 rounded-full blur-[2px]"></div>
                    </Link>

                    <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-48 text-center">
                        <div className={`text-xs font-bold px-3 py-1.5 rounded-xl border shadow-sm inline-block transition-colors duration-300
                            ${isActive ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200'}
                        `}>
                            {lesson.title}
                        </div>
                    </div>

                    {isActive && (
                        <div className="absolute -top-4 -right-4 z-20 animate-bounce">
                            <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg border-2 border-white uppercase tracking-wider">
                                START
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

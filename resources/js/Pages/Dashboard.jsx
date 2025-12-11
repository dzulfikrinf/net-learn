import React from 'react';
import { Head, Link } from '@inertiajs/react';
import LearningNode from '@/Components/LearningNode';
import TeacherAssistant from '@/Components/TeacherAssistant';
import { FaFire, FaTrophy, FaUserAstronaut, FaSignOutAlt, FaMapMarkedAlt, FaStar, FaChartLine, FaMedal } from 'react-icons/fa';

export default function Dashboard({ auth, weeks, gamification, course }) {

    // --- LOGIKA ZIG-ZAG (Pola Ular) ---
    // 0: Center, 1: Right, 2: Center, 3: Left
    const getPosition = (index) => {
        const mod = index % 4;
        if (mod === 1) return 'right';
        if (mod === 3) return 'left';
        return 'center';
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex">
            <Head title={course ? course.title : "Peta Belajar"} />

            {/* === SIDEBAR KIRI (Navigasi Colorful) === */}
            <aside className="w-72 bg-white border-r border-slate-200 hidden md:flex flex-col p-6 sticky top-0 h-screen shadow-sm z-30">
                {/* Logo dengan Gradient Text */}
                <div className="flex items-center gap-3 mb-10">
                    <div className="bg-gradient-to-tr from-blue-500 to-cyan-400 p-2.5 rounded-xl shadow-lg shadow-blue-200">
                        <FaUserAstronaut size={24} className="text-white" />
                    </div>
                    <div>
                        <span className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                            NetLearn
                        </span>
                    </div>
                </div>

                <nav className="space-y-3 flex-1">
                    <div className="flex items-center gap-4 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold border-l-4 border-blue-500 shadow-sm transition-all hover:pl-6">
                        <FaMapMarkedAlt /> Peta Belajar
                    </div>
                    <Link href={route('leaderboard')} className="flex items-center gap-4 px-4 py-3 text-slate-500 hover:text-orange-500 hover:bg-orange-50 rounded-xl font-medium transition-all group">
                        <FaTrophy className="group-hover:scale-110 transition" /> Leaderboard
                    </Link>
                </nav>

                <Link href={route('logout')} method="post" as="button" className="flex items-center gap-3 text-slate-400 hover:text-red-500 transition mt-auto font-medium px-4 py-2 hover:bg-red-50 rounded-lg">
                    <FaSignOutAlt /> Log Out
                </Link>
            </aside>

            {/* === AREA UTAMA (Peta Belajar) === */}
            <main className="flex-1 relative overflow-y-auto h-screen bg-slate-50/50">
                {/* Background Pattern */}
                <div className="inset-0 opacity-30 pointer-events-none bg-grid-pattern fixed"></div>

                <div className="py-12 px-4 flex flex-col items-center min-h-full relative z-10 pb-40">

                    {/* Header Sambutan */}
                    <div className="text-center mb-16">
                        <h1 className="text-3xl font-black text-slate-800 mb-2">Petualangan Jaringan</h1>
                        <p className="text-slate-500">Selesaikan setiap node untuk membuka materi selanjutnya.</p>
                    </div>

                    {/* RENDER MAP */}
                    <div className="flex flex-col items-center w-full max-w-xl">
                        {weeks.map((week, weekIndex) => (
                            <div key={week.id} className="w-full flex flex-col items-center mb-10">

                                {/* Badge Judul Minggu */}
                                <div className="mb-10 bg-white border-2 border-slate-100 shadow-md px-6 py-2 rounded-full flex items-center gap-2 z-20 transform hover:scale-105 transition">
                                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse"></div>
                                    <span className="font-bold text-slate-600 uppercase tracking-widest text-xs">
                                        {week.title}
                                    </span>
                                </div>

                                {/* Nodes dalam Minggu Ini */}
                                <div className="flex flex-col items-center w-full">
                                    {week.lessons.map((lesson, index) => {
                                        // Logic Posisi ZigZag
                                        const position = getPosition(index);
                                        const nextIndex = index + 1;
                                        const nextPosition = nextIndex < week.lessons.length ? getPosition(nextIndex) : 'center'; // Default center kalau habis
                                        const isLastInWeek = index === week.lessons.length - 1;

                                        return (
                                            <LearningNode
                                                key={lesson.id}
                                                lesson={lesson}
                                                isLast={isLastInWeek && weekIndex === weeks.length - 1} // Cek benar-benar terakhir di semua minggu
                                                position={position}
                                                nextPosition={nextPosition}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* === SIDEBAR KANAN (Stats Cards Colorful) === */}
            <aside className="w-80 bg-white border-l border-slate-200 hidden lg:flex flex-col p-6 sticky top-0 h-screen shadow-sm z-30 overflow-y-auto">

                <h3 className="font-bold text-slate-700 mb-6 text-lg">Status Pemain</h3>

                {/* Card 1: Bintang (Gradient Orange) */}
                <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-5 text-white shadow-lg shadow-orange-200 mb-4 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 opacity-20 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition">
                        <FaStar size={80} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-1 opacity-90 text-sm font-medium">
                            <FaStar /> Total Bintang
                        </div>
                        <div className="text-4xl font-black">{gamification.stars}</div>
                        <div className="text-xs opacity-75 mt-2 bg-white/20 inline-block px-2 py-1 rounded">Terus kumpulkan!</div>
                    </div>
                </div>

                {/* Card 2: XP (Gradient Blue) */}
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-200 mb-6 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 opacity-20 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition">
                        <FaTrophy size={80} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-1 opacity-90 text-sm font-medium">
                            <FaTrophy /> Experience (XP)
                        </div>
                        <div className="text-4xl font-black">{gamification.xp}</div>
                        <div className="text-xs opacity-75 mt-2 bg-white/20 inline-block px-2 py-1 rounded">Rank: {gamification.rank}</div>
                    </div>
                </div>

                {/* Target Harian (Flat Style) */}
                <div className="border-2 border-slate-100 rounded-2xl p-5">
                    <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <FaMedal className="text-purple-500"/> Misi Harian
                    </h4>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                            <div className="w-5 h-5 rounded-full border-2 border-green-400 bg-green-100 flex items-center justify-center text-green-600 text-xs">✓</div>
                            Login Hari Ini
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                            <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center text-xs"></div>
                            Selesaikan 1 Level
                        </div>
                    </div>
                </div>

            </aside>

            {/* CHATBOT (Muncul di Kanan Bawah) */}
            <TeacherAssistant user={auth.user} className="bottom-6" />
        </div>
    );
}

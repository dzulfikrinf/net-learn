import React from "react";
import { Head, Link } from "@inertiajs/react";
import LearningNode from "@/Components/LearningNode";
import TeacherAssistant from "@/Components/TeacherAssistant";
import {
    FaStar,
    FaTrophy,
    FaUserGraduate,
    FaSignOutAlt,
    FaBookOpen,
    FaNetworkWired,
    FaMapMarkerAlt,
} from "react-icons/fa";

export default function Dashboard({ auth, weeks, gamification }) {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex">
            <Head title="Peta Belajar" />

            {/* === SIDEBAR KIRI (Tetap Sama) === */}
            <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col p-6 sticky top-0 h-screen shadow-sm z-20">
                <div className="flex items-center gap-3 mb-10 text-net-blue">
                    <FaNetworkWired size={32} />
                    <span className="text-2xl font-bold tracking-tighter">
                        NetLearn
                    </span>
                </div>
                <nav className="space-y-2 flex-1">
                    <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-net-blue rounded-xl font-semibold border border-blue-100">
                        <FaMapMarkerAlt /> Peta Belajar
                    </div>
                    <Link
                        href={route("leaderboard")}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition cursor-pointer font-medium
                        ${
                            route().current("leaderboard")
                                ? "bg-blue-50 text-net-blue border border-blue-100"
                                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                        }`}
                    >
                        <FaTrophy /> Leaderboard
                    </Link>
                </nav>
                <Link
                    href={route("logout")}
                    method="post"
                    as="button"
                    className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition mt-auto font-medium"
                >
                    <FaSignOutAlt /> Log Out
                </Link>
            </aside>

            {/* === AREA UTAMA (Peta Vertikal) === */}
            <main className="flex-1 relative overflow-y-auto h-screen">
                {/* Background Pattern (Titik-titik) */}
                <div
                    className="absolute inset-0 opacity-40 pointer-events-none"
                    style={{
                        backgroundImage:
                            "radial-gradient(#cbd5e1 2px, transparent 2px)",
                        backgroundSize: "30px 30px",
                    }}
                ></div>

                {/* Header Mobile */}
                <div className="md:hidden p-4 bg-white/80 backdrop-blur sticky top-0 z-50 flex justify-between items-center border-b border-slate-200">
                    <span className="font-bold text-net-blue">NetLearn</span>
                    <span className="text-yellow-500 flex items-center gap-1 font-bold">
                        <FaStar /> {auth.user.stars}
                    </span>
                </div>

                <div className="py-12 px-4 flex flex-col items-center min-h-full relative z-10">
                    {/* Header Selamat Datang */}
                    <div className="text-center mb-16">
                        <h1 className="text-3xl font-black text-slate-800 mb-2">
                            Jalur Kompetensi
                        </h1>
                        <p className="text-slate-500">
                            Selesaikan setiap node untuk membuka materi
                            selanjutnya.
                        </p>
                    </div>

                    {/* LOOPING MINGGU & LEVEL */}
                    <div className="flex flex-col items-center w-full max-w-md">
                        {weeks.map((week, weekIndex) => (
                            <div
                                key={week.id}
                                className="w-full flex flex-col items-center"
                            >
                                {/* Penanda Minggu (Bendera) */}
                                <div className="mb-8 mt-4 bg-white border border-slate-200 shadow-sm px-6 py-2 rounded-full flex items-center gap-2 z-20">
                                    <div className="w-3 h-3 rounded-full bg-net-teal animate-pulse"></div>
                                    <span className="font-bold text-slate-600 uppercase tracking-widest text-xs">
                                        {week.title}
                                    </span>
                                </div>

                                {/* Nodes / Levels */}
                                <div className="flex flex-col items-center">
                                    {week.lessons.map((lesson, index) => {
                                        // Cek apakah ini node terakhir di minggu ini
                                        // Jika YA, dan bukan minggu terakhir, tetap gambar garis ke minggu berikutnya
                                        const isLastInWeek =
                                            index === week.lessons.length - 1;
                                        const isVeryLast =
                                            isLastInWeek &&
                                            weekIndex === weeks.length - 1;

                                        return (
                                            <LearningNode
                                                key={lesson.id}
                                                lesson={lesson}
                                                isLast={isVeryLast} // Garis putus hanya kalau benar2 materi habis
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {/* Trophy Akhir (Goal) */}
                        <div className="mt-8 mb-24 flex flex-col items-center opacity-50 grayscale">
                            <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center border-4 border-slate-300">
                                <FaTrophy
                                    size={40}
                                    className="text-slate-400"
                                />
                            </div>
                            <span className="font-bold text-slate-400 mt-2">
                                SERTIFIKAT
                            </span>
                        </div>
                    </div>
                </div>
            </main>

            {/* === SIDEBAR KANAN (Stats) === */}
            <aside className="w-80 bg-white p-6 hidden lg:block sticky top-0 h-screen border-l border-slate-200 shadow-sm z-20">
                <div className="flex justify-between mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 text-yellow-500 font-bold">
                        <FaStar className="text-xl drop-shadow-sm animate-pulse" />
                        {/* Ambil data stars langsung dari auth.user */}
                        <span>{auth.user.stars} Bintang</span>
                    </div>
                    <div className="flex items-center gap-2 text-net-blue font-bold">
                        <FaTrophy /> <span>{gamification.xp} XP</span>
                    </div>
                </div>

                {/* Widget Target Harian */}
                <div className="border border-slate-200 rounded-2xl p-6 mb-6 relative overflow-hidden">
                    <h3 className="font-bold text-lg mb-2 text-slate-700">
                        Target Hari Ini 🎯
                    </h3>
                    <p className="text-slate-400 text-xs mb-4">
                        Selesaikan 2 Node untuk menjaga streak!
                    </p>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div className="bg-net-teal h-full w-[40%]"></div>
                    </div>
                </div>

                <div className="bg-net-blue text-white rounded-2xl p-6 shadow-lg shadow-blue-200 relative">
                    <FaUserGraduate className="absolute right-4 top-4 opacity-20 text-5xl" />
                    <h3 className="font-bold text-lg mb-1">Profil Siswa</h3>
                    <p className="text-blue-100 text-xs mb-4">
                        {auth.user.email}
                    </p>
                    <div className="text-2xl font-black">
                        {gamification.rank}
                    </div>
                </div>
            </aside>
            <TeacherAssistant user={auth.user} />
        </div>
    );
}

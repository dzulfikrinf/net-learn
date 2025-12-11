import React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    FaNetworkWired, FaCode, FaUserAstronaut, FaSignOutAlt, FaArrowRight,
    FaPenNib, FaVideo, FaMicrochip, FaUserTie, FaBook
} from 'react-icons/fa';

// 1. MAPPING ICON (Database String -> React Component)
const iconMap = {
    'FaNetworkWired': FaNetworkWired,
    'FaCode': FaCode,
    'FaPenNib': FaPenNib,
    'FaVideo': FaVideo,
    'FaMicrochip': FaMicrochip,
    'FaUserTie': FaUserTie,
    'FaBook': FaBook,
};

// 2. MAPPING WARNA (Database String -> Tailwind CSS Classes)
// Pastikan key disini SAMA PERSIS dengan value di <option> Admin Panel
const themeMap = {
    'blue': 'from-blue-500 to-cyan-400 shadow-blue-200',
    'purple': 'from-purple-500 to-pink-400 shadow-purple-200',
    'green': 'from-emerald-500 to-teal-400 shadow-emerald-200',
    'orange': 'from-orange-400 to-amber-400 shadow-orange-200', // <--- INI YANG HILANG TADI
    'red': 'from-rose-500 to-red-400 shadow-rose-200',
    'teal': 'from-teal-500 to-cyan-400 shadow-teal-200',
};

export default function CourseSelection({ courses, user }) {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 relative overflow-hidden">
            <Head title="Pilih Materi" />

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-40 pointer-events-none bg-grid-pattern"></div>

            {/* NAVBAR */}
            <nav className="relative z-10 px-8 py-6 flex justify-between items-center max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-tr from-blue-600 to-cyan-500 p-2 rounded-xl shadow-lg">
                        <FaUserAstronaut size={20} className="text-white" />
                    </div>
                    <span className="text-xl font-black tracking-tighter text-slate-800">NetLearn</span>
                </div>
                <div className="flex items-center gap-6">
                    <span className="text-sm font-medium text-slate-500">Halo, <span className="text-slate-800 font-bold">{user.name}</span></span>
                    <Link href={route('logout')} method="post" as="button" className="text-sm font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-full transition">
                        Keluar
                    </Link>
                </div>
            </nav>

            {/* KONTEN UTAMA */}
            <main className="relative z-10 max-w-7xl mx-auto px-8 pt-10 pb-20">

                <div className="text-center mb-16">
                    <h1 className="text-4xl font-black text-slate-900 mb-4">Mau belajar apa hari ini?</h1>
                    <p className="text-slate-500 text-lg">Pilih kelas untuk melanjutkan petualanganmu.</p>
                </div>

                {/* GRID COURSE CARD */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map((course) => {
                        // Ambil komponen ikon, default FaBook jika tidak ketemu
                        const IconComponent = iconMap[course.icon] || FaBook;

                        // Ambil warna, default Blue jika tidak ketemu (orange pasti ketemu sekarang)
                        const themeClass = themeMap[course.theme] || themeMap['blue'];

                        return (
                            <Link
                                key={course.id}
                                href={route('course.map', course.slug)}
                                className="group relative bg-white rounded-3xl p-3 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-100"
                            >
                                {/* Card Image / Icon Header */}
                                <div className={`h-48 rounded-2xl bg-gradient-to-br ${themeClass} flex items-center justify-center relative overflow-hidden`}>
                                    {/* Hiasan Background di dalam kartu */}
                                    <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition"></div>

                                    <IconComponent size={72} className="text-white drop-shadow-md transform group-hover:scale-110 transition duration-500 relative z-10" />

                                    {/* Progress Badge */}
                                    <div className="absolute bottom-4 right-4 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold border border-white/20 shadow-sm">
                                        {course.progress}% Selesai
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition line-clamp-1">
                                        {course.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm mb-6 line-clamp-2 h-10 leading-relaxed">
                                        {course.description || "Tidak ada deskripsi."}
                                    </p>

                                    {/* Progress Bar Kecil */}
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-6">
                                        <div
                                            className={`h-full bg-gradient-to-r ${themeClass}`}
                                            style={{ width: `${course.progress}%` }}
                                        ></div>
                                    </div>

                                    {/* Tombol Action */}
                                    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded">
                                            {course.completed_lessons} / {course.total_lessons} LEVEL
                                        </span>
                                        <span className="flex items-center gap-2 text-sm font-bold text-slate-700 group-hover:translate-x-1 transition">
                                            Masuk Kelas <FaArrowRight size={12} />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

            </main>
        </div>
    );
}

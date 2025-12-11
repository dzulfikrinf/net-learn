import React from "react";
import { Head, Link, router } from "@inertiajs/react"; // Tambah router
import {
    FaChalkboardTeacher,
    FaUserGraduate,
    FaSignOutAlt,
    FaKey,
    FaBook,
    FaArrowRight
} from "react-icons/fa"; // Tambah FaKey
import ApexChart from 'react-apexcharts';

export default function AdminDashboard({ auth, students, charts}) {
    const handleReset = (id, name) => {
        if (
            confirm(
                `Reset password untuk siswa "${name}" menjadi "netlearn123"?`
            )
        ) {
            router.post(route("admin.reset_password", id));
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-800 font-sans">
            <Head title="Teacher Dashboard" />

            {/* NAVBAR */}
            <nav className="bg-net-blue text-white px-8 py-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <FaChalkboardTeacher size={24} />
                    <span className="font-bold text-xl">NetLearn <span className="font-normal opacity-80 text-sm">| Teacher Panel</span></span>
                </div>

                <div className="flex items-center gap-4">

                    {/* --- TOMBOL MENU BARU --- */}
                    <Link
                        href={route('admin.content.index')}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-bold transition border border-white/20"
                    >
                        <FaBook /> Manajemen Kurikulum
                    </Link>
                    {/* ------------------------ */}

                    <div className="h-6 w-px bg-white/20 mx-2"></div>

                    <span className="text-sm font-medium hidden md:inline">Halo, {auth.user.name}</span>

                    <Link href={route('logout')} method="post" as="button" className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-bold transition shadow-md hover:shadow-lg flex items-center gap-2">
                        <FaSignOutAlt /> Logout
                    </Link>
                </div>
            </nav>

            {/* MAIN CONTENT */}
            <main className="p-8 max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">
                            Monitoring Siswa
                        </h1>
                        <p className="text-slate-500">
                            Data perkembangan siswa real-time.
                        </p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded shadow text-sm">
                        Total Siswa: <strong>{students.length}</strong>
                    </div>
                </div>

                {/* === SECTION GRAFIK (DATA VISUALIZATION) === */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

                    {/* GRAFIK 1: TREN AKTIVITAS (Area Chart) */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <span className="w-2 h-6 bg-net-blue rounded-full"></span>
                            Aktivitas Belajar (7 Hari Terakhir)
                        </h3>
                        <ApexChart
                            options={{
                                chart: { type: 'area', toolbar: { show: false } },
                                colors: ['#4070ad'],
                                stroke: { curve: 'smooth' },
                                xaxis: { categories: charts.activity.map(d => d.date) },
                                dataLabels: { enabled: false },
                                fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.2, stops: [0, 90, 100] } }
                            }}
                            series={[{ name: 'Materi Selesai', data: charts.activity.map(d => d.count) }]}
                            type="area"
                            height={300}
                        />
                    </div>

                    {/* GRAFIK 2: PENYELESAIAN MATERI (Bar Chart) */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <span className="w-2 h-6 bg-net-teal rounded-full"></span>
                            Total Penyelesaian per Materi
                        </h3>
                        <ApexChart
                            options={{
                                chart: { type: 'bar', toolbar: { show: false } },
                                colors: ['#45b0ac'],
                                plotOptions: { bar: { borderRadius: 4, horizontal: false } },
                                xaxis: { categories: charts.completion.map(d => d.title), labels: { show: false } }, // Label disembunyikan biar gak penuh
                                tooltip: { x: { show: true } } // Nama materi muncul pas di-hover
                            }}
                            series={[{ name: 'Siswa Lulus', data: charts.completion.map(d => d.count) }]}
                            type="bar"
                            height={300}
                        />
                    </div>

                    {/* GRAFIK 3: TINGKAT KESULITAN (Horizontal Bar) - Full Width */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <span className="w-2 h-6 bg-orange-400 rounded-full"></span>
                            Analisis Kesulitan (Rata-rata Percobaan)
                        </h3>
                        <p className="text-xs text-slate-400 mb-4">*Semakin panjang bar, semakin sulit materi tersebut bagi siswa.</p>
                        <ApexChart
                            options={{
                                chart: { type: 'bar', toolbar: { show: false } },
                                colors: ['#fb923c'], // Orange
                                plotOptions: { bar: { borderRadius: 4, horizontal: true } },
                                xaxis: { categories: charts.difficulty.map(d => d.title) },
                                dataLabels: { enabled: true, formatter: (val) => val + "x" }
                            }}
                            series={[{ name: 'Rata-rata Percobaan', data: charts.difficulty.map(d => d.avg) }]}
                            type="bar"
                            height={350}
                        />
                    </div>

                </div>

                {/* TABLE CARD */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm uppercase tracking-wider">
                                <th className="p-4 font-bold">Nama Siswa</th>
                                <th className="p-4 font-bold">Email</th>
                                <th className="p-4 font-bold text-center">
                                    XP Total
                                </th>
                                <th className="p-4 font-bold text-center">
                                    Level Selesai
                                </th>
                                <th className="p-4 font-bold text-right">
                                    Status
                                </th>
                                <th className="p-4 font-bold text-right">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {students.length > 0 ? (
                                students.map((student) => (
                                    <tr
                                        key={student.id}
                                        className="hover:bg-blue-50/50 transition"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-net-blue flex items-center justify-center">
                                                    <FaUserGraduate size={14} />
                                                </div>
                                                {/* Link ke Halaman Detail */}
                                                <Link
                                                    href={route(
                                                        "admin.student_detail",
                                                        student.id
                                                    )}
                                                    className="font-bold text-slate-700 hover:text-net-blue hover:underline transition cursor-pointer"
                                                >
                                                    {student.name}
                                                </Link>
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-500 text-sm">
                                            {student.email}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded font-bold text-xs">
                                                {student.xp} XP
                                            </span>
                                        </td>
                                        <td className="p-4 text-center font-mono font-bold text-slate-600">
                                            {student.completed_lessons}
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded-full border border-green-100">
                                                Active
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() =>
                                                    handleReset(
                                                        student.id,
                                                        student.name
                                                    )
                                                }
                                                className="bg-orange-100 hover:bg-orange-200 text-orange-600 px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ml-auto"
                                                title="Reset Password ke Default"
                                            >
                                                <FaKey /> Reset Pass
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="p-8 text-center text-slate-400 italic"
                                    >
                                        Belum ada siswa yang mendaftar.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}

import React from "react";
import { Head, Link, router } from "@inertiajs/react"; // Tambah router
import {
    FaChalkboardTeacher,
    FaUserGraduate,
    FaSignOutAlt,
    FaKey,
} from "react-icons/fa"; // Tambah FaKey

export default function AdminDashboard({ auth, students }) {
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
            <nav className="bg-net-blue text-white px-8 py-4 flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-3">
                    <FaChalkboardTeacher size={24} />
                    <span className="font-bold text-xl">
                        NetLearn{" "}
                        <span className="font-normal opacity-80">
                            | Teacher Panel
                        </span>
                    </span>
                </div>
                <div className="flex items-center gap-6">
                    <span className="text-sm">Halo, {auth.user.name}</span>
                    <Link
                        href={route("logout")}
                        method="post"
                        as="button"
                        className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm font-bold transition"
                    >
                        Logout
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

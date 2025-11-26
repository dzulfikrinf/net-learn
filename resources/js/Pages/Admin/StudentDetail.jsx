import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { FaArrowLeft, FaUserGraduate, FaClock, FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';

export default function StudentDetail({ student, history }) {
    return (
        <div className="min-h-screen bg-slate-100 text-slate-800 font-sans p-8">
            <Head title={`Detail: ${student.name}`} />

            {/* HEADER & TOMBOL KEMBALI */}
            <div className="max-w-5xl mx-auto mb-8">
                <Link href={route('admin.dashboard')} className="inline-flex items-center gap-2 text-slate-500 hover:text-net-blue mb-4 font-bold transition">
                    <FaArrowLeft /> Kembali ke Dashboard
                </Link>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-100 text-net-blue rounded-full flex items-center justify-center text-2xl font-bold">
                        {student.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{student.name}</h1>
                        <p className="text-slate-500">{student.email}</p>
                        <div className="flex gap-4 mt-2 text-sm">
                            <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded font-bold">XP: {student.xp}</span>
                            <span className="bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded font-bold">Stars: {student.stars}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* TABEL RIWAYAT BELAJAR */}
            <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                    <h2 className="font-bold text-lg text-slate-700">Riwayat Pembelajaran</h2>
                </div>

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                            <th className="p-4 font-bold">Materi / Lesson</th>
                            <th className="p-4 font-bold text-center">Status</th>
                            <th className="p-4 font-bold text-center">Durasi</th>
                            <th className="p-4 font-bold text-right">Waktu Selesai</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {history.length > 0 ? history.map((item) => (
                            <tr key={item.id} className="hover:bg-blue-50/50 transition">
                                <td className="p-4">
                                    <div className="font-bold text-slate-700">{item.lesson_title}</div>
                                    <div className="text-xs text-slate-400">Percobaan: {item.attempts}x</div>
                                </td>
                                <td className="p-4 text-center">
                                    {item.status === 'completed' ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                                            <FaCheckCircle /> Selesai
                                        </span>
                                    ) : (
                                        <span className="inline-block px-2 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
                                            {item.status}
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 text-center font-mono text-sm text-slate-600">
                                    {item.status === 'completed' ? (
                                        <div className="flex items-center justify-center gap-1">
                                            <FaClock className="text-slate-400" /> {item.duration}
                                        </div>
                                    ) : '-'}
                                </td>
                                <td className="p-4 text-right text-sm font-medium text-slate-600">
                                    {item.status === 'completed' ? (
                                        <div className="flex items-center justify-end gap-1">
                                            {item.completed_at_formatted} <FaCalendarAlt className="text-slate-400" />
                                        </div>
                                    ) : '-'}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" className="p-8 text-center text-slate-400 italic">
                                    Siswa ini belum mengerjakan materi apapun.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

import React from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import {
    FaArrowLeft,
    FaCheckCircle,
    FaClock,
    FaCalendarAlt,
    FaUserGraduate,
    FaLightbulb,
    FaRobot,
    FaClipboardList,
    FaRedo,
    FaHourglassHalf
} from "react-icons/fa";
import Chart from "react-apexcharts";
import ReactMarkdown from "react-markdown";

export default function StudentDetail({ student, history, charts = {}, analysis }) {
    const { props } = usePage();
    const flash = props.flash || {};

    // Helper untuk cek data grafik
    const hasRadarData = charts?.radar?.series?.length > 0;
    const hasPerformanceData = charts?.performance?.labels?.length > 0;
    const hasHeatmapData = charts?.heatmap?.length > 0;
    const hasDurationData = charts?.duration?.minutes?.length > 0;

    return (
        <div className="min-h-screen bg-slate-100 text-slate-800 font-sans p-8">
            <Head title={`Detail: ${student.name}`} />

            {/* HEADER & TOMBOL KEMBALI */}
            <div className="max-w-6xl mx-auto mb-8">
                <Link
                    href={route("admin.dashboard")}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-net-blue mb-4 font-bold transition"
                >
                    <FaArrowLeft /> Kembali ke Dashboard
                </Link>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-100 text-net-blue rounded-full flex items-center justify-center text-2xl font-bold">
                        <FaUserGraduate />
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

            {/* === SECTION 1: REKOMENDASI & AI (UNIFIED CARD) === */}
            <div className="max-w-6xl mx-auto mb-8">
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[400px]">

                    {/* KIRI: VISUAL UTAMA */}
                    <div className="md:w-[30%] bg-gradient-to-b from-blue-600 to-indigo-800 p-8 flex flex-col items-center justify-center text-center relative text-white">
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-inner border border-white/20">
                                <FaLightbulb size={40} className="text-yellow-300 drop-shadow-lg" />
                            </div>
                            <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-2">Fokus Evaluasi</p>
                            <h2 className="text-3xl font-black leading-tight mb-4">{analysis ? analysis.topic : 'Loading...'}</h2>
                            {analysis && analysis.score !== undefined && (
                                <div className="inline-flex flex-col items-center bg-black/20 rounded-xl px-4 py-2 border border-white/10">
                                    <span className="text-[10px] text-blue-200 uppercase font-bold">Skor Rata-rata</span>
                                    <span className="text-2xl font-bold">{analysis.score}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* KANAN: DETAIL */}
                    <div className="md:w-[70%] flex flex-col">
                        {/* A. DIAGNOSIS SISTEM */}
                        <div className="p-8 border-b border-slate-100">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-2 bg-blue-50 rounded-lg text-net-blue"><FaClipboardList size={18} /></div>
                                <h3 className="font-bold text-slate-800 text-lg">Diagnosis Sistem</h3>
                            </div>
                            {analysis ? (
                                <div>
                                    <p className="text-slate-600 italic border-l-4 border-yellow-400 pl-4 py-1 mb-4 bg-slate-50/50 rounded-r-lg">"{analysis.message}"</p>
                                    <div className="flex items-start gap-3">
                                        <span className="text-xs font-bold bg-net-blue text-white px-2 py-1 rounded uppercase tracking-wider mt-0.5">Action</span>
                                        <span className="text-sm font-bold text-slate-700">{analysis.action}</span>
                                    </div>
                                </div>
                            ) : (<p className="text-slate-400 italic">Data tidak cukup.</p>)}
                        </div>

                        {/* B. AI ANALYST */}
                        <div className="p-8 bg-purple-50/30 flex-1 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><FaRobot size={18} /></div>
                                    <div><h3 className="font-bold text-slate-800 text-lg">AI Analyst</h3><p className="text-[10px] text-slate-500">Powered by Gemini AI</p></div>
                                </div>
                                <Link href={route('admin.student_refresh_ai', student.id)} method="post" as="button" className="text-slate-400 hover:text-purple-600 hover:bg-white p-2 rounded-full transition shadow-sm border border-transparent hover:border-slate-200" title="Generate Ulang" preserveScroll><FaRedo size={14} /></Link>
                            </div>
                            <div className="flex-1">
                                {flash?.ai_report || student.ai_report ? (
                                    <div className="bg-white p-5 rounded-xl border border-purple-100 shadow-sm">
                                        <div className="prose prose-sm max-w-none prose-p:text-slate-600 prose-p:leading-relaxed prose-p:mb-2 prose-strong:text-purple-700 prose-strong:font-bold prose-headings:text-slate-800 prose-headings:font-bold prose-headings:text-sm">
                                            <ReactMarkdown>{flash?.ai_report || student.ai_report}</ReactMarkdown>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center py-6 border-2 border-dashed border-purple-100 rounded-xl bg-white/50">
                                        <FaRobot className="text-purple-200 text-3xl mb-2" />
                                        <p className="text-sm text-slate-500 mb-3">Belum ada analisis mendalam.</p>
                                        <Link href={route('admin.student_analyze', student.id)} method="post" as="button" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md transition" preserveScroll>Generate Report</Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* === SECTION 2: GRAFIK PERFORMA (GRID 2 KOLOM) === */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center">
                    <h3 className="font-bold text-slate-700 mb-2 border-b pb-2 w-full">Peta Kompetensi</h3>
                    {hasRadarData ? (
                        <Chart options={{ chart: { type: 'radar', toolbar: { show: false } }, xaxis: { categories: charts.radar.categories }, yaxis: { max: 100, min: 0, tickAmount: 4, show: false }, colors: ['#45b0ac'], fill: { opacity: 0.2 }, markers: { size: 4 }, stroke: { show: true, width: 2, colors: ['#45b0ac'] } }} series={[{ name: 'Penguasaan', data: charts.radar.series }]} type="radar" height={300} width="100%" />
                    ) : (<p className="text-slate-400 py-10">Belum cukup data.</p>)}
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-700 mb-4 border-b pb-2">Nilai vs Usaha</h3>
                    {hasPerformanceData ? (
                        <Chart options={{ chart: { type: 'line', toolbar: { show: false } }, stroke: { width: [0, 3] }, xaxis: { categories: charts.performance.labels, labels: { rotate: -45, style: { fontSize: '10px' } } }, yaxis: [{ title: { text: 'Nilai' }, min: 0, max: 100 }, { opposite: true, title: { text: 'Percobaan' } }], colors: ['#4070ad', '#fb923c'], plotOptions: { bar: { columnWidth: '50%', borderRadius: 4 } }, dataLabels: { enabled: true, enabledOnSeries: [1] } }} series={[{ name: 'Nilai Akhir', type: 'column', data: charts.performance.scores }, { name: 'Jumlah Percobaan', type: 'line', data: charts.performance.attempts }]} type="line" height={300} />
                    ) : (<p className="text-slate-400 py-10 text-center">Belum ada data materi.</p>)}
                </div>
            </div>

            {/* === SECTION 3: ANALISIS WAKTU (GRID 2 KOLOM) === */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                    <h3 className="font-bold text-slate-700 mb-2 border-b pb-2 flex items-center gap-2"><FaClock className="text-blue-500" /> Pola Waktu Belajar</h3>
                    <div className="flex-1 flex items-center">
                        {hasHeatmapData ? (
                            <Chart options={{ chart: { type: 'heatmap', toolbar: { show: false } }, plotOptions: { heatmap: { shadeIntensity: 0.5, radius: 4, colorScale: { ranges: [{ from: 0, to: 0, color: '#f1f5f9', name: 'Pasif' }, { from: 1, to: 5, color: '#93c5fd', name: 'Jarang' }, { from: 6, to: 100, color: '#2563eb', name: 'Sering' }] } } }, dataLabels: { enabled: false }, stroke: { width: 2, colors: ['#fff'] }, xaxis: { type: 'category', labels: { style: { fontSize: '10px' } } }, yaxis: { labels: { style: { fontSize: '10px', fontWeight: 'bold' } } }, legend: { position: 'top', horizontalAlign: 'right', fontSize: '11px' } }} series={charts.heatmap} type="heatmap" height={280} width="100%" />
                        ) : (<p className="text-slate-400 py-10 w-full text-center">Belum ada aktivitas.</p>)}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                    <h3 className="font-bold text-slate-700 mb-2 border-b pb-2 flex items-center gap-2 justify-between">
                        <div className="flex items-center gap-2"><FaHourglassHalf className="text-orange-500" /> Durasi Pengerjaan</div>
                        <span className="text-[10px] bg-slate-100 px-2 py-1 rounded-full">Menit</span>
                    </h3>
                    <div className="flex-1 flex items-center">
                        {hasDurationData ? (
                            <Chart options={{ chart: { type: 'bar', toolbar: { show: false } }, plotOptions: { bar: { borderRadius: 4, horizontal: false, colors: { ranges: [{ from: 0, to: 2, color: '#ef4444' }, { from: 3, to: 1000, color: '#3b82f6' }] } } }, dataLabels: { enabled: true, formatter: (val) => val + "m", style: { fontSize: '10px' }, offsetY: -20 }, stroke: { show: true, width: 2, colors: ['transparent'] }, xaxis: { categories: charts.duration.labels, labels: { rotate: -45, style: { fontSize: '9px' }, trim: true, maxHeight: 60 } }, yaxis: { title: { text: 'Menit' } }, colors: ['#3b82f6'] }} series={[{ name: 'Durasi', data: charts.duration.minutes }]} type="bar" height={280} width="100%" />
                        ) : (<p className="text-slate-400 py-10 w-full text-center">Belum ada data durasi.</p>)}
                    </div>
                </div>
            </div>

            {/* === SECTION 4: TABEL RIWAYAT (PERBAIKAN VISUAL SCORE) === */}
            <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                    <h2 className="font-bold text-lg text-slate-700">Riwayat Pembelajaran Detail</h2>
                </div>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                            <th className="p-4 font-bold">Materi</th>
                            <th className="p-4 font-bold text-center">Status</th>
                            <th className="p-4 font-bold text-center">Nilai</th>
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
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold"><FaCheckCircle /> Selesai</span>
                                    ) : (
                                        <span className="inline-block px-2 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold uppercase">{item.status}</span>
                                    )}
                                </td>

                                {/* --- PERBAIKAN KOLOM NILAI (BADGE WARNA) --- */}
                                <td className="p-4 text-center">
                                    {item.status === 'completed' ? (
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold border
                                            ${(item.score ?? 0) >= 75
                                                ? 'bg-green-50 text-green-600 border-green-200'
                                                : 'bg-red-50 text-red-600 border-red-200'
                                            }
                                        `}>
                                            {item.score ?? 0}
                                        </span>
                                    ) : (
                                        <span className="text-slate-300 text-xs italic">-</span>
                                    )}
                                </td>
                                {/* ----------------------------------------- */}

                                <td className="p-4 text-center font-mono text-sm text-slate-600">
                                    {item.status === 'completed' ? <div className="flex items-center justify-center gap-1"><FaClock className="text-slate-400" /> {item.duration}</div> : '-'}
                                </td>
                                <td className="p-4 text-right text-sm font-medium text-slate-600">
                                    {item.status === 'completed' ? <div className="flex items-center justify-end gap-1">{item.completed_at_formatted} <FaCalendarAlt className="text-slate-400" /></div> : '-'}
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="5" className="p-8 text-center text-slate-400 italic">Belum ada data.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

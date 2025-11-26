import React from 'react';
import { Head, Link } from '@inertiajs/react';
import TeacherAssistant from '@/Components/TeacherAssistant';
import { FaTrophy, FaMedal, FaArrowLeft, FaFire } from 'react-icons/fa';

export default function Leaderboard({ leaderboard, my_stats, auth }) {

    // Pisahkan Top 3 dengan sisanya
    const topThree = leaderboard.slice(0, 3);
    const others = leaderboard.slice(3);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            <Head title="Leaderboard" />

            {/* HEADER */}
            <div className="bg-net-blue pb-24 pt-8 px-6 relative overflow-hidden">
                 {/* Pattern Background */}
                 <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '20px 20px' }}></div>

                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="flex items-center justify-between text-white mb-8">
                        <Link href={route('dashboard')} className="flex items-center gap-2 opacity-80 hover:opacity-100 transition">
                            <FaArrowLeft /> Kembali
                        </Link>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <FaTrophy className="text-yellow-400" /> Papan Peringkat
                        </h1>
                    </div>

                    {/* PODIUM JUARA 1, 2, 3 */}
                    <div className="flex justify-center items-end gap-4 md:gap-8">
                        {/* JUARA 2 */}
                        {topThree[1] && (
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-slate-300 bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-500 mb-2 shadow-lg relative">
                                    <span className="absolute -top-3 bg-slate-500 text-white text-xs px-2 py-0.5 rounded-full">#2</span>
                                    {topThree[1].name.charAt(0)}
                                </div>
                                <div className="text-center text-white">
                                    <div className="font-bold text-sm md:text-base">{topThree[1].name}</div>
                                    <div className="text-xs opacity-80">{topThree[1].xp} XP</div>
                                </div>
                                <div className="h-24 w-16 md:w-24 bg-slate-400/30 rounded-t-lg mt-2 backdrop-blur-sm"></div>
                            </div>
                        )}

                        {/* JUARA 1 */}
                        {topThree[0] && (
                            <div className="flex flex-col items-center">
                                <div className="relative">
                                    <FaMedal className="absolute -top-6 -right-2 text-yellow-300 text-3xl animate-bounce" />
                                    <div className="w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-yellow-400 bg-yellow-100 flex items-center justify-center text-4xl font-bold text-yellow-600 mb-2 shadow-xl shadow-yellow-500/50">
                                        {topThree[0].name.charAt(0)}
                                    </div>
                                </div>
                                <div className="text-center text-white">
                                    <div className="font-bold text-lg">{topThree[0].name}</div>
                                    <div className="text-sm font-bold text-yellow-300">{topThree[0].xp} XP</div>
                                </div>
                                <div className="h-32 w-20 md:w-32 bg-yellow-500/30 rounded-t-lg mt-2 backdrop-blur-sm border-t border-yellow-400/50"></div>
                            </div>
                        )}

                        {/* JUARA 3 */}
                        {topThree[2] && (
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-orange-400 bg-orange-200 flex items-center justify-center text-2xl font-bold text-orange-600 mb-2 shadow-lg relative">
                                    <span className="absolute -top-3 bg-orange-600 text-white text-xs px-2 py-0.5 rounded-full">#3</span>
                                    {topThree[2].name.charAt(0)}
                                </div>
                                <div className="text-center text-white">
                                    <div className="font-bold text-sm md:text-base">{topThree[2].name}</div>
                                    <div className="text-xs opacity-80">{topThree[2].xp} XP</div>
                                </div>
                                <div className="h-20 w-16 md:w-24 bg-orange-500/30 rounded-t-lg mt-2 backdrop-blur-sm"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* LIST SISWA LAINNYA */}
            <div className="max-w-3xl mx-auto px-4 -mt-10 relative z-20 pb-20">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">

                    {/* Header List */}
                    <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider flex justify-between">
                        <span>Peringkat</span>
                        <span>XP Perolehan</span>
                    </div>

                    {/* Scrollable Area */}
                    <div className="divide-y divide-slate-100">
                        {others.map((user) => (
                            <div key={user.rank} className={`flex items-center justify-between p-4 ${user.is_me ? 'bg-blue-50' : 'hover:bg-slate-50'} transition`}>
                                <div className="flex items-center gap-4">
                                    <span className="text-slate-400 font-bold w-6 text-center">{user.rank}</span>
                                    <div className={`w-10 h-10 rounded-full ${user.avatar_color} text-white flex items-center justify-center font-bold shadow-sm`}>
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className={`font-bold ${user.is_me ? 'text-net-blue' : 'text-slate-700'}`}>
                                            {user.name} {user.is_me && '(Anda)'}
                                        </div>
                                    </div>
                                </div>
                                <div className="font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                                    {user.xp} XP
                                </div>
                            </div>
                        ))}

                        {others.length === 0 && (
                            <div className="p-8 text-center text-slate-400">
                                Belum ada siswa lain di peringkat ini.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* STICKY FOOTER (POSISI SAYA) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-30">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                         <div className="bg-net-blue text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">
                            #{my_stats.rank}
                         </div>
                         <div>
                             <div className="text-xs text-slate-400 uppercase font-bold">Posisi Anda</div>
                             <div className="font-bold text-slate-800">{my_stats.name}</div>
                         </div>
                    </div>
                    <div className="flex items-center gap-2 text-net-blue font-bold">
                        <FaFire /> {my_stats.xp} XP
                    </div>
                </div>
            </div>
            <TeacherAssistant user={auth.user} />
        </div>
    );
}

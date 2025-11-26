import React from 'react';
import { motion } from 'framer-motion';

// Komponen Balok tunggal yang merepresentasikan satu subnet
export default function SubnetBlock({ data, totalHosts, index }) {
    // Hitung lebar balok berdasarkan porsi host terhadap total jaringan induk
    const widthPercentage = (data.hostsAvailable / totalHosts) * 100;

    // Warna-warni agar menarik, di-cycle berdasarkan index
    const colors = [
        'bg-net-blue border-blue-500 text-white',
        'bg-net-teal border-teal-500 text-white',
        'bg-orange-400 border-orange-600 text-white',
        'bg-purple-400 border-purple-600 text-white',
        'bg-pink-400 border-pink-600 text-white',
    ];
    // Jika ini blok "Sisa/Unused", warnanya abu-abu
    const colorClass = data.isUnused ? 'bg-slate-200 border-slate-300 text-slate-500' : colors[index % colors.length];

    return (
        // Container Tooltip
        <div className="relative group h-24 flex-grow-0 flex-shrink-0 transition-all duration-500" style={{ flexBasis: `${widthPercentage}%` }}>
             {/* Tooltip Detail (Muncul saat Hover) */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-slate-800 text-white text-xs rounded p-2 opacity-0 group-hover:opacity-100 transition pointer-events-none z-20 text-center">
                <div className="font-bold">{data.networkId}/{data.prefix}</div>
                <div>Range: {data.rangeStart} - {data.rangeEnd}</div>
                <div>Broadcast: {data.broadcastId}</div>
                <div className="mt-1 text-slate-300">{data.hostsAvailable} Hosts</div>
                {/* Segitiga tooltip */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
            </div>

             {/* ANIMASI BALOK UTAMA (Framer Motion) */}
            <motion.div
                layout // Agar transisi ukuran halus
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1, type: "spring" }}
                className={`h-full rounded-lg border-2 shadow-sm flex flex-col items-center justify-center p-1 text-center overflow-hidden relative ${colorClass}`}
            >
                {/* Label Utama (Minimalis) */}
                <div className="font-bold text-sm truncate w-full px-1">{data.name}</div>
                <div className="font-mono text-xs opacity-90">/{data.prefix}</div>

                {/* Indikator ukuran relatif (Opsional, bola kecil di pojok) */}
                {!data.isUnused && (
                    <div className="absolute bottom-1 right-1 text-[10px] font-bold opacity-60">
                        {Math.round(widthPercentage)}%
                    </div>
                )}
            </motion.div>
        </div>
    );
}

import React from "react";
import { motion } from "framer-motion";

export default function MathStepCard({ stepData }) {
    if (!stepData) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white border-2 border-net-blue rounded-xl p-6 shadow-xl max-w-lg mx-auto mb-6 relative overflow-hidden"
        >
            {/* Hiasan Background Rumus */}
            <div className="absolute -right-4 -top-4 text-9xl opacity-5 text-slate-200 font-serif font-bold italic">
                2ⁿ
            </div>

            <h4 className="text-lg font-bold text-slate-700 mb-4 border-b pb-2 flex justify-between">
                <span>🧮 Dapur Perhitungan</span>
                <span className="text-net-blue">{stepData.name}</span>
            </h4>

            <div className="space-y-4 font-mono text-sm">
                {/* Step 1: Kebutuhan */}
                <div className="flex justify-between items-center">
                    <span className="text-slate-500">1. Kebutuhan Host:</span>
                    <span className="font-bold text-slate-800 text-lg">
                        {stepData.hosts} PC
                    </span>
                </div>

                {/* Step 2: Rumus */}
                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                    <div className="text-xs text-slate-400 mb-1">
                        Rumus: Host + 2 (Network & Broadcast)
                    </div>
                    <div className="flex items-center gap-2">
                        <span>{stepData.hosts} + 2 = </span>
                        <span className="font-bold text-red-500">
                            {stepData.needed}
                        </span>
                        <span className="text-slate-400 text-xs">(Target)</span>
                    </div>
                </div>

                {/* Step 3: Cari Pangkat 2 / Logika FLSM */}
                <div className="flex items-center justify-between bg-blue-50 p-3 rounded border border-blue-100">
                    <div className="flex flex-col">
                        <span className="text-xs text-blue-400">
                            Logika Pembagian:
                        </span>

                        {/* Jika ada custom message (dari FLSM), tampilkan itu. Jika tidak, pakai logika VLSM biasa */}
                        {stepData.customMessage ? (
                            <span className="font-bold text-blue-700 text-sm mt-1">
                                {stepData.customMessage}
                            </span>
                        ) : (
                            <span className="font-bold text-blue-700 text-xl">
                                2^{stepData.hostBits} = {stepData.blockSize}
                            </span>
                        )}
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-slate-400">
                            Prefix Baru:
                        </div>
                        <div className="font-bold text-green-600 text-lg">
                            /{stepData.newPrefix}
                        </div>
                    </div>
                </div>

                {/* Step 4: Range */}
                <div className="text-xs text-center text-slate-400 pt-2">
                    Range IP: {stepData.networkId} s/d {stepData.broadcastId}
                </div>
            </div>
        </motion.div>
    );
}

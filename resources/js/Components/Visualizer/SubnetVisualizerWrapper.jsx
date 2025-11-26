import React, { useState } from 'react';
import FlsmVisualizer from './FlsmVisualizer';
import VlsmVisualizer from './VlsmVisualizer';

export default function SubnetVisualizerWrapper() {
    const [mode, setMode] = useState('vlsm');

    return (
        // UBAH DISINI: min-h-full agar dia memanjang ke bawah kalau kontennya banyak
        <div className="w-full min-h-full flex flex-col font-sans bg-slate-50">

            {/* Sticky Header Tab: Nempel di atas saat discroll */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md px-6 py-3 border-b border-slate-200 flex flex-wrap gap-4 justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Laboratorium Jaringan</span>
                </div>

                <div className="flex bg-slate-200/50 rounded-lg p-1">
                    <button
                        onClick={() => setMode('flsm')}
                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition ${mode === 'flsm' ? 'bg-white text-net-blue shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        FLSM
                    </button>
                    <button
                        onClick={() => setMode('vlsm')}
                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition ${mode === 'vlsm' ? 'bg-white text-net-teal shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        VLSM
                    </button>
                </div>
            </div>

            {/* Content Area: Padding diatur disini agar lega */}
            <div className="flex-1 p-4 md:p-8 pb-24"> {/* pb-24 biar konten paling bawah gak ketutup tombol Next */}
                 {mode === 'flsm' ? <FlsmVisualizer /> : <VlsmVisualizer />}
            </div>
        </div>
    );
}

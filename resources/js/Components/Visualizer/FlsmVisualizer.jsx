import React, { useState, useEffect, useRef } from 'react';
import { ipToLong, longToIp } from "@/lib/ipUtils";
import SubnetBlock from './SubnetBlock';
import MathStepCard from './MathStepCard';
import NetworkTopologyGraph from './NetworkTopologyGraph';
import { FaPlay, FaForward, FaRedo, FaNetworkWired, FaPause, FaProjectDiagram, FaCube, FaPlus, FaTrash } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';

export default function FlsmVisualizer({ initialMode = 'manual' }) {
    const [networkInput, setNetworkInput] = useState("192.168.10.0/24");
    const [subnetCountReq, setSubnetCountReq] = useState("4");

    // State Simulasi
    const [isSimulating, setIsSimulating] = useState(false);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [subnets, setSubnets] = useState([]);
    const [totalHostsMaster, setTotalHostsMaster] = useState(0);
    const [calculationData, setCalculationData] = useState(null);
    const [viewMode, setViewMode] = useState('topology');

    // State untuk Hover Info (Agar sama dengan VLSM)
    const [hoveredBlock, setHoveredBlock] = useState(null);

    // Auto Play State
    const [autoPlay, setAutoPlay] = useState(initialMode === 'auto');
    const timerRef = useRef(null);

    // Data statis hasil perhitungan FLSM (Blueprint)
    const [flsmPlan, setFlsmPlan] = useState(null);

    // --- LOGIKA AUTO PLAY ---
    useEffect(() => {
        if (isSimulating && autoPlay && flsmPlan) {
            const isFinished = currentIdx >= flsmPlan.actualSubnetCount && !calculationData;
            if (isFinished) return;

            // Jeda 1.5 detik per langkah
            timerRef.current = setTimeout(() => {
                nextStepAuto();
            }, 1500);
        }
        return () => clearTimeout(timerRef.current);
    }, [isSimulating, autoPlay, currentIdx, flsmPlan, calculationData]);


    const startSimulation = () => {
        try {
            const [ip, prefixStr] = networkInput.split('/');
            const masterPrefix = parseInt(prefixStr);
            const masterLong = ipToLong(ip);
            const masterTotalHosts = Math.pow(2, 32 - masterPrefix);
            setTotalHostsMaster(masterTotalHosts);

            // 1. Hitung Rumus Dasar
            const neededSubnets = parseInt(subnetCountReq);
            const borrowedBits = Math.ceil(Math.log2(neededSubnets));
            const newPrefix = masterPrefix + borrowedBits;
            const actualSubnetCount = Math.pow(2, borrowedBits);
            const blockSize = Math.pow(2, 32 - newPrefix);

            // Simpan rencana perhitungan
            setFlsmPlan({
                masterLong,
                borrowedBits,
                newPrefix,
                actualSubnetCount,
                blockSize,
                neededSubnets
            });

            setSubnets([]);
            setCurrentIdx(0);
            setCalculationData(null);
            setViewMode('topology');
            setHoveredBlock(null);
            setIsSimulating(true);

            if (initialMode === 'auto') setAutoPlay(true);

        } catch (e) {
            alert("Input Network tidak valid! Gunakan format CIDR (contoh: 192.168.1.0/24)");
        }
    };

    // --- NEXT STEP MANUAL (Pakai Kartu) ---
    const nextStep = () => {
        if (calculationData) {
            setSubnets(prev => [...prev, { ...calculationData, isUnused: false }]);
            setCalculationData(null);
            setCurrentIdx(prev => prev + 1);
            return;
        }

        if (!flsmPlan || currentIdx >= flsmPlan.actualSubnetCount) return;

        const calcData = calculateSubnet(currentIdx);
        setCalculationData(calcData);
    };

    // --- NEXT STEP AUTO (Langsung) ---
    const nextStepAuto = () => {
        if (!flsmPlan || currentIdx >= flsmPlan.actualSubnetCount) return;

        const calcData = calculateSubnet(currentIdx);
        setSubnets(prev => [...prev, { ...calcData, isUnused: false }]);
        setCurrentIdx(prev => prev + 1);
    };

    const calculateSubnet = (idx) => {
        const currentIpLong = flsmPlan.masterLong + (idx * flsmPlan.blockSize);
        const networkId = longToIp(currentIpLong);
        const broadcastId = longToIp(currentIpLong + flsmPlan.blockSize - 1);
        const rangeStart = longToIp(currentIpLong + 1);
        const rangeEnd = longToIp(currentIpLong + flsmPlan.blockSize - 2);

        return {
            name: `Subnet #${idx + 1}`,
            hosts: flsmPlan.blockSize - 2, // Kapasitas usable
            needed: flsmPlan.blockSize,
            hostBits: 32 - flsmPlan.newPrefix,
            blockSize: flsmPlan.blockSize,

            prefix: flsmPlan.newPrefix, // PENTING: Untuk Topologi & Balok
            newPrefix: flsmPlan.newPrefix,

            networkId: networkId,
            broadcastId: broadcastId,
            rangeStart: rangeStart,
            rangeEnd: rangeEnd,
            hostsAvailable: flsmPlan.blockSize,

            borrowedBits: flsmPlan.borrowedBits,
            customMessage: `Meminjam ${flsmPlan.borrowedBits} bit untuk membuat ${flsmPlan.actualSubnetCount} subnet.`
        };
    };

    const reset = () => {
        setIsSimulating(false); setSubnets([]); setCurrentIdx(0); setCalculationData(null); setFlsmPlan(null); setHoveredBlock(null);
        clearTimeout(timerRef.current);
    };

    const isFinished = isSimulating && flsmPlan && currentIdx >= flsmPlan.actualSubnetCount && !calculationData;

    return (
        <div className="h-full flex flex-col bg-slate-50 relative">

            {/* === TOOLBAR === */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm z-10 flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between">
                <div className="flex flex-wrap gap-4 items-center flex-1 w-full">
                    <div className="w-full sm:w-48">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Network Induk</label>
                        <div className="flex items-center border-2 border-slate-200 rounded-xl overflow-hidden focus-within:border-net-blue transition bg-slate-50">
                            <div className="bg-slate-100 px-3 py-2 text-slate-500 border-r border-slate-200"><FaNetworkWired /></div>
                            <input value={networkInput} onChange={e => setNetworkInput(e.target.value)} disabled={isSimulating} className="w-full border-none px-3 py-2 font-mono text-sm focus:ring-0 bg-transparent" placeholder="192.168.10.0/24"/>
                        </div>
                    </div>
                    <div className="w-full sm:w-32">
                         <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Jumlah Subnet</label>
                         <select
                            value={subnetCountReq} onChange={e => setSubnetCountReq(e.target.value)} disabled={isSimulating}
                            className="w-full border-2 border-slate-200 rounded-xl px-3 py-2 font-mono text-sm focus:ring-net-blue focus:border-net-blue bg-white disabled:bg-slate-50 disabled:text-slate-500 cursor-pointer"
                        >
                            <option value="2">2 Subnet</option>
                            <option value="4">4 Subnet</option>
                            <option value="8">8 Subnet</option>
                            <option value="16">16 Subnet</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-2 shrink-0">
                    {!isSimulating ? (
                         <button onClick={startSimulation} className="bg-gradient-to-r from-net-blue to-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:scale-105 transition flex items-center gap-2">
                            <FaPlay size={12}/> {initialMode === 'auto' ? 'Play Demo' : 'Mulai Hitung'}
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            {initialMode === 'auto' && !isFinished && (
                                <button onClick={() => setAutoPlay(!autoPlay)} className="px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 text-sm flex items-center gap-2">
                                    {autoPlay ? <><FaPause size={10}/> Pause</> : <><FaPlay size={10}/> Lanjut</>}
                                </button>
                            )}
                            <button onClick={reset} className="px-4 py-2.5 rounded-xl font-bold text-red-500 bg-red-50 hover:bg-red-100 text-sm border border-red-100 transition flex items-center gap-2">
                                <FaRedo size={12}/> Reset
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* === CONTENT AREA === */}
            <div className="flex-1 relative overflow-hidden p-8 flex flex-col bg-slate-50">

                <div className="absolute inset-0 opacity-30 pointer-events-none bg-grid-pattern"></div>

                {!isSimulating && (
                     <div className="flex-1 flex flex-col items-center justify-center text-slate-400 z-0 mt-10">
                         <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-lg shadow-slate-200 border border-slate-100 mb-6 rotate-6 animate-float">
                             <FaProjectDiagram size={40} className="text-net-blue opacity-50"/>
                         </div>
                         <h3 className="text-xl font-bold text-slate-700 mb-1">Simulator FLSM</h3>
                         <p className="text-sm opacity-80">Pilih jumlah subnet, sistem akan membaginya rata.</p>
                     </div>
                )}

                {/* MODAL PERHITUNGAN (MANUAL MODE ONLY) */}
                <AnimatePresence mode='wait'>
                    {calculationData && initialMode === 'manual' && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden transform scale-100">
                                <MathStepCard stepData={calculationData} />
                                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-center">
                                    <button
                                        onClick={nextStep}
                                        className="w-full bg-net-blue text-white py-3 rounded-xl font-bold text-lg shadow-md hover:bg-blue-600 transition animate-bounce-slow"
                                    >
                                        Terapkan Subnet Ini
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>

                {/* HASIL VISUALISASI */}
                {isSimulating && (
                    <div className="flex-1 relative flex flex-col">

                        {/* TAB SWITCHER */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-white/90 backdrop-blur border border-slate-200 p-1 rounded-xl shadow-lg flex gap-1">
                             <button onClick={() => setViewMode('topology')} className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${viewMode === 'topology' ? 'bg-net-blue text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}>
                                <FaProjectDiagram/> Topologi
                            </button>
                            <button onClick={() => setViewMode('blocks')} className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${viewMode === 'blocks' ? 'bg-net-blue text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}>
                                <FaCube/> Balok Memori
                            </button>
                        </div>

                        {/* MODE 1: TOPOLOGI */}
                        <div className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${viewMode === 'topology' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                             <NetworkTopologyGraph allocations={subnets} masterNetwork={networkInput} />
                        </div>

                        {/* MODE 2: BALOK (DENGAN PANEL INFO LENGKAP) */}
                        <div className={`absolute inset-0 w-full h-full flex flex-col justify-center items-center transition-opacity duration-500 ${viewMode === 'blocks' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>

                             <div className="w-full max-w-5xl bg-white p-8 rounded-3xl border border-slate-200 shadow-xl relative overflow-visible">

                                {/* HEADER: Judul + INFO PANEL DINAMIS */}
                                <div className="flex justify-between items-start mb-6 h-16">
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Peta Pembagian FLSM</h4>
                                        <div className="text-xs font-mono text-slate-400 mt-1">Total: {totalHostsMaster} IP</div>
                                    </div>

                                    {/* PANEL INFO (Muncul saat Hover) */}
                                    <AnimatePresence mode='wait'>
                                        {hoveredBlock ? (() => {
                                            // Hitung Kapasitas
                                            const capacity = hoveredBlock.hostsAvailable - 2;
                                            const used = hoveredBlock.hosts || 0;
                                            const free = Math.max(0, capacity - used);

                                            return (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="bg-slate-800 text-white px-5 py-3 rounded-xl shadow-lg border border-slate-700 text-xs flex gap-6 items-center z-50"
                                                >
                                                    <div className="border-r border-slate-600 pr-6">
                                                        <div className="font-bold text-yellow-400 text-base mb-0.5">{hoveredBlock.name}</div>
                                                        <div className="font-mono text-[10px] text-slate-400">{hoveredBlock.networkId}</div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-[11px]">
                                                        <span className="text-slate-400">Prefix: <span className="text-white font-mono font-bold">/{hoveredBlock.prefix}</span></span>
                                                        <span className="text-slate-400">Broadcast: <span className="text-white font-mono">{hoveredBlock.broadcastId}</span></span>
                                                        <span className="text-slate-400 col-span-2">
                                                            Range: <span className="text-blue-300 font-mono font-bold">{hoveredBlock.rangeStart} - {hoveredBlock.rangeEnd}</span>
                                                        </span>
                                                        {/* Di FLSM biasanya 'used' tidak spesifik (karena dibagi rata), jadi kita tampilkan kapasitas total saja */}
                                                        <span className="text-slate-400 flex items-center gap-1 col-span-2">
                                                            Kapasitas: <span className="text-green-400 font-bold">{capacity} Host Usable</span>
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            );
                                        })() : (
                                            <div className="flex items-center gap-2 text-slate-400 italic h-full bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse"></div>
                                                <span>Arahkan kursor ke balok warna untuk melihat detail.</span>
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* CONTAINER BALOK (Overflow Visible) */}
                                <div className="flex w-full h-48 bg-slate-100 rounded-2xl overflow-visible border border-slate-200 relative shadow-inner items-end pb-1 px-1 gap-0.5 z-20">
                                    <AnimatePresence>
                                        {subnets.map((subnet, index) => (
                                            <SubnetBlock
                                                key={index}
                                                data={subnet}
                                                totalHosts={totalHostsMaster}
                                                index={index}
                                                onHover={setHoveredBlock} // <--- Pass function ke anak
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        {/* TOMBOL NEXT MANUAL (FLOATING TOP RIGHT) */}
                        {initialMode === 'manual' && !isFinished && !calculationData && (
                            <div className="absolute top-6 right-6 z-30">
                                 <button
                                    onClick={nextStep}
                                    className="bg-net-blue text-white px-6 py-2 rounded-full font-bold shadow-xl shadow-blue-200 hover:bg-blue-600 transition flex items-center gap-3 animate-bounce-slow border-4 border-slate-50"
                                >
                                    Hitung Subnet #{currentIdx + 1} <FaForward size={12}/>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

import React, { useState, useEffect, useRef } from 'react';
import { ipToLong, longToIp } from "@/lib/ipUtils";
import SubnetBlock from './SubnetBlock';
import MathStepCard from './MathStepCard';
import NetworkTopologyGraph from './NetworkTopologyGraph';
import { FaPlay, FaForward, FaRedo, FaPlus, FaTrash, FaPause, FaCube, FaProjectDiagram, FaNetworkWired } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';

export default function VlsmVisualizer({ initialMode = 'manual' }) {
    const [networkInput, setNetworkInput] = useState("192.168.10.0/24");
    const [requirements, setRequirements] = useState([
        { id: 1, name: "Lab RPL", hosts: 60 },
        { id: 2, name: "Guru", hosts: 12 },
        { id: 3, name: "Server", hosts: 5 },
    ]);

    const [isSimulating, setIsSimulating] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [sortedReqs, setSortedReqs] = useState([]);
    const [allocatedBlocks, setAllocatedBlocks] = useState([]);
    const [totalHostsMaster, setTotalHostsMaster] = useState(0);
    const [nextAvailableIp, setNextAvailableIp] = useState(null);
    const [calculationData, setCalculationData] = useState(null);

    const [viewMode, setViewMode] = useState('topology');
    const [autoPlay, setAutoPlay] = useState(initialMode === 'auto');
    const timerRef = useRef(null);

    const [hoveredBlock, setHoveredBlock] = useState(null);

    // --- LOGIKA AUTO PLAY ---
    useEffect(() => {
        if (isSimulating && autoPlay) {
            const isFinished = currentStep >= sortedReqs.length && !calculationData;
            if (isFinished) return;

            timerRef.current = setTimeout(() => {
                nextStepAuto();
            }, 1500);
        }
        return () => clearTimeout(timerRef.current);
    }, [isSimulating, autoPlay, currentStep, sortedReqs, calculationData]);

    const handleReqChange = (id, field, val) => {
        setRequirements(prev => prev.map(r => r.id === id ? { ...r, [field]: field === 'hosts' ? parseInt(val)||0 : val } : r));
    };
    const addReq = () => setRequirements(prev => [...prev, { id: Date.now(), name: '', hosts: 0 }]);
    const removeReq = (id) => setRequirements(prev => prev.filter(r => r.id !== id));

    const startSimulation = () => {
        try {
            const [ip, prefixStr] = networkInput.split('/');
            const masterLong = ipToLong(ip);
            setNextAvailableIp(masterLong);
            setTotalHostsMaster(Math.pow(2, 32 - parseInt(prefixStr)));

            const sorted = [...requirements].filter(r => r.hosts > 0).sort((a, b) => b.hosts - a.hosts);
            setSortedReqs(sorted);
            setAllocatedBlocks([]);
            setCurrentStep(0);
            setCalculationData(null);
            setViewMode('topology');
            setIsSimulating(true);
            if (initialMode === 'auto') setAutoPlay(true);
        } catch (e) {
            alert("Input Network error.");
        }
    };

    const nextStep = () => {
        if (calculationData) {
            setAllocatedBlocks(prev => [...prev, { ...calculationData, isUnused: false }]);
            setNextAvailableIp(ipToLong(calculationData.broadcastId) + 1);
            setCalculationData(null);
            setCurrentStep(prev => prev + 1);
            return;
        }
        if (currentStep >= sortedReqs.length) return;
        const result = calculateNextBlock();
        setCalculationData(result);
    };

    const nextStepAuto = () => {
        if (currentStep >= sortedReqs.length) return;
        const result = calculateNextBlock();
        setAllocatedBlocks(prev => [...prev, { ...result, isUnused: false }]);
        setNextAvailableIp(ipToLong(result.broadcastId) + 1);
        setCurrentStep(prev => prev + 1);
    };

    const calculateNextBlock = () => {
        const req = sortedReqs[currentStep];
        const needed = req.hosts + 2;
        const hostBits = Math.ceil(Math.log2(needed));
        const newPrefix = 32 - hostBits;
        const blockSize = Math.pow(2, hostBits);
        const networkIdLong = nextAvailableIp;
        const broadcastIdLong = networkIdLong + blockSize - 1;

        return {
            name: req.name, hosts: req.hosts, needed, hostBits, blockSize,
            prefix: newPrefix, newPrefix,
            networkId: longToIp(networkIdLong), broadcastId: longToIp(broadcastIdLong),
            rangeStart: longToIp(networkIdLong + 1), rangeEnd: longToIp(broadcastIdLong - 1), hostsAvailable: blockSize
        };
    };

    const reset = () => {
        setIsSimulating(false); setAllocatedBlocks([]); setCurrentStep(0); setNextAvailableIp(null); setCalculationData(null);
        clearTimeout(timerRef.current);
    };

    const calculateUnusedBlock = () => {
        if (!isSimulating || nextAvailableIp === null) return null;
        try {
            const [masterIp, masterPrefixStr] = networkInput.split('/');
            const masterStartLong = ipToLong(masterIp);
            const masterSize = Math.pow(2, 32 - parseInt(masterPrefixStr));
            const masterEndLong = masterStartLong + masterSize - 1;
            const remainingHosts = masterEndLong - nextAvailableIp + 1;
            if (remainingHosts <= 0) return null;

            return {
                name: 'Sisa (Unused)', networkId: longToIp(nextAvailableIp), prefix: 'Free',
                rangeStart: longToIp(nextAvailableIp), rangeEnd: longToIp(masterEndLong), broadcastId: longToIp(masterEndLong), hostsAvailable: remainingHosts, isUnused: true
            };
        } catch(e) { return null; }
    };

    const unusedBlock = calculateUnusedBlock();
    const isFinished = isSimulating && currentStep >= sortedReqs.length && !calculationData;

    return (
        <div className="h-full flex flex-col bg-slate-50 relative">

            {/* === 1. TOOLBAR === */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm z-10 flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between">
                <div className="flex flex-wrap gap-4 items-center flex-1 w-full">
                    <div className="w-full sm:w-48">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Network Induk</label>
                        <div className="flex items-center border-2 border-slate-200 rounded-xl overflow-hidden focus-within:border-net-blue transition bg-slate-50">
                            <div className="bg-slate-100 px-3 py-2 text-slate-500 border-r border-slate-200"><FaNetworkWired /></div>
                            <input value={networkInput} onChange={e => setNetworkInput(e.target.value)} disabled={isSimulating} className="w-full border-none px-3 py-2 font-mono text-sm focus:ring-0 bg-transparent" placeholder="192.168.10.0/24"/>
                        </div>
                    </div>
                    <div className="flex-1 min-w-0 overflow-x-auto pb-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 flex gap-2 items-center">
                            Kebutuhan Host {!isSimulating && (<button onClick={addReq} className="text-net-teal bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded-full text-[10px] font-bold transition flex items-center gap-1"><FaPlus size={8}/> Tambah</button>)}
                        </label>
                        <div className="flex gap-2">
                            {requirements.map((r, i) => (
                                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} key={r.id} className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl border-2 transition-all w-40 relative group ${isSimulating ? 'bg-slate-100 border-slate-200 opacity-80' : `bg-white border-slate-100 shadow-sm hover:border-${['blue','teal','purple'][i%3]}-400`}`}>
                                    <input value={r.name} onChange={e => handleReqChange(r.id, 'name', e.target.value)} disabled={isSimulating} className="w-full bg-transparent border-none text-xs font-bold focus:ring-0 px-0 p-0 text-slate-700" placeholder="Nama"/>
                                    <div className="h-4 w-[2px] bg-slate-100 mx-1"></div>
                                    <input type="number" value={r.hosts} onChange={e => handleReqChange(r.id, 'hosts', e.target.value)} disabled={isSimulating} className="w-10 bg-transparent border-none p-0 text-xs text-center focus:ring-0 font-mono text-net-blue font-bold"/>
                                    <span className="text-[9px] text-slate-400">PC</span>
                                    {!isSimulating && (<button onClick={() => removeReq(r.id)} className="absolute -top-2 -right-2 bg-red-100 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-sm hover:bg-red-200"><FaTrash size={8}/></button>)}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 shrink-0">
                     {!isSimulating ? (
                        <button onClick={startSimulation} className="bg-gradient-to-r from-net-teal to-teal-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-teal-200 hover:scale-105 transition flex items-center gap-2"><FaPlay size={12}/> {initialMode === 'auto' ? 'Play Demo' : 'Mulai Hitung'}</button>
                    ) : (
                        <div className="flex gap-2">
                            {initialMode === 'auto' && !isFinished && (<button onClick={() => setAutoPlay(!autoPlay)} className="px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 text-sm flex items-center gap-2">{autoPlay ? <><FaPause size={10}/> Pause</> : <><FaPlay size={10}/> Lanjut</>}</button>)}
                            <button onClick={reset} className="px-4 py-2.5 rounded-xl font-bold text-red-500 bg-red-50 hover:bg-red-100 text-sm border border-red-100 transition flex items-center gap-2"><FaRedo size={12}/> Reset</button>
                        </div>
                    )}
                </div>
            </div>

            {/* === 2. VISUALIZATION AREA === */}
            <div className="flex-1 relative overflow-hidden bg-slate-50 flex flex-col">
                <div className="absolute inset-0 opacity-30 pointer-events-none bg-grid-pattern"></div>
                {!isSimulating && (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 z-0 mt-10">
                         <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-lg shadow-slate-200 border border-slate-100 mb-6 rotate-6 animate-float"><FaProjectDiagram size={40} className="text-net-blue opacity-50"/></div>
                        <h3 className="text-xl font-bold text-slate-700 mb-1">Siap Simulasi?</h3>
                        <p className="text-sm opacity-80">Masukkan data network di atas, lalu klik Mulai.</p>
                    </div>
                )}
                <AnimatePresence mode='wait'>
                    {calculationData && initialMode === 'manual' && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4">
                            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden transform scale-100">
                                <MathStepCard stepData={calculationData} />
                                <button onClick={nextStep} className="w-full bg-net-blue text-white py-4 font-bold text-lg hover:bg-blue-700 transition flex justify-center items-center gap-2">Terapkan ke Topologi <FaForward/></button>
                            </div>
                        </div>
                    )}
                </AnimatePresence>

                {isSimulating && (
                    <div className="flex-1 relative flex flex-col">
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-white/90 backdrop-blur border border-slate-200 p-1 rounded-xl shadow-lg flex gap-1">
                             <button onClick={() => setViewMode('topology')} className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${viewMode === 'topology' ? 'bg-net-blue text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}><FaProjectDiagram/> Topologi</button>
                            <button onClick={() => setViewMode('blocks')} className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${viewMode === 'blocks' ? 'bg-net-blue text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}><FaCube/> Balok Memori</button>
                        </div>

                        {/* MODE 1: TOPOLOGI */}
                        <div className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${viewMode === 'topology' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                             <NetworkTopologyGraph allocations={allocatedBlocks} masterNetwork={networkInput} />
                        </div>

                        {/* MODE 2: BALOK */}
                        <div className={`absolute inset-0 w-full h-full flex flex-col justify-center items-center transition-opacity duration-500 ${viewMode === 'blocks' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>

                             <div className="w-full max-w-6xl bg-white p-8 rounded-3xl border border-slate-200 shadow-xl relative">

                                {/* HEADER: Judul + INFO PANEL DINAMIS */}
                                <div className="flex justify-between items-start mb-6 h-16">
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Alokasi Memori IP Address</h4>
                                        <div className="text-xs font-mono text-slate-400 mt-1">Total: {totalHostsMaster} IP</div>
                                    </div>

                                    {/* PANEL INFO (Muncul saat Hover) */}
                                    <AnimatePresence mode='wait'>
                                        {hoveredBlock ? (() => {
                                            // --- HITUNG LOGIKA SISA (FREE) DISINI ---
                                            // Kapasitas Usable = Total Blok - 2 (Network & Broadcast)
                                            const capacity = hoveredBlock.hostsAvailable - 2;
                                            // Host yang diminta
                                            const used = hoveredBlock.hosts || 0;
                                            // Sisa
                                            const free = Math.max(0, capacity - used);
                                            // ----------------------------------------

                                            return (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="bg-slate-800 text-white px-5 py-3 rounded-xl shadow-lg border border-slate-700 text-xs flex gap-6 items-center"
                                                >
                                                    {/* Nama & Network ID */}
                                                    <div className="border-r border-slate-600 pr-6">
                                                        <div className="font-bold text-yellow-400 text-base mb-0.5">{hoveredBlock.name}</div>
                                                        <div className="font-mono text-[10px] text-slate-400">Network Address : {hoveredBlock.networkId}</div>
                                                    </div>

                                                    {/* Grid Informasi Detail */}
                                                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-[11px]">

                                                        {/* Baris 1 */}
                                                        <span className="text-slate-400">Prefix: <span className="text-white font-mono font-bold">/{hoveredBlock.prefix}</span></span>
                                                        <span className="text-slate-400">Broadcast: <span className="text-white font-mono">{hoveredBlock.broadcastId}</span></span>

                                                        {/* Baris 2: Range IP (SUDAH DIPERBAIKI) */}
                                                        <span className="text-slate-400 col-span-2">
                                                            Range: <span className="text-blue-300 font-mono font-bold">{hoveredBlock.rangeStart} - {hoveredBlock.rangeEnd}</span>
                                                        </span>

                                                        {/* Baris 3: Statistik (SUDAH DITAMBAHKAN SISA) */}
                                                        {!hoveredBlock.isUnused && (
                                                            <>
                                                                <span className="text-slate-400 flex items-center gap-1">
                                                                    Terpakai: <span className="text-green-400 font-bold">{used}</span>
                                                                </span>
                                                                <span className="text-slate-400 flex items-center gap-1">
                                                                    Sisa: <span className="text-orange-400 font-bold">{free}</span>
                                                                </span>
                                                            </>
                                                        )}
                                                        {/* Khusus Blok Unused */}
                                                        {hoveredBlock.isUnused && (
                                                            <span className="text-slate-400 col-span-2">
                                                                Kapasitas Bebas: <span className="text-white font-bold">{hoveredBlock.hostsAvailable} IP</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            );
                                        })() : (
                                            // Tampilan Default (Saat tidak hover)
                                            <div className="flex items-center gap-2 text-slate-400 italic h-full bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse"></div>
                                                <span>Arahkan kursor ke balok warna untuk melihat detail IP & Sisa Host.</span>
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* CONTAINER SCROLLABLE (Track Balok) */}
                                <div className="flex w-full h-40 bg-slate-100 rounded-2xl overflow-x-auto overflow-y-hidden border border-slate-200 relative shadow-inner items-end pb-1 px-1 gap-0.5 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                                    <AnimatePresence>
                                        {allocatedBlocks.map((block, index) => (
                                            <SubnetBlock
                                                key={block.networkId}
                                                data={block}
                                                totalHosts={totalHostsMaster}
                                                index={index}
                                                onHover={setHoveredBlock} // <--- Pass function ke anak
                                            />
                                        ))}
                                    </AnimatePresence>
                                    {unusedBlock && !calculationData && (
                                        <SubnetBlock
                                            key="unused"
                                            data={unusedBlock}
                                            totalHosts={totalHostsMaster}
                                            index={99}
                                            onHover={setHoveredBlock} // <--- Pass function ke anak
                                        />
                                    )}
                                </div>
                             </div>
                        </div>

                        {initialMode === 'manual' && !isFinished && !calculationData && (
                            // Ubah bottom-8 menjadi top-4, agar muncul di pojok kanan atas kanvas
                            <div className="absolute top-4 right-4 z-30">
                                <button
                                    onClick={nextStep}
                                    className="bg-white border-2 border-net-blue text-net-blue px-6 py-2 rounded-full font-bold shadow-lg hover:bg-blue-50 transition flex items-center gap-2 animate-bounce-slow"
                                >
                                    Langkah Berikutnya <FaForward size={12}/>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

import React, { useState, useMemo } from 'react';
import { ipToLong, longToIp } from "@/lib/ipUtils";
import SubnetBlock from './SubnetBlock';
import MathStepCard from './MathStepCard';
import NetworkTopologyGraph from './NetworkTopologyGraph';
import { FaPlay, FaForward, FaRedo, FaCheckCircle, FaPlus, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import { AnimatePresence } from 'framer-motion';

export default function VlsmVisualizer() {
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
    const [viewMode, setViewMode] = useState('blocks');

    // --- HELPER: Hitung Kapasitas Real-time ---
    const capacityStats = useMemo(() => {
        try {
            // 1. Hitung Kapasitas Induk
            const prefixStr = networkInput.split('/')[1];
            if (!prefixStr) return { total: 0, used: 0, percent: 0, error: null };

            const masterPrefix = parseInt(prefixStr);
            if (isNaN(masterPrefix) || masterPrefix > 30) return { total: 0, used: 0, percent: 0, error: "Prefix tidak valid" };

            const totalCapacity = Math.pow(2, 32 - masterPrefix);

            // 2. Hitung Total Kebutuhan (Berdasarkan Blok VLSM)
            let totalUsed = 0;
            requirements.forEach(r => {
                const needed = (parseInt(r.hosts) || 0) + 2; // +2 untuk Net & Broadcast
                const hostBits = Math.ceil(Math.log2(needed)); // Cari pangkat 2 terdekat
                const blockSize = Math.pow(2, hostBits);
                totalUsed += blockSize;
            });

            const percent = (totalUsed / totalCapacity) * 100;
            const isOverload = totalUsed > totalCapacity;

            return { total: totalCapacity, used: totalUsed, percent, isOverload };
        } catch (e) {
            return { total: 0, used: 0, percent: 0, error: "Format IP Salah" };
        }
    }, [networkInput, requirements]);

    // --- CRUD Logic ---
    const handleReqChange = (id, field, val) => {
        setRequirements(prev => prev.map(r => r.id === id ? { ...r, [field]: field === 'hosts' ? parseInt(val)||0 : val } : r));
    };
    const addReq = () => setRequirements(prev => [...prev, { id: Date.now(), name: '', hosts: 0 }]);
    const removeReq = (id) => setRequirements(prev => prev.filter(r => r.id !== id));

    // --- START Logic ---
    const startSimulation = () => {
        if (capacityStats.isOverload) {
            alert("Kapasitas IP tidak cukup! Kurangi jumlah host atau ganti prefix induk.");
            return;
        }
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
            setViewMode('blocks');
            setIsSimulating(true);
        } catch (e) {
            alert("Input Network error. Format: 192.168.1.0/24");
        }
    };

    // --- NEXT STEP Logic ---
    const nextStep = () => {
        if (calculationData) {
            setAllocatedBlocks(prev => [...prev, { ...calculationData, isUnused: false }]);
            setNextAvailableIp(ipToLong(calculationData.broadcastId) + 1);
            setCalculationData(null);
            setCurrentStep(prev => prev + 1);
            return;
        }
        if (currentStep >= sortedReqs.length) return;

        const req = sortedReqs[currentStep];
        const needed = req.hosts + 2;
        const hostBits = Math.ceil(Math.log2(needed));
        const newPrefix = 32 - hostBits;
        const blockSize = Math.pow(2, hostBits);
        const networkIdLong = nextAvailableIp;
        const broadcastIdLong = networkIdLong + blockSize - 1;

        // Siapkan Data Perhitungan
        const calcData = {
            name: req.name,
            hosts: req.hosts,
            needed: needed,
            hostBits: hostBits,
            blockSize: blockSize,
            prefix: newPrefix,
            newPrefix: newPrefix,
            networkId: longToIp(networkIdLong),
            broadcastId: longToIp(broadcastIdLong),
            rangeStart: longToIp(networkIdLong + 1),
            rangeEnd: longToIp(broadcastIdLong - 1),
            hostsAvailable: blockSize
        };

        setCalculationData(calcData);
    };

    const reset = () => {
        setIsSimulating(false); setAllocatedBlocks([]); setCurrentStep(0); setNextAvailableIp(null); setCalculationData(null);
    };

    const calculateUnusedBlock = () => {
        if (!isSimulating || nextAvailableIp === null) return null;
        const [masterIp, masterPrefixStr] = networkInput.split('/');
        const masterEndLong = ipToLong(masterIp) + Math.pow(2, 32 - parseInt(masterPrefixStr));
        const remainingHosts = masterEndLong - nextAvailableIp;
        if (remainingHosts <= 0) return null;
        return {
            name: 'Sisa (Unused)', networkId: longToIp(nextAvailableIp), prefix: '?',
            rangeStart: '-', rangeEnd: '-', broadcastId: '-', hostsAvailable: remainingHosts, isUnused: true
        };
    };
    const unusedBlock = calculateUnusedBlock();
    const isFinished = isSimulating && currentStep >= sortedReqs.length && !calculationData;

    return (
        <div className="h-full flex flex-col bg-slate-50 relative">

            {/* === 1. TOOLBAR (INPUTS FULL WIDTH) === */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm z-10">

                {/* Baris Utama: Input & Button Sejajar */}
                <div className="flex flex-col xl:flex-row items-start xl:items-end gap-6 w-full">

                    {/* Input Network Induk */}
                    <div className="w-full xl:w-64 shrink-0">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">1. Network Induk (CIDR)</label>
                        <input
                            value={networkInput} onChange={e => setNetworkInput(e.target.value)} disabled={isSimulating}
                            className={`w-full border-2 rounded-lg px-3 py-2.5 font-mono text-sm focus:ring-0 transition ${capacityStats.error ? 'border-red-300 bg-red-50' : 'border-slate-300 focus:border-net-teal'}`}
                            placeholder="192.168.10.0/24"
                        />
                    </div>

                    {/* Daftar Ruangan (Expanded) */}
                    <div className="flex-1 w-full">
                        <div className="flex justify-between items-end mb-1">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">2. Daftar Kebutuhan Host</label>

                            {/* INDIKATOR KAPASITAS (BARU) */}
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold ${capacityStats.isOverload ? 'text-red-500' : 'text-slate-500'}`}>
                                    Terpakai: {capacityStats.used} / {capacityStats.total} IP
                                </span>
                                <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${capacityStats.isOverload ? 'bg-red-500' : 'bg-green-500'}`}
                                        style={{ width: `${Math.min(capacityStats.percent, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* Container Input Ruangan */}
                        <div className="flex flex-wrap gap-3">
                            {requirements.map(r => (
                                <div key={r.id} className={`flex items-center gap-0 bg-white border rounded-lg overflow-hidden transition-all w-48 ${isSimulating ? 'opacity-70 bg-slate-50 border-slate-200' : 'border-slate-300 hover:border-net-teal shadow-sm'}`}>
                                    <input
                                        value={r.name} onChange={e => handleReqChange(r.id, 'name', e.target.value)} disabled={isSimulating}
                                        className="flex-1 min-w-0 bg-transparent border-none text-xs font-bold focus:ring-0 px-3 py-2 text-slate-700 placeholder-slate-400"
                                        placeholder="Nama Ruang"
                                    />
                                    <div className="h-4 w-[1px] bg-slate-200"></div>
                                    <input
                                        type="number" value={r.hosts} onChange={e => handleReqChange(r.id, 'hosts', e.target.value)} disabled={isSimulating}
                                        className="w-12 bg-transparent border-none p-0 text-xs text-center focus:ring-0 font-mono text-slate-600"
                                    />
                                    <span className="text-[10px] text-slate-400 pr-1">PC</span>
                                    {!isSimulating && (
                                        <button onClick={() => removeReq(r.id)} className="text-slate-300 hover:text-red-500 px-2 border-l border-slate-100 h-full bg-slate-50 hover:bg-red-50">
                                            <FaTrash size={10}/>
                                        </button>
                                    )}
                                </div>
                            ))}

                            {!isSimulating && (
                                <button onClick={addReq} className="text-net-teal text-xs font-bold hover:underline flex items-center gap-1 bg-teal-50 px-3 rounded border border-teal-100 hover:bg-teal-100 transition">
                                    <FaPlus size={10}/> Tambah
                                </button>
                            )}
                        </div>

                        {/* PESAN ERROR OVERLOAD */}
                        {capacityStats.isOverload && !isSimulating && (
                            <div className="mt-2 text-xs text-red-500 font-bold flex items-center gap-1 animate-pulse">
                                <FaExclamationTriangle /> Peringatan: Total kebutuhan ({capacityStats.used} IP) melebihi kapasitas network induk ({capacityStats.total} IP)!
                            </div>
                        )}
                    </div>

                    {/* Tombol Aksi (Selalu di Kanan) */}
                    <div className="xl:ml-auto shrink-0">
                        {!isSimulating ? (
                            <button
                                onClick={startSimulation}
                                disabled={capacityStats.isOverload || capacityStats.error}
                                className={`px-8 py-3 rounded-xl font-bold text-sm shadow-lg transition flex items-center gap-2 w-full sm:w-auto justify-center
                                    ${capacityStats.isOverload
                                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                        : 'bg-net-teal text-white shadow-teal-100 hover:bg-teal-600 hover:-translate-y-0.5'
                                    }
                                `}
                            >
                                <FaPlay size={12}/> Mulai Hitung
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={reset} className="px-5 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 text-sm transition flex items-center gap-2 border border-slate-200">
                                    <FaRedo size={12}/> Reset
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* === 2. VISUALIZATION AREA === */}
            <div className="flex-1 relative overflow-y-auto p-8 bg-slate-50 flex flex-col items-center">
                <div className="absolute inset-0 opacity-30 pointer-events-none bg-grid-pattern"></div>

                {!isSimulating && (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 z-0 mt-10">
                        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-200 mb-4 rotate-3">
                            <FaPlay size={24} className="ml-1 opacity-20"/>
                        </div>
                        <p className="text-lg font-medium text-slate-500">Area Visualisasi</p>
                        <p className="text-sm">Data akan muncul di sini setelah Anda menekan tombol <strong>Mulai Hitung</strong>.</p>
                    </div>
                )}

                <AnimatePresence mode='wait'>
                    {calculationData && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4">
                            <div className="w-full max-w-2xl shadow-2xl">
                                <MathStepCard stepData={calculationData} />
                                <div className="p-4 bg-white border-t border-slate-200 rounded-b-xl flex justify-center">
                                    <button onClick={nextStep} className="w-full bg-net-blue text-white py-3 rounded-xl font-bold text-lg shadow-xl hover:bg-blue-600 transition animate-bounce-slow">
                                        Terapkan Hasil Ini
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>

                {isSimulating && !isFinished && !calculationData && (
                    <div className="absolute top-6 right-6 z-30">
                         <button onClick={nextStep} className="bg-net-blue text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition flex items-center gap-2 animate-bounce-slow border-2 border-white">
                            Langkah Berikutnya <FaForward size={12}/>
                        </button>
                    </div>
                )}

                {isSimulating && (
                    <div className="w-full max-w-6xl mx-auto space-y-8 pb-20 relative z-10">
                        {isFinished && (
                            <div className="flex justify-center mb-4">
                                <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex">
                                    <button onClick={() => setViewMode('blocks')} className={`px-6 py-2 rounded-lg text-sm font-bold transition ${viewMode === 'blocks' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}>Balok Memori</button>
                                    <button onClick={() => setViewMode('topology')} className={`px-6 py-2 rounded-lg text-sm font-bold transition ${viewMode === 'topology' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}>Topologi Jaringan</button>
                                </div>
                            </div>
                        )}

                        <div className={viewMode === 'blocks' ? 'block' : 'hidden'}>
                            <div className="w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 text-center">Peta Alokasi IP</h4>
                                <div className="flex w-full h-48 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative shadow-inner">
                                    <AnimatePresence>
                                        {allocatedBlocks.map((block, index) => (
                                            <SubnetBlock key={block.networkId} data={block} totalHosts={totalHostsMaster} index={index} />
                                        ))}
                                    </AnimatePresence>
                                    {unusedBlock && !calculationData && (
                                        <SubnetBlock key="unused" data={unusedBlock} totalHosts={totalHostsMaster} index={99} />
                                    )}
                                </div>
                                <div className="flex justify-between items-center mt-4 px-2">
                                    <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">{networkInput}</span>
                                    <span className="text-xs font-mono text-slate-400">Kapasitas Total: {totalHostsMaster} IP</span>
                                </div>
                            </div>
                        </div>

                        <div className={viewMode === 'topology' ? 'block' : 'hidden'}>
                             <div className="w-full bg-white p-2 rounded-2xl border border-slate-200 shadow-sm h-[600px]">
                                <NetworkTopologyGraph allocations={allocatedBlocks} masterNetwork={networkInput} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

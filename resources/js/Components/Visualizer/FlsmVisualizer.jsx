import React, { useState } from "react";
import { ipToLong, longToIp } from "@/lib/ipUtils";
import SubnetBlock from "./SubnetBlock";
import MathStepCard from "./MathStepCard";
import NetworkTopologyGraph from "./NetworkTopologyGraph";
import {
    FaCogs,
    FaPlay,
    FaForward,
    FaRedo,
    FaCheckCircle,
} from "react-icons/fa";
import { AnimatePresence } from "framer-motion";

export default function FlsmVisualizer() {
    const [networkInput, setNetworkInput] = useState("192.168.10.0/24");
    const [subnetCountReq, setSubnetCountReq] = useState("4");

    // State Simulasi
    const [isSimulating, setIsSimulating] = useState(false);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [subnets, setSubnets] = useState([]);
    const [totalHostsMaster, setTotalHostsMaster] = useState(0);
    const [calculationData, setCalculationData] = useState(null);
    const [viewMode, setViewMode] = useState("blocks");

    // Data statis hasil perhitungan FLSM (disimpan setelah Start)
    const [flsmPlan, setFlsmPlan] = useState(null);

    const startSimulation = () => {
        try {
            const [ip, prefixStr] = networkInput.split("/");
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

            // Simpan rencana perhitungan (Blueprint)
            setFlsmPlan({
                masterLong,
                borrowedBits,
                newPrefix,
                actualSubnetCount,
                blockSize,
                neededSubnets,
            });

            setSubnets([]);
            setCurrentIdx(0);
            setCalculationData(null);
            setViewMode("blocks");
            setIsSimulating(true);
        } catch (e) {
            alert(
                "Input Network tidak valid! Gunakan format CIDR (contoh: 192.168.1.0/24)"
            );
        }
    };

    const nextStep = () => {
        // Jika sedang tampil kartu, terapkan ke balok
        if (calculationData) {
            setSubnets((prev) => [
                ...prev,
                { ...calculationData, isUnused: false },
            ]);
            setCalculationData(null);
            setCurrentIdx((prev) => prev + 1);
            return;
        }

        if (currentIdx >= flsmPlan.actualSubnetCount) return;

        // Hitung Subnet ke-i
        const currentIpLong =
            flsmPlan.masterLong + currentIdx * flsmPlan.blockSize;
        const networkId = longToIp(currentIpLong);
        const broadcastId = longToIp(currentIpLong + flsmPlan.blockSize - 1);
        const rangeStart = longToIp(currentIpLong + 1);
        const rangeEnd = longToIp(currentIpLong + flsmPlan.blockSize - 2);

        // Siapkan Data Tampilan Kartu
        const calcData = {
            name: `Subnet #${currentIdx + 1}`,
            hosts: flsmPlan.blockSize - 2,
            needed: flsmPlan.blockSize,
            hostBits: 32 - flsmPlan.newPrefix,
            blockSize: flsmPlan.blockSize,

            // --- PERBAIKAN DISINI: Pastikan key-nya 'prefix' agar terbaca di Topologi ---
            prefix: flsmPlan.newPrefix,
            newPrefix: flsmPlan.newPrefix, // (Biarkan ini untuk MathCard)
            // ---------------------------------------------------------------------------

            networkId: networkId,
            broadcastId: broadcastId,
            rangeStart: rangeStart,
            rangeEnd: rangeEnd,
            hostsAvailable: flsmPlan.blockSize - 2, // Tampilkan kapasitas usable
            borrowedBits: flsmPlan.borrowedBits,
            customMessage: `Meminjam ${flsmPlan.borrowedBits} bit untuk membuat ${flsmPlan.actualSubnetCount} subnet.`
        };

        setCalculationData(calcData);
    };

    const reset = () => {
        setIsSimulating(false);
        setSubnets([]);
        setCurrentIdx(0);
        setCalculationData(null);
    };

    const isFinished =
        isSimulating &&
        flsmPlan &&
        currentIdx >= flsmPlan.actualSubnetCount &&
        !calculationData;

    return (
        <div className="h-full flex flex-col bg-slate-50 relative">
            {/* === TOOLBAR === */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm z-10">
                <div className="flex flex-wrap gap-6 items-center justify-between w-full">
                    <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
                        <div className="w-full sm:w-48">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                                Network Induk
                            </label>
                            <input
                                value={networkInput}
                                onChange={(e) =>
                                    setNetworkInput(e.target.value)
                                }
                                disabled={isSimulating}
                                className="w-full border border-slate-300 rounded-md px-3 py-2 font-mono text-sm focus:ring-net-blue focus:border-net-blue bg-slate-50 disabled:text-slate-500"
                            />
                        </div>
                        <div className="w-full sm:w-32">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                                Jumlah Subnet
                            </label>
                            <select
                                value={subnetCountReq}
                                onChange={(e) =>
                                    setSubnetCountReq(e.target.value)
                                }
                                disabled={isSimulating}
                                className="w-full border border-slate-300 rounded-md px-3 py-2 font-mono text-sm focus:ring-net-blue bg-white disabled:bg-slate-100"
                            >
                                <option value="2">2 Subnet</option>
                                <option value="4">4 Subnet</option>
                                <option value="8">8 Subnet</option>
                                <option value="16">16 Subnet</option>
                            </select>
                        </div>
                    </div>

                    <div className="w-full md:w-auto flex justify-end">
                        {!isSimulating ? (
                            <button
                                onClick={startSimulation}
                                className="bg-net-blue text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-md shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 transition flex items-center gap-2"
                            >
                                <FaPlay size={12} /> Mulai Hitung
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={reset}
                                    className="px-4 py-2.5 rounded-lg font-bold text-slate-500 hover:bg-slate-100 text-sm transition flex items-center gap-2 border border-slate-200"
                                >
                                    <FaRedo size={12} /> Reset
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* === CONTENT AREA === */}
            <div className="flex-1 relative overflow-y-auto p-8 flex flex-col bg-slate-50">
                <div className="absolute inset-0 opacity-30 pointer-events-none bg-grid-pattern"></div>

                {!isSimulating && (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 z-0 mt-10">
                        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-200 mb-4 rotate-3">
                            <FaCogs size={32} className="ml-1 opacity-20" />
                        </div>
                        <p className="text-lg font-medium text-slate-500">
                            Simulator FLSM
                        </p>
                        <p className="text-sm">
                            Pilih jumlah subnet, sistem akan membaginya rata.
                        </p>
                    </div>
                )}

                {/* A. OVERLAY KARTU PERHITUNGAN */}
                {/* A. OVERLAY KARTU PERHITUNGAN */}
                <AnimatePresence mode="wait">
                    {calculationData && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
                                <MathStepCard stepData={calculationData} />

                                {/* FOOTER MODAL DENGAN TOMBOL */}
                                <div className="p-4 bg-slate-50 border-t border-slate-200">
                                    <button
                                        onClick={nextStep}
                                        className="w-full bg-net-blue text-white py-3 rounded-xl font-bold text-lg shadow-md hover:bg-blue-600 transition animate-bounce-slow"
                                    >
                                        Terapkan Hasil Ini
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>

                {/* B. TOMBOL FLOATING NEXT STEP */}
                {isSimulating && !isFinished && !calculationData && (
                    <div className="absolute top-6 right-6 z-30">
                        <button
                            onClick={nextStep}
                            className="bg-net-teal text-white px-6 py-2 rounded-full font-bold shadow-xl shadow-teal-200 hover:bg-teal-600 transition flex items-center gap-3 animate-bounce-slow border-4 border-slate-50"
                        >
                            Hitung Subnet #{currentIdx + 1}{" "}
                            <FaForward size={12} />
                        </button>
                    </div>
                )}

                {/* C. HASIL (Blocks & Topology) */}
                {isSimulating && (
                    <div className="w-full max-w-6xl mx-auto space-y-8 pb-20 relative z-10">
                        {/* Tab Switcher */}
                        {isFinished && (
                            <div className="flex justify-center">
                                <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex">
                                    <button
                                        onClick={() => setViewMode("blocks")}
                                        className={`px-6 py-2 rounded-lg text-sm font-bold transition ${
                                            viewMode === "blocks"
                                                ? "bg-slate-800 text-white shadow"
                                                : "text-slate-500 hover:bg-slate-50"
                                        }`}
                                    >
                                        Balok Memori
                                    </button>
                                    <button
                                        onClick={() => setViewMode("topology")}
                                        className={`px-6 py-2 rounded-lg text-sm font-bold transition ${
                                            viewMode === "topology"
                                                ? "bg-slate-800 text-white shadow"
                                                : "text-slate-500 hover:bg-slate-50"
                                        }`}
                                    >
                                        Topologi Jaringan
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* MODE 1: BALOK */}
                        <div
                            className={
                                viewMode === "blocks" ? "block" : "hidden"
                            }
                        >
                            <div className="w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 text-center">
                                    Peta Pembagian FLSM (Sama Rata)
                                </h4>
                                <div className="flex w-full h-40 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative shadow-inner">
                                    <AnimatePresence>
                                        {subnets.map((subnet, index) => (
                                            <SubnetBlock
                                                key={index}
                                                data={subnet}
                                                totalHosts={totalHostsMaster}
                                                index={index}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                                <div className="text-center text-xs text-slate-400 mt-4 font-mono">
                                    Total Kapasitas: {totalHostsMaster} IP
                                    (Dibagi {flsmPlan?.actualSubnetCount} blok)
                                </div>
                            </div>
                        </div>

                        {/* MODE 2: TOPOLOGI */}
                        <div
                            className={
                                viewMode === "topology" ? "block" : "hidden"
                            }
                        >
                            <div className="w-full bg-white p-2 rounded-2xl border border-slate-200 shadow-sm h-[600px]">
                                <NetworkTopologyGraph
                                    allocations={subnets}
                                    masterNetwork={networkInput}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

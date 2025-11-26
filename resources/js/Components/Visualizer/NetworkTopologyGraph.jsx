import React, { useMemo } from 'react';
import ReactFlow, { Background, Controls, Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import { FaServer, FaNetworkWired, FaLaptop, FaGlobe, FaEthernet } from 'react-icons/fa';

// --- Custom Node Types (Updated dengan IP Label) ---
const DeviceNode = ({ data }) => {
    let Icon = FaNetworkWired;
    let bgClass = "bg-white border-slate-400";
    let textClass = "text-slate-700";

    if (data.type === 'router') {
        Icon = FaGlobe;
        bgClass = "bg-blue-50 border-blue-500 shadow-lg shadow-blue-100";
    } else if (data.type === 'switch') {
        Icon = FaEthernet;
        bgClass = "bg-teal-50 border-teal-500 shadow-md";
    } else if (data.type === 'pc') {
        Icon = FaLaptop;
        bgClass = "bg-slate-50 border-slate-300";
    }

    return (
        <div className={`px-3 py-2 rounded-lg border-2 min-w-[140px] text-center ${bgClass}`}>
            <Handle type="target" position={Position.Top} className="!bg-slate-400" />
            <div className="flex flex-col items-center">
                <Icon className="mb-1 text-lg opacity-70" />
                <div className={`font-bold text-xs ${textClass}`}>{data.label}</div>

                {/* --- PERBAIKAN: Tampilkan IP Address Disini --- */}
                {data.ip && (
                    <div className="mt-1 bg-white/80 px-2 py-0.5 rounded border border-slate-200 text-[10px] font-mono font-bold text-slate-600">
                        {data.ip}
                    </div>
                )}
                {data.subLabel && <div className="text-[9px] text-slate-400 mt-0.5">{data.subLabel}</div>}
            </div>
            <Handle type="source" position={Position.Bottom} className="!bg-slate-400" />
        </div>
    );
};

const nodeTypes = { device: DeviceNode };

export default function NetworkTopologyGraph({ allocations, masterNetwork }) {
    const { nodes, edges } = useMemo(() => {
        const initialNodes = [];
        const initialEdges = [];

        // 1. Core Router (Gateway Utama)
        // Biasanya IP pertama dari network induk
        const routerIp = masterNetwork ? masterNetwork.split('/')[0] : 'Gateway';

        initialNodes.push({
            id: 'router-main',
            type: 'device',
            position: { x: 400, y: 0 },
            data: {
                label: 'Core Router',
                type: 'router',
                ip: routerIp,
                subLabel: 'ISP / Core'
            }
        });

        // 2. Generate Switch per Subnet
        allocations.forEach((alloc, index) => {
            const xPos = 100 + (index * 220); // Jarak horizontal antar node
            const switchId = `sw-${index}`;

            // Node Switch (Mewakili Network ID subnet tersebut)
            initialNodes.push({
                id: switchId,
                type: 'device',
                position: { x: xPos, y: 150 },
                data: {
                    label: `Network ${alloc.name}`,
                    type: 'switch',
                    ip: alloc.networkId, // Network ID
                    subLabel: `Prefix: /${alloc.prefix}`
                }
            });

            // Kabel Router ke Switch
            initialEdges.push({
                id: `e-r-${index}`,
                source: 'router-main',
                target: switchId,
                type: 'smoothstep',
                animated: true,
                label: `Link`,
                labelStyle: { fontSize: 10, fill: '#94a3b8' },
                style: { stroke: '#45b0ac', strokeWidth: 2 }
            });

            // Node PC (Mewakili Host Range)
            initialNodes.push({
                id: `pc-${index}`,
                type: 'device',
                position: { x: xPos, y: 300 },
                data: {
                    label: `Host Range`,
                    type: 'pc',

                    // --- PERBAIKAN DISINI: Tampilkan Range Lengkap ---
                    ip: `${alloc.rangeStart} - ${alloc.rangeEnd}`,
                    // -----------------------------------------------

                    subLabel: `Kapasitas: ${alloc.hostsAvailable} IP`
                }
            });

            // Kabel Switch ke PC
            initialEdges.push({
                id: `e-sw-${index}`,
                source: switchId,
                target: `pc-${index}`,
                type: 'default',
                style: { stroke: '#cbd5e1' }
            });
        });

        return { nodes: initialNodes, edges: initialEdges };
    }, [allocations, masterNetwork]);

    return (
        <div className="w-full h-[500px] bg-slate-100 rounded-xl border-2 border-slate-200 relative overflow-hidden">
            <div className="absolute top-2 left-2 z-10 bg-white/90 px-3 py-1 rounded text-xs font-bold text-slate-500 border border-slate-200 shadow-sm">
                Topology Map
            </div>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-right"
            >
                <Background color="#94a3b8" gap={25} size={1} />
                <Controls className='bg-white border border-slate-200 shadow-sm' />
            </ReactFlow>
        </div>
    );
}

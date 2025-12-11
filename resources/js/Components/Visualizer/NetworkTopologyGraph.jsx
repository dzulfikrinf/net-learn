import React, { useEffect, useMemo } from 'react';
import ReactFlow, { Background, Controls, Handle, Position, useReactFlow, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { FaServer, FaNetworkWired, FaLaptop, FaGlobe, FaEthernet } from 'react-icons/fa';
import { motion } from 'framer-motion';

// --- CUSTOM NODE ---
const DeviceNode = ({ data }) => {
    let Icon = FaNetworkWired;
    let bgClass = "bg-white border-slate-300";
    let iconColor = "text-slate-500";

    if (data.type === 'router') {
        Icon = FaGlobe;
        bgClass = "bg-blue-50 border-blue-500 shadow-blue-200 shadow-lg";
        iconColor = "text-blue-600";
    } else if (data.type === 'switch') {
        Icon = FaEthernet;
        bgClass = "bg-teal-50 border-teal-500 shadow-teal-200 shadow-md";
        iconColor = "text-teal-600";
    } else if (data.type === 'pc') {
        Icon = FaLaptop;
        bgClass = "bg-slate-50 border-slate-400";
        iconColor = "text-slate-600";
    }

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className={`px-4 py-3 rounded-xl border-2 min-w-[160px] text-center ${bgClass}`}
        >
            <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-3 !h-3" />
            <div className="flex flex-col items-center">
                <div className={`p-2 rounded-full bg-white/50 mb-2 ${iconColor}`}>
                    <Icon className="text-xl" />
                </div>
                <div className="font-bold text-xs text-slate-700">{data.label}</div>

                {/* IP LABEL */}
                {data.ip && (
                    <div className="mt-1 bg-white/90 px-2 py-0.5 rounded border border-slate-200 text-[10px] font-mono font-bold text-slate-600 shadow-sm whitespace-nowrap">
                        {data.ip}
                    </div>
                )}

                {/* SUB LABEL */}
                {data.subLabel && <div className="text-[9px] text-slate-500 mt-0.5 font-bold uppercase">{data.subLabel}</div>}
            </div>
            <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-3 !h-3" />
        </motion.div>
    );
};

const nodeTypes = { device: DeviceNode };

// --- GRAPH UTAMA ---
function TopologyGraph({ allocations, masterNetwork }) {
    const { setCenter } = useReactFlow();

    const { nodes, edges } = useMemo(() => {
        const newNodes = [];
        const newEdges = [];

        // 1. CORE ROUTER
        const coreIp = masterNetwork ? masterNetwork.split('/')[0] : '...';

        newNodes.push({
            id: 'router-main',
            type: 'device',
            position: { x: 400, y: 0 },
            data: { label: 'Core Router', type: 'router', ip: coreIp, subLabel: 'ISP Gateway' }
        });

        // 2. GENERATE SUBNETS
        allocations.forEach((alloc, index) => {
            const xPos = 100 + (index * 280);
            const switchId = `sw-${index}`;
            const pcId = `pc-${index}`;

            // SWITCH
            newNodes.push({
                id: switchId,
                type: 'device',
                position: { x: xPos, y: 200 },
                data: {
                    label: alloc.name,
                    type: 'switch',
                    ip: alloc.networkId,
                    subLabel: `Prefix: /${alloc.prefix}`
                }
            });

            newEdges.push({
                id: `e-r-${index}`,
                source: 'router-main',
                target: switchId,
                animated: true,
                style: { stroke: '#45b0ac', strokeWidth: 2 },
            });

            // PC (HOST RANGE)
            newNodes.push({
                id: pcId,
                type: 'device',
                position: { x: xPos, y: 400 },
                data: {
                    label: 'Host Range',
                    type: 'pc',

                    // --- PERBAIKAN: Range Full (Tanpa Titik-titik) ---
                    ip: `${alloc.rangeStart} - ${alloc.rangeEnd}`,
                    // ------------------------------------------------

                    subLabel: `${alloc.hosts} PC`
                }
            });

            newEdges.push({
                id: `e-sw-${index}`,
                source: switchId,
                target: pcId,
                style: { stroke: '#94a3b8', strokeWidth: 1.5 },
            });
        });

        return { nodes: newNodes, edges: newEdges };
    }, [allocations, masterNetwork]);

    // Efek Kamera
    useEffect(() => {
        if (allocations.length > 0) {
            const lastIndex = allocations.length - 1;
            const xPos = 100 + (lastIndex * 280);
            setCenter(xPos, 250, { zoom: 0.9, duration: 800 });
        } else {
            setCenter(400, 100, { zoom: 1.2, duration: 800 });
        }
    }, [allocations, setCenter]);

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-right"
        >
            <Background color="#cbd5e1" gap={30} size={1} />
            <Controls className='bg-white border border-slate-200 shadow-lg rounded-lg' />
        </ReactFlow>
    );
}

export default function NetworkTopologyGraph(props) {
    return (
        <ReactFlowProvider>
            <div className="w-full h-full bg-slate-50 relative overflow-hidden">
                <TopologyGraph {...props} />
            </div>
        </ReactFlowProvider>
    );
}

import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FaArrowLeft, FaGripVertical, FaPlus, FaPencilAlt, FaTrash } from 'react-icons/fa';

export default function ManageModules({ lesson }) {
    // State lokal untuk urutan modul
    const [modules, setModules] = useState(lesson.modules);
    const [isSaving, setIsSaving] = useState(false);

    // Fungsi saat item selesai digeser (Drop)
    const handleOnDragEnd = (result) => {
        if (!result.destination) return; // Kalau dilepas di luar area, batalkan

        // 1. Ubah urutan di State React (Visual saja)
        const items = Array.from(modules);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setModules(items);

        // 2. Kirim Urutan Baru ke Database (Auto Save)
        saveOrder(items);
    };

    const saveOrder = (newModules) => {
        setIsSaving(true);
        router.post(route('admin.modules.reorder', lesson.id), {
            modules: newModules
        }, {
            preserveScroll: true,
            onFinish: () => setIsSaving(false)
        });
    };

    // Helper Ikon Tipe
    const getTypeLabel = (type) => {
        if(type === 'text') return { label: 'Bacaan', color: 'bg-blue-100 text-blue-700' };
        if(type === 'quiz') return { label: 'Kuis', color: 'bg-orange-100 text-orange-700' };
        if(type === 'simulator_vlsm') return { label: 'Simulator', color: 'bg-teal-100 text-teal-700' };
        return { label: 'Lainnya', color: 'bg-gray-100 text-gray-700' };
    };

    return (
        <div className="min-h-screen bg-slate-100 p-8 font-sans text-slate-800">
            <Head title={`Atur Materi: ${lesson.title}`} />

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <Link href={route('admin.content.index')} className="text-slate-500 hover:text-net-blue flex items-center gap-2 mb-2 text-sm font-bold">
                            <FaArrowLeft /> Kembali ke Kurikulum
                        </Link>
                        <h1 className="text-2xl font-bold">
                            Atur Modul: <span className="text-net-blue">{lesson.title}</span>
                        </h1>
                    </div>
                    <Link
                        href={route('admin.module.create', lesson.id)}
                        className="bg-net-blue text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-blue-700 transition flex items-center gap-2"
                    >
                        <FaPlus /> Tambah Modul Baru
                    </Link>
                </div>

                {/* Status Saving */}
                <div className="h-6 mb-2 text-right">
                    {isSaving && <span className="text-xs text-slate-400 italic">Menyimpan urutan...</span>}
                </div>

                {/* AREA DRAG & DROP */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <DragDropContext onDragEnd={handleOnDragEnd}>
                        <Droppable droppableId="modules-list">
                            {(provided) => (
                                <ul {...provided.droppableProps} ref={provided.innerRef} className="divide-y divide-slate-100">
                                    {modules.map((mod, index) => {
                                        const typeInfo = getTypeLabel(mod.type);
                                        return (
                                            <Draggable key={mod.id} draggableId={mod.id.toString()} index={index}>
                                                {(provided, snapshot) => (
                                                    <li
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className={`flex items-center p-4 gap-4 bg-white hover:bg-slate-50 transition ${snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-200 z-10' : ''}`}
                                                    >
                                                        {/* Handle Grip (Pegang disini untuk geser) */}
                                                        <div {...provided.dragHandleProps} className="text-slate-300 hover:text-slate-600 cursor-grab active:cursor-grabbing p-2">
                                                            <FaGripVertical />
                                                        </div>

                                                        {/* Nomor Urut */}
                                                        <div className="text-slate-400 font-mono w-6 font-bold">{index + 1}.</div>

                                                        {/* Info Modul */}
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wide ${typeInfo.color}`}>
                                                                    {typeInfo.label}
                                                                </span>
                                                            </div>
                                                            {/* Tampilkan cuplikan konten */}
                                                            <div className="text-sm font-medium text-slate-700 line-clamp-1">
                                                                {mod.type === 'quiz'
                                                                    ? `Q: ${mod.data?.question || 'Soal Kuis'}`
                                                                    : mod.content ? mod.content.replace(/<[^>]*>?/gm, '').substring(0, 80) + '...' : '(Konten Visual)'
                                                                }
                                                            </div>
                                                        </div>

                                                        {/* Actions (Edit/Delete - Placeholder) */}
                                                        <div className="flex gap-2">
                                                            <button className="p-2 text-slate-400 hover:text-blue-600 transition" title="Edit (Coming Soon)">
                                                                <FaPencilAlt />
                                                            </button>
                                                            <button className="p-2 text-slate-400 hover:text-red-600 transition" title="Hapus (Coming Soon)">
                                                                <FaTrash />
                                                            </button>
                                                        </div>
                                                    </li>
                                                )}
                                            </Draggable>
                                        );
                                    })}
                                    {provided.placeholder}
                                </ul>
                            )}
                        </Droppable>
                    </DragDropContext>

                    {modules.length === 0 && (
                        <div className="p-10 text-center text-slate-400">
                            Belum ada materi di level ini.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

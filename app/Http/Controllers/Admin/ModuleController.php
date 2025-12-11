<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Lesson;
use App\Models\Module;
use Inertia\Inertia;

class ModuleController extends Controller
{
    // 1. FUNGSI MENAMPILKAN HALAMAN FORM
    public function create($lessonId)
    {
        $lesson = Lesson::findOrFail($lessonId);

        // Cari urutan order terakhir, lalu tambah 1 (biar otomatis urut)
        $nextOrder = Module::where('lesson_id', $lessonId)->max('order') + 1;

        return Inertia::render('Admin/Content/CreateModule', [
            'lesson' => $lesson,
            'nextOrder' => $nextOrder
        ]);
    }

    // 2. FUNGSI MENYIMPAN DATA KE DATABASE
    public function store(Request $request, $lessonId)
    {
        // Validasi input agar tidak error
        $request->validate([
            'type' => 'required|in:text,quiz,simulator_vlsm,code_editor',
            'content' => 'nullable|string', // Untuk materi teks (HTML)
            'data' => 'nullable|array',      // Untuk konfigurasi kuis/simulator (JSON)
            'order' => 'required|integer'
        ]);

        // Simpan ke tabel modules
        Module::create([
            'lesson_id' => $lessonId,
            'type' => $request->type,
            'content' => $request->content,
            'data' => $request->data,
            'order' => $request->order
        ]);

        // Kembali ke dashboard dengan pesan sukses
        return redirect()->route('admin.dashboard')->with('message', 'Materi berhasil ditambahkan!');
    }

    public function index($lessonId)
    {
        $lesson = Lesson::with(['modules' => function($q) {
            $q->orderBy('order', 'asc'); // Ambil urut dari 1, 2, 3...
        }])->findOrFail($lessonId);

        return Inertia::render('Admin/Content/ManageModules', [
            'lesson' => $lesson
        ]);
    }

    // 2. PROSES PENYIMPANAN URUTAN BARU (AJAX)
    public function reorder(Request $request, $lessonId)
    {
        $request->validate([
            'modules' => 'required|array'
        ]);

        // Loop array yang dikirim dari frontend
        // Array index 0 = order 1, index 1 = order 2, dst...
        foreach ($request->modules as $index => $moduleData) {
            Module::where('id', $moduleData['id'])->update([
                'order' => $index + 1
            ]);
        }

        return back()->with('message', 'Urutan berhasil diperbarui!');
    }
}

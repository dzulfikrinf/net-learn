<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Course;
use App\Models\Week;
use App\Models\Lesson;
use Inertia\Inertia;

class CourseController extends Controller
{
    // 1. HALAMAN MANAJEMEN KONTEN
    public function index()
    {
        $courses = Course::with(['weeks.lessons.modules'])->get();
        return Inertia::render('Admin/Content/Index', [
            'courses' => $courses
        ]);
    }

    // 2. SIMPAN COURSE BARU (Fungsi ini yang tadi hilang/undefined)
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|string',
            'color_theme' => 'required|string',
        ]);

        // Auto Generate Slug
        $slug = \Illuminate\Support\Str::slug($request->title);

        // Pilih Icon Otomatis
        $iconMap = [
            'network' => 'FaNetworkWired',
            'programming' => 'FaCode',
            'design' => 'FaPenNib',
            'multimedia' => 'FaVideo',
            'hardware' => 'FaMicrochip',
            'softskill' => 'FaUserTie',
        ];

        $icon = $iconMap[$request->category] ?? 'FaBook';

        Course::create([
            'title' => $request->title,
            'slug' => $slug,
            'description' => $request->description,
            'category' => $request->category,
            'color_theme' => $request->color_theme,
            'icon' => $icon
        ]);

        return back()->with('message', 'Mata Pelajaran berhasil dibuat!');
    }

    // 3. SIMPAN WEEK BARU
    public function storeWeek(Request $request, $courseId)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $lastWeek = Week::where('course_id', $courseId)->max('week_number') ?? 0;

        Week::create([
            'course_id' => $courseId,
            'title' => $request->title,
            'description' => $request->description,
            'week_number' => $lastWeek + 1,
            'is_active' => true
        ]);

        return back()->with('message', 'Minggu berhasil ditambahkan!');
    }

    // 4. SIMPAN LESSON BARU
    public function storeLesson(Request $request, $weekId)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string', // Slug unik bisa dihandle lebih lanjut jika perlu
            'xp_reward' => 'required|integer|min:0',
        ]);

        $lastOrder = Lesson::where('week_id', $weekId)->max('order') ?? 0;

        Lesson::create([
            'week_id' => $weekId,
            'title' => $request->title,
            'slug' => $request->slug,
            'order' => $lastOrder + 1,
            'xp_reward' => $request->xp_reward
        ]);

        return back()->with('message', 'Level pelajaran berhasil ditambahkan!');
    }
}

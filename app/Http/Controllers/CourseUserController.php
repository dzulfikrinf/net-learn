<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Course;
use App\Models\UserProgress;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class CourseUserController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Ambil semua course beserta jumlah lesson-nya
        $courses = Course::withCount('lessons')->get()->map(function ($course) use ($user) {

            // Hitung berapa lesson yang sudah completed di course ini
            $completedCount = UserProgress::where('user_id', $user->id)
                ->where('status', 'completed')
                ->whereHas('lesson.week', function ($query) use ($course) {
                    $query->where('course_id', $course->id);
                })
                ->count();

            // Hitung Persentase
            $percent = $course->lessons_count > 0
                ? round(($completedCount / $course->lessons_count) * 100)
                : 0;

            return [
                'id' => $course->id,
                'title' => $course->title,
                'slug' => $course->slug,
                'description' => $course->description,
                'icon' => $course->icon,
                'theme' => $course->color_theme,
                'progress' => $percent,
                'total_lessons' => $course->lessons_count,
                'completed_lessons' => $completedCount
            ];
        });

        return Inertia::render('CourseSelection', [
            'courses' => $courses,
            'user' => $user
        ]);
    }


}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index()
    {
        // Ambil semua user yang role-nya 'student'
        // Beserta data progress mereka (relasi user_progress)
        $students = User::where('role', 'student')
            ->with('progress') // Pastikan relasi 'progress' ada di Model User
            ->orderBy('name', 'asc')
            ->get()
            ->map(function ($student) {
                // Hitung statistik sederhana
                $completedLessons = $student->progress->where('status', 'completed')->count();
                $totalScore = $student->xp; // Atau hitung dari score progress

                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'xp' => $student->xp,
                    'completed_lessons' => $completedLessons,
                    'last_login' => $student->updated_at->diffForHumans(), // Contoh saja
                ];
            });

        return Inertia::render('Admin/Dashboard', [
            'students' => $students
        ]);
    }

    public function resetPassword($id)
    {
        $student = User::findOrFail($id);

        // Reset password ke default
        $student->password = Hash::make('netlearn123'); // Password default
        $student->save();

        return back()->with('message', 'Password siswa berhasil direset menjadi: netlearn123');
    }

    public function show($id)
    {
        $student = User::where('role', 'student')
            ->with(['progress.lesson']) // Ambil data progress beserta detail lesson-nya
            ->findOrFail($id);

        // Format data agar enak dibaca di React
        $progressDetails = $student->progress->map(function ($prog) {

            // Hitung Durasi (Selesai - Mulai)
            $duration = '-';
            if ($prog->completed_at && $prog->created_at) {
                // Menggunakan Carbon untuk selisih waktu
                $start = \Carbon\Carbon::parse($prog->created_at);
                $end = \Carbon\Carbon::parse($prog->completed_at);

                // Format durasi manusiawi (contoh: 15 menit)
                $duration = $end->diffForHumans($start, [
                    'syntax' => \Carbon\CarbonInterface::DIFF_ABSOLUTE,
                    'parts' => 2, // Tampilkan 2 unit saja (misal: 1 jam 5 menit)
                ]);
            }

            return [
                'id' => $prog->id,
                'lesson_title' => $prog->lesson->title,
                'status' => $prog->status,
                'score' => $prog->score,
                'attempts' => $prog->attempts,
                // Format Tanggal: Hari, Tgl Bulan Tahun, Jam:Menit
                'completed_at_formatted' => $prog->completed_at
                    ? \Carbon\Carbon::parse($prog->completed_at)->translatedFormat('l, d M Y, H:i')
                    : '-',
                'duration' => $duration,
            ];
        });

        return Inertia::render('Admin/StudentDetail', [
            'student' => $student,
            'history' => $progressDetails
        ]);
    }
}

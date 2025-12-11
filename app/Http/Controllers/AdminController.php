<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\UserProgress;
use App\Models\Lesson;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index()
    {
        // 1. DATA TABEL SISWA (Sama seperti sebelumnya)
        $students = User::where('role', 'student')
            ->with('progress')
            ->orderBy('name', 'asc')
            ->get()
            ->map(function ($student) {
                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'xp' => $student->xp,
                    'completed_lessons' => $student->progress->where('status', 'completed')->count(),
                ];
            });

        // --- DATA UNTUK GRAFIK ---

        // 2. GRAFIK 1: Tingkat Penyelesaian per Materi
        // Menghitung berapa siswa yang sudah 'completed' di setiap lesson
        $lessons = Lesson::orderBy('week_id')->orderBy('order')->get();
        $completionData = $lessons->map(function($lesson) {
            return [
                'title' => $lesson->title, // Label X
                'count' => UserProgress::where('lesson_id', $lesson->id)
                            ->where('status', 'completed')
                            ->count() // Nilai Y
            ];
        });

        // 3. GRAFIK 2: Tren Belajar 7 Hari Terakhir
        // Menghitung jumlah aktivitas 'completed' per hari
        $activityData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->format('Y-m-d');
            $count = UserProgress::whereDate('updated_at', $date)
                        ->where('status', 'completed')
                        ->count();
            $activityData[] = [
                'date' => Carbon::now()->subDays($i)->format('d M'), // Label X (Tgl)
                'count' => $count // Nilai Y
            ];
        }

        // 4. GRAFIK 3: Tingkat Kesulitan (Rata-rata Percobaan)
        $difficultyData = $lessons->map(function($lesson) {
            $avgAttempts = UserProgress::where('lesson_id', $lesson->id)->avg('attempts');
            return [
                'title' => $lesson->title,
                'avg' => round($avgAttempts ?? 0, 1) // Bulatkan 1 desimal
            ];
        });

        return Inertia::render('Admin/Dashboard', [
            'students' => $students,
            'charts' => [
                'completion' => $completionData,
                'activity' => $activityData,
                'difficulty' => $difficultyData
            ]
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

    // --- FUNGSI PRIVAT UNTUK PANGGIL AI (Helper) ---
    private function generateAndSaveAIReport($student)
    {
        try {
            // 1. SIAPKAN DATA LENGKAP (Termasuk Durasi)
            $reportCard = $student->progress->map(function($p) {
                $durationInfo = "Belum selesai";

                if ($p->completed_at && $p->created_at) {
                    $start = \Carbon\Carbon::parse($p->created_at);
                    $end = \Carbon\Carbon::parse($p->completed_at);

                    // Hitung selisih menit
                    $minutes = $start->diffInMinutes($end);

                    // Logika tampilan durasi
                    if ($minutes < 1) {
                        $durationInfo = "< 1 menit (Sangat Cepat)";
                    } else {
                        $durationInfo = "{$minutes} menit";
                    }
                }

                // Format string untuk dibaca AI
                return "- Materi '{$p->lesson->title}': Skor {$p->score}, Percobaan {$p->attempts}x, Waktu Pengerjaan: {$durationInfo}";
            })->implode("\n");

            if (empty($reportCard)) $reportCard = "Belum ada data pembelajaran.";

            // 2. UPDATE PROMPT AGAR AI MENGANALISIS WAKTU
            $prompt = "
            Bertindaklah sebagai Asisten Guru Jaringan Komputer.
            Analisis data siswa berikut secara mendalam:
            Nama: {$student->name}
            Total XP: {$student->xp}

            Riwayat Detail:
            {$reportCard}

            Tugasmu:
            1. Analisis performa berdasarkan Skor dan JUGA Waktu Pengerjaan.
            2. Jika ada materi yang dikerjakan sangat cepat (< 1 menit) tapi nilai bagus, beri peringatan halus (dugaan menebak/asal klik).
            3. Jika waktu pengerjaan lama tapi nilai bagus, puji ketekunannya.
            4. Berikan rekomendasi belajar spesifik selanjutnya.

            Output:
            Buatlah poin kelemahan siswa dan rekomendasi perbaikan dalam format teks yang mudah dipahami untuk diberikan kepada guru (max 100 kata).";

            $apiKey = env('GEMINI_API_KEY');

            // 3. REQUEST KE GEMINI (Sama seperti sebelumnya)
            $response = \Illuminate\Support\Facades\Http::withOptions(['verify' => false])
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
                    'contents' => [['parts' => [['text' => $prompt]]]],
                    'safetySettings' => [
                        ['category' => 'HARM_CATEGORY_HARASSMENT', 'threshold' => 'BLOCK_NONE'],
                        ['category' => 'HARM_CATEGORY_HATE_SPEECH', 'threshold' => 'BLOCK_NONE'],
                        ['category' => 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'threshold' => 'BLOCK_NONE'],
                        ['category' => 'HARM_CATEGORY_DANGEROUS_CONTENT', 'threshold' => 'BLOCK_NONE'],
                    ]
                ]);

            $json = $response->json();

            // 4. AMBIL JAWABAN
            if (isset($json['candidates'][0]['content']['parts'][0]['text'])) {
                $aiText = $json['candidates'][0]['content']['parts'][0]['text'];
            } else {
                $aiText = "Gagal analisis. Coba refresh beberapa saat lagi.";
            }

            // 5. SIMPAN
            $student->ai_report = $aiText;
            $student->save();

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("AI Error: " . $e->getMessage());
        }
    }

    // --- FITUR REFRESH MANUAL (Opsional, jika guru ingin update data terbaru) ---
    public function forceRegenerateReport($id)
    {
        $student = User::findOrFail($id);
        $student->ai_report = null; // Kosongkan dulu
        $student->save();

        return back()->with('message', 'Sedang menyusun laporan baru...'); // Halaman akan reload dan mentrigger generate otomatis
    }

    public function show($id)
    {
        $student = User::where('role', 'student')
            ->with(['progress.lesson'])
            ->findOrFail($id);

        // --- 1. DATA TABEL RIWAYAT ---
        $progressDetails = $student->progress->map(function ($prog) {
            $duration = '-';
            if ($prog->completed_at && $prog->created_at) {
                $start = \Carbon\Carbon::parse($prog->created_at);
                $end = \Carbon\Carbon::parse($prog->completed_at);
                $duration = $end->diffForHumans($start, ['syntax' => \Carbon\CarbonInterface::DIFF_ABSOLUTE, 'parts' => 2]);
            }
            return [
                'id' => $prog->id,
                'lesson_title' => $prog->lesson->title ?? 'Materi Dihapus',
                'status' => $prog->status,
                'score' => $prog->score,
                'attempts' => $prog->attempts,
                'completed_at_formatted' => $prog->completed_at ? \Carbon\Carbon::parse($prog->completed_at)->translatedFormat('l, d M Y, H:i') : '-',
                'duration' => $duration,
            ];
        });

        // --- 2. LOGIKA SKILL & RATA-RATA (DIPERBAIKI) ---

        // Tampung nilai mentah per kategori
        $rawScores = [
            'Konsep Dasar' => [],
            'Hitungan Subnet' => [],
            'Praktik Lab' => []
        ];

        foreach ($student->progress as $p) {
            // Hanya hitung yang sudah selesai dan punya nilai
            if ($p->status !== 'completed' || is_null($p->score)) continue;

            $title = strtolower($p->lesson->title ?? '');
            $score = $p->score;

            if (str_contains($title, 'simulator') || str_contains($title, 'lab') || str_contains($title, 'topologi')) {
                $rawScores['Praktik Lab'][] = $score;
            } elseif (str_contains($title, 'hitung') || str_contains($title, 'flsm') || str_contains($title, 'vlsm')) {
                $rawScores['Hitungan Subnet'][] = $score;
            } else {
                $rawScores['Konsep Dasar'][] = $score;
            }
        }

        // Hitung Rata-rata per Kategori
        $skillsAvg = [];
        foreach($rawScores as $cat => $scores) {
            // Jika ada nilai, hitung rata-rata. Jika tidak, 0.
            $skillsAvg[$cat] = count($scores) > 0 ? round(array_sum($scores) / count($scores)) : 0;
        }

        // --- 3. ANALISIS REKOMENDASI ---

        // Cari skill terlemah (nilai terkecil)
        asort($skillsAvg);
        $weakestSkill = array_key_first($skillsAvg);
        $weakestScore = $skillsAvg[$weakestSkill];

        // Hitung Rata-rata TOTAL SEMUA (Untuk Badge "Skor Rata-rata")
        $totalAverage = $student->progress->where('status', 'completed')->avg('score');
        $totalAverage = round($totalAverage ?? 0);

        $recommendation = [
            'topic' => $weakestSkill,
            'score' => $totalAverage, // <--- INI YANG KITA PERBAIKI (Pakai Rata-rata Total)
            'message' => '',
            'action' => ''
        ];

        // Logika Pesan
        if ($totalAverage > 85) {
            $recommendation['topic'] = 'Mastery';
            $recommendation['message'] = "Siswa ini memiliki performa sangat baik di seluruh topik.";
            $recommendation['action'] = "Siap untuk materi pengayaan atau menjadi mentor sebaya.";
        } else {
            switch ($weakestSkill) {
                case 'Konsep Dasar':
                    $recommendation['message'] = "Nilai rata-rata Konsep Dasar ({$weakestScore}) paling rendah dibanding lainnya.";
                    $recommendation['action'] = "Ulangi materi Minggu 1 (IP & Biner).";
                    break;
                case 'Hitungan Subnet':
                    $recommendation['message'] = "Terdeteksi kesulitan di logika hitungan ({$weakestScore}).";
                    $recommendation['action'] = "Latihan intensif rumus FLSM.";
                    break;
                case 'Praktik Lab':
                    $recommendation['message'] = "Nilai praktik simulasi ({$weakestScore}) perlu ditingkatkan.";
                    $recommendation['action'] = "Dampingi penggunaan Simulator VLSM.";
                    break;
            }
        }

        // --- 4. DATA GRAFIK ---
        $radarData = [
            'categories' => array_keys($skillsAvg),
            'series' => array_values($skillsAvg)
        ];

        $labels = $student->progress->pluck('lesson.title')->toArray();
        $performanceData = [
            'labels' => empty($labels) ? ['No Data'] : $labels,
            'scores' => empty($labels) ? [0] : $student->progress->pluck('score')->toArray(),
            'attempts' => empty($labels) ? [0] : $student->progress->pluck('attempts')->toArray()
        ];

        $completedProgress = $student->progress->whereNotNull('completed_at');
        $durationData = [
            'labels' => $completedProgress->pluck('lesson.title')->toArray(),
            'minutes' => $completedProgress->map(function($p) {
                $start = \Carbon\Carbon::parse($p->created_at);
                $end = \Carbon\Carbon::parse($p->completed_at);
                return round($start->diffInSeconds($end) / 60, 1);
            })->toArray()
        ];

        $heatmapData = [];
        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        foreach ($days as $day) {
            $dataPerHour = [];
            for ($hour = 0; $hour < 24; $hour++) {
                $count = $student->progress->filter(function ($p) use ($day, $hour) {
                    if (!$p->completed_at) return false;
                    $dt = \Carbon\Carbon::parse($p->completed_at);
                    return $dt->format('l') === $day && $dt->hour === $hour;
                })->count();
                $dataPerHour[] = ['x' => sprintf('%02d:00', $hour), 'y' => $count];
            }
            $heatmapData[] = ['name' => $day, 'data' => $dataPerHour];
        }

        // --- 5. CEK AUTO-GENERATE AI ---
        if (empty($student->ai_report)) {
            $this->generateAndSaveAIReport($student);
            $student->refresh();
        }

        return Inertia::render('Admin/StudentDetail', [
            'student' => $student,
            'history' => $progressDetails,
            'charts' => [
                'radar' => $radarData,
                'performance' => $performanceData,
                'heatmap' => $heatmapData,
                'duration' => $durationData,
            ],
            'analysis' => $recommendation
        ]);
    }
}

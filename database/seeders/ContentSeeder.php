<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Week;
use App\Models\Lesson;
use App\Models\Module;
use Illuminate\Support\Facades\Hash;

class ContentSeeder extends Seeder
{
    public function run(): void
    {
        // 1. BUAT USER UNTUK TEST LOGIN
        // Nanti Anda login pakai email & password ini
        User::create([
            'name' => 'Mahasiswa Test',
            'email' => 'admin@netlearn.com',
            'password' => Hash::make('password'),
            'role' => 'student',
            'xp' => 0
        ]);

        // 2. BUAT MINGGU 1 (FONDASI)
        $week1 = Week::create([
            'title' => 'Minggu 1: Fondasi Jaringan',
            'description' => 'Memahami konsep dasar IP Address dan Biner.',
            'week_number' => 1,
            'is_active' => true, // Minggu 1 langsung aktif
        ]);

            // Level 1.1: Pengenalan IP
            $lesson1 = Lesson::create([
                'week_id' => $week1->id,
                'title' => 'Apa itu IP Address?',
                'slug' => 'pengenalan-ip',
                'order' => 1,
                'xp_reward' => 100
            ]);

                // Isi (Modul) Level 1.1
                Module::create([
                    'lesson_id' => $lesson1->id,
                    'type' => 'text',
                    'content' => 'IP Address ibarat alamat rumah dalam dunia internet...',
                    'order' => 1
                ]);

                Module::create([
                    'lesson_id' => $lesson1->id,
                    'type' => 'quiz',
                    'content' => 'Kuis Singkat',
                    'data' => json_encode([
                        'question' => 'Berapa bit panjang IPv4?',
                        'options' => ['32 bit', '128 bit', '64 bit'],
                        'answer' => '32 bit'
                    ]),
                    'order' => 2
                ]);

            // Level 1.2: Konversi Biner
            Lesson::create([
                'week_id' => $week1->id,
                'title' => 'Matematika Biner',
                'slug' => 'biner-dasar',
                'order' => 2,
                'xp_reward' => 150
            ]);

        // 3. BUAT MINGGU 2 (FLSM)
        $week2 = Week::create([
            'title' => 'Minggu 2: Pembagian Subnet (FLSM)',
            'description' => 'Membagi jaringan dengan metode Fixed Length.',
            'week_number' => 2,
            'is_active' => false, // Masih terkunci
        ]);

            Lesson::create([
                'week_id' => $week2->id,
                'title' => 'Konsep CIDR (/24, /16)',
                'slug' => 'konsep-cidr',
                'order' => 1,
                'xp_reward' => 200
            ]);

        // 4. BUAT MINGGU 3 (VLSM - FINAL BOSS)
        $week3 = Week::create([
            'title' => 'Minggu 3: Efisiensi VLSM',
            'description' => 'Studi kasus tingkat lanjut.',
            'week_number' => 3,
            'is_active' => false, // Masih terkunci
        ]);

            // Level VLSM Simulator (Tempat kode React Flow Anda nanti)
            $lessonVlsm = Lesson::create([
                'week_id' => $week3->id,
                'title' => 'Simulator VLSM',
                'slug' => 'simulator-vlsm',
                'order' => 5, // Level terakhir
                'xp_reward' => 500
            ]);

            Module::create([
                'lesson_id' => $lessonVlsm->id,
                'type' => 'simulator_vlsm', // Tipe khusus
                'content' => 'Gunakan alat di samping untuk memecahkan masalah.',
                'order' => 1
            ]);
    }
}

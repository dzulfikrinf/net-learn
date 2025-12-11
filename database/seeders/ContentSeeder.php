<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Week;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\UserProgress;
use App\Models\Course;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class ContentSeeder extends Seeder
{
    public function run(): void
    {
        // --- 1. BERSIHKAN DATABASE DULU (Agar tidak numpuk) ---
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        UserProgress::truncate();
        Module::truncate();
        Lesson::truncate();
        Week::truncate();
        Course::truncate(); // Jangan lupa truncate courses juga
        User::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // --- 2. BUAT USER ---
        User::create([
            'name' => 'Pak Guru',
            'email' => 'guru@netlearn.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'xp' => 9999
        ]);

        User::create([
            'name' => 'Siswa Test',
            'email' => 'admin@netlearn.com',
            'password' => Hash::make('password'),
            'role' => 'student',
            'xp' => 0
        ]);

        // --- 3. BUAT COURSES ---
        $courseJarkom = Course::create([
            'title' => 'Jaringan Komputer & Subnetting',
            'slug' => 'jarkom',
            'description' => 'Pelajari IP Address, Subnetting, dan Routing dasar.',
            'icon' => 'FaNetworkWired',
            'color_theme' => 'blue'
        ]);

        $courseCoding = Course::create([
            'title' => 'Pemrograman Dasar (Python)',
            'slug' => 'algo',
            'description' => 'Dasar logika coding menggunakan Python.',
            'icon' => 'FaCode',
            'color_theme' => 'purple'
        ]);


        // ==========================================
        // COURSE 1: JARINGAN KOMPUTER
        // ==========================================

        // --- MINGGU 1: FONDASI ---
        $week1 = Week::create([
            'course_id' => $courseJarkom->id,
            'title' => 'Minggu 1: Fondasi & Biner',
            'description' => 'Memahami bahasa mesin dan konsep dasar pengalamatan.',
            'week_number' => 1,
            'is_active' => true,
        ]);

            // Level 1.1
            $l1 = Lesson::create(['week_id' => $week1->id, 'title' => 'Anatomi IPv4', 'slug' => 'anatomi-ipv4', 'order' => 1, 'xp_reward' => 100]);
            Module::create(['lesson_id' => $l1->id, 'type' => 'text', 'order' => 1, 'content' => '<h3>Ibarat Alamat Rumah 🏠</h3><p>Bayangkan paket data seperti surat. Agar sampai, surat butuh alamat unik. Di komputer, alamat ini disebut <strong>IP Address</strong>.</p>']);
            Module::create(['lesson_id' => $l1->id, 'type' => 'text', 'order' => 2, 'content' => '<h3>Struktur 32 Bit 🧬</h3><p>IPv4 terdiri dari 4 blok angka (oktet) yang dipisahkan titik. Contoh: <code>192.168.10.1</code>. Total panjangnya adalah 32 bit.</p>']);
            Module::create(['lesson_id' => $l1->id, 'type' => 'quiz', 'order' => 3, 'data' => json_encode(['question' => 'Berapa total panjang bit pada alamat IPv4?', 'options' => ['16 bit', '32 bit', '64 bit', '128 bit'], 'answer' => '32 bit'])]);

            // Level 1.2
            $l2 = Lesson::create(['week_id' => $week1->id, 'title' => 'Matematika Biner', 'slug' => 'matematika-biner', 'order' => 2, 'xp_reward' => 150]);
            Module::create(['lesson_id' => $l2->id, 'type' => 'text', 'order' => 1, 'content' => '<h3>Bahasa Mesin 0 dan 1 🤖</h3><p>Komputer tidak paham angka 9 atau huruf A. Mereka hanya paham arus listrik: <strong>Mati (0)</strong> dan <strong>Hidup (1)</strong>.</p>']);
            Module::create(['lesson_id' => $l2->id, 'type' => 'text', 'order' => 2, 'content' => '<h3>Tabel Sakti Konversi 📊</h3><p>Hafalkan urutan nilai bit ini: <strong>128, 64, 32, 16, 8, 4, 2, 1</strong>. Jika bit bernilai 1, jumlahkan angkanya.</p>']);
            Module::create(['lesson_id' => $l2->id, 'type' => 'quiz', 'order' => 3, 'data' => json_encode(['question' => 'Konversi biner 10000000 ke desimal adalah...', 'options' => ['1', '128', '255', '192'], 'answer' => '128'])]);

            // Level 1.3
            $l3 = Lesson::create(['week_id' => $week1->id, 'title' => 'Kelas IP Address', 'slug' => 'kelas-ip', 'order' => 3, 'xp_reward' => 150]);
            Module::create(['lesson_id' => $l3->id, 'type' => 'text', 'order' => 1, 'content' => '<h3>Kelas A, B, dan C 🏫</h3><p>IP dibagi menjadi kelas berdasarkan oktet pertamanya. <strong>Kelas C</strong> (192-223) paling sering dipakai untuk LAN kecil.</p>']);
            Module::create(['lesson_id' => $l3->id, 'type' => 'quiz', 'order' => 2, 'data' => json_encode(['question' => 'IP 192.168.100.1 termasuk kelas apa?', 'options' => ['Kelas A', 'Kelas B', 'Kelas C', 'Kelas D'], 'answer' => 'Kelas C'])]);


        // --- MINGGU 2: FLSM ---
        $week2 = Week::create([
            'course_id' => $courseJarkom->id,
            'title' => 'Minggu 2: Subnetting Dasar',
            'description' => 'Mempelajari notasi CIDR dan pembagian FLSM.',
            'week_number' => 2,
            'is_active' => true,
        ]);

            // Level 2.1
            $l4 = Lesson::create(['week_id' => $week2->id, 'title' => 'Rahasia Garis Miring', 'slug' => 'konsep-cidr', 'order' => 1, 'xp_reward' => 200]);
            Module::create(['lesson_id' => $l4->id, 'type' => 'text', 'order' => 1, 'content' => '<h3>Apa itu CIDR? 🤔</h3><p>CIDR (Classless Inter-Domain Routing) adalah cara menulis subnet mask dengan ringkas. Contoh: <code>/24</code>.</p>']);
            Module::create(['lesson_id' => $l4->id, 'type' => 'text', 'order' => 2, 'content' => '<h3>Tabel Prefix Umum</h3><ul class="list-disc ml-5"><li>/8 = 255.0.0.0</li><li>/16 = 255.255.0.0</li><li>/24 = 255.255.255.0</li></ul>']);
            Module::create(['lesson_id' => $l4->id, 'type' => 'quiz', 'order' => 3, 'data' => json_encode(['question' => 'Subnet mask untuk /24 adalah...', 'options' => ['255.0.0.0', '255.255.0.0', '255.255.255.0', '255.255.255.255'], 'answer' => '255.255.255.0'])]);

            // Level 2.2
            $l5 = Lesson::create(['week_id' => $week2->id, 'title' => 'Logika FLSM', 'slug' => 'logika-flsm', 'order' => 2, 'xp_reward' => 200]);
            Module::create(['lesson_id' => $l5->id, 'type' => 'text', 'order' => 1, 'content' => '<h3>Membagi Kue Sama Rata 🍰</h3><p><strong>FLSM (Fixed Length Subnet Mask)</strong> artinya semua subnet memiliki ukuran yang SAMA. Tidak boleh ada yang besar kecil.</p>']);
            Module::create(['lesson_id' => $l5->id, 'type' => 'text', 'order' => 2, 'content' => '<h3>Rumus Penting 🧮</h3><p>Jumlah Subnet = 2^n (n = bit yang dipinjam).<br>Jumlah Host = 2^h - 2 (h = sisa bit host).</p>']);

            // --- Level 2.3: PRAKTIK MANUAL FLSM ---
            $l6 = Lesson::create(['week_id' => $week2->id, 'title' => 'Praktik Manual FLSM', 'slug' => 'praktek-flsm', 'order' => 3, 'xp_reward' => 300]);
            Module::create([
                'lesson_id' => $l6->id,
                'type' => 'simulator_flsm', // Tipe FLSM
                'order' => 1,
                'content' => '<p>Gunakan simulator untuk membagi jaringan secara manual. Tekan "Langkah Berikutnya" untuk melihat prosesnya.</p>',
                'data' => json_encode(['mode' => 'manual']) // MODE MANUAL
            ]);

            // --- Level 2.4: DEMO OTOMATIS FLSM ---
            $l6_auto = Lesson::create(['week_id' => $week2->id, 'title' => 'Demo Otomatis FLSM', 'slug' => 'demo-flsm', 'order' => 4, 'xp_reward' => 100]);
            Module::create([
                'lesson_id' => $l6_auto->id,
                'type' => 'simulator_flsm', // Tipe FLSM
                'order' => 1,
                'content' => '<p>Perhatikan bagaimana sistem membagi blok IP secara otomatis.</p>',
                'data' => json_encode(['mode' => 'auto']) // MODE AUTO
            ]);


        // --- MINGGU 3: VLSM ---
        $week3 = Week::create([
            'course_id' => $courseJarkom->id,
            'title' => 'Minggu 3: Efisiensi VLSM',
            'description' => 'Teknik tingkat lanjut untuk efisiensi IP.',
            'week_number' => 3,
            'is_active' => true,
        ]);

            // Level 3.1
            $l7 = Lesson::create(['week_id' => $week3->id, 'title' => 'Kenapa FLSM Boros?', 'slug' => 'masalah-flsm', 'order' => 1, 'xp_reward' => 200]);
            Module::create(['lesson_id' => $l7->id, 'type' => 'text', 'order' => 1, 'content' => '<h3>IP Wasting 🗑️</h3><p>Bayangkan FLSM itu memotong kue ukuran 100 potong untuk semua orang. Padahal ada orang yang cuma butuh 2 potong (Link WAN). Sisanya 98 terbuang!</p>']);
            Module::create(['lesson_id' => $l7->id, 'type' => 'quiz', 'order' => 2, 'data' => json_encode(['question' => 'Apa kelemahan utama FLSM?', 'options' => ['Terlalu sulit', 'Banyak IP terbuang (Wasting)', 'Tidak didukung router', 'Hanya untuk IPv6'], 'answer' => 'Banyak IP terbuang (Wasting)'])]);

            // Level 3.2
            $l8 = Lesson::create(['week_id' => $week3->id, 'title' => 'Logika VLSM', 'slug' => 'logika-vlsm', 'order' => 2, 'xp_reward' => 250]);
            Module::create(['lesson_id' => $l8->id, 'type' => 'text', 'order' => 1, 'content' => '<h3>Solusi: Potongan Beda Ukuran 🧩</h3><p>VLSM (Variable Length) membolehkan kita memotong subnet dengan ukuran berbeda-beda sesuai kebutuhan.</p>']);
            Module::create(['lesson_id' => $l8->id, 'type' => 'text', 'order' => 2, 'content' => '<h3>Aturan Emas 🥇</h3><p>Selalu urutkan kebutuhan dari yang <strong>TERBESAR</strong> ke yang <strong>TERKECIL</strong> sebelum mulai menghitung.</p>']);

            $l9 = Lesson::create(['week_id' => $week3->id, 'title' => 'Praktik Manual VLSM', 'slug' => 'praktek-vlsm', 'order' => 3, 'xp_reward' => 300]);
            Module::create([
                'lesson_id' => $l9->id,
                'type' => 'simulator_vlsm',
                'order' => 1,
                'content' => '<p>Gunakan mode manual untuk memahami setiap langkah perhitungan.</p>',
                'data' => json_encode(['mode' => 'manual']) // <--- CONFIG MANUAL
            ]);

            // LESSON 3.4: DEMONSTRASI OTOMATIS (AUTO)
            $l10 = Lesson::create(['week_id' => $week3->id, 'title' => 'Demonstrasi VLSM Otomatis', 'slug' => 'demo-vlsm', 'order' => 4, 'xp_reward' => 200]);
            Module::create([
                'lesson_id' => $l10->id,
                'type' => 'simulator_vlsm',
                'order' => 1,
                'content' => '<p>Perhatikan bagaimana sistem membagi blok secara otomatis.</p>',
                'data' => json_encode(['mode' => 'auto']) // <--- CONFIG AUTO
            ]);


        // ==========================================
        // COURSE 2: PEMROGRAMAN DASAR (PYTHON)
        // ==========================================

        // --- MINGGU 1: PENGENALAN ---
        $week1Coding = Week::create([
            'course_id' => $courseCoding->id, // <--- Tempel ke Coding
            'title' => 'Minggu 1: Pengenalan Variabel',
            'week_number' => 1,
            'is_active' => true
        ]);

            // Level 1 Coding
            $lessonVar = Lesson::create(['week_id' => $week1Coding->id, 'title' => 'Apa itu Variabel?', 'slug' => 'intro-variabel', 'order' => 1, 'xp_reward' => 100]);

            Module::create(['lesson_id' => $lessonVar->id, 'type' => 'text', 'order' => 1, 'content' => '<h3>Variabel = Kotak Penyimpanan 📦</h3><p>Dalam coding, variabel adalah tempat menyimpan data. Bayangkan kotak sepatu yang ditempeli label nama.</p>']);

            // Contoh Modul Praktek Coding (Nanti)
            Module::create([
                'lesson_id' => $lessonVar->id,
                'type' => 'code_editor',
                'order' => 2,
                'content' => 'Buatlah variabel bernama "nama" dan isi dengan nama kamu.',
                'data' => json_encode([
                    'language' => 'python',
                    'starter_code' => '# Tulis kodemu di bawah sini\n',
                    'test_case' => 'nama ='
                ])
            ]);
    }
}

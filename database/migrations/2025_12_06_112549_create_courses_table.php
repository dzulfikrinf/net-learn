<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // Contoh: "Jaringan Komputer"
            $table->string('slug')->unique(); // Contoh: "jarkom"
            $table->string('description')->nullable();
            $table->string('category')->default('General');
            $table->string('icon')->default('FaNetworkWired'); // Nama icon untuk frontend
            $table->string('color_theme')->default('blue'); // Tema warna (blue, green, purple)
            $table->timestamps();
        });

        // Kita juga perlu update tabel WEEKS agar punya 'course_id'
        Schema::table('weeks', function (Blueprint $table) {
            $table->foreignId('course_id')->nullable()->after('id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};

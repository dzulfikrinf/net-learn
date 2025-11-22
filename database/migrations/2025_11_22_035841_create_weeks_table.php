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
        Schema::create('weeks', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // Contoh: "Minggu 1: Fondasi"
            $table->text('description')->nullable();
            $table->integer('week_number'); // 1, 2, 3
            $table->boolean('is_active')->default(false); // Fitur untuk Dosen membuka/kunci materi
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('weeks');
    }
};

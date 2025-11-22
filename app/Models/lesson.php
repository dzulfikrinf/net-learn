<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    use HasFactory;

    protected $guarded = [];

    // Relasi: Level milik Satu Minggu
    public function week()
    {
        return $this->belongsTo(Week::class);
    }

    // Relasi: Satu Level punya BANYAK Modul (slide materi)
    public function modules()
    {
        return $this->hasMany(Module::class);
    }
}

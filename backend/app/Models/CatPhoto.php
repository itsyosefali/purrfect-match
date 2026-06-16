<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class CatPhoto extends Model
{
    protected $fillable = ['cat_listing_id', 'path', 'sort_order'];

    public function listing(): BelongsTo
    {
        return $this->belongsTo(CatListing::class, 'cat_listing_id');
    }

    public function getUrlAttribute(): string
    {
        if (str_starts_with($this->path, 'http')) {
            return $this->path;
        }

        return Storage::disk('public')->url($this->path);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    protected $fillable = [
        'user_id',
        'cat_listing_id',
        'rating',
        'body',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function catListing(): BelongsTo
    {
        return $this->belongsTo(CatListing::class);
    }

    public static function recalculateListingRating(CatListing $listing): void
    {
        $stats = static::query()
            ->where('cat_listing_id', $listing->id)
            ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as count')
            ->first();

        $listing->update([
            'rating' => round((float) ($stats->avg_rating ?? 0), 1),
            'review_count' => (int) ($stats->count ?? 0),
        ]);
    }

    public static function recalculateOwnerRating(User $owner): void
    {
        $stats = static::query()
            ->whereHas('catListing', fn ($q) => $q->where('user_id', $owner->id))
            ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as count')
            ->first();

        $owner->update([
            'rating' => round((float) ($stats->avg_rating ?? 0), 1),
            'review_count' => (int) ($stats->count ?? 0),
        ]);
    }
}

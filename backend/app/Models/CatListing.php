<?php

namespace App\Models;

use App\Enums\ListingStatus;
use App\Enums\Gender;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class CatListing extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'slug',
        'name',
        'breed',
        'age_months',
        'gender',
        'location',
        'description',
        'rehome_reason',
        'adoption_fee_cents',
        'status',
        'is_featured',
        'rating',
        'review_count',
    ];

    protected function casts(): array
    {
        return [
            'gender' => Gender::class,
            'status' => ListingStatus::class,
            'is_featured' => 'boolean',
            'rating' => 'decimal:1',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (CatListing $listing): void {
            if (empty($listing->slug)) {
                $listing->slug = static::generateUniqueSlug($listing->name);
            }
        });
    }

    public static function generateUniqueSlug(string $name): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $counter = 1;

        while (static::where('slug', $slug)->exists()) {
            $slug = $base.'-'.$counter++;
        }

        return $slug;
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function photos(): HasMany
    {
        return $this->hasMany(CatPhoto::class)->orderBy('sort_order');
    }

    public function traits(): BelongsToMany
    {
        return $this->belongsToMany(CatTrait::class, 'cat_listing_trait', 'cat_listing_id', 'trait_id');
    }

    public function savedBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'saved_cats')->withTimestamps();
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }

    public function adoptionApplications(): HasMany
    {
        return $this->hasMany(AdoptionApplication::class);
    }

    public function scopeAvailable($query)
    {
        return $query->where('status', ListingStatus::Available);
    }

    public function getAgeLabelAttribute(): string
    {
        $months = $this->age_months;

        if ($months < 12) {
            return $months.' mo';
        }

        $years = intdiv($months, 12);
        $remaining = $months % 12;

        if ($remaining === 0) {
            return $years.' yr'.($years > 1 ? 's' : '');
        }

        return $years.' yr'.($years > 1 ? 's' : '').', '.$remaining.' mo';
    }

    public function getPrimaryPhotoUrlAttribute(): ?string
    {
        $photo = $this->photos->first();

        return $photo ? $photo->url : null;
    }
}

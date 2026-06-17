<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements FilamentUser
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'avatar_url',
        'city',
        'is_admin',
        'identity_verified_at',
        'phone_verified_at',
        'rating',
        'review_count',
        'response_rate',
        'avg_response_minutes',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'identity_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
            'rating' => 'decimal:1',
        ];
    }

    public function canAccessPanel(Panel $panel): bool
    {
        return $this->is_admin;
    }

    public function catListings(): HasMany
    {
        return $this->hasMany(CatListing::class);
    }

    public function savedCats(): BelongsToMany
    {
        return $this->belongsToMany(CatListing::class, 'saved_cats')->withTimestamps();
    }

    public function conversationsAsAdopter(): HasMany
    {
        return $this->hasMany(Conversation::class, 'adopter_id');
    }

    public function conversationsAsOwner(): HasMany
    {
        return $this->hasMany(Conversation::class, 'owner_id');
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
        return $this->hasMany(AdoptionApplication::class, 'adopter_id');
    }

    public function isVerified(): bool
    {
        return $this->identity_verified_at !== null;
    }
}

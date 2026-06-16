<?php

namespace App\Models;

use App\Enums\TraitCategory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class CatTrait extends Model
{
    use HasFactory;

    protected $table = 'traits';

    protected $fillable = ['name', 'slug', 'category'];

    protected function casts(): array
    {
        return [
            'category' => TraitCategory::class,
        ];
    }

    public function listings(): BelongsToMany
    {
        return $this->belongsToMany(CatListing::class, 'cat_listing_trait', 'trait_id', 'cat_listing_id');
    }
}

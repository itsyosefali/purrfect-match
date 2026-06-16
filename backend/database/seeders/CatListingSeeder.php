<?php

namespace Database\Seeders;

use App\Enums\Gender;
use App\Enums\ListingStatus;
use App\Models\CatListing;
use App\Models\CatPhoto;
use App\Models\CatTrait;
use App\Models\User;
use Database\Seeders\Concerns\DownloadsSeedImages;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CatListingSeeder extends Seeder
{
    use DownloadsSeedImages;

    public function run(): void
    {
        $traits = CatTrait::all()->keyBy('name');
        $cats = require __DIR__.'/data/cats.php';

        foreach ($cats as $catData) {
            $owner = User::where('name', $catData['owner'])->first();

            if (! $owner instanceof User) {
                continue;
            }

            $listing = CatListing::create([
                'user_id' => $owner->id,
                'slug' => Str::slug($catData['name']),
                'name' => $catData['name'],
                'breed' => $catData['breed'],
                'age_months' => $catData['age_months'],
                'gender' => Gender::from($catData['gender']),
                'location' => $catData['location'],
                'description' => $catData['description'],
                'rehome_reason' => $catData['reason'],
                'adoption_fee_cents' => $catData['fee'],
                'status' => isset($catData['status'])
                    ? ListingStatus::from($catData['status'])
                    : ListingStatus::Available,
                'rating' => $catData['rating'],
                'review_count' => $catData['reviews'],
                'created_at' => now()->subDays($catData['days_ago']),
                'updated_at' => now()->subDays($catData['days_ago']),
            ]);

            $listing->traits()->sync(
                collect($catData['traits'])
                    ->map(fn (string $name) => $traits[$name]->id ?? null)
                    ->filter()
                    ->all()
            );

            foreach ($catData['photos'] as $index => $sourceUrl) {
                $path = $this->downloadPublicImage(
                    $sourceUrl,
                    'seed/cats/'.$listing->slug,
                    $listing->slug.'-'.($index + 1),
                );

                CatPhoto::create([
                    'cat_listing_id' => $listing->id,
                    'path' => $path ?? $sourceUrl,
                    'sort_order' => $index,
                ]);
            }
        }
    }
}

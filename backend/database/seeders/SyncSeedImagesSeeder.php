<?php

namespace Database\Seeders;

use App\Models\CatListing;
use App\Models\CatPhoto;
use App\Models\User;
use Database\Seeders\Concerns\DownloadsSeedImages;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SyncSeedImagesSeeder extends Seeder
{
    use DownloadsSeedImages;

    public function run(): void
    {
        $this->syncCatPhotos();
        $this->syncUserAvatars();
    }

    private function syncCatPhotos(): void
    {
        $cats = require __DIR__.'/data/cats.php';

        foreach ($cats as $catData) {
            $listing = CatListing::query()
                ->where('slug', Str::slug($catData['name']))
                ->first();

            if (! $listing instanceof CatListing) {
                continue;
            }

            foreach ($catData['photos'] as $index => $sourceUrl) {
                $photo = CatPhoto::query()
                    ->where('cat_listing_id', $listing->id)
                    ->where('sort_order', $index)
                    ->first();

                if (! $photo instanceof CatPhoto) {
                    continue;
                }

                if (str_starts_with($photo->path, 'http')) {
                    continue;
                }

                if (Storage::disk('public')->exists($photo->path)) {
                    continue;
                }

                $path = $this->downloadPublicImage(
                    $sourceUrl,
                    'seed/cats/'.$listing->slug,
                    $listing->slug.'-'.($index + 1),
                );

                $photo->update([
                    'path' => $path ?? $sourceUrl,
                ]);
            }
        }
    }

    private function syncUserAvatars(): void
    {
        $users = [
            'admin@purrfectmatch.test' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&auto=format',
            'priya@purrfectmatch.test' => 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=200&h=200&fit=crop&auto=format',
            'marcus@purrfectmatch.test' => 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&fit=crop&auto=format',
            'sarah@purrfectmatch.test' => 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&auto=format',
            'elena@purrfectmatch.test' => 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=200&h=200&fit=crop&auto=format',
            'tom@purrfectmatch.test' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&auto=format',
            'alex@purrfectmatch.test' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&auto=format',
        ];

        foreach ($users as $email => $sourceUrl) {
            $user = User::query()->where('email', $email)->first();

            if (! $user instanceof User || ! is_string($user->avatar_url)) {
                continue;
            }

            if (str_starts_with($user->avatar_url, 'http')) {
                continue;
            }

            $relativePath = str_starts_with($user->avatar_url, '/storage/')
                ? substr($user->avatar_url, strlen('/storage/'))
                : $user->avatar_url;

            if (Storage::disk('public')->exists($relativePath)) {
                continue;
            }

            $slug = str_replace('.', '-', explode('@', $email)[0]);
            $path = $this->downloadPublicImage($sourceUrl, 'seed/avatars', $slug);

            if ($path) {
                $user->update([
                    'avatar_url' => $this->publicImageUrl($path, $sourceUrl),
                ]);
            }
        }
    }
}

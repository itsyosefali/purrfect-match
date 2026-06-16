<?php

namespace Database\Seeders\Concerns;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

trait DownloadsSeedImages
{
    protected function downloadPublicImage(string $sourceUrl, string $directory, string $filename): ?string
    {
        $relativePath = trim($directory, '/').'/'.Str::slug(pathinfo($filename, PATHINFO_FILENAME)).'.jpg';

        if (Storage::disk('public')->exists($relativePath)) {
            return $relativePath;
        }

        try {
            $response = Http::timeout(30)->get($sourceUrl);

            if (! $response->successful()) {
                return null;
            }

            Storage::disk('public')->put($relativePath, $response->body());

            return $relativePath;
        } catch (\Throwable) {
            return null;
        }
    }

    protected function publicImageUrl(?string $relativePath, ?string $fallbackUrl = null): ?string
    {
        if ($relativePath && Storage::disk('public')->exists($relativePath)) {
            return Storage::disk('public')->url($relativePath);
        }

        return $fallbackUrl;
    }
}

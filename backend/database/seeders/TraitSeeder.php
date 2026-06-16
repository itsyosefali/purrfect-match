<?php

namespace Database\Seeders;

use App\Enums\TraitCategory;
use App\Models\CatTrait;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TraitSeeder extends Seeder
{
    public function run(): void
    {
        $traits = [
            ['Calm', TraitCategory::Personality],
            ['Playful', TraitCategory::Personality],
            ['Affectionate', TraitCategory::Personality],
            ['Curious', TraitCategory::Personality],
            ['Independent', TraitCategory::Personality],
            ['Good with Kids', TraitCategory::Lifestyle],
            ['Indoor', TraitCategory::Lifestyle],
            ['Kitten', TraitCategory::Lifestyle],
            ['Vaccinated', TraitCategory::Health],
            ['Neutered / Spayed', TraitCategory::Health],
            ['Good with Dogs', TraitCategory::Lifestyle],
        ];

        foreach ($traits as [$name, $category]) {
            CatTrait::firstOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name, 'category' => $category],
            );
        }
    }
}

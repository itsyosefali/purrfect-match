<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(TraitSeeder::class);
        $this->call(UserSeeder::class);
        $this->call(CatListingSeeder::class);
        $this->call(ConversationSeeder::class);
    }
}

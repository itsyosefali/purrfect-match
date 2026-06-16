<?php

namespace Database\Seeders;

use App\Models\CatListing;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Seeder;

class ConversationSeeder extends Seeder
{
    public function run(): void
    {
        $adopter = User::where('email', 'alex@purrfectmatch.test')->first();
        $oliver = CatListing::where('slug', 'oliver')->first();

        if (! $adopter || ! $oliver) {
            return;
        }

        $conversation = Conversation::create([
            'cat_listing_id' => $oliver->id,
            'adopter_id' => $adopter->id,
            'owner_id' => $oliver->user_id,
            'created_at' => now()->subHours(2),
            'updated_at' => now()->subMinutes(20),
        ]);

        Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $adopter->id,
            'body' => 'Hi Priya! I am interested in adopting Oliver. Could we chat more about the process?',
            'created_at' => now()->subHours(2),
        ]);

        Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $oliver->user_id,
            'body' => 'Hi! Thanks for reaching out about Oliver. I\'d love to tell you more. When would be a good time to chat?',
            'read_at' => null,
            'created_at' => now()->subMinutes(20),
        ]);
    }
}

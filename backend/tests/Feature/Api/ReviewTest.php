<?php

namespace Tests\Feature\Api;

use App\Models\CatListing;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_review_after_conversation(): void
    {
        $this->seed();
        $adopter = User::where('email', 'alex@purrfectmatch.test')->first();
        $cat = CatListing::where('slug', 'oliver')->first();

        Conversation::firstOrCreate(
            ['cat_listing_id' => $cat->id, 'adopter_id' => $adopter->id],
            ['owner_id' => $cat->user_id],
        );

        $response = $this->actingAs($adopter)->postJson("/api/cats/{$cat->slug}/reviews", [
            'rating' => 5,
            'body' => 'Great experience!',
        ]);

        $response->assertCreated()->assertJsonPath('data.rating', 5);
    }
}

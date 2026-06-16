<?php

namespace Tests\Feature\Api;

use App\Models\CatListing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConversationTest extends TestCase
{
    use RefreshDatabase;

    public function test_adopter_can_start_conversation(): void
    {
        $this->seed();
        $adopter = User::where('email', 'alex@purrfectmatch.test')->first();
        $cat = CatListing::where('user_id', '!=', $adopter->id)->first();

        $response = $this->actingAs($adopter)->postJson('/api/conversations', [
            'cat_listing_id' => $cat->id,
            'body' => 'Hello, is this cat still available?',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.cat.id', $cat->id);
    }
}

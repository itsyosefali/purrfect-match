<?php

namespace Tests\Feature\Api;

use App\Models\CatListing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SavedCatTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_save_and_unsave_cat(): void
    {
        $this->seed();
        $user = User::where('email', 'alex@purrfectmatch.test')->first();
        $cat = CatListing::first();

        $this->actingAs($user)
            ->postJson("/api/cats/{$cat->id}/save")
            ->assertOk();

        $this->actingAs($user)
            ->getJson('/api/saved-cats')
            ->assertOk()
            ->assertJsonFragment(['id' => $cat->id]);

        $this->actingAs($user)
            ->deleteJson("/api/cats/{$cat->id}/save")
            ->assertOk();
    }
}

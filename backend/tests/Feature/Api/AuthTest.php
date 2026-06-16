<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_update_profile(): void
    {
        $user = User::factory()->create(['name' => 'Before']);

        $response = $this->actingAs($user)->patchJson('/api/user', [
            'name' => 'After',
            'city' => 'Queens, NY',
        ]);

        $response->assertOk()->assertJsonPath('data.name', 'After');
        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'After']);
    }

    public function test_authenticated_user_can_change_password(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('old-password'),
        ]);

        $response = $this->actingAs($user)->postJson('/api/user/password', [
            'current_password' => 'old-password',
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ]);

        $response->assertOk();
    }
}

<?php

namespace Tests\Feature\Api;

use App\Models\User;
use App\Models\WhatsAppSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PhoneOtpRegistrationTest extends TestCase
{
    use RefreshDatabase;

    private function seedConnectedWhatsAppSettings(): void
    {
        WhatsAppSetting::query()->updateOrCreate(
            ['id' => 1],
            [
                'wasel_api_token' => 'test-token',
                'device_id' => 1,
                'from_number' => '218123456789',
                'connection_status' => WhatsAppSetting::STATUS_CONNECTED,
            ],
        );
    }

    public function test_user_can_register_with_phone_otp(): void
    {
        $phone = '972501234567';
        $code = '123456';

        Cache::put("otp:{$phone}", [
            'hash' => hash('sha256', $code),
            'attempts' => 0,
        ], 300);

        $response = $this
            ->withHeader('Origin', 'http://localhost:3000')
            ->withHeader('Referer', 'http://localhost:3000')
            ->postJson('/api/register', [
                'name' => 'Phone User',
                'phone' => $phone,
                'otp' => $code,
                'password' => 'password-123',
                'password_confirmation' => 'password-123',
                'city' => 'Tel Aviv',
            ]);

        $response->assertCreated()
            ->assertJsonPath('user.phone', $phone)
            ->assertJsonPath('user.name', 'Phone User');

        $this->assertDatabaseHas('users', [
            'phone' => $phone,
            'name' => 'Phone User',
        ]);

        $user = User::query()->where('phone', $phone)->first();
        $this->assertNotNull($user?->phone_verified_at);
        $this->assertAuthenticatedAs($user);
    }

    public function test_registration_rejects_invalid_otp(): void
    {
        $phone = '972501234567';

        Cache::put("otp:{$phone}", [
            'hash' => hash('sha256', '123456'),
            'attempts' => 0,
        ], 300);

        $response = $this->postJson('/api/register', [
            'name' => 'Phone User',
            'phone' => $phone,
            'otp' => '000000',
            'password' => 'password-123',
            'password_confirmation' => 'password-123',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['otp']);
    }

    public function test_registration_rejects_duplicate_phone(): void
    {
        User::factory()->create(['phone' => '972501234567']);

        $phone = '972501234567';
        $code = '123456';

        Cache::put("otp:{$phone}", [
            'hash' => hash('sha256', $code),
            'attempts' => 0,
        ], 300);

        $response = $this->postJson('/api/register', [
            'name' => 'Another User',
            'phone' => $phone,
            'otp' => $code,
            'password' => 'password-123',
            'password_confirmation' => 'password-123',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['phone']);
    }

    public function test_otp_send_is_blocked_when_device_disconnected(): void
    {
        $this->seedConnectedWhatsAppSettings();

        WhatsAppSetting::current()->update([
            'connection_status' => WhatsAppSetting::STATUS_DISCONNECTED,
        ]);

        $response = $this->postJson('/api/auth/otp/send', [
            'phone' => '972501234567',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['phone']);
    }

    public function test_otp_send_calls_wasel_api(): void
    {
        $this->seedConnectedWhatsAppSettings();

        Http::fake([
            '*/messages/send/text' => Http::response(['message' => 'sent'], 200),
        ]);

        $response = $this->postJson('/api/auth/otp/send', [
            'phone' => '972501234567',
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'OTP sent via WhatsApp.');

        Http::assertSent(function ($request) {
            return $request->url() === rtrim(config('wasel.base_url'), '/').'/messages/send/text'
                && $request['from'] === '218123456789'
                && $request['phone'] === '972501234567'
                && str_contains($request['body'], 'Your Purrfect Match verification code is');
        });

        $this->assertTrue(Cache::has('otp:972501234567'));
    }
}

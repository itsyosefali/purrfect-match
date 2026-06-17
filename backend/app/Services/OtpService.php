<?php

namespace App\Services;

use App\Models\WhatsAppSetting;
use App\Services\Wasel\WaselClient;
use App\Services\Wasel\WaselException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OtpService
{
    public function __construct(
        private WaselClient $waselClient,
    ) {}

    public function normalizePhone(string $phone): string
    {
        $normalized = preg_replace('/\D/', '', $phone) ?? '';

        if (strlen($normalized) < 8 || strlen($normalized) > 15) {
            throw ValidationException::withMessages([
                'phone' => ['Please enter a valid phone number with country code.'],
            ]);
        }

        return $normalized;
    }

    public function send(string $phone): void
    {
        $phone = $this->normalizePhone($phone);
        $settings = WhatsAppSetting::current();

        if (! $settings->isConnected()) {
            throw ValidationException::withMessages([
                'phone' => ['WhatsApp verification is temporarily unavailable. Please try again later.'],
            ]);
        }

        $cooldownKey = "otp:cooldown:{$phone}";

        if (Cache::has($cooldownKey)) {
            throw ValidationException::withMessages([
                'phone' => ['Please wait before requesting another code.'],
            ]);
        }

        $code = $this->generateCode();
        $ttl = config('wasel.otp_ttl_seconds');
        $cooldown = config('wasel.otp_resend_cooldown_seconds');

        Cache::put($this->cacheKey($phone), [
            'hash' => hash('sha256', $code),
            'attempts' => 0,
        ], $ttl);

        Cache::put($cooldownKey, true, $cooldown);

        $message = str_replace(':code', $code, config('wasel.otp_message'));

        try {
            $this->waselClient->sendText($settings->from_number, $phone, $message);
        } catch (WaselException $e) {
            Cache::forget($this->cacheKey($phone));
            Cache::forget($cooldownKey);

            throw ValidationException::withMessages([
                'phone' => ['Failed to send verification code. Please try again later.'],
            ]);
        }
    }

    public function verify(string $phone, string $code): bool
    {
        $phone = $this->normalizePhone($phone);
        $stored = Cache::get($this->cacheKey($phone));

        if (! is_array($stored) || ! isset($stored['hash'])) {
            throw ValidationException::withMessages([
                'otp' => ['Verification code has expired. Please request a new one.'],
            ]);
        }

        $attempts = (int) ($stored['attempts'] ?? 0);

        if ($attempts >= config('wasel.otp_max_attempts')) {
            Cache::forget($this->cacheKey($phone));

            throw ValidationException::withMessages([
                'otp' => ['Too many failed attempts. Please request a new code.'],
            ]);
        }

        $stored['attempts'] = $attempts + 1;
        Cache::put($this->cacheKey($phone), $stored, config('wasel.otp_ttl_seconds'));

        if (! hash_equals($stored['hash'], hash('sha256', $code))) {
            throw ValidationException::withMessages([
                'otp' => ['Invalid verification code.'],
            ]);
        }

        Cache::forget($this->cacheKey($phone));

        return true;
    }

    private function generateCode(): string
    {
        $length = config('wasel.otp_length');

        return Str::padLeft((string) random_int(0, (10 ** $length) - 1), $length, '0');
    }

    private function cacheKey(string $phone): string
    {
        return "otp:{$phone}";
    }
}

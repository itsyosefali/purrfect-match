<?php

namespace App\Services\Wasel;

use App\Models\WhatsAppSetting;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;

class WaselClient
{
    public function __construct(
        private ?WhatsAppSetting $settings = null,
    ) {
        $this->settings ??= WhatsAppSetting::current();
    }

    public function createDevice(string $name): array
    {
        return $this->request()->post('/devices', ['name' => $name])->json();
    }

    public function connect(int $deviceId): array
    {
        return $this->request()->post("/devices/{$deviceId}/connect")->json();
    }

    public function getQr(int $deviceId): array
    {
        return $this->request()->get("/devices/{$deviceId}/qr")->json();
    }

    public function getStatus(int $deviceId): array
    {
        return $this->request()->get("/devices/{$deviceId}/status")->json();
    }

    public function getCredentials(int $deviceId): array
    {
        return $this->request()->get("/devices/{$deviceId}/credentials")->json();
    }

    public function regenerateToken(int $deviceId): array
    {
        return $this->request()->post("/devices/{$deviceId}/token/regenerate")->json();
    }

    public function sendText(string $from, string $phone, string $body): array
    {
        return $this->request()->post('/messages/send/text', [
            'from' => $from,
            'phone' => $phone,
            'body' => $body,
        ])->json();
    }

    public function syncStatus(WhatsAppSetting $settings): WhatsAppSetting
    {
        if (! $settings->device_id) {
            return $settings;
        }

        $response = $this->getStatus($settings->device_id);
        $data = $response['data'] ?? $response;

        $status = $this->mapConnectionStatus($data);
        $fromNumber = $this->extractFromNumber($data);

        $settings->update([
            'connection_status' => $status,
            'from_number' => $fromNumber ?? $settings->from_number,
            'last_status_synced_at' => now(),
        ]);

        return $settings->fresh();
    }

    public function mapConnectionStatus(array $data): string
    {
        $status = strtolower((string) ($data['status'] ?? $data['connection_status'] ?? $data['state'] ?? ''));

        if (in_array($status, ['connected', 'online', 'open'], true)) {
            return WhatsAppSetting::STATUS_CONNECTED;
        }

        if (in_array($status, ['connecting', 'pairing', 'qr'], true)) {
            return WhatsAppSetting::STATUS_CONNECTING;
        }

        return WhatsAppSetting::STATUS_DISCONNECTED;
    }

    public function extractFromNumber(array $data): ?string
    {
        $from = $data['from'] ?? $data['phone'] ?? $data['number'] ?? $data['jid'] ?? null;

        if (! is_string($from) || $from === '') {
            return null;
        }

        return preg_replace('/\D/', '', $from) ?: null;
    }

    private function request(): PendingRequest
    {
        if (! filled($this->settings->wasel_api_token)) {
            throw new WaselException('Wasel API token is not configured.');
        }

        return Http::baseUrl(rtrim(config('wasel.base_url'), '/'))
            ->acceptJson()
            ->withToken($this->settings->wasel_api_token)
            ->throw(function ($response, $e) {
                $message = $response->json('message')
                    ?? $response->json('error')
                    ?? $response->body()
                    ?? $e->getMessage();

                throw new WaselException((string) $message, $response->status());
            });
    }
}

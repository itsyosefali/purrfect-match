<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsAppSetting extends Model
{
    protected $table = 'whatsapp_settings';

    public const STATUS_DISCONNECTED = 'disconnected';

    public const STATUS_CONNECTING = 'connecting';

    public const STATUS_CONNECTED = 'connected';

    protected $fillable = [
        'id',
        'wasel_api_token',
        'device_id',
        'device_name',
        'from_number',
        'wuzapi_token',
        'connection_status',
        'last_status_synced_at',
    ];

    protected function casts(): array
    {
        return [
            'wasel_api_token' => 'encrypted',
            'wuzapi_token' => 'encrypted',
            'device_id' => 'integer',
            'last_status_synced_at' => 'datetime',
        ];
    }

    public static function current(): self
    {
        return static::query()->firstOrCreate(
            ['id' => 1],
            ['connection_status' => self::STATUS_DISCONNECTED],
        );
    }

    public function isConnected(): bool
    {
        return $this->connection_status === self::STATUS_CONNECTED
            && filled($this->from_number)
            && filled($this->wasel_api_token);
    }
}

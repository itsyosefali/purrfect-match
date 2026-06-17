<?php

namespace App\Filament\Pages;

use App\Models\WhatsAppSetting;
use App\Services\Wasel\WaselClient;
use App\Services\Wasel\WaselException;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Components\Actions;
use Filament\Schemas\Components\EmbeddedSchema;
use Filament\Schemas\Components\Form;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Text;
use Filament\Schemas\Components\View;
use Filament\Schemas\Schema;
use Filament\Support\Enums\Alignment;
use Illuminate\Contracts\Support\Htmlable;
use UnitEnum;

class WhatsAppSettings extends Page
{
    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-chat-bubble-left-right';

    protected static string|UnitEnum|null $navigationGroup = 'Settings';

    protected static ?string $navigationLabel = 'WhatsApp';

    protected static ?string $title = 'WhatsApp Settings';

    protected static ?string $slug = 'whatsapp-settings';

    protected static ?int $navigationSort = 100;

    protected string $view = 'filament-panels::pages.page';

    /**
     * @var array<string, mixed>|null
     */
    public ?array $data = [];

    public ?string $qrImage = null;

    public function mount(): void
    {
        $settings = WhatsAppSetting::current();

        $this->form->fill([
            'device_name' => $settings->device_name ?? 'Purrfect Match OTP',
            'wasel_api_token' => '',
            'connection_status' => $settings->connection_status,
            'from_number' => $settings->from_number,
            'device_id' => $settings->device_id,
            'last_status_synced_at' => $settings->last_status_synced_at?->toDateTimeString(),
            'has_api_token' => filled($settings->wasel_api_token),
        ]);

        $this->refreshQr();
    }

    public function defaultForm(Schema $schema): Schema
    {
        return $schema
            ->statePath('data')
            ->model(WhatsAppSetting::current());
    }

    public function form(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('API Credentials')
                ->description('Paste your Wasel tenant JWT from /api/login or /api/token.')
                ->schema([
                    TextInput::make('wasel_api_token')
                        ->label('Wasel API Token')
                        ->password()
                        ->revealable()
                        ->placeholder(fn (): string => ($this->data['has_api_token'] ?? false)
                            ? 'Token configured — enter a new value to replace'
                            : 'Paste JWT token here'),
                    Text::make(fn (): string => ($this->data['has_api_token'] ?? false)
                        ? 'API token is saved (encrypted).'
                        : 'No API token saved yet.')
                        ->badge()
                        ->color(fn (): string => ($this->data['has_api_token'] ?? false) ? 'success' : 'danger'),
                ]),
            Section::make('Device')
                ->schema([
                    TextInput::make('device_name')
                        ->label('Device name')
                        ->required()
                        ->maxLength(255),
                    TextInput::make('device_id')
                        ->label('Device ID')
                        ->disabled()
                        ->dehydrated(false),
                    TextInput::make('from_number')
                        ->label('Sender number')
                        ->disabled()
                        ->dehydrated(false),
                    TextInput::make('connection_status')
                        ->label('Connection status')
                        ->disabled()
                        ->dehydrated(false),
                    TextInput::make('last_status_synced_at')
                        ->label('Last status sync')
                        ->disabled()
                        ->dehydrated(false),
                ]),
            Section::make('QR Pairing')
                ->description('Scan this QR code with WhatsApp on your phone after clicking Connect.')
                ->visible(fn (): bool => in_array(
                    $this->data['connection_status'] ?? WhatsAppSetting::STATUS_DISCONNECTED,
                    [WhatsAppSetting::STATUS_DISCONNECTED, WhatsAppSetting::STATUS_CONNECTING],
                    true,
                ))
                ->schema([
                    View::make('filament.pages.whatsapp-qr')
                        ->viewData(fn (): array => [
                            'qrImage' => $this->qrImage,
                        ]),
                ]),
        ]);
    }

    public function content(Schema $schema): Schema
    {
        return $schema->components([
            Form::make([EmbeddedSchema::make('form')])
                ->id('whatsapp-settings-form')
                ->livewireSubmitHandler('save')
                ->footer([
                    Actions::make([
                        Action::make('save')
                            ->label('Save settings')
                            ->submit('save')
                            ->keyBindings(['mod+s']),
                    ])
                        ->alignment(Alignment::Start)
                        ->key('form-actions'),
                ]),
        ]);
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('createDevice')
                ->label('Create device')
                ->action('createDevice')
                ->color('gray'),
            Action::make('connect')
                ->label('Connect')
                ->action('connectDevice')
                ->color('info'),
            Action::make('refreshStatus')
                ->label('Refresh status')
                ->action('refreshStatus'),
            Action::make('regenerateToken')
                ->label('Regenerate token')
                ->requiresConfirmation()
                ->modalDescription('This will invalidate the current session. You will need to scan the QR code again.')
                ->action('regenerateToken')
                ->color('danger'),
        ];
    }

    public function save(): void
    {
        $data = $this->form->getState();
        $settings = WhatsAppSetting::current();

        $updates = [
            'device_name' => $data['device_name'] ?? $settings->device_name,
        ];

        if (filled($data['wasel_api_token'] ?? null)) {
            $updates['wasel_api_token'] = $data['wasel_api_token'];
        }

        $settings->update($updates);

        $this->form->fill([
            ...$this->data,
            'wasel_api_token' => '',
            'has_api_token' => filled($settings->fresh()->wasel_api_token),
        ]);

        Notification::make()
            ->title('Settings saved')
            ->success()
            ->send();
    }

    public function createDevice(): void
    {
        $this->persistTokenFromForm();

        $settings = WhatsAppSetting::current();
        $name = $this->data['device_name'] ?? 'Purrfect Match OTP';

        try {
            $client = new WaselClient($settings);
            $response = $client->createDevice($name);
            $deviceId = $this->extractDeviceId($response);

            if (! $deviceId) {
                throw new WaselException('Device ID missing from Wasel response.');
            }

            $settings->update([
                'device_id' => $deviceId,
                'device_name' => $name,
                'connection_status' => WhatsAppSetting::STATUS_DISCONNECTED,
            ]);

            $credentials = $client->getCredentials($deviceId);
            $wuzapiToken = $credentials['wuzapi_token']
                ?? $credentials['data']['wuzapi_token']
                ?? $credentials['token']
                ?? null;

            if ($wuzapiToken) {
                $settings->update(['wuzapi_token' => $wuzapiToken]);
            }

            $this->reloadFormState($settings->fresh());

            Notification::make()
                ->title('Device created')
                ->body("Device #{$deviceId} is ready to connect.")
                ->success()
                ->send();
        } catch (WaselException $e) {
            $this->notifyError($e->getMessage());
        }
    }

    public function connectDevice(): void
    {
        $this->persistTokenFromForm();

        $settings = WhatsAppSetting::current();

        if (! $settings->device_id) {
            $this->notifyError('Create a device first.');

            return;
        }

        try {
            $client = new WaselClient($settings);
            $client->connect($settings->device_id);

            $settings->update(['connection_status' => WhatsAppSetting::STATUS_CONNECTING]);

            $this->reloadFormState($settings->fresh());
            $this->refreshQr();

            Notification::make()
                ->title('Connecting')
                ->body('Scan the QR code with WhatsApp.')
                ->success()
                ->send();
        } catch (WaselException $e) {
            $this->notifyError($e->getMessage());
        }
    }

    public function refreshStatus(): void
    {
        $settings = WhatsAppSetting::current();

        if (! $settings->device_id) {
            $this->notifyError('No device configured.');

            return;
        }

        try {
            $client = new WaselClient($settings);
            $settings = $client->syncStatus($settings);

            $this->reloadFormState($settings);

            if ($settings->isConnected()) {
                $this->qrImage = null;
            } else {
                $this->refreshQr();
            }

            Notification::make()
                ->title('Status updated')
                ->body('Connection: '.$settings->connection_status)
                ->success()
                ->send();
        } catch (WaselException $e) {
            $this->notifyError($e->getMessage());
        }
    }

    public function regenerateToken(): void
    {
        $settings = WhatsAppSetting::current();

        if (! $settings->device_id) {
            $this->notifyError('No device configured.');

            return;
        }

        try {
            $client = new WaselClient($settings);
            $response = $client->regenerateToken($settings->device_id);

            $wuzapiToken = $response['wuzapi_token']
                ?? $response['data']['wuzapi_token']
                ?? $response['token']
                ?? null;

            $settings->update([
                'wuzapi_token' => $wuzapiToken,
                'connection_status' => WhatsAppSetting::STATUS_DISCONNECTED,
                'from_number' => null,
            ]);

            $this->reloadFormState($settings->fresh());
            $this->refreshQr();

            Notification::make()
                ->title('Token regenerated')
                ->body('Reconnect the device by scanning a new QR code.')
                ->warning()
                ->send();
        } catch (WaselException $e) {
            $this->notifyError($e->getMessage());
        }
    }

    public function refreshQr(): void
    {
        $settings = WhatsAppSetting::current();

        if (! $settings->device_id || $settings->connection_status === WhatsAppSetting::STATUS_CONNECTED) {
            $this->qrImage = null;

            return;
        }

        try {
            $client = new WaselClient($settings);
            $response = $client->getQr($settings->device_id);

            $this->qrImage = $response['qr']
                ?? $response['data']['qr']
                ?? $response['image']
                ?? $response['data']['image']
                ?? null;

            if ($this->qrImage && str_starts_with($this->qrImage, 'data:image')) {
                $this->qrImage = preg_replace('/^data:image\/[^;]+;base64,/', '', $this->qrImage);
            }
        } catch (WaselException) {
            $this->qrImage = null;
        }
    }

    public function getTitle(): string|Htmlable
    {
        return static::$title ?? 'WhatsApp Settings';
    }

    private function persistTokenFromForm(): void
    {
        $token = $this->data['wasel_api_token'] ?? null;

        if (! filled($token)) {
            return;
        }

        WhatsAppSetting::current()->update(['wasel_api_token' => $token]);
        $this->data['wasel_api_token'] = '';
        $this->data['has_api_token'] = true;
    }

    private function reloadFormState(WhatsAppSetting $settings): void
    {
        $this->form->fill([
            'device_name' => $settings->device_name ?? 'Purrfect Match OTP',
            'wasel_api_token' => '',
            'connection_status' => $settings->connection_status,
            'from_number' => $settings->from_number,
            'device_id' => $settings->device_id,
            'last_status_synced_at' => $settings->last_status_synced_at?->toDateTimeString(),
            'has_api_token' => filled($settings->wasel_api_token),
        ]);
    }

    /**
     * @param  array<string, mixed>  $response
     */
    private function extractDeviceId(array $response): ?int
    {
        $id = $response['id']
            ?? $response['device_id']
            ?? $response['data']['id']
            ?? $response['data']['device_id']
            ?? null;

        return $id !== null ? (int) $id : null;
    }

    private function notifyError(string $message): void
    {
        Notification::make()
            ->title('Wasel API error')
            ->body($message)
            ->danger()
            ->send();
    }
}

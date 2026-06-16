<?php

namespace App\Filament\Resources\AdoptionApplicationResource\Pages;

use App\Enums\ApplicationStatus;
use App\Filament\Resources\AdoptionApplicationResource;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Resources\Pages\EditRecord;
use Filament\Schemas\Schema;

class EditAdoptionApplication extends EditRecord
{
    protected static string $resource = AdoptionApplicationResource::class;

    public function form(Schema $schema): Schema
    {
        return $schema->components([
            Textarea::make('message')->disabled()->columnSpanFull(),
            Select::make('status')
                ->options(collect(ApplicationStatus::cases())->mapWithKeys(fn ($s) => [$s->value => ucfirst($s->value)]))
                ->required(),
        ]);
    }
}

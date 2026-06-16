<?php

namespace App\Filament\Resources\CatTraitResource\Pages;

use App\Filament\Resources\CatTraitResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditCatTrait extends EditRecord
{
    protected static string $resource = CatTraitResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}

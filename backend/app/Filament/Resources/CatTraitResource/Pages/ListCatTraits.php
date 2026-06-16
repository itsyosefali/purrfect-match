<?php

namespace App\Filament\Resources\CatTraitResource\Pages;

use App\Filament\Resources\CatTraitResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListCatTraits extends ListRecords
{
    protected static string $resource = CatTraitResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}

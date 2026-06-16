<?php

namespace App\Filament\Resources\CatListingResource\Pages;

use App\Filament\Resources\CatListingResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListCatListings extends ListRecords
{
    protected static string $resource = CatListingResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}

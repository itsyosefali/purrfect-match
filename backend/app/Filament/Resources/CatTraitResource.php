<?php

namespace App\Filament\Resources;

use App\Enums\TraitCategory;
use App\Filament\Resources\CatTraitResource\Pages;
use App\Models\CatTrait;
use BackedEnum;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;
use UnitEnum;

class CatTraitResource extends Resource
{
    protected static ?string $model = CatTrait::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-tag';

    protected static string|UnitEnum|null $navigationGroup = 'Adoptions';

    protected static ?string $navigationLabel = 'Traits';

    protected static ?string $modelLabel = 'Trait';

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('name')->required(),
            TextInput::make('slug')->required(),
            Select::make('category')
                ->options(collect(TraitCategory::cases())->mapWithKeys(fn ($c) => [$c->value => ucfirst($c->value)]))
                ->required(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')->searchable(),
                Tables\Columns\TextColumn::make('slug'),
                Tables\Columns\TextColumn::make('category')->badge(),
            ])
            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListCatTraits::route('/'),
            'create' => Pages\CreateCatTrait::route('/create'),
            'edit' => Pages\EditCatTrait::route('/{record}/edit'),
        ];
    }
}

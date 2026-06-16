<?php

namespace App\Filament\Resources;

use App\Enums\Gender;
use App\Enums\ListingStatus;
use App\Filament\Resources\CatListingResource\Pages;
use App\Models\CatListing;
use App\Models\User;
use BackedEnum;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;
use UnitEnum;

class CatListingResource extends Resource
{
    protected static ?string $model = CatListing::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-heart';

    protected static string|UnitEnum|null $navigationGroup = 'Adoptions';

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Select::make('user_id')
                ->label('Owner')
                ->options(User::pluck('name', 'id'))
                ->searchable()
                ->required(),
            TextInput::make('name')->required(),
            TextInput::make('slug')->required(),
            TextInput::make('breed')->required(),
            TextInput::make('age_months')->numeric()->required(),
            Select::make('gender')
                ->options(collect(Gender::cases())->mapWithKeys(fn ($g) => [$g->value => ucfirst($g->value)]))
                ->required(),
            TextInput::make('location')->required(),
            Textarea::make('description')->required()->columnSpanFull(),
            TextInput::make('rehome_reason')->required(),
            TextInput::make('adoption_fee_cents')->numeric()->required(),
            Select::make('status')
                ->options(collect(ListingStatus::cases())->mapWithKeys(fn ($s) => [$s->value => ucfirst($s->value)]))
                ->required(),
            Toggle::make('is_featured'),
            Select::make('traits')
                ->relationship('traits', 'name')
                ->multiple()
                ->preload(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('breed')->searchable(),
                Tables\Columns\TextColumn::make('owner.name')->label('Owner'),
                Tables\Columns\TextColumn::make('location'),
                Tables\Columns\TextColumn::make('status')->badge(),
                Tables\Columns\IconColumn::make('is_featured')->boolean(),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(collect(ListingStatus::cases())->mapWithKeys(fn ($s) => [$s->value => ucfirst($s->value)])),
            ])
            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListCatListings::route('/'),
            'create' => Pages\CreateCatListing::route('/create'),
            'edit' => Pages\EditCatListing::route('/{record}/edit'),
        ];
    }
}

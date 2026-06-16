<?php

namespace App\Filament\Resources;

use App\Enums\ReportStatus;
use App\Filament\Resources\ReportResource\Pages;
use App\Models\Report;
use BackedEnum;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;
use UnitEnum;

class ReportResource extends Resource
{
    protected static ?string $model = Report::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-flag';

    protected static string|UnitEnum|null $navigationGroup = 'Moderation';

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('user.name')->label('Reporter')->disabled(),
            TextInput::make('catListing.name')->label('Listing')->disabled(),
            TextInput::make('reason')->disabled(),
            Textarea::make('body')->disabled()->columnSpanFull(),
            Select::make('status')
                ->options(collect(ReportStatus::cases())->mapWithKeys(fn ($s) => [$s->value => ucfirst($s->value)]))
                ->required(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('catListing.name')->label('Listing')->searchable(),
                Tables\Columns\TextColumn::make('user.name')->label('Reporter'),
                Tables\Columns\TextColumn::make('reason')->badge(),
                Tables\Columns\TextColumn::make('status')->badge(),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(collect(ReportStatus::cases())->mapWithKeys(fn ($s) => [$s->value => ucfirst($s->value)])),
            ])
            ->recordActions([
                EditAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListReports::route('/'),
            'edit' => Pages\EditReport::route('/{record}/edit'),
        ];
    }
}

<?php

namespace App\Filament\Widgets;

use App\Models\CatListing;
use App\Models\Report;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverview extends StatsOverviewWidget
{
    protected function getStats(): array
    {
        return [
            Stat::make('Available Cats', CatListing::where('status', 'available')->count())
                ->description('Active listings')
                ->color('success'),
            Stat::make('Pending Reports', Report::where('status', 'pending')->count())
                ->description('Needs review')
                ->color('warning'),
            Stat::make('Verified Owners', User::whereNotNull('identity_verified_at')->count())
                ->description('Identity verified')
                ->color('info'),
            Stat::make('Total Users', User::count())
                ->description('Registered accounts'),
        ];
    }
}

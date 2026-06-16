<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CatListing;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class StatsController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => [
                'verified_owners' => User::whereNotNull('identity_verified_at')->count(),
                'successful_adoptions' => CatListing::where('status', 'adopted')->count(),
                'identity_verified_percent' => 100,
                'cities_covered' => CatListing::query()->distinct('location')->count('location'),
                'cats_available' => CatListing::where('status', 'available')->count(),
            ],
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CatListingResource;
use App\Models\CatListing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SavedCatController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return CatListingResource::collection(
            $request->user()
                ->savedCats()
                ->with(['owner', 'photos', 'traits'])
                ->latest('saved_cats.created_at')
                ->get()
        );
    }

    public function store(Request $request, CatListing $cat): JsonResponse
    {
        $request->user()->savedCats()->syncWithoutDetaching([$cat->id]);

        return response()->json(['message' => 'Cat saved.', 'is_saved' => true]);
    }

    public function destroy(Request $request, CatListing $cat): JsonResponse
    {
        $request->user()->savedCats()->detach($cat->id);

        return response()->json(['message' => 'Cat removed from saved.', 'is_saved' => false]);
    }
}

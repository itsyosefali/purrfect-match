<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PublicUserResource;
use App\Http\Resources\ReviewResource;
use App\Models\CatListing;
use App\Models\Conversation;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ReviewController extends Controller
{
    public function index(string $slug): AnonymousResourceCollection
    {
        $listing = CatListing::where('slug', $slug)->firstOrFail();

        return ReviewResource::collection(
            $listing->reviews()->with('user')->latest()->paginate(20)
        );
    }

    public function store(Request $request, string $slug): ReviewResource|JsonResponse
    {
        $listing = CatListing::where('slug', $slug)->firstOrFail();
        $user = $request->user();

        if ($listing->user_id === $user->id) {
            return response()->json(['message' => 'You cannot review your own listing.'], 422);
        }

        $hasConversation = Conversation::query()
            ->where('cat_listing_id', $listing->id)
            ->where(fn ($q) => $q->where('adopter_id', $user->id)->orWhere('owner_id', $user->id))
            ->exists();

        if (! $hasConversation) {
            return response()->json(['message' => 'You must message the owner before leaving a review.'], 422);
        }

        if ($listing->reviews()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'You have already reviewed this listing.'], 422);
        }

        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'body' => ['nullable', 'string', 'max:2000'],
        ]);

        $review = $listing->reviews()->create([
            'user_id' => $user->id,
            ...$validated,
        ]);

        Review::recalculateListingRating($listing);
        Review::recalculateOwnerRating($listing->owner);

        $review->load('user');

        return new ReviewResource($review);
    }
}

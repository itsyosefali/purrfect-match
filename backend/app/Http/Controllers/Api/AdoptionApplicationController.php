<?php

namespace App\Http\Controllers\Api;

use App\Enums\ApplicationStatus;
use App\Enums\ListingStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\AdoptionApplicationResource;
use App\Models\AdoptionApplication;
use App\Models\CatListing;
use App\Notifications\AdoptionApplicationStatusNotification;
use App\Notifications\NewAdoptionApplicationNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AdoptionApplicationController extends Controller
{
    public function store(Request $request, CatListing $cat): AdoptionApplicationResource|JsonResponse
    {
        $user = $request->user();

        if ($cat->user_id === $user->id) {
            return response()->json(['message' => 'You cannot apply to adopt your own cat.'], 422);
        }

        if ($cat->status->value !== 'available') {
            return response()->json(['message' => 'This cat is not available for adoption.'], 422);
        }

        $existing = AdoptionApplication::query()
            ->where('cat_listing_id', $cat->id)
            ->where('adopter_id', $user->id)
            ->first();

        if ($existing && $existing->status !== ApplicationStatus::Withdrawn) {
            return response()->json(['message' => 'You have already applied for this cat.'], 422);
        }

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:5000'],
        ]);

        if ($existing) {
            $existing->update([
                'message' => $validated['message'],
                'status' => ApplicationStatus::Pending,
            ]);
            $application = $existing;
        } else {
            $application = AdoptionApplication::create([
                'cat_listing_id' => $cat->id,
                'adopter_id' => $user->id,
                'message' => $validated['message'],
                'status' => ApplicationStatus::Pending,
            ]);
        }

        $application->load(['catListing.photos', 'catListing.owner', 'adopter']);

        $application->catListing->owner->notify(new NewAdoptionApplicationNotification($application));

        return new AdoptionApplicationResource($application);
    }

    public function myApplications(Request $request): AnonymousResourceCollection
    {
        return AdoptionApplicationResource::collection(
            AdoptionApplication::query()
                ->where('adopter_id', $request->user()->id)
                ->with(['catListing.photos', 'catListing.owner'])
                ->latest()
                ->get()
        );
    }

    public function listingApplications(Request $request, CatListing $cat): AnonymousResourceCollection|JsonResponse
    {
        if ($cat->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        return AdoptionApplicationResource::collection(
            $cat->adoptionApplications()
                ->with('adopter')
                ->latest()
                ->get()
        );
    }

    public function update(Request $request, AdoptionApplication $application): AdoptionApplicationResource|JsonResponse
    {
        $user = $request->user();
        $listing = $application->catListing;

        $validated = $request->validate([
            'status' => ['required', 'in:approved,rejected,withdrawn'],
        ]);

        $newStatus = ApplicationStatus::from($validated['status']);

        if ($newStatus === ApplicationStatus::Withdrawn) {
            if ($application->adopter_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
        } else {
            if ($listing->user_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
        }

        $application->update(['status' => $newStatus]);

        if ($newStatus === ApplicationStatus::Approved) {
            $listing->update(['status' => ListingStatus::Pending]);
            $listing->adoptionApplications()
                ->where('id', '!=', $application->id)
                ->where('status', ApplicationStatus::Pending)
                ->update(['status' => ApplicationStatus::Rejected]);
        }

        $application->load(['catListing.photos', 'catListing.owner', 'adopter']);

        if (in_array($newStatus, [ApplicationStatus::Approved, ApplicationStatus::Rejected], true)) {
            $application->adopter->notify(new AdoptionApplicationStatusNotification($application));
        }

        return new AdoptionApplicationResource($application);
    }
}

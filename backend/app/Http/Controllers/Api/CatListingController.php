<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CatListingResource;
use App\Models\CatListing;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CatListingController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = CatListing::query()
            ->with(['owner', 'photos', 'traits'])
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->string('search');
                $q->where(function ($inner) use ($search) {
                    $inner->where('name', 'ilike', "%{$search}%")
                        ->orWhere('breed', 'ilike', "%{$search}%")
                        ->orWhere('location', 'ilike', "%{$search}%");
                });
            })
            ->when($request->filled('gender'), fn ($q) => $q->where('gender', $request->string('gender')))
            ->when($request->filled('breed'), fn ($q) => $q->where('breed', $request->string('breed')))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->when($request->filled('max_age_months'), fn ($q) => $q->where('age_months', '<=', (int) $request->input('max_age_months')))
            ->when($request->filled('max_fee_cents'), fn ($q) => $q->where('adoption_fee_cents', '<=', (int) $request->input('max_fee_cents')))
            ->when($request->filled('traits'), function ($q) use ($request) {
                $slugs = collect(explode(',', $request->string('traits')))->filter();
                foreach ($slugs as $slug) {
                    $q->whereHas('traits', fn ($t) => $t->where('slug', $slug));
                }
            });

        $sort = $request->string('sort', 'newest');
        match ($sort->value()) {
            'featured' => $query->orderByDesc('is_featured')->latest(),
            'rating' => $query->orderByDesc('rating')->orderByDesc('review_count'),
            'fee-asc' => $query->orderBy('adoption_fee_cents'),
            'fee-desc' => $query->orderByDesc('adoption_fee_cents'),
            default => $query->orderByDesc('is_featured')->latest(),
        };

        return CatListingResource::collection(
            $query->paginate($request->integer('per_page', 12))
        );
    }

    public function show(string $slug): CatListingResource
    {
        $listing = CatListing::query()
            ->with(['owner', 'photos', 'traits'])
            ->where('slug', $slug)
            ->firstOrFail();

        return new CatListingResource($listing);
    }

    public function store(Request $request): CatListingResource
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'breed' => ['required', 'string', 'max:100'],
            'age_months' => ['required', 'integer', 'min:1', 'max:300'],
            'gender' => ['required', 'in:male,female'],
            'location' => ['required', 'string', 'max:150'],
            'description' => ['required', 'string', 'max:5000'],
            'rehome_reason' => ['required', 'string', 'max:255'],
            'adoption_fee_cents' => ['required', 'integer', 'min:0'],
            'trait_ids' => ['array'],
            'trait_ids.*' => ['integer', 'exists:traits,id'],
            'photos' => ['array', 'max:6'],
            'photos.*' => ['image', 'max:10240'],
        ]);

        $listing = $request->user()->catListings()->create(collect($validated)->except(['trait_ids', 'photos'])->all());

        if (! empty($validated['trait_ids'])) {
            $listing->traits()->sync($validated['trait_ids']);
        }

        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $index => $photo) {
                $path = $photo->store('cat-photos', 'public');
                $listing->photos()->create(['path' => $path, 'sort_order' => $index]);
            }
        }

        $listing->load(['owner', 'photos', 'traits']);

        return new CatListingResource($listing);
    }

    public function update(Request $request, CatListing $cat): CatListingResource
    {
        $this->authorize('update', $cat);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:100'],
            'breed' => ['sometimes', 'string', 'max:100'],
            'age_months' => ['sometimes', 'integer', 'min:1', 'max:300'],
            'gender' => ['sometimes', 'in:male,female'],
            'location' => ['sometimes', 'string', 'max:150'],
            'description' => ['sometimes', 'string', 'max:5000'],
            'rehome_reason' => ['sometimes', 'string', 'max:255'],
            'adoption_fee_cents' => ['sometimes', 'integer', 'min:0'],
            'status' => ['sometimes', 'in:available,pending,adopted'],
            'trait_ids' => ['array'],
            'trait_ids.*' => ['integer', 'exists:traits,id'],
            'photos' => ['array', 'max:6'],
            'photos.*' => ['image', 'max:10240'],
            'delete_photo_ids' => ['array'],
            'delete_photo_ids.*' => ['integer', 'exists:cat_photos,id'],
        ]);

        $cat->update(collect($validated)->except(['trait_ids', 'photos', 'delete_photo_ids'])->all());

        if (array_key_exists('trait_ids', $validated)) {
            $cat->traits()->sync($validated['trait_ids'] ?? []);
        }

        if (! empty($validated['delete_photo_ids'])) {
            $cat->photos()->whereIn('id', $validated['delete_photo_ids'])->delete();
        }

        if ($request->hasFile('photos')) {
            $nextOrder = (int) $cat->photos()->max('sort_order') + 1;
            foreach ($request->file('photos') as $index => $photo) {
                $path = $photo->store('cat-photos', 'public');
                $cat->photos()->create(['path' => $path, 'sort_order' => $nextOrder + $index]);
            }
        }

        $cat->load(['owner', 'photos', 'traits']);

        return new CatListingResource($cat);
    }

    public function destroy(CatListing $cat): \Illuminate\Http\JsonResponse
    {
        $this->authorize('delete', $cat);
        $cat->delete();

        return response()->json(['message' => 'Listing deleted.']);
    }

    public function myListings(Request $request): AnonymousResourceCollection
    {
        return CatListingResource::collection(
            $request->user()
                ->catListings()
                ->with(['photos', 'traits', 'owner'])
                ->latest()
                ->get()
        );
    }
}

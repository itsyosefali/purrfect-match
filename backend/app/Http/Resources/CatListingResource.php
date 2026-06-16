<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CatListingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'breed' => $this->breed,
            'age_months' => $this->age_months,
            'age_label' => $this->age_label,
            'gender' => $this->gender->value,
            'location' => $this->location,
            'description' => $this->when($request->routeIs('api.cats.show'), $this->description),
            'rehome_reason' => $this->when($request->routeIs('api.cats.show'), $this->rehome_reason),
            'adoption_fee_cents' => $this->adoption_fee_cents,
            'status' => $this->status->value,
            'is_featured' => $this->is_featured,
            'rating' => (float) $this->rating,
            'review_count' => $this->review_count,
            'posted_at' => $this->created_at->toIso8601String(),
            'posted_ago' => $this->created_at->diffForHumans(),
            'primary_photo_url' => $this->primary_photo_url,
            'photos' => CatPhotoResource::collection($this->whenLoaded('photos')),
            'traits' => CatTraitResource::collection($this->whenLoaded('traits')),
            'owner' => new UserSummaryResource($this->whenLoaded('owner')),
            'is_saved' => $this->when($user, fn () => $user->savedCats()->where('cat_listings.id', $this->id)->exists()),
        ];
    }
}

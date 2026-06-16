<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdoptionApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'message' => $this->message,
            'status' => $this->status->value,
            'created_at' => $this->created_at->toIso8601String(),
            'cat' => new CatListingResource($this->whenLoaded('catListing')),
            'adopter' => new UserSummaryResource($this->whenLoaded('adopter')),
        ];
    }
}

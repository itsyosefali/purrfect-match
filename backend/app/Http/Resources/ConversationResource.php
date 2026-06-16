<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $other = $user?->id === $this->owner_id ? $this->adopter : $this->owner;

        return [
            'id' => $this->id,
            'cat' => new CatListingResource($this->whenLoaded('catListing')),
            'other_user' => new UserSummaryResource($other),
            'latest_message' => new MessageResource($this->whenLoaded('latestMessage')),
            'unread_count' => $this->when(isset($this->unread_count), $this->unread_count),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'avatar_url' => $this->avatar_url,
            'city' => $this->city,
            'is_verified' => $this->isVerified(),
            'is_admin' => $this->is_admin,
            'rating' => (float) $this->rating,
            'review_count' => $this->review_count,
            'response_rate' => $this->response_rate,
            'avg_response_minutes' => $this->avg_response_minutes,
        ];
    }
}

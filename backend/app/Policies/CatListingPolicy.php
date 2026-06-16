<?php

namespace App\Policies;

use App\Models\CatListing;
use App\Models\Conversation;
use App\Models\User;

class CatListingPolicy
{
    public function update(User $user, CatListing $catListing): bool
    {
        return $user->id === $catListing->user_id;
    }

    public function delete(User $user, CatListing $catListing): bool
    {
        return $user->id === $catListing->user_id || $user->is_admin;
    }
}

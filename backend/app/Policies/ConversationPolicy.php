<?php

namespace App\Policies;

use App\Models\Conversation;
use App\Models\User;

class ConversationPolicy
{
    public function view(User $user, Conversation $conversation): bool
    {
        return in_array($user->id, [$conversation->adopter_id, $conversation->owner_id], true);
    }
}

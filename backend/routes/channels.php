<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    return \App\Models\Conversation::query()
        ->where('id', $conversationId)
        ->where(fn ($q) => $q->where('adopter_id', $user->id)->orWhere('owner_id', $user->id))
        ->exists();
});

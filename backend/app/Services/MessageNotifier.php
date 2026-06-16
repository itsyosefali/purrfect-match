<?php

namespace App\Services;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Notifications\NewMessageNotification;

class MessageNotifier
{
    public static function notifyRecipient(Message $message, Conversation $conversation): void
    {
        $senderId = $message->sender_id;
        $recipientId = $conversation->adopter_id === $senderId
            ? $conversation->owner_id
            : $conversation->adopter_id;

        $recipient = User::find($recipientId);

        if (! $recipient) {
            return;
        }

        $message->load(['sender', 'conversation.catListing']);

        $recipient->notify(new NewMessageNotification($message));
    }
}

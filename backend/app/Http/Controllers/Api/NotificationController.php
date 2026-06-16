<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $unread = Message::query()
            ->whereHas('conversation', function ($q) use ($userId) {
                $q->where('adopter_id', $userId)->orWhere('owner_id', $userId);
            })
            ->where('sender_id', '!=', $userId)
            ->whereNull('read_at')
            ->with(['conversation.catListing', 'sender'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn (Message $message) => [
                'id' => $message->id,
                'title' => $message->sender->name.' replied about '.$message->conversation->catListing->name,
                'body' => $message->body,
                'conversation_id' => $message->conversation_id,
                'created_at' => $message->created_at->toIso8601String(),
            ]);

        return response()->json(['data' => $unread]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $count = Message::query()
            ->whereHas('conversation', function ($q) use ($userId) {
                $q->where('adopter_id', $userId)->orWhere('owner_id', $userId);
            })
            ->where('sender_id', '!=', $userId)
            ->whereNull('read_at')
            ->count();

        $conversationCount = Conversation::query()
            ->where(fn ($q) => $q->where('adopter_id', $userId)->orWhere('owner_id', $userId))
            ->count();

        return response()->json([
            'data' => [
                'unread_messages' => $count,
                'conversations' => $conversationCount,
            ],
        ]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        Message::query()
            ->whereHas('conversation', function ($q) use ($userId) {
                $q->where('adopter_id', $userId)->orWhere('owner_id', $userId);
            })
            ->where('sender_id', '!=', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read.']);
    }
}

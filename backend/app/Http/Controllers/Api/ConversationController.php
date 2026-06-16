<?php

namespace App\Http\Controllers\Api;

use App\Events\MessageSent;
use App\Http\Controllers\Controller;
use App\Http\Resources\ConversationResource;
use App\Http\Resources\MessageResource;
use App\Models\CatListing;
use App\Models\Conversation;
use App\Models\Message;
use App\Services\MessageNotifier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ConversationController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $userId = $request->user()->id;

        $conversations = Conversation::query()
            ->with(['catListing.photos', 'catListing.owner', 'adopter', 'owner', 'latestMessage'])
            ->where(fn ($q) => $q->where('adopter_id', $userId)->orWhere('owner_id', $userId))
            ->withCount(['messages as unread_count' => function ($q) use ($userId) {
                $q->where('sender_id', '!=', $userId)->whereNull('read_at');
            }])
            ->latest('updated_at')
            ->get();

        return ConversationResource::collection($conversations);
    }

    public function store(Request $request): ConversationResource|JsonResponse
    {
        $validated = $request->validate([
            'cat_listing_id' => ['required', 'exists:cat_listings,id'],
            'body' => ['required', 'string', 'max:5000'],
        ]);

        $listing = CatListing::findOrFail($validated['cat_listing_id']);
        $user = $request->user();

        if ($listing->user_id === $user->id) {
            return response()->json(['message' => 'You cannot message yourself.'], 422);
        }

        $conversation = Conversation::firstOrCreate(
            [
                'cat_listing_id' => $listing->id,
                'adopter_id' => $user->id,
            ],
            ['owner_id' => $listing->user_id]
        );

        $message = $conversation->messages()->create([
            'sender_id' => $user->id,
            'body' => $validated['body'],
        ]);

        $conversation->touch();
        MessageSent::dispatch($message);
        MessageNotifier::notifyRecipient($message, $conversation);
        $conversation->load(['catListing.photos', 'catListing.owner', 'adopter', 'owner', 'latestMessage']);

        return (new ConversationResource($conversation))
            ->additional(['initial_message' => new MessageResource($message)]);
    }

    public function show(Request $request, Conversation $conversation): ConversationResource
    {
        $this->authorize('view', $conversation);

        $conversation->messages()
            ->where('sender_id', '!=', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $conversation->load(['catListing.photos', 'catListing.owner', 'adopter', 'owner', 'messages.sender']);

        return (new ConversationResource($conversation))
            ->additional([
                'messages' => MessageResource::collection($conversation->messages),
            ]);
    }

    public function sendMessage(Request $request, Conversation $conversation): MessageResource
    {
        $this->authorize('view', $conversation);

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:5000'],
        ]);

        $message = $conversation->messages()->create([
            'sender_id' => $request->user()->id,
            'body' => $validated['body'],
        ]);

        $conversation->touch();
        MessageSent::dispatch($message);
        MessageNotifier::notifyRecipient($message, $conversation);

        return new MessageResource($message);
    }
}

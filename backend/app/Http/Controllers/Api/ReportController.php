<?php

namespace App\Http\Controllers\Api;

use App\Enums\ReportStatus;
use App\Http\Controllers\Controller;
use App\Models\CatListing;
use App\Models\Report;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function store(Request $request, CatListing $cat): JsonResponse
    {
        $user = $request->user();

        if ($cat->user_id === $user->id) {
            return response()->json(['message' => 'You cannot report your own listing.'], 422);
        }

        if (Report::query()->where('user_id', $user->id)->where('cat_listing_id', $cat->id)->exists()) {
            return response()->json(['message' => 'You have already reported this listing.'], 422);
        }

        $validated = $request->validate([
            'reason' => ['required', 'string', 'in:spam,scam,inappropriate,misleading,other'],
            'body' => ['nullable', 'string', 'max:2000'],
        ]);

        Report::create([
            'user_id' => $user->id,
            'cat_listing_id' => $cat->id,
            'reason' => $validated['reason'],
            'body' => $validated['body'] ?? null,
            'status' => ReportStatus::Pending,
        ]);

        return response()->json(['message' => 'Report submitted. Our team will review it.'], 201);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\OtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PhoneOtpController extends Controller
{
    public function send(Request $request, OtpService $otpService): JsonResponse
    {
        $validated = $request->validate([
            'phone' => ['required', 'string', 'max:20'],
        ]);

        $otpService->send($validated['phone']);

        return response()->json([
            'message' => 'OTP sent via WhatsApp.',
        ]);
    }
}

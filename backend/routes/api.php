<?php

use App\Http\Controllers\Api\AdoptionApplicationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CatListingController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\PhoneOtpController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\SavedCatController;
use App\Http\Controllers\Api\StatsController;
use App\Http\Controllers\Api\TraitController;
use Illuminate\Support\Facades\Route;

Route::get('/traits', [TraitController::class, 'index']);
Route::get('/stats', [StatsController::class, 'index']);
Route::get('/cats', [CatListingController::class, 'index'])->name('api.cats.index');
Route::get('/cats/{slug}', [CatListingController::class, 'show'])->name('api.cats.show');
Route::get('/cats/{slug}/reviews', [ReviewController::class, 'index']);
Route::get('/users/{user}', [ProfileController::class, 'show']);

Route::post('/auth/otp/send', [PhoneOtpController::class, 'send'])->middleware('throttle:5,1');
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword'])->middleware('throttle:5,1');
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword'])->middleware('throttle:5,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::patch('/user', [ProfileController::class, 'update']);
    Route::post('/user/password', [ProfileController::class, 'updatePassword']);

    Route::get('/my-listings', [CatListingController::class, 'myListings']);
    Route::post('/cats', [CatListingController::class, 'store'])->middleware('throttle:5,1');
    Route::patch('/cats/{cat}', [CatListingController::class, 'update']);
    Route::delete('/cats/{cat}', [CatListingController::class, 'destroy']);

    Route::get('/saved-cats', [SavedCatController::class, 'index']);
    Route::post('/cats/{cat}/save', [SavedCatController::class, 'store']);
    Route::delete('/cats/{cat}/save', [SavedCatController::class, 'destroy']);

    Route::post('/cats/{cat}/report', [ReportController::class, 'store'])->middleware('throttle:5,1');
    Route::post('/cats/{slug}/reviews', [ReviewController::class, 'store'])->middleware('throttle:5,1');

    Route::post('/cats/{cat}/apply', [AdoptionApplicationController::class, 'store'])->middleware('throttle:10,1');
    Route::get('/my-applications', [AdoptionApplicationController::class, 'myApplications']);
    Route::get('/cats/{cat}/applications', [AdoptionApplicationController::class, 'listingApplications']);
    Route::patch('/applications/{application}', [AdoptionApplicationController::class, 'update']);

    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::post('/conversations', [ConversationController::class, 'store'])->middleware('throttle:20,1');
    Route::get('/conversations/{conversation}', [ConversationController::class, 'show']);
    Route::post('/conversations/{conversation}/messages', [ConversationController::class, 'sendMessage'])->middleware('throttle:30,1');

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllRead']);
});

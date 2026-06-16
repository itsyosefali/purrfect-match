<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/sanctum/csrf-token', function () {
    return response()->json([
        'csrf_token' => $_COOKIE['XSRF-TOKEN'] ?? null,
    ]);
})->middleware('web');

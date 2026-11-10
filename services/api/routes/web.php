<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => response()->json(['product' => 'Segno Gebeya', 'health' => '/api/v1/health']));

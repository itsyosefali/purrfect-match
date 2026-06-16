<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CatTraitResource;
use App\Models\CatTrait;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TraitController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return CatTraitResource::collection(
            CatTrait::query()->orderBy('category')->orderBy('name')->get()
        );
    }
}

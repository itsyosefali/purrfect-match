<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cat_listing_trait', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cat_listing_id')->constrained()->cascadeOnDelete();
            $table->foreignId('trait_id')->constrained()->cascadeOnDelete();
            $table->unique(['cat_listing_id', 'trait_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cat_listing_trait');
    }
};

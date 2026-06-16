<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cat_listing_id')->constrained()->cascadeOnDelete();
            $table->foreignId('adopter_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['cat_listing_id', 'adopter_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};

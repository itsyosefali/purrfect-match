<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cat_listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('breed');
            $table->unsignedSmallInteger('age_months');
            $table->string('gender');
            $table->string('location');
            $table->text('description');
            $table->string('rehome_reason');
            $table->unsignedInteger('adoption_fee_cents')->default(0);
            $table->string('status')->default('available');
            $table->boolean('is_featured')->default(false);
            $table->decimal('rating', 2, 1)->default(0);
            $table->unsignedInteger('review_count')->default(0);
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index('breed');
            $table->index('gender');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cat_listings');
    }
};

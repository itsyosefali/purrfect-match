<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar_url')->nullable()->after('password');
            $table->string('city')->nullable()->after('avatar_url');
            $table->boolean('is_admin')->default(false)->after('city');
            $table->timestamp('identity_verified_at')->nullable()->after('is_admin');
            $table->decimal('rating', 2, 1)->default(0)->after('identity_verified_at');
            $table->unsignedInteger('review_count')->default(0)->after('rating');
            $table->unsignedTinyInteger('response_rate')->default(100)->after('review_count');
            $table->unsignedSmallInteger('avg_response_minutes')->default(30)->after('response_rate');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'avatar_url',
                'city',
                'is_admin',
                'identity_verified_at',
                'rating',
                'review_count',
                'response_rate',
                'avg_response_minutes',
            ]);
        });
    }
};

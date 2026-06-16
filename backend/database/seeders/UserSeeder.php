<?php

namespace Database\Seeders;

use App\Models\User;
use Database\Seeders\Concerns\DownloadsSeedImages;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    use DownloadsSeedImages;

    public function run(): void
    {
        $users = [
            [
                'name' => 'Admin User',
                'email' => 'admin@purrfectmatch.test',
                'password' => 'password',
                'is_admin' => true,
                'city' => 'San Francisco, CA',
                'identity_verified_at' => now(),
                'rating' => 5.0,
                'review_count' => 50,
                'avatar_source' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&auto=format',
            ],
            [
                'name' => 'Priya Sharma',
                'email' => 'priya@purrfectmatch.test',
                'password' => 'password',
                'city' => 'Seattle, WA',
                'identity_verified_at' => now(),
                'rating' => 5.0,
                'review_count' => 203,
                'response_rate' => 100,
                'avg_response_minutes' => 30,
                'avatar_source' => 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=200&h=200&fit=crop&auto=format',
            ],
            [
                'name' => 'Marcus Lee',
                'email' => 'marcus@purrfectmatch.test',
                'password' => 'password',
                'city' => 'Atlanta, GA',
                'identity_verified_at' => now(),
                'rating' => 4.9,
                'review_count' => 64,
                'response_rate' => 95,
                'avg_response_minutes' => 45,
                'avatar_source' => 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&fit=crop&auto=format',
            ],
            [
                'name' => 'Sarah Mitchell',
                'email' => 'sarah@purrfectmatch.test',
                'password' => 'password',
                'city' => 'Brooklyn, NY',
                'identity_verified_at' => now(),
                'rating' => 4.9,
                'review_count' => 128,
                'response_rate' => 98,
                'avg_response_minutes' => 20,
                'avatar_source' => 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&auto=format',
            ],
            [
                'name' => 'Elena Voss',
                'email' => 'elena@purrfectmatch.test',
                'password' => 'password',
                'city' => 'Miami, FL',
                'identity_verified_at' => now(),
                'rating' => 4.9,
                'review_count' => 89,
                'response_rate' => 100,
                'avg_response_minutes' => 25,
                'avatar_source' => 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=200&h=200&fit=crop&auto=format',
            ],
            [
                'name' => 'Tom',
                'email' => 'tom@purrfectmatch.test',
                'password' => 'password',
                'city' => 'Chicago, IL',
                'identity_verified_at' => now(),
                'rating' => 4.7,
                'review_count' => 91,
                'response_rate' => 90,
                'avg_response_minutes' => 60,
                'avatar_source' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&auto=format',
            ],
            [
                'name' => 'Alex Rivera',
                'email' => 'alex@purrfectmatch.test',
                'password' => 'password',
                'city' => 'Los Angeles, CA',
                'identity_verified_at' => now(),
                'rating' => 4.8,
                'review_count' => 15,
                'response_rate' => 100,
                'avg_response_minutes' => 15,
                'avatar_source' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&auto=format',
            ],
        ];

        foreach ($users as $data) {
            $avatarSource = $data['avatar_source'];
            unset($data['avatar_source']);

            $slug = str_replace('.', '-', explode('@', $data['email'])[0]);
            $avatarPath = $this->downloadPublicImage(
                $avatarSource,
                'seed/avatars',
                $slug,
            );

            $data['avatar_url'] = $this->publicImageUrl($avatarPath, $avatarSource);

            User::create($data);
        }
    }
}

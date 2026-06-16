<?php

namespace Tests\Feature\Api;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CatListingTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_cats(): void
    {
        $this->seed();

        $response = $this->getJson('/api/cats');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'slug', 'name', 'breed', 'status'],
                ],
                'meta' => ['current_page', 'total'],
            ]);
    }

    public function test_can_show_cat_by_slug(): void
    {
        $this->seed();

        $response = $this->getJson('/api/cats/oliver');

        $response->assertOk()
            ->assertJsonPath('data.slug', 'oliver')
            ->assertJsonPath('data.name', 'Oliver');
    }
}

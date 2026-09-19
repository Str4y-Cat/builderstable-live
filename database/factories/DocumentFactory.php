<?php

namespace Database\Factories;

use App\Models\Trip;
use Illuminate\Database\Eloquent\Factories\Factory;

class DocumentFactory extends Factory
{
    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'trip_id' => Trip::factory(),
            'name' => fake()->name(),
            'url' => fake()->url(),
            'type' => fake()->regexify('[A-Za-z0-9]{100}'),
            'assigned_traveler_ids' => '{}',
            'pinned' => fake()->boolean(),
        ];
    }
}

<?php

namespace Database\Factories;

use App\Models\Trip;
use Illuminate\Database\Eloquent\Factories\Factory;

class ItineraryItemFactory extends Factory
{
    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'trip_id' => Trip::factory(),
            'date' => fake()->date(),
            'time' => fake()->time(),
            'title' => fake()->sentence(4),
            'description' => fake()->text(),
            'location' => fake()->regexify('[A-Za-z0-9]{255}'),
            'type' => fake()->randomElement(['flight', 'accommodation', 'activity', 'meal', 'transport', 'call-time', 'other']),
            'assigned_traveler_ids' => '{}',
            'document_ids' => '{}',
        ];
    }
}

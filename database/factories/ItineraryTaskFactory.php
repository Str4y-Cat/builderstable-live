<?php

namespace Database\Factories;

use App\Models\ItineraryItem;
use Illuminate\Database\Eloquent\Factories\Factory;

class ItineraryTaskFactory extends Factory
{
    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'itinerary_item_id' => ItineraryItem::factory(),
            'title' => fake()->sentence(4),
            'done' => fake()->boolean(),
        ];
    }
}

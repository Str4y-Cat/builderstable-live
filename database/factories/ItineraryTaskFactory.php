<?php

namespace Database\Factories;

use App\Models\ItineraryItem;
use App\Models\ItineraryTask;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ItineraryTask>
 */
class ItineraryTaskFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'itinerary_item_id' => ItineraryItem::factory(),
            'title' => fake()->sentence(4),
            'done' => false,
        ];
    }
}

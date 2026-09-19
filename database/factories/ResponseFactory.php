<?php

namespace Database\Factories;

use App\Models\ItineraryItem;
use App\Models\Traveler;
use Illuminate\Database\Eloquent\Factories\Factory;

class ResponseFactory extends Factory
{
    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'itinerary_item_id' => ItineraryItem::factory(),
            'traveler_id' => Traveler::factory(),
            'status' => fake()->randomElement(['pending', 'confirmed', 'declined']),
            'responded_at' => fake()->dateTime(),
        ];
    }
}

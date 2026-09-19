<?php

namespace Database\Factories;

use App\Models\ItineraryItem;
use App\Models\Traveler;
use App\Models\Trip;
use Illuminate\Database\Eloquent\Factories\Factory;

class NotificationLogFactory extends Factory
{
    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'trip_id' => Trip::factory(),
            'itinerary_item_id' => ItineraryItem::factory(),
            'traveler_id' => Traveler::factory(),
            'channel' => fake()->randomElement(['email', 'telegram']),
            'sent_at' => fake()->dateTime(),
            'message_preview' => fake()->text(),
        ];
    }
}

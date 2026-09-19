<?php

namespace Database\Factories;

use App\Enums\ResponseStatus;
use App\Models\ItineraryItem;
use App\Models\Response;
use App\Models\Traveler;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Response>
 */
class ResponseFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'itinerary_item_id' => ItineraryItem::factory(),
            'traveler_id' => Traveler::factory(),
            'status' => fake()->randomElement(ResponseStatus::cases()),
            'responded_at' => fake()->optional()->dateTime(),
        ];
    }
}

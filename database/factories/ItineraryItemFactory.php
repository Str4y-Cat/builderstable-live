<?php

namespace Database\Factories;

use App\Enums\ItineraryItemType;
use App\Models\ItineraryItem;
use App\Models\Trip;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ItineraryItem>
 */
class ItineraryItemFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'trip_id' => Trip::factory(),
            'date' => fake()->date(),
            'time' => fake()->time('H:i'),
            'title' => fake()->sentence(4),
            'description' => fake()->optional()->sentence(),
            'location' => fake()->optional()->city(),
            'type' => fake()->randomElement(ItineraryItemType::cases()),
            'assigned_traveler_ids' => [],
            'document_ids' => [],
        ];
    }
}

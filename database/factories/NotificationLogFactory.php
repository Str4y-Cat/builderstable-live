<?php

namespace Database\Factories;

use App\Enums\NotifyChannel;
use App\Models\ItineraryItem;
use App\Models\NotificationLog;
use App\Models\Traveler;
use App\Models\Trip;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<NotificationLog>
 */
class NotificationLogFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'trip_id' => Trip::factory(),
            'itinerary_item_id' => ItineraryItem::factory(),
            'traveler_id' => Traveler::factory(),
            'channel' => fake()->randomElement(NotifyChannel::cases()),
            'sent_at' => fake()->dateTime(),
            'message_preview' => fake()->sentence(),
        ];
    }
}

<?php

namespace Database\Factories;

use App\Enums\TripBadge;
use App\Enums\TripTag;
use App\Models\Trip;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Trip>
 */
class TripFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('now', '+2 months');

        return [
            'user_id' => User::factory(),
            'name' => fake()->words(3, true),
            'destination' => fake()->city(),
            'start_date' => $startDate,
            'end_date' => fake()->dateTimeBetween($startDate, '+3 months'),
            'description' => fake()->sentence(),
            'badge' => fake()->randomElement(TripBadge::cases()),
            'tags' => fake()->randomElements(TripTag::cases(), 2),
            'auto_notify_on_assign' => false,
        ];
    }
}

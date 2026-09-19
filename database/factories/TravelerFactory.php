<?php

namespace Database\Factories;

use App\Models\Traveler;
use App\Models\Trip;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Traveler>
 */
class TravelerFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'trip_id' => Trip::factory(),
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->optional()->phoneNumber(),
            'role_on_production' => fake()->randomElement(['Director', 'DP', 'Producer', 'Talent', 'Gaffer', '1st AD', 'Sound Mixer']),
        ];
    }
}

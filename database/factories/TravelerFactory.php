<?php

namespace Database\Factories;

use App\Models\Trip;
use Illuminate\Database\Eloquent\Factories\Factory;

class TravelerFactory extends Factory
{
    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'trip_id' => Trip::factory(),
            'name' => fake()->name(),
            'email' => fake()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'role_on_production' => fake()->regexify('[A-Za-z0-9]{255}'),
            'share_code' => fake()->regexify('[A-Za-z0-9]{255}'),
        ];
    }
}

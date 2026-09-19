<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TripFactory extends Factory
{
    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->name(),
            'destination' => fake()->regexify('[A-Za-z0-9]{255}'),
            'start_date' => fake()->date(),
            'end_date' => fake()->date(),
            'description' => fake()->text(),
            'badge' => fake()->randomElement(['planning', 'locked', 'on-hold', 'wrap']),
            'tags' => '{}',
            'auto_notify_on_assign' => fake()->boolean(),
        ];
    }
}

<?php

namespace Database\Factories;

use App\Models\Document;
use App\Models\Trip;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Document>
 */
class DocumentFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'trip_id' => Trip::factory(),
            'name' => fake()->words(3, true).'.pdf',
            'url' => fake()->url(),
            'type' => 'application/pdf',
            'assigned_traveler_ids' => [],
            'pinned' => false,
        ];
    }
}

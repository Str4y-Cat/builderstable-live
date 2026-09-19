<?php

use App\Models\Traveler;
use App\Models\Trip;
use App\Models\User;

test('curators can add a traveler with a generated share code', function () {
    $user = User::factory()->create();
    $trip = Trip::factory()->for($user)->create();

    $this->actingAs($user)
        ->post(route('trips.travelers.store', $trip), [
            'name' => 'Marcus Williams',
            'email' => 'marcus@example.com',
            'phone' => '+1-555-0101',
            'role_on_production' => 'Director',
        ])
        ->assertRedirect(route('trips.show', $trip));

    $traveler = Traveler::query()->first();

    expect($traveler)->not->toBeNull()
        ->and($traveler->trip_id)->toBe($trip->id)
        ->and($traveler->email)->toBe('marcus@example.com')
        ->and($traveler->share_code)->not->toBeEmpty();
});

test('traveler email must be unique on the trip', function () {
    $user = User::factory()->create();
    $trip = Trip::factory()->for($user)->create();
    Traveler::factory()->for($trip)->create(['email' => 'marcus@example.com']);

    $this->actingAs($user)
        ->from(route('trips.show', $trip))
        ->post(route('trips.travelers.store', $trip), [
            'name' => 'Marcus Clone',
            'email' => 'marcus@example.com',
            'role_on_production' => 'DP',
        ])
        ->assertRedirect(route('trips.show', $trip))
        ->assertInvalid(['email']);
});

test('curators cannot add travelers to another users trip', function () {
    $user = User::factory()->create();
    $trip = Trip::factory()->create();

    $this->actingAs($user)
        ->post(route('trips.travelers.store', $trip), [
            'name' => 'Marcus Williams',
            'email' => 'marcus@example.com',
            'role_on_production' => 'Director',
        ])
        ->assertNotFound();

    $this->assertDatabaseCount('travelers', 0);
});

test('curators can update and remove travelers', function () {
    $user = User::factory()->create();
    $trip = Trip::factory()->for($user)->create();
    $traveler = Traveler::factory()->for($trip)->create(['role_on_production' => 'DP']);

    $this->actingAs($user)
        ->patch(route('trips.travelers.update', [$trip, $traveler]), [
            'role_on_production' => 'Director',
        ])
        ->assertRedirect(route('trips.show', $trip));

    expect($traveler->refresh()->role_on_production)->toBe('Director');

    $this->actingAs($user)
        ->delete(route('trips.travelers.destroy', [$trip, $traveler]))
        ->assertRedirect(route('trips.show', $trip));

    $this->assertSoftDeleted($traveler);
});

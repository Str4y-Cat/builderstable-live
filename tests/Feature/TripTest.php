<?php

use App\Enums\TripBadge;
use App\Enums\TripTag;
use App\Models\ItineraryItem;
use App\Models\Trip;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests cannot create a trip', function () {
    $this->post(route('trips.store'), [
        'name' => 'Sundance',
    ])->assertRedirect(route('login'));

    $this->assertDatabaseCount('trips', 0);
});

test('curators can create a trip', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->post(route('trips.store'), [
            'name' => 'Sundance Film Festival',
            'destination' => 'Park City, Utah',
            'start_date' => '2026-01-23',
            'end_date' => '2026-01-29',
            'description' => 'Festival itinerary',
            'badge' => TripBadge::Planning->value,
            'tags' => [TripTag::Festival->value],
        ]);

    $trip = Trip::query()->first();

    expect($trip)->not->toBeNull()
        ->and($trip->name)->toBe('Sundance Film Festival')
        ->and($trip->user_id)->toBe($user->id)
        ->and($trip->badge)->toBe(TripBadge::Planning);

    expect(collect($trip->tags)->contains(TripTag::Festival))->toBeTrue();

    $response->assertRedirect(route('trips.show', $trip));
});

test('creating a trip requires a name', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->from(route('dashboard'))
        ->post(route('trips.store'), [])
        ->assertRedirect(route('dashboard'))
        ->assertInvalid(['name']);

    $this->assertDatabaseCount('trips', 0);
});

test('curators can view their trip', function () {
    $user = User::factory()->create();
    $trip = Trip::factory()->for($user)->create(['name' => 'Commercial Shoot']);

    $this->actingAs($user)
        ->get(route('trips.show', $trip))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('trips/show')
            ->where('trip.id', $trip->id)
            ->where('trip.name', 'Commercial Shoot')
            ->has('itinerary')
            ->has('travelers')
            ->has('documents')
            ->has('responses')
        );
});

test('curators cannot view another users trip', function () {
    $user = User::factory()->create();
    $trip = Trip::factory()->create();

    $this->actingAs($user)
        ->get(route('trips.show', $trip))
        ->assertNotFound();
});

test('curators can update their trip', function () {
    $user = User::factory()->create();
    $trip = Trip::factory()->for($user)->create(['name' => 'Old Name']);

    $this->actingAs($user)
        ->patch(route('trips.update', $trip), [
            'name' => 'New Name',
            'badge' => TripBadge::Locked->value,
        ])
        ->assertRedirect(route('trips.show', $trip));

    expect($trip->refresh()->name)->toBe('New Name')
        ->and($trip->badge)->toBe(TripBadge::Locked);
});

test('curators cannot update another users trip', function () {
    $user = User::factory()->create();
    $trip = Trip::factory()->create(['name' => 'Old Name']);

    $this->actingAs($user)
        ->patch(route('trips.update', $trip), [
            'name' => 'Hacked',
        ])
        ->assertNotFound();

    expect($trip->refresh()->name)->toBe('Old Name');
});

test('curators can delete their trip', function () {
    $user = User::factory()->create();
    $trip = Trip::factory()->for($user)->create();

    $this->actingAs($user)
        ->delete(route('trips.destroy', $trip))
        ->assertRedirect(route('dashboard'));

    $this->assertSoftDeleted($trip);
});

test('trip date range falls back to itinerary dates', function () {
    $user = User::factory()->create();
    $trip = Trip::factory()->for($user)->create([
        'start_date' => null,
        'end_date' => null,
    ]);
    ItineraryItem::factory()->for($trip)->create(['date' => '2026-01-23']);
    ItineraryItem::factory()->for($trip)->create(['date' => '2026-01-29']);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('trips.0.dateRange.startDate', '2026-01-23')
            ->where('trips.0.dateRange.endDate', '2026-01-29')
        );
});

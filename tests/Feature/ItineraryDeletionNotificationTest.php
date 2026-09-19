<?php

use App\Models\ItineraryItem;
use App\Models\Traveler;
use App\Models\Trip;
use App\Models\User;
use DefStudio\Telegraph\Facades\Telegraph;

test('deleting an item notifies assigned crew only', function () {
    Telegraph::fake();
    telegram_connected_bot();

    $user = User::factory()->create();
    $trip = Trip::factory()->for($user)->create();
    $assigned = Traveler::factory()->for($trip)->create(['name' => 'Alex Producer']);
    $bystander = Traveler::factory()->for($trip)->create(['name' => 'Sam Bystander']);
    $item = ItineraryItem::factory()->for($trip)->create([
        'title' => 'Flight Departure',
        'assigned_traveler_ids' => [$assigned->id],
    ]);

    $this->actingAs($user)
        ->delete(route('trips.itinerary-items.destroy', [$trip, $item]))
        ->assertRedirect(route('trips.show', $trip));

    Telegraph::assertSent('Alex Producer', exact: false);
    Telegraph::assertSent('Flight Departure', exact: false);
    Telegraph::assertSent('has been deleted', exact: false);
    Telegraph::assertNotSent('Sam Bystander', exact: false);

    $this->assertSoftDeleted($item);
});

test('deleting an unassigned item notifies all trip travelers', function () {
    Telegraph::fake();
    telegram_connected_bot();

    $user = User::factory()->create();
    $trip = Trip::factory()->for($user)->create();
    Traveler::factory()->for($trip)->create(['name' => 'Alex Producer']);
    Traveler::factory()->for($trip)->create(['name' => 'Sam Director']);
    $item = ItineraryItem::factory()->for($trip)->create(['assigned_traveler_ids' => []]);

    $this->actingAs($user)
        ->delete(route('trips.itinerary-items.destroy', [$trip, $item]))
        ->assertRedirect(route('trips.show', $trip));

    Telegraph::assertSent('Alex Producer', exact: false);
    Telegraph::assertSent('Sam Director', exact: false);
});

test('deleting an item sends nothing when no chat is registered', function () {
    Telegraph::fake();

    $user = User::factory()->create();
    $trip = Trip::factory()->for($user)->create();
    $traveler = Traveler::factory()->for($trip)->create();
    $item = ItineraryItem::factory()->for($trip)->create(['assigned_traveler_ids' => [$traveler->id]]);

    $this->actingAs($user)
        ->delete(route('trips.itinerary-items.destroy', [$trip, $item]))
        ->assertRedirect(route('trips.show', $trip));

    Telegraph::assertNothingSent();

    $this->assertSoftDeleted($item);
});

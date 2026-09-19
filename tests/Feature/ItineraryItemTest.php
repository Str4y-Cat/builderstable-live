<?php

use App\Enums\ItineraryItemType;
use App\Models\ItineraryItem;
use App\Models\ItineraryTask;
use App\Models\Trip;
use App\Models\User;

test('curators can add itinerary items to their trip', function () {
    $user = User::factory()->create();
    $trip = Trip::factory()->for($user)->create();

    $this->actingAs($user)
        ->post(route('trips.itinerary-items.store', $trip), [
            'date' => '2026-01-23',
            'time' => '08:00',
            'title' => 'Flight Departure',
            'type' => ItineraryItemType::Flight->value,
            'location' => 'LAX',
            'tasks' => [
                ['title' => 'Check bags', 'done' => false],
            ],
        ])
        ->assertRedirect(route('trips.show', $trip));

    $item = ItineraryItem::query()->first();

    expect($item)->not->toBeNull()
        ->and($item->trip_id)->toBe($trip->id)
        ->and($item->title)->toBe('Flight Departure')
        ->and($item->type)->toBe(ItineraryItemType::Flight)
        ->and($item->itineraryTasks)->toHaveCount(1)
        ->and($item->itineraryTasks->first()->title)->toBe('Check bags');
});

test('adding an itinerary item requires a title and type', function () {
    $user = User::factory()->create();
    $trip = Trip::factory()->for($user)->create();

    $this->actingAs($user)
        ->from(route('trips.show', $trip))
        ->post(route('trips.itinerary-items.store', $trip), [
            'date' => '2026-01-23',
        ])
        ->assertRedirect(route('trips.show', $trip))
        ->assertInvalid(['title', 'type']);

    $this->assertDatabaseCount('itinerary_items', 0);
});

test('curators cannot add itinerary items to another users trip', function () {
    $user = User::factory()->create();
    $trip = Trip::factory()->create();

    $this->actingAs($user)
        ->post(route('trips.itinerary-items.store', $trip), [
            'date' => '2026-01-23',
            'title' => 'Secret',
            'type' => ItineraryItemType::Other->value,
        ])
        ->assertNotFound();

    $this->assertDatabaseCount('itinerary_items', 0);
});

test('curators can update an itinerary item and its tasks', function () {
    $user = User::factory()->create();
    $trip = Trip::factory()->for($user)->create();
    $item = ItineraryItem::factory()->for($trip)->create(['title' => 'Old title']);
    $task = ItineraryTask::factory()->for($item, 'itineraryItem')->create(['title' => 'Old task']);

    $this->actingAs($user)
        ->patch(route('trips.itinerary-items.update', [$trip, $item]), [
            'title' => 'New title',
            'tasks' => [
                ['id' => $task->id, 'title' => 'Updated task', 'done' => true],
                ['title' => 'New task', 'done' => false],
            ],
        ])
        ->assertRedirect(route('trips.show', $trip));

    expect($item->refresh()->title)->toBe('New title')
        ->and($item->itineraryTasks)->toHaveCount(2)
        ->and($task->refresh()->title)->toBe('Updated task')
        ->and($task->done)->toBeTrue();
});

test('curators can delete an itinerary item', function () {
    $user = User::factory()->create();
    $trip = Trip::factory()->for($user)->create();
    $item = ItineraryItem::factory()->for($trip)->create();

    $this->actingAs($user)
        ->delete(route('trips.itinerary-items.destroy', [$trip, $item]))
        ->assertRedirect(route('trips.show', $trip));

    $this->assertSoftDeleted($item);
});

test('itinerary items from another trip are not found', function () {
    $user = User::factory()->create();
    $trip = Trip::factory()->for($user)->create();
    $otherItem = ItineraryItem::factory()->create();

    $this->actingAs($user)
        ->patch(route('trips.itinerary-items.update', [$trip, $otherItem]), [
            'title' => 'Hacked',
        ])
        ->assertNotFound();
});

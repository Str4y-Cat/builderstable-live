<?php

use App\Enums\ItineraryItemType;
use App\Enums\ResponseStatus;
use App\Models\Document;
use App\Models\ItineraryItem;
use App\Models\Response as EntryResponse;
use App\Models\Traveler;
use App\Models\Trip;
use Inertia\Testing\AssertableInertia as Assert;

test('travelers can view their share link without logging in', function () {
    $trip = Trip::factory()->create(['name' => 'Sundance Film Festival']);
    $traveler = Traveler::factory()->for($trip)->create(['name' => 'Marcus Williams']);
    $assigned = ItineraryItem::factory()->for($trip)->create([
        'title' => 'Talent call time',
        'type' => ItineraryItemType::CallTime,
        'assigned_traveler_ids' => [$traveler->id],
    ]);
    ItineraryItem::factory()->for($trip)->create([
        'title' => 'Crew only dinner',
        'assigned_traveler_ids' => [999],
    ]);
    $document = Document::factory()->for($trip)->create(['name' => 'Talent rider.pdf']);

    $this->get(route('trips.share', $traveler))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('trips/share')
            ->where('trip.name', 'Sundance Film Festival')
            ->where('traveler.id', $traveler->id)
            ->has('itinerary', 1)
            ->where('itinerary.0.id', $assigned->id)
            ->where('itinerary.0.title', 'Talent call time')
            ->has('documents', 1)
            ->where('documents.0.id', $document->id)
        );
});

test('an unknown share code returns 404', function () {
    $this->get(route('trips.share', ['traveler' => 'missing-code']))
        ->assertNotFound();
});

test('travelers can confirm an assigned itinerary item', function () {
    $trip = Trip::factory()->create();
    $traveler = Traveler::factory()->for($trip)->create();
    $item = ItineraryItem::factory()->for($trip)->create([
        'assigned_traveler_ids' => [],
    ]);

    $this->post(route('trips.respond', $traveler), [
        'itinerary_item_id' => $item->id,
        'status' => ResponseStatus::Confirmed->value,
    ])->assertRedirect(route('trips.share', $traveler));

    $response = EntryResponse::query()->first();

    expect($response)->not->toBeNull()
        ->and($response->traveler_id)->toBe($traveler->id)
        ->and($response->itinerary_item_id)->toBe($item->id)
        ->and($response->status)->toBe(ResponseStatus::Confirmed)
        ->and($response->responded_at)->not->toBeNull();
});

test('travelers cannot respond to items they are not assigned to', function () {
    $trip = Trip::factory()->create();
    $traveler = Traveler::factory()->for($trip)->create();
    $item = ItineraryItem::factory()->for($trip)->create([
        'assigned_traveler_ids' => [999],
    ]);

    $this->from(route('trips.share', $traveler))
        ->post(route('trips.respond', $traveler), [
            'itinerary_item_id' => $item->id,
            'status' => ResponseStatus::Confirmed->value,
        ])
        ->assertRedirect(route('trips.share', $traveler))
        ->assertInvalid(['itinerary_item_id']);

    $this->assertDatabaseCount('responses', 0);
});

test('travelers cannot set a pending response', function () {
    $trip = Trip::factory()->create();
    $traveler = Traveler::factory()->for($trip)->create();
    $item = ItineraryItem::factory()->for($trip)->create();

    $this->from(route('trips.share', $traveler))
        ->post(route('trips.respond', $traveler), [
            'itinerary_item_id' => $item->id,
            'status' => ResponseStatus::Pending->value,
        ])
        ->assertRedirect(route('trips.share', $traveler))
        ->assertInvalid(['status']);
});

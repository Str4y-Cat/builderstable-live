<?php

use App\Enums\ItineraryItemType;
use App\Models\ItineraryItem;
use App\Models\Traveler;
use App\Models\Trip;
use App\Models\User;
use DefStudio\Telegraph\Facades\Telegraph;
use DefStudio\Telegraph\Models\TelegraphBot;
use DefStudio\Telegraph\Models\TelegraphChat;

function telegram_connected_bot(): TelegraphBot
{
    $bot = TelegraphBot::factory()->create(['token' => 'test-bot-token']);
    TelegraphChat::factory()->for($bot, 'bot')->create(['chat_id' => '123456789']);

    return $bot;
}

function itinerary_assign_payload(array $overrides = []): array
{
    return array_merge([
        'date' => '2026-01-23',
        'time' => '08:00',
        'title' => 'Flight Departure',
        'type' => ItineraryItemType::Flight->value,
        'assigned_traveler_ids' => [],
    ], $overrides);
}

function callback_payload(int $travelerId, int $itemId, string $action): array
{
    return [
        'update_id' => 1,
        'callback_query' => [
            'id' => 1,
            'from' => ['id' => 123456789, 'first_name' => 'Alex'],
            'message' => [
                'message_id' => 1,
                'date' => now()->getTimestamp(),
                'chat' => ['id' => 123456789, 'type' => 'private'],
                'text' => 'Assignment request',
            ],
            'data' => "action:{$action};traveler_id:{$travelerId};itinerary_item_id:{$itemId}",
        ],
    ];
}

test('storing an item with assigned travelers sends a telegram confirmation when auto notify is on', function () {
    Telegraph::fake();
    telegram_connected_bot();

    $user = User::factory()->create();
    $trip = Trip::factory()->for($user)->create(['auto_notify_on_assign' => true]);
    $traveler = Traveler::factory()->for($trip)->create(['name' => 'Alex Producer']);

    $this->actingAs($user)
        ->post(route('trips.itinerary-items.store', $trip), itinerary_assign_payload([
            'assigned_traveler_ids' => [$traveler->id],
        ]))
        ->assertRedirect(route('trips.show', $trip));

    Telegraph::assertSent('Alex Producer', exact: false);
    Telegraph::assertSent('Flight Departure', exact: false);
});

test('storing an item does not send a telegram confirmation when auto notify is off', function () {
    Telegraph::fake();
    telegram_connected_bot();

    $user = User::factory()->create();
    $trip = Trip::factory()->for($user)->create();
    $traveler = Traveler::factory()->for($trip)->create();

    $this->actingAs($user)
        ->post(route('trips.itinerary-items.store', $trip), itinerary_assign_payload([
            'assigned_traveler_ids' => [$traveler->id],
        ]))
        ->assertRedirect(route('trips.show', $trip));

    Telegraph::assertNothingSent();
});

test('storing an item sends nothing when no chat is registered', function () {
    Telegraph::fake();

    $user = User::factory()->create();
    $trip = Trip::factory()->for($user)->create(['auto_notify_on_assign' => true]);
    $traveler = Traveler::factory()->for($trip)->create();

    $this->actingAs($user)
        ->post(route('trips.itinerary-items.store', $trip), itinerary_assign_payload([
            'assigned_traveler_ids' => [$traveler->id],
        ]))
        ->assertRedirect(route('trips.show', $trip));

    Telegraph::assertNothingSent();
});

test('updating an item notifies only newly assigned travelers when auto notify is on', function () {
    Telegraph::fake();
    telegram_connected_bot();

    $user = User::factory()->create();
    $trip = Trip::factory()->for($user)->create(['auto_notify_on_assign' => true]);
    $existing = Traveler::factory()->for($trip)->create(['name' => 'Existing Traveler']);
    $added = Traveler::factory()->for($trip)->create(['name' => 'New Traveler']);
    $item = ItineraryItem::factory()->for($trip)->create(['assigned_traveler_ids' => [$existing->id]]);

    $this->actingAs($user)
        ->patch(route('trips.itinerary-items.update', [$trip, $item]), [
            'assigned_traveler_ids' => [$existing->id, $added->id],
        ])
        ->assertRedirect(route('trips.show', $trip));

    Telegraph::assertSent('New Traveler', exact: false);
    Telegraph::assertNotSent('Existing Traveler', exact: false);
});

test('updating an item with the same assignment sends nothing', function () {
    Telegraph::fake();
    telegram_connected_bot();

    $user = User::factory()->create();
    $trip = Trip::factory()->for($user)->create(['auto_notify_on_assign' => true]);
    $traveler = Traveler::factory()->for($trip)->create();
    $item = ItineraryItem::factory()->for($trip)->create(['assigned_traveler_ids' => [$traveler->id]]);

    $this->actingAs($user)
        ->patch(route('trips.itinerary-items.update', [$trip, $item]), [
            'assigned_traveler_ids' => [$traveler->id],
        ])
        ->assertRedirect(route('trips.show', $trip));

    Telegraph::assertNothingSent();
});

test('removing a traveler from an item sends no notification', function () {
    Telegraph::fake();
    telegram_connected_bot();

    $user = User::factory()->create();
    $trip = Trip::factory()->for($user)->create(['auto_notify_on_assign' => true]);
    $traveler = Traveler::factory()->for($trip)->create();
    $item = ItineraryItem::factory()->for($trip)->create(['assigned_traveler_ids' => [$traveler->id]]);

    $this->actingAs($user)
        ->patch(route('trips.itinerary-items.update', [$trip, $item]), [
            'assigned_traveler_ids' => [],
        ])
        ->assertRedirect(route('trips.show', $trip));

    Telegraph::assertNothingSent();
});

test('a confirm callback creates a confirmed response for the assigned traveler', function () {
    Telegraph::fake();
    telegram_connected_bot();

    $trip = Trip::factory()->create();
    $traveler = Traveler::factory()->for($trip)->create();
    $item = ItineraryItem::factory()->for($trip)->create(['assigned_traveler_ids' => [$traveler->id]]);

    $this->post(route('telegraph.webhook', 'test-bot-token'), callback_payload($traveler->id, $item->id, 'confirmInvite'))
        ->assertNoContent();

    Telegraph::assertSent('<b>'.$traveler->name.'</b> confirmed the assignment.');
    Telegraph::assertSentData('editMessageReplyMarkup', [
        'chat_id' => '123456789',
        'message_id' => 1,
        'reply_markup' => '',
    ]);

    $this->assertDatabaseHas('responses', [
        'itinerary_item_id' => $item->id,
        'traveler_id' => $traveler->id,
        'status' => 'confirmed',
    ])->assertDatabaseCount('responses', 1);
});

test('a decline callback creates a declined response for the assigned traveler', function () {
    Telegraph::fake();
    telegram_connected_bot();

    $trip = Trip::factory()->create();
    $traveler = Traveler::factory()->for($trip)->create();
    $item = ItineraryItem::factory()->for($trip)->create(['assigned_traveler_ids' => [$traveler->id]]);

    $this->post(route('telegraph.webhook', 'test-bot-token'), callback_payload($traveler->id, $item->id, 'declineInvite'))
        ->assertNoContent();

    Telegraph::assertSent('<b>'.$traveler->name.'</b> declined the assignment.');
    Telegraph::assertSentData('editMessageReplyMarkup', [
        'chat_id' => '123456789',
        'message_id' => 1,
        'reply_markup' => '',
    ]);

    $this->assertDatabaseHas('responses', [
        'itinerary_item_id' => $item->id,
        'traveler_id' => $traveler->id,
        'status' => 'declined',
    ])->assertDatabaseCount('responses', 1);
});

test('a callback for a traveler from another trip writes no response', function () {
    Telegraph::fake();
    telegram_connected_bot();

    $trip = Trip::factory()->create();
    $otherTrip = Trip::factory()->create();
    $traveler = Traveler::factory()->for($otherTrip)->create();
    $item = ItineraryItem::factory()->for($trip)->create(['assigned_traveler_ids' => [$traveler->id]]);

    $this->post(route('telegraph.webhook', 'test-bot-token'), callback_payload($traveler->id, $item->id, 'confirmInvite'))
        ->assertNoContent();

    Telegraph::assertSentData('editMessageReplyMarkup', [
        'chat_id' => '123456789',
        'message_id' => 1,
        'reply_markup' => '',
    ]);

    $this->assertDatabaseCount('responses', 0);
});

test('a callback for an item from another trip writes no response', function () {
    Telegraph::fake();
    telegram_connected_bot();

    $trip = Trip::factory()->create();
    $otherTrip = Trip::factory()->create();
    $traveler = Traveler::factory()->for($trip)->create();
    $item = ItineraryItem::factory()->for($otherTrip)->create(['assigned_traveler_ids' => [$traveler->id]]);

    $this->post(route('telegraph.webhook', 'test-bot-token'), callback_payload($traveler->id, $item->id, 'confirmInvite'))
        ->assertNoContent();

    Telegraph::assertSentData('editMessageReplyMarkup', [
        'chat_id' => '123456789',
        'message_id' => 1,
        'reply_markup' => '',
    ]);

    $this->assertDatabaseCount('responses', 0);
});

test('a callback for an unassigned traveler writes no response', function () {
    Telegraph::fake();
    telegram_connected_bot();

    $trip = Trip::factory()->create();
    $assigned = Traveler::factory()->for($trip)->create();
    $unassigned = Traveler::factory()->for($trip)->create();
    $item = ItineraryItem::factory()->for($trip)->create(['assigned_traveler_ids' => [$assigned->id]]);

    $this->post(route('telegraph.webhook', 'test-bot-token'), callback_payload($unassigned->id, $item->id, 'confirmInvite'))
        ->assertNoContent();

    Telegraph::assertSentData('editMessageReplyMarkup', [
        'chat_id' => '123456789',
        'message_id' => 1,
        'reply_markup' => '',
    ]);

    $this->assertDatabaseCount('responses', 0);
});

test('a callback for a missing traveler writes no response', function () {
    Telegraph::fake();
    telegram_connected_bot();

    $trip = Trip::factory()->create();
    $item = ItineraryItem::factory()->for($trip)->create();

    $this->post(route('telegraph.webhook', 'test-bot-token'), callback_payload(9999, $item->id, 'confirmInvite'))
        ->assertNoContent();

    Telegraph::assertSentData('editMessageReplyMarkup', [
        'chat_id' => '123456789',
        'message_id' => 1,
        'reply_markup' => '',
    ]);

    $this->assertDatabaseCount('responses', 0);
});

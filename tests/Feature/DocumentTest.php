<?php

use App\Models\Document;
use App\Models\Trip;
use App\Models\User;

test('curators can add a document to their trip', function () {
    $user = User::factory()->create();
    $trip = Trip::factory()->for($user)->create();

    $this->actingAs($user)
        ->post(route('trips.documents.store', $trip), [
            'name' => 'Call sheet.pdf',
            'url' => 'https://example.com/call-sheet.pdf',
            'type' => 'application/pdf',
            'pinned' => true,
        ])
        ->assertRedirect(route('trips.show', $trip));

    $document = Document::query()->first();

    expect($document)->not->toBeNull()
        ->and($document->trip_id)->toBe($trip->id)
        ->and($document->name)->toBe('Call sheet.pdf')
        ->and($document->pinned)->toBeTrue();
});

test('adding a document requires a name and url', function () {
    $user = User::factory()->create();
    $trip = Trip::factory()->for($user)->create();

    $this->actingAs($user)
        ->from(route('trips.show', $trip))
        ->post(route('trips.documents.store', $trip), [])
        ->assertRedirect(route('trips.show', $trip))
        ->assertInvalid(['name', 'url', 'type']);
});

test('curators cannot add documents to another users trip', function () {
    $user = User::factory()->create();
    $trip = Trip::factory()->create();

    $this->actingAs($user)
        ->post(route('trips.documents.store', $trip), [
            'name' => 'Call sheet.pdf',
            'url' => 'https://example.com/call-sheet.pdf',
            'type' => 'application/pdf',
        ])
        ->assertNotFound();

    $this->assertDatabaseCount('documents', 0);
});

test('curators can update and delete documents', function () {
    $user = User::factory()->create();
    $trip = Trip::factory()->for($user)->create();
    $document = Document::factory()->for($trip)->create(['pinned' => false]);

    $this->actingAs($user)
        ->patch(route('trips.documents.update', [$trip, $document]), [
            'pinned' => true,
        ])
        ->assertRedirect(route('trips.show', $trip));

    expect($document->refresh()->pinned)->toBeTrue();

    $this->actingAs($user)
        ->delete(route('trips.documents.destroy', [$trip, $document]))
        ->assertRedirect(route('trips.show', $trip));

    $this->assertDatabaseMissing('documents', ['id' => $document->id]);
});

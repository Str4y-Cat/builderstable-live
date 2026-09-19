<?php

use App\Models\Trip;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('visitors can visit the dashboard without authenticating', function () {
    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('dashboard lists only the authenticated user trips', function () {
    $user = User::factory()->create();
    $ownTrip = Trip::factory()->for($user)->create(['name' => 'Sundance Film Festival']);
    Trip::factory()->create(['name' => 'Someone Else Trip']);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has('trips', 1)
            ->where('trips.0.id', $ownTrip->id)
            ->where('trips.0.name', 'Sundance Film Festival')
        );
});

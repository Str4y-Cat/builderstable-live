<?php

use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());
});

test('registration screen redirects visitors to the dashboard', function () {
    $response = $this->get(route('register'));

    $response->assertRedirect(route('dashboard'));
});

test('registration attempt redirects visitors to the dashboard', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertRedirect(route('dashboard'));
});

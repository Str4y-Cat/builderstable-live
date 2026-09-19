<?php

use App\Models\User;
use Illuminate\Support\Facades\Notification;
use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::resetPasswords());
});

test('reset password link screen redirects to the dashboard', function () {
    $response = $this->get(route('password.request'));

    $response->assertRedirect(route('dashboard'));
});

test('reset password link cannot be requested while authenticated', function () {
    Notification::fake();

    $user = User::factory()->create();

    $response = $this->post(route('password.email'), ['email' => $user->email]);

    $response->assertRedirect(route('dashboard'));

    Notification::assertNothingSent();
});

test('reset password screen redirects to the dashboard', function () {
    $response = $this->get(route('password.reset', 'token'));

    $response->assertRedirect(route('dashboard'));
});

test('password cannot be reset directly while authenticated', function () {
    $response = $this->post(route('password.update'), [
        'token' => 'token',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertRedirect(route('dashboard'));
});

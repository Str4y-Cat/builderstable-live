<?php

namespace App\Http\Controllers;

use App\Models\Trip;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        $trips = $user->trips()
            ->withCount(['travelers', 'itineraryItems'])
            ->withMin('itineraryItems', 'date')
            ->withMax('itineraryItems', 'date')
            ->latest()
            ->get()
            ->map(fn (Trip $trip): array => $trip->toDashboardArray())
            ->values();

        return Inertia::render('dashboard', [
            'trips' => $trips,
        ]);
    }
}

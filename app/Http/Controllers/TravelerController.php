<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTravelerRequest;
use App\Http\Requests\UpdateTravelerRequest;
use App\Models\Traveler;
use App\Models\Trip;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class TravelerController extends Controller
{
    public function store(StoreTravelerRequest $request, Trip $trip): RedirectResponse
    {
        $trip->travelers()->create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Traveler added.')]);

        return to_route('trips.show', $trip);
    }

    public function update(UpdateTravelerRequest $request, Trip $trip, Traveler $traveler): RedirectResponse
    {
        $traveler->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Traveler updated.')]);

        return to_route('trips.show', $trip);
    }

    public function destroy(Trip $trip, Traveler $traveler): RedirectResponse
    {
        Gate::authorize('update', $trip);

        $traveler->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Traveler removed.')]);

        return to_route('trips.show', $trip);
    }
}

<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTripRequest;
use App\Http\Requests\UpdateTripRequest;
use App\Models\Document;
use App\Models\ItineraryItem;
use App\Models\Response as EntryResponse;
use App\Models\Traveler;
use App\Models\Trip;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class TripController extends Controller
{
    public function store(StoreTripRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $trip = $user->trips()->create([
            ...$request->safe()->except(['description']),
            'description' => $request->validated('description') ?? '',
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Trip created.')]);

        return to_route('trips.show', $trip);
    }

    public function show(Trip $trip): Response
    {
        Gate::authorize('view', $trip);

        $trip->load([
            'travelers',
            'documents',
            'itineraryItems' => fn ($query) => $query->orderBy('date')->orderBy('time'),
            'itineraryItems.itineraryTasks',
            'itineraryItems.responses',
        ]);

        $trip->itineraryItems->each(fn (ItineraryItem $item) => $item->setRelation('trip', $trip));

        return Inertia::render('trips/show', [
            'trip' => $trip->toDetailArray(),
            'itinerary' => $trip->itineraryItems->map(fn (ItineraryItem $item): array => $item->toArrayForTrip())->values(),
            'travelers' => $trip->travelers->map(fn (Traveler $traveler): array => $traveler->toArrayForTrip())->values(),
            'documents' => $trip->documents->map(fn (Document $document): array => $document->toArrayForTrip())->values(),
            'responses' => $trip->itineraryItems
                ->flatMap(fn (ItineraryItem $item) => $item->responses)
                ->map(fn (EntryResponse $response): array => $response->toArrayForTrip())
                ->values(),
        ]);
    }

    public function update(UpdateTripRequest $request, Trip $trip): RedirectResponse
    {
        $trip->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Trip updated.')]);

        return to_route('trips.show', $trip);
    }

    public function destroy(Trip $trip): RedirectResponse
    {
        Gate::authorize('delete', $trip);

        $trip->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Trip deleted.')]);

        return to_route('dashboard');
    }
}

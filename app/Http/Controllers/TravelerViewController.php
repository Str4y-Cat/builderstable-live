<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\ItineraryItem;
use App\Models\Response as EntryResponse;
use App\Models\Traveler;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class TravelerViewController extends Controller
{
    public function show(Traveler $traveler): Response
    {
        $trip = $traveler->trip()->with([
            'travelers',
            'documents',
            'itineraryItems' => fn ($query) => $query->orderBy('date')->orderBy('time'),
            'itineraryItems.itineraryTasks',
            'itineraryItems.responses' => fn ($query) => $query->where('traveler_id', $traveler->id),
        ])->first();

        if ($trip === null) {
            throw new NotFoundHttpException;
        }

        $trip->itineraryItems->each(fn (ItineraryItem $item) => $item->setRelation('trip', $trip));

        $itinerary = $trip->itineraryItems
            ->filter(fn (ItineraryItem $item): bool => $item->isAssignedTo($traveler))
            ->values();

        $documents = $trip->documents
            ->filter(fn (Document $document): bool => $document->isAssignedTo($traveler))
            ->values();

        return Inertia::render('trips/share', [
            'trip' => $trip->toDetailArray(),
            'traveler' => $traveler->toArrayForTrip(),
            'itinerary' => $itinerary->map(fn (ItineraryItem $item): array => $item->toArrayForTrip())->values(),
            'documents' => $documents->map(fn (Document $document): array => $document->toArrayForTrip())->values(),
            'responses' => $itinerary
                ->flatMap(fn (ItineraryItem $item) => $item->responses)
                ->map(fn (EntryResponse $response): array => $response->toArrayForTrip())
                ->values(),
        ]);
    }
}

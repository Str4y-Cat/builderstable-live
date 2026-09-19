<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDocumentRequest;
use App\Http\Requests\UpdateDocumentRequest;
use App\Models\Document;
use App\Models\Trip;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class DocumentController extends Controller
{
    public function store(StoreDocumentRequest $request, Trip $trip): RedirectResponse
    {
        $trip->documents()->create([
            ...$request->validated(),
            'assigned_traveler_ids' => $request->validated('assigned_traveler_ids') ?? [],
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Document added.')]);

        return to_route('trips.show', $trip);
    }

    public function update(UpdateDocumentRequest $request, Trip $trip, Document $document): RedirectResponse
    {
        $document->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Document updated.')]);

        return to_route('trips.show', $trip);
    }

    public function destroy(Trip $trip, Document $document): RedirectResponse
    {
        Gate::authorize('update', $trip);

        $document->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Document removed.')]);

        return to_route('trips.show', $trip);
    }
}

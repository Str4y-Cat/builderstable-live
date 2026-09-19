<?php

namespace App\Http\Controllers;

use App\Enums\ResponseStatus;
use App\Http\Requests\StoreTravelerResponseRequest;
use App\Models\Response as EntryResponse;
use App\Models\Traveler;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class ResponseController extends Controller
{
    public function store(StoreTravelerResponseRequest $request, Traveler $traveler): RedirectResponse
    {
        $status = ResponseStatus::from($request->validated('status'));

        EntryResponse::query()->updateOrCreate(
            [
                'itinerary_item_id' => $request->integer('itinerary_item_id'),
                'traveler_id' => $traveler->id,
            ],
            [
                'status' => $status,
                'responded_at' => now(),
            ],
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Response saved.')]);

        return to_route('trips.share', $traveler);
    }
}

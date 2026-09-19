<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreItineraryItemRequest;
use App\Http\Requests\UpdateItineraryItemRequest;
use App\Models\ItineraryItem;
use App\Models\Trip;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ItineraryItemController extends Controller
{
    public function store(StoreItineraryItemRequest $request, Trip $trip): RedirectResponse
    {
        $item = $trip->itineraryItems()->create($this->itemAttributes($request->validated(), creating: true));

        $this->syncTasks($item, $request->validated('tasks') ?? []);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Itinerary item added.')]);

        return to_route('trips.show', $trip);
    }

    public function update(UpdateItineraryItemRequest $request, Trip $trip, ItineraryItem $itineraryItem): RedirectResponse
    {
        $validated = $request->validated();

        $itineraryItem->update($this->itemAttributes($validated, creating: false));

        if (array_key_exists('tasks', $validated)) {
            $this->syncTasks($itineraryItem, $validated['tasks'] ?? []);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Itinerary item updated.')]);

        return to_route('trips.show', $trip);
    }

    public function destroy(Trip $trip, ItineraryItem $itineraryItem): RedirectResponse
    {
        Gate::authorize('update', $trip);

        $itineraryItem->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Itinerary item deleted.')]);

        return to_route('trips.show', $trip);
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function itemAttributes(array $validated, bool $creating): array
    {
        $attributes = collect($validated)->except('tasks')->all();

        if ($creating || array_key_exists('assigned_traveler_ids', $validated)) {
            $attributes['assigned_traveler_ids'] = $validated['assigned_traveler_ids'] ?? [];
        }

        if ($creating || array_key_exists('document_ids', $validated)) {
            $attributes['document_ids'] = $validated['document_ids'] ?? [];
        }

        return $attributes;
    }

    /**
     * @param  list<array{id?: int, title: string, done?: bool}>  $tasks
     */
    private function syncTasks(ItineraryItem $item, array $tasks): void
    {
        $keep = [];

        foreach ($tasks as $task) {
            if (isset($task['id'])) {
                $existing = $item->itineraryTasks()->whereKey($task['id'])->first();

                if ($existing) {
                    $existing->update([
                        'title' => $task['title'],
                        'done' => $task['done'] ?? false,
                    ]);
                    $keep[] = $existing->id;

                    continue;
                }
            }

            $created = $item->itineraryTasks()->create([
                'title' => $task['title'],
                'done' => $task['done'] ?? false,
            ]);
            $keep[] = $created->id;
        }

        $item->itineraryTasks()->whereNotIn('id', $keep)->delete();
    }
}

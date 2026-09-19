<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreItineraryItemRequest;
use App\Http\Requests\UpdateItineraryItemRequest;
use App\Models\ItineraryItem;
use App\Models\Trip;
use DefStudio\Telegraph\Facades\Telegraph;
use DefStudio\Telegraph\Keyboard\Button;
use DefStudio\Telegraph\Keyboard\Keyboard;
use DefStudio\Telegraph\Models\TelegraphBot;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ItineraryItemController extends Controller
{
    public function store(StoreItineraryItemRequest $request, Trip $trip): RedirectResponse
    {
        $item = $trip->itineraryItems()->create($this->itemAttributes($request->validated(), creating: true));

        $this->syncTasks($item, $request->validated('tasks') ?? []);

        $this->sendAssignmentInvites($trip, $item, $request->validated('assigned_traveler_ids') ?? []);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Itinerary item added.')]);

        return to_route('trips.show', $trip);
    }

    public function update(UpdateItineraryItemRequest $request, Trip $trip, ItineraryItem $itineraryItem): RedirectResponse
    {
        $validated = $request->validated();

        $previousAssignedIds = $itineraryItem->assigned_traveler_ids ?? [];

        $itineraryItem->update($this->itemAttributes($validated, creating: false));

        if (array_key_exists('assigned_traveler_ids', $validated)) {
            $this->sendAssignmentInvites(
                $trip,
                $itineraryItem,
                array_values(array_diff($validated['assigned_traveler_ids'], $previousAssignedIds)),
            );
        }

        if (array_key_exists('tasks', $validated)) {
            $this->syncTasks($itineraryItem, $validated['tasks'] ?? []);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Itinerary item updated.')]);

        return to_route('trips.show', $trip);
    }

    public function destroy(Trip $trip, ItineraryItem $itineraryItem): RedirectResponse
    {
        Gate::authorize('update', $trip);

        $this->sendDeletionNotices($trip, $itineraryItem);

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

    /**
     * @param  list<int>  $addedTravelerIds
     */
    private function sendAssignmentInvites(Trip $trip, ItineraryItem $item, array $addedTravelerIds): void
    {
        if (! $trip->auto_notify_on_assign || $addedTravelerIds === []) {
            return;
        }

        $chat = TelegraphBot::query()->first()?->chats()->first();

        if ($chat === null) {
            return;
        }

        $travelers = $trip->travelers()
            ->whereKey($addedTravelerIds)
            ->get()
            ->keyBy('id');

        foreach ($addedTravelerIds as $travelerId) {
            $traveler = $travelers->get($travelerId);

            if ($traveler === null) {
                continue;
            }

            $dateLabel = $item->date?->toDateString();

            $text = sprintf(
                '%s invites <b>%s</b> to %s%s%s. Please confirm or decline.',
                e($trip->name),
                e($traveler->name),
                e($item->title),
                $dateLabel !== null ? " on {$dateLabel}" : '',
                $item->time !== null ? " at {$item->time}" : '',
            );

            $keyboard = Keyboard::make()->row([
                Button::make('Confirm')->action('confirmInvite')
                    ->param('traveler_id', $traveler->id)
                    ->param('itinerary_item_id', $item->id),
                Button::make('Decline')->action('declineInvite')
                    ->param('traveler_id', $traveler->id)
                    ->param('itinerary_item_id', $item->id),
            ]);

            Telegraph::chat($chat)->html($text)->keyboard($keyboard)->send();
        }
    }

    private function sendDeletionNotices(Trip $trip, ItineraryItem $item): void
    {
        $chat = TelegraphBot::query()->first()?->chats()->first();

        if ($chat === null) {
            return;
        }

        $assignedIds = $item->assigned_traveler_ids ?? [];

        $travelers = $assignedIds === []
            ? $trip->travelers()->get()
            : $trip->travelers()->whereKey($assignedIds)->get();

        foreach ($travelers as $traveler) {
            $dateLabel = $item->date?->toDateString();

            $text = sprintf(
                '%s: <b>%s</b>, the itinerary item %s%s%s has been deleted.',
                e($trip->name),
                e($traveler->name),
                e($item->title),
                $dateLabel !== null ? " on {$dateLabel}" : '',
                $item->time !== null ? " at {$item->time}" : '',
            );

            Telegraph::chat($chat)->html($text)->send();
        }
    }
}

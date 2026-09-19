<?php

namespace Database\Seeders;

use App\Enums\ResponseStatus;
use App\Enums\TripBadge;
use App\Enums\TripTag;
use App\Models\Response as TravelerResponse;
use App\Models\Trip;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use RuntimeException;

class DemoTripSeeder extends Seeder
{
    /**
     * Seed trips from the Vue mockup demo data.
     */
    public function run(): void
    {
        $user = User::query()->firstOr(fn () => User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]));

        $payload = json_decode(
            (string) file_get_contents(base_path('mock/src/data/mockData.json')),
            true,
            flags: JSON_THROW_ON_ERROR,
        );

        $trips = $payload['trips'] ?? throw new RuntimeException('mockData.json is missing a "trips" key.');

        foreach ($trips as $trip) {
            $this->createTrip($user, $trip);
        }
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function createTrip(User $user, array $data): void
    {
        $trip = Trip::query()->create([
            'user_id' => $user->id,
            'name' => $data['name'],
            'destination' => $data['destination'] ?? null,
            'start_date' => $data['startDate'] ?? null,
            'end_date' => $data['endDate'] ?? null,
            'description' => $data['description'] ?? '',
            'badge' => TripBadge::from($data['badge']),
            'tags' => array_map(
                fn (string $tag): TripTag => TripTag::from($tag),
                $data['tags'] ?? [],
            ),
            'auto_notify_on_assign' => $data['autoNotifyOnAssign'] ?? false,
        ]);

        $travelerIds = [];
        foreach ($data['travelers'] ?? [] as $traveler) {
            $travelerIds[$traveler['id']] = $trip->travelers()->create([
                'name' => $traveler['name'],
                'email' => $traveler['email'],
                'phone' => $traveler['phone'] ?? null,
                'role_on_production' => $traveler['roleOnProduction'],
                'share_code' => $traveler['shareCode'],
            ])->id;
        }

        $documentIds = [];
        foreach ($data['documents'] ?? [] as $document) {
            $documentIds[$document['id']] = $trip->documents()->create([
                'name' => $document['name'],
                'url' => $document['url'],
                'type' => $document['type'],
                'assigned_traveler_ids' => $this->mapIds($document['assignedTravelerIds'] ?? [], $travelerIds),
                'pinned' => $document['pinned'] ?? false,
            ])->id;
        }

        $itemIds = [];
        foreach ($data['itinerary'] ?? [] as $item) {
            $model = $trip->itineraryItems()->create([
                'date' => $item['date'],
                'time' => $item['time'] ?? null,
                'title' => $item['title'],
                'description' => $item['description'] ?? null,
                'location' => $item['location'] ?? null,
                'type' => $item['type'],
                'assigned_traveler_ids' => $this->mapIds($item['assignedTravelerIds'] ?? [], $travelerIds),
                'document_ids' => $this->mapIds($item['documentIds'] ?? [], $documentIds),
            ]);

            $itemIds[$item['id']] = $model->id;

            foreach ($item['tasks'] ?? [] as $task) {
                $model->itineraryTasks()->create([
                    'title' => $task['title'],
                    'done' => $task['done'] ?? false,
                ]);
            }
        }

        foreach ($data['responses'] ?? [] as $response) {
            TravelerResponse::query()->create([
                'itinerary_item_id' => $itemIds[$response['itineraryItemId']] ?? throw new RuntimeException('Unknown response itinerary item id.'),
                'traveler_id' => $travelerIds[$response['travelerId']] ?? throw new RuntimeException('Unknown response traveler id.'),
                'status' => ResponseStatus::from($response['status']),
                'responded_at' => isset($response['respondedAt'])
                    ? Carbon::parse($response['respondedAt'])
                    : null,
            ]);
        }
    }

    /**
     * @param  array<string, string>  $ids
     * @param  array<string, int>  $map
     * @return list<int>
     */
    private function mapIds(array $ids, array $map): array
    {
        return array_values(array_map(
            fn (string $id): int => $map[$id] ?? throw new RuntimeException("Unknown mock id [{$id}]."),
            $ids,
        ));
    }
}

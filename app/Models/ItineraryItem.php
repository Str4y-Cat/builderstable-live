<?php

namespace App\Models;

use App\Enums\ItineraryItemType;
use App\Enums\ResponseStatus;
use Database\Factories\ItineraryItemFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

class ItineraryItem extends Model
{
    /** @use HasFactory<ItineraryItemFactory> */
    use HasFactory, SoftDeletes;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'trip_id',
        'date',
        'time',
        'title',
        'description',
        'location',
        'type',
        'assigned_traveler_ids',
        'document_ids',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date' => 'date',
            'type' => ItineraryItemType::class,
            'assigned_traveler_ids' => 'array',
            'document_ids' => 'array',
        ];
    }

    public function isAssignedTo(Traveler $traveler): bool
    {
        $assignedIds = $this->assigned_traveler_ids ?? [];

        return $assignedIds === [] || collect($assignedIds)->contains(fn (mixed $id): bool => (int) $id === $traveler->id);
    }

    /**
     * @return array{confirmed: int, declined: int, pending: int, total: int}
     */
    public function responseRollup(): array
    {
        $assignedIds = $this->assigned_traveler_ids ?? [];
        $total = $assignedIds === []
            ? $this->trip->travelers->count()
            : count($assignedIds);

        $responses = $this->relationLoaded('responses')
            ? $this->responses
            : $this->responses()->get();

        $confirmed = $responses->where('status', ResponseStatus::Confirmed)->count();
        $declined = $responses->where('status', ResponseStatus::Declined)->count();

        return [
            'confirmed' => $confirmed,
            'declined' => $declined,
            'pending' => max(0, $total - $confirmed - $declined),
            'total' => $total,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArrayForTrip(): array
    {
        $time = $this->time;

        if (is_string($time) && str_contains($time, ':')) {
            $time = Carbon::parse($time)->format('H:i');
        }

        return [
            'id' => $this->id,
            'date' => $this->date?->toDateString(),
            'time' => $time,
            'title' => $this->title,
            'description' => $this->description,
            'location' => $this->location,
            'type' => $this->type->value,
            'assignedTravelerIds' => $this->assigned_traveler_ids ?? [],
            'documentIds' => $this->document_ids ?? [],
            'tasks' => $this->itineraryTasks->map(fn (ItineraryTask $task): array => $task->toArrayForItem())->values()->all(),
            'responseRollup' => $this->responseRollup(),
        ];
    }

    public function trip(): BelongsTo
    {
        return $this->belongsTo(Trip::class);
    }

    public function itineraryTasks(): HasMany
    {
        return $this->hasMany(ItineraryTask::class);
    }

    public function responses(): HasMany
    {
        return $this->hasMany(Response::class);
    }
}

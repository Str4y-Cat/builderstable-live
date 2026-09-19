<?php

namespace App\Models;

use Database\Factories\DocumentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Document extends Model
{
    /** @use HasFactory<DocumentFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'trip_id',
        'name',
        'url',
        'type',
        'assigned_traveler_ids',
        'pinned',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'assigned_traveler_ids' => 'array',
            'pinned' => 'boolean',
        ];
    }

    public function isAssignedTo(Traveler $traveler): bool
    {
        $assignedIds = $this->assigned_traveler_ids ?? [];

        return $assignedIds === [] || collect($assignedIds)->contains(fn (mixed $id): bool => (int) $id === $traveler->id);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArrayForTrip(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'url' => $this->url,
            'type' => $this->type,
            'assignedTravelerIds' => $this->assigned_traveler_ids ?? [],
            'pinned' => $this->pinned,
        ];
    }

    public function trip(): BelongsTo
    {
        return $this->belongsTo(Trip::class);
    }
}

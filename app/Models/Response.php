<?php

namespace App\Models;

use App\Enums\ResponseStatus;
use Database\Factories\ResponseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Response extends Model
{
    /** @use HasFactory<ResponseFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'itinerary_item_id',
        'traveler_id',
        'status',
        'responded_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => ResponseStatus::class,
            'responded_at' => 'datetime',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArrayForTrip(): array
    {
        return [
            'itineraryItemId' => $this->itinerary_item_id,
            'travelerId' => $this->traveler_id,
            'status' => $this->status->value,
            'respondedAt' => $this->responded_at?->toIso8601String(),
        ];
    }

    public function itineraryItem(): BelongsTo
    {
        return $this->belongsTo(ItineraryItem::class);
    }

    public function traveler(): BelongsTo
    {
        return $this->belongsTo(Traveler::class);
    }
}

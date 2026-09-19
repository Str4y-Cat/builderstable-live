<?php

namespace App\Models;

use Database\Factories\ItineraryTaskFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItineraryTask extends Model
{
    /** @use HasFactory<ItineraryTaskFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'itinerary_item_id',
        'title',
        'done',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'done' => 'boolean',
        ];
    }

    /**
     * @return array{id: int, title: string, done: bool}
     */
    public function toArrayForItem(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'done' => $this->done,
        ];
    }

    public function itineraryItem(): BelongsTo
    {
        return $this->belongsTo(ItineraryItem::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ItineraryItem extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
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
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'trip_id' => 'integer',
            'date' => 'date',
            'assigned_traveler_ids' => 'array',
            'document_ids' => 'array',
        ];
    }

    public function itineraryTasks(): HasMany
    {
        return $this->hasMany(ItineraryTask::class);
    }

    public function responses(): HasMany
    {
        return $this->hasMany(Response::class);
    }

    public function trip(): BelongsTo
    {
        return $this->belongsTo(Trip::class);
    }
}

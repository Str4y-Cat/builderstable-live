<?php

namespace App\Models;

use App\Enums\TripBadge;
use App\Enums\TripTag;
use Database\Factories\TripFactory;
use Illuminate\Database\Eloquent\Casts\AsEnumCollection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

class Trip extends Model
{
    /** @use HasFactory<TripFactory> */
    use HasFactory, SoftDeletes;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'destination',
        'start_date',
        'end_date',
        'description',
        'badge',
        'tags',
        'auto_notify_on_assign',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'badge' => TripBadge::class,
            'tags' => AsEnumCollection::of(TripTag::class),
            'auto_notify_on_assign' => 'boolean',
        ];
    }

    /**
     * @return array{startDate: string|null, endDate: string|null}
     */
    public function derivedDateRange(): array
    {
        $start = $this->start_date?->toDateString();
        $end = $this->end_date?->toDateString();

        if ($start !== null && $end !== null) {
            return [
                'startDate' => $start,
                'endDate' => $end,
            ];
        }

        if ($this->relationLoaded('itineraryItems')) {
            $dates = $this->itineraryItems
                ->pluck('date')
                ->filter()
                ->map(fn (Carbon|string $date): string => $date instanceof Carbon ? $date->toDateString() : $date);

            return [
                'startDate' => $start ?? $dates->min(),
                'endDate' => $end ?? $dates->max(),
            ];
        }

        return [
            'startDate' => $start ?? $this->aggregateDateString('itinerary_items_min_date'),
            'endDate' => $end ?? $this->aggregateDateString('itinerary_items_max_date'),
        ];
    }

    private function aggregateDateString(string $attribute): ?string
    {
        $value = $this->getAttribute($attribute);

        if ($value instanceof Carbon) {
            return $value->toDateString();
        }

        if (! is_string($value) || $value === '') {
            return null;
        }

        return Carbon::parse($value)->toDateString();
    }

    /**
     * @return array<string, mixed>
     */
    public function toDashboardArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'destination' => $this->destination,
            'dateRange' => $this->derivedDateRange(),
            'badge' => $this->badge->value,
            'tags' => collect($this->tags)->map(fn (mixed $tag): string => $tag instanceof TripTag ? $tag->value : (string) $tag)->values()->all(),
            'travelerCount' => (int) ($this->getAttribute('travelers_count') ?? $this->travelers->count()),
            'itemCount' => (int) ($this->getAttribute('itinerary_items_count') ?? $this->itineraryItems->count()),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function toDetailArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'destination' => $this->destination,
            'dateRange' => $this->derivedDateRange(),
            'description' => $this->description,
            'badge' => $this->badge->value,
            'tags' => collect($this->tags)->map(fn (mixed $tag): string => $tag instanceof TripTag ? $tag->value : (string) $tag)->values()->all(),
            'autoNotifyOnAssign' => $this->auto_notify_on_assign,
        ];
    }

    public function curator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function user(): BelongsTo
    {
        return $this->curator();
    }

    public function travelers(): HasMany
    {
        return $this->hasMany(Traveler::class);
    }

    public function itineraryItems(): HasMany
    {
        return $this->hasMany(ItineraryItem::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    public function notificationLogs(): HasMany
    {
        return $this->hasMany(NotificationLog::class);
    }
}

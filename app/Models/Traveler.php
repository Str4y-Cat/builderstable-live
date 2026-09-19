<?php

namespace App\Models;

use Database\Factories\TravelerFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Traveler extends Model
{
    /** @use HasFactory<TravelerFactory> */
    use HasFactory, SoftDeletes;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'trip_id',
        'name',
        'email',
        'phone',
        'role_on_production',
        'share_code',
    ];

    protected static function booted(): void
    {
        static::creating(function (Traveler $traveler): void {
            if (filled($traveler->share_code)) {
                return;
            }

            $traveler->share_code = static::generateShareCode($traveler->name);
        });
    }

    public static function generateShareCode(string $name): string
    {
        do {
            $slug = Str::slug(Str::words($name, 2, ''));
            $code = trim(Str::lower($slug.'-'.Str::lower(Str::random(6))), '-');
        } while (static::withTrashed()->where('share_code', $code)->exists());

        return $code;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArrayForTrip(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'roleOnProduction' => $this->role_on_production,
            'shareCode' => $this->share_code,
        ];
    }

    public function trip(): BelongsTo
    {
        return $this->belongsTo(Trip::class);
    }

    public function responses(): HasMany
    {
        return $this->hasMany(Response::class);
    }
}

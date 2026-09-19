<?php

namespace App\Http\Requests;

use App\Concerns\AuthorizesTripUpdates;
use App\Enums\TripBadge;
use App\Enums\TripTag;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTripRequest extends FormRequest
{
    use AuthorizesTripUpdates;

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'destination' => ['nullable', 'string', 'max:255'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'description' => ['nullable', 'string', 'max:280'],
            'badge' => ['sometimes', Rule::enum(TripBadge::class)],
            'tags' => ['nullable', 'array'],
            'tags.*' => [Rule::enum(TripTag::class)],
            'auto_notify_on_assign' => ['sometimes', 'boolean'],
        ];
    }
}

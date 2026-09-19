<?php

namespace App\Http\Requests;

use App\Enums\TripBadge;
use App\Enums\TripTag;
use App\Models\Trip;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTripRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Trip::class) ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
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

<?php

namespace App\Http\Requests;

use App\Concerns\AuthorizesTripUpdates;
use App\Enums\ItineraryItemType;
use App\Models\Trip;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreItineraryItemRequest extends FormRequest
{
    use AuthorizesTripUpdates;

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Trip $trip */
        $trip = $this->route('trip');

        return [
            'date' => ['required', 'date'],
            'time' => ['nullable', 'date_format:H:i'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'location' => ['nullable', 'string', 'max:255'],
            'type' => ['required', Rule::enum(ItineraryItemType::class)],
            'assigned_traveler_ids' => ['nullable', 'array'],
            'assigned_traveler_ids.*' => ['integer', Rule::exists('travelers', 'id')->where('trip_id', $trip->id)],
            'document_ids' => ['nullable', 'array'],
            'document_ids.*' => ['integer', Rule::exists('documents', 'id')->where('trip_id', $trip->id)],
            'tasks' => ['nullable', 'array'],
            'tasks.*.title' => ['required', 'string', 'max:255'],
            'tasks.*.done' => ['sometimes', 'boolean'],
        ];
    }
}

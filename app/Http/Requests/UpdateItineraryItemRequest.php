<?php

namespace App\Http\Requests;

use App\Concerns\AuthorizesTripUpdates;
use App\Enums\ItineraryItemType;
use App\Models\Trip;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateItineraryItemRequest extends FormRequest
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
            'date' => ['sometimes', 'required', 'date'],
            'time' => ['nullable', 'date_format:H:i'],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'location' => ['nullable', 'string', 'max:255'],
            'type' => ['sometimes', Rule::enum(ItineraryItemType::class)],
            'assigned_traveler_ids' => ['nullable', 'array'],
            'assigned_traveler_ids.*' => ['integer', Rule::exists('travelers', 'id')->where('trip_id', $trip->id)],
            'document_ids' => ['nullable', 'array'],
            'document_ids.*' => ['integer', Rule::exists('documents', 'id')->where('trip_id', $trip->id)],
            'tasks' => ['nullable', 'array'],
            'tasks.*.id' => ['nullable', 'integer', Rule::exists('itinerary_tasks', 'id')],
            'tasks.*.title' => ['required_with:tasks', 'string', 'max:255'],
            'tasks.*.done' => ['sometimes', 'boolean'],
        ];
    }
}

<?php

namespace App\Http\Requests;

use App\Concerns\AuthorizesTripUpdates;
use App\Models\Trip;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDocumentRequest extends FormRequest
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
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'url' => ['sometimes', 'required', 'url', 'max:500'],
            'type' => ['sometimes', 'required', 'string', 'max:100'],
            'assigned_traveler_ids' => ['nullable', 'array'],
            'assigned_traveler_ids.*' => ['integer', Rule::exists('travelers', 'id')->where('trip_id', $trip->id)],
            'pinned' => ['sometimes', 'boolean'],
        ];
    }
}

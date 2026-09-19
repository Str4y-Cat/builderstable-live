<?php

namespace App\Http\Requests;

use App\Concerns\AuthorizesTripUpdates;
use App\Models\Traveler;
use App\Models\Trip;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTravelerRequest extends FormRequest
{
    use AuthorizesTripUpdates;

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Trip $trip */
        $trip = $this->route('trip');
        /** @var Traveler $traveler */
        $traveler = $this->route('traveler');

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'required',
                'email',
                Rule::unique('travelers', 'email')
                    ->where('trip_id', $trip->id)
                    ->whereNull('deleted_at')
                    ->ignore($traveler->id),
            ],
            'phone' => ['nullable', 'string', 'max:50'],
            'role_on_production' => ['sometimes', 'required', 'string', 'max:255'],
        ];
    }
}

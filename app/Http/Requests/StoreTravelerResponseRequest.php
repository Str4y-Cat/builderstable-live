<?php

namespace App\Http\Requests;

use App\Enums\ResponseStatus;
use App\Models\ItineraryItem;
use App\Models\Traveler;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTravelerResponseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Traveler $traveler */
        $traveler = $this->route('traveler');

        return [
            'itinerary_item_id' => [
                'required',
                'integer',
                Rule::exists('itinerary_items', 'id')->where('trip_id', $traveler->trip_id),
            ],
            'status' => [
                'required',
                Rule::enum(ResponseStatus::class)->only([
                    ResponseStatus::Confirmed,
                    ResponseStatus::Declined,
                ]),
            ],
        ];
    }

    /**
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->has('itinerary_item_id')) {
                    return;
                }

                /** @var Traveler $traveler */
                $traveler = $this->route('traveler');
                $item = ItineraryItem::query()->find($this->integer('itinerary_item_id'));

                if ($item instanceof ItineraryItem && ! $item->isAssignedTo($traveler)) {
                    $validator->errors()->add('itinerary_item_id', 'This itinerary item is not assigned to you.');
                }
            },
        ];
    }
}

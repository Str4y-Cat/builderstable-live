<?php

namespace App\Concerns;

use App\Models\Trip;
use Illuminate\Support\Facades\Gate;

trait AuthorizesTripUpdates
{
    public function authorize(): bool
    {
        $trip = $this->route('trip');

        if (! $trip instanceof Trip) {
            return false;
        }

        Gate::authorize('update', $trip);

        return true;
    }
}

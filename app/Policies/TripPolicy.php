<?php

namespace App\Policies;

use App\Models\Trip;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class TripPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Trip $trip): Response
    {
        return $this->owns($user, $trip);
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Trip $trip): Response
    {
        return $this->owns($user, $trip);
    }

    public function delete(User $user, Trip $trip): Response
    {
        return $this->owns($user, $trip);
    }

    public function restore(User $user, Trip $trip): Response
    {
        return $this->owns($user, $trip);
    }

    public function forceDelete(User $user, Trip $trip): Response
    {
        return $this->owns($user, $trip);
    }

    private function owns(User $user, Trip $trip): Response
    {
        return $user->id === $trip->user_id
            ? Response::allow()
            : Response::denyAsNotFound();
    }
}

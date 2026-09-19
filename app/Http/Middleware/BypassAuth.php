<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class BypassAuth
{
    /**
     * Authenticate every request as the demo user for the hackathon.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! Auth::check()) {
            $user = User::query()->first() ?? User::factory()->create([
                'name' => 'Hackathon Demo',
                'email' => 'demo@example.com',
            ]);

            Auth::setUser($user);
        }

        return $next($request);
    }
}

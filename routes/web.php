<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\ItineraryItemController;
use App\Http\Controllers\ResponseController;
use App\Http\Controllers\TravelerController;
use App\Http\Controllers\TravelerViewController;
use App\Http\Controllers\TripController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('dashboard/trips/{trip}', [TripController::class, 'show'])->name('trips.show');
    Route::post('trips', [TripController::class, 'store'])->name('trips.store');
    Route::match(['put', 'patch'], 'trips/{trip}', [TripController::class, 'update'])->name('trips.update');
    Route::delete('trips/{trip}', [TripController::class, 'destroy'])->name('trips.destroy');

    Route::scopeBindings()->group(function () {
        Route::post('trips/{trip}/itinerary-items', [ItineraryItemController::class, 'store'])->name('trips.itinerary-items.store');
        Route::match(['put', 'patch'], 'trips/{trip}/itinerary-items/{itinerary_item}', [ItineraryItemController::class, 'update'])->name('trips.itinerary-items.update');
        Route::delete('trips/{trip}/itinerary-items/{itinerary_item}', [ItineraryItemController::class, 'destroy'])->name('trips.itinerary-items.destroy');

        Route::post('trips/{trip}/travelers', [TravelerController::class, 'store'])->name('trips.travelers.store');
        Route::match(['put', 'patch'], 'trips/{trip}/travelers/{traveler}', [TravelerController::class, 'update'])->name('trips.travelers.update');
        Route::delete('trips/{trip}/travelers/{traveler}', [TravelerController::class, 'destroy'])->name('trips.travelers.destroy');

        Route::post('trips/{trip}/documents', [DocumentController::class, 'store'])->name('trips.documents.store');
        Route::match(['put', 'patch'], 'trips/{trip}/documents/{document}', [DocumentController::class, 'update'])->name('trips.documents.update');
        Route::delete('trips/{trip}/documents/{document}', [DocumentController::class, 'destroy'])->name('trips.documents.destroy');
    });
});

Route::get('trips/{traveler:share_code}', [TravelerViewController::class, 'show'])->name('trips.share');
Route::post('trips/{traveler:share_code}/responses', [ResponseController::class, 'store'])->name('trips.respond');

require __DIR__.'/settings.php';

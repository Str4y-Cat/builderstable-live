<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::disableForeignKeyConstraints();

        Schema::create('responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('itinerary_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('traveler_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['pending', 'confirmed', 'declined'])->default('pending');
            $table->timestamp('responded_at')->nullable();
            $table->unique(['itinerary_item_id', 'traveler_id']);
            $table->timestamps();
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('responses');
    }
};

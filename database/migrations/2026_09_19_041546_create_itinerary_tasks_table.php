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

        Schema::create('itinerary_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('itinerary_item_id')->constrained()->cascadeOnDelete();
            $table->string('title', 255);
            $table->boolean('done')->default(false);
            $table->timestamps();
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('itinerary_tasks');
    }
};

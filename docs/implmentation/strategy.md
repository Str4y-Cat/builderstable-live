# Implementation Strategy: Vue Mockup → Laravel App

**Project:** TravelBuddy - Production Itinerary Management  
**Goal:** Migrate Vue 3 mockup to Laravel 13 + Inertia.js + React production app  
**Hackathon Context:** Fast iteration, context-aware development

---

## Executive Summary

We have a **fully functional Vue 3 mockup** (`/mock`) with 22 components, 3 pages, and complete UX flows. The Laravel app is a fresh install with Fortify auth. This strategy outlines a phased migration that respects context limitations while delivering a working product efficiently.

**Key Constraint:** AI context limits require working in focused vertical slices rather than loading entire codebases.

**Timeline:** 5-7 focused development sessions

**Schema tooling:** [Laravel Blueprint](https://blueprint.laravelshift.com/) generates the initial migrations, models, and factories from a single `draft.yaml` file (project root). If the schema needs to change:
```bash
# Edit draft.yaml, then:
php artisan blueprint:build -m          # -m updates existing migrations too
vendor/bin/pint --format agent app/Models database/migrations database/factories
php artisan migrate:fresh --seed        # rebuild DB from scratch
```
Blueprint only owns migrations/models/factories here — controllers, requests, and routes are hand-written in Phase 2 for full control over Inertia responses.

---

## Current State Assessment

### Mockup (`/mock`)
- ✅ Vue 3 + TypeScript + Vue Router
- ✅ shadcn-vue components (Radix UI)
- ✅ 22 production-ready components
- ✅ 3 pages (Dashboard, TripDetail, TravelerView)
- ✅ Complete TypeScript types (`src/types/index.ts`)
- ✅ Mock data with realistic production scenarios
- ✅ UX flows validated and demo-ready

### Laravel App (Current)
- ✅ Laravel 13.32.0 + PHP 8.5
- ✅ Inertia.js 3.7.1 + React 19.3.0
- ✅ Fortify authentication (login, register, 2FA, passkeys)
- ✅ Tailwind CSS 4.3.3 + shadcn-react components
- ✅ Wayfinder (typed route generation)
- ❌ **No domain models** (only User exists)
- ❌ **No domain routes** (only auth/settings)
- ❌ **No business logic**

**Gap:** Everything except auth infrastructure

---

## Migration Philosophy

### Core Principles

1. **Database First** - Schema is the contract; build it once, use everywhere
2. **Vertical Slices** - Complete one feature end-to-end before moving to next
3. **Context Isolation** - Each session focuses on 1-2 related concerns
4. **Type Safety** - Port TypeScript types to PHP early, maintain sync
5. **Component Batching** - Port 3-5 related Vue components per session
6. **Test as You Go** - Feature tests validate each slice

### Context Management Strategy

**Session Structure:**
```
1. Load minimal required context (models, routes, types)
2. Implement focused feature slice
3. Test immediately
4. Document assumptions/decisions
5. Exit cleanly (commit, summarize)
```

**Anti-Patterns to Avoid:**
- ❌ Loading all Vue components simultaneously
- ❌ Attempting full-stack features in single massive session
- ❌ Re-reading mockup files repeatedly
- ❌ Building without testing

---

## Phase 1: Foundation (Database + Models)

**Goal:** Create the data layer that everything depends on

**Tooling:** [Laravel Blueprint](https://blueprint.laravelshift.com/) — already a dev dependency (`laravel-shift/blueprint ^2.13`). Blueprint reads a single human-readable `draft.yaml` and generates migrations, Eloquent models (with `fillable`, `casts`, and relationship methods), and factories in one pass. This keeps the schema definition in one reviewable file instead of hand-writing 7 migrations + 7 models.

**Session Duration:** 1 focused session (already completed as a proof-of-concept during planning)

### Tasks

#### 1.1 Database Schema Design via `draft.yaml`
**Artifact:** `draft.yaml` (project root — this is where `blueprint:build` looks by default)

**Reference:** Mock types in `/mock/src/types/index.ts`

**Workflow:**
```bash
# 1. Define/edit models in draft.yaml
# 2. Generate migrations + models + factories
php artisan blueprint:build

# 3. Format generated code to project style
vendor/bin/pint --format agent app/Models database/migrations database/factories

# 4. Run migrations
php artisan migrate

# 5. If something's wrong, undo the last build and retry
php artisan blueprint:erase
php artisan blueprint:build
```

**Models defined (see `draft.yaml` for full spec):**
- `Trip` — core production entity, `user_id` is the curator (owner)
- `Traveler` — crew member on a trip, `share_code` is the public identifier for `/trips/{shareCode}`
- `ItineraryItem` — timeline events (flight, accommodation, activity, meal, transport, call-time, other)
- `ItineraryTask` — checklist sub-items on an itinerary item (`itinerary_item_id`, `title`, `done`)
- `Document` — files attached to a trip, optionally pinned
- `Response` — traveler confirm/decline per itinerary item (unique per item+traveler pair)
- `NotificationLog` — audit trail of sent notifications (email/telegram)

**Key Decisions:**
- `trips.user_id` → curator (owner), `onDelete:cascade`
- `travelers.share_code` → unique public identifier
- `itinerary_items.assigned_traveler_ids`, `document_ids`, `documents.assigned_traveler_ids`, `trips.tags` → **JSON columns cast to `array`**, not pivot tables. This matches the mock's data shape exactly (`string[]` of IDs) and avoids extra join tables for a hackathon timeline. Revisit as `belongsToMany` post-hackathon if query patterns demand it.
- Soft deletes on `Trip`, `Traveler`, `ItineraryItem` (curators may "remove" without losing history/audit trail)
- All child tables (`Traveler`, `ItineraryItem`, `Document`, `ItineraryTask`, `Response`, `NotificationLog`) cascade-delete with their parent
- `Response` has a composite unique index on `(itinerary_item_id, traveler_id)` — one response per traveler per event

**Validated (2026-09-19):** `draft.yaml` parses cleanly, `blueprint:build` generates all 7 migrations/models/factories, `php artisan migrate` runs without error on SQLite, and relationships + JSON casts were confirmed working via Tinker (`Trip::factory()->for($user)->create()`, `$item->assigned_traveler_ids` casts to `array`, `$item->trip` resolves).

#### 1.2 Eloquent Models — Generated, Then Refined
**Location:** `app/Models/`

Blueprint generates the base model with `fillable`, `casts()`, and relationship methods. After generation, hand-add anything Blueprint can't express:

**Relationships generated automatically:**
```php
Trip:      hasMany Traveler, ItineraryItem, Document, NotificationLog
           belongsTo User (rename user() → curator() by hand, optional)

Traveler:  hasMany Response
           belongsTo Trip

ItineraryItem: hasMany ItineraryTask, Response
               belongsTo Trip

Document:      belongsTo Trip
Response:      belongsTo ItineraryItem, Traveler
NotificationLog: belongsTo Trip, ItineraryItem, Traveler
```

**Manual additions needed post-generation (Blueprint can't express these):**
- Trip: `derived_date_range` accessor (from itinerary items when start/end absent)
- Traveler: `share_code` auto-generation on create (model `creating` event or observer)
- ItineraryItem: `is_past`, `is_upcoming`, `is_today` accessors
- ItineraryItem: `response_rollup` accessor (counts by status)
- Optional: rename `Trip::user()` to `Trip::curator()` for domain clarity

#### 1.3 Factories (no mock-data seeder)
Blueprint generated factories for every model:
`TripFactory`, `TravelerFactory`, `ItineraryItemFactory`, `ItineraryTaskFactory`, `DocumentFactory`, `ResponseFactory`, `NotificationLogFactory`.

Use these in tests (`Trip::factory()->has(Traveler::factory()->count(3))`). Do **not** port `/mock/src/data/mockData.json` into a seeder.

Generated fakes are column-length guesses, not domain-aware (`name()` for trip titles, `regexify('[A-Za-z0-9]{255}')` for destination/role/share_code, JSON columns as `'{}'` strings). Tweak a factory when a test or demo needs realistic values — don't write a dedicated seeder.

**Success Criteria:**
- ✅ All migrations run clean
- ✅ Models loaded in Tinker
- ✅ Relationships work: `Trip::first()->travelers`
- ✅ Factories create related records for tests

---

## Phase 2: Backend API (Routes + Controllers)

**Goal:** Build Laravel controllers that Inertia will consume

**Session Duration:** 3-4 focused sessions (one domain per session)

### Session 2.1: Trip Management

**Routes:**
```php
// Curator routes (auth required)
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::resource('trips', TripController::class);
});

// Public traveler route
Route::get('/trips/{shareCode}', [TravelerViewController::class, 'show'])
    ->name('trips.share');
```

**Controllers:**
- `DashboardController@index` → return trips for auth user
- `TripController` (resource) → CRUD operations

**Form Requests:**
- `StoreTripRequest` (name, destination, dates, description, tags, badge)
- `UpdateTripRequest`

**Inertia Props:**
```php
// Dashboard
return Inertia::render('Dashboard', [
    'trips' => Trip::with('travelers', 'itinerary')
        ->where('user_id', auth()->id())
        ->get()
        ->map(fn($trip) => [
            'id' => $trip->id,
            'name' => $trip->name,
            'destination' => $trip->destination,
            'dateRange' => $trip->derived_date_range,
            'badge' => $trip->badge,
            'tags' => $trip->tags,
            'travelerCount' => $trip->travelers->count(),
            'itemCount' => $trip->itinerary->count(),
        ])
]);
```

**Tests:**
- `tests/Feature/TripTest.php`
  - Curator can create trip
  - Curator can view own trips
  - Curator cannot view others' trips
  - Validation works

### Session 2.2: Itinerary Management

**Routes:**
```php
Route::middleware('auth')->group(function () {
    Route::post('/trips/{trip}/itinerary', [ItineraryItemController::class, 'store']);
    Route::patch('/trips/{trip}/itinerary/{item}', [ItineraryItemController::class, 'update']);
    Route::delete('/trips/{trip}/itinerary/{item}', [ItineraryItemController::class, 'destroy']);
});
```

**Controller:**
- `ItineraryItemController` (API-style, not resource)
- Scoped to trip: `Route::scopeBindings()`

**Form Requests:**
- `StoreItineraryItemRequest` (date, time, title, type, location, etc.)
- `UpdateItineraryItemRequest`

**Tests:**
- Curator can add/edit/delete items on own trip
- Items sorted by date, time
- Cannot modify items on others' trips

### Session 2.3: Traveler Management

**Routes:**
```php
Route::middleware('auth')->group(function () {
    Route::post('/trips/{trip}/travelers', [TravelerController::class, 'store']);
    Route::patch('/trips/{trip}/travelers/{traveler}', [TravelerController::class, 'update']);
    Route::delete('/trips/{trip}/travelers/{traveler}', [TravelerController::class, 'destroy']);
});
```

**Controller:**
- `TravelerController`
- Generate unique `share_code` on create
- Validate email uniqueness within trip

**Tests:**
- Add/remove travelers
- Share code is unique and URL-safe
- Notification logic (if auto-notify enabled)

### Session 2.4: Document Management

**Routes:**
```php
Route::middleware('auth')->group(function () {
    Route::post('/trips/{trip}/documents', [DocumentController::class, 'store']);
    Route::patch('/trips/{trip}/documents/{document}', [DocumentController::class, 'update']);
    Route::delete('/trips/{trip}/documents/{document}', [DocumentController::class, 'destroy']);
});
```

**Controller:**
- `DocumentController`
- File upload handling (store in `storage/app/documents`)
- Attach to trip and optionally to itinerary items

**Tests:**
- Upload document
- Pin/unpin
- Assign to specific travelers

### Session 2.5: Response Tracking

**Routes:**
```php
// Public route for traveler responses
Route::post('/trips/{shareCode}/responses', [ResponseController::class, 'store'])
    ->name('trips.respond');
```

**Controller:**
- `ResponseController`
- Traveler confirms/declines itinerary items
- No auth required (share code validates access)

**Tests:**
- Traveler can confirm/decline via share link
- Response rollup calculation

**Success Criteria (Phase 2):**
- ✅ All CRUD operations work via Tinker/API testing
- ✅ Authorization enforced (policies if needed)
- ✅ Validation prevents bad data
- ✅ Feature tests cover happy/sad paths
- ✅ Inertia props return clean, typed data

---

## Phase 3: Frontend Components (Vue → React)

**Goal:** Port Vue components to React with Inertia.js patterns

**Session Duration:** 5 sessions (batched by domain)

### Component Porting Strategy

**For Each Component:**
1. Read Vue source file
2. Identify Radix UI components used (shadcn-vue → shadcn-react mapping)
3. Port template to JSX
4. Convert Vue Composition API → React hooks
5. Replace Vue Router → Inertia `<Link>` and `router` calls
6. Use Wayfinder for type-safe routes
7. Test in Storybook (optional) or page context

**Vue → React Patterns:**

| Vue Pattern | React Equivalent |
|-------------|------------------|
| `<script setup>` | Function component with hooks |
| `ref()` / `reactive()` | `useState()` |
| `computed()` | `useMemo()` |
| `watch()` | `useEffect()` |
| `@click` | `onClick` |
| `v-if` | `{condition && <Component />}` |
| `v-for` | `.map()` |
| `emit('event')` | Pass callback props |
| `defineProps()` | Destructure function params |
| Radix Vue components | Radix React (already in app) |

### Session 3.1: Core Trip Components

**Port:**
- `TripCard.vue` → `trip-card.tsx`
- `TripBoard.vue` → `trip-board.tsx`
- `TripHeader.vue` → `trip-header.tsx`

**Location:** `resources/js/components/trips/`

**Key Considerations:**
- TripCard: Badge colors, tag rendering, date formatting
- TripBoard: Grid vs list toggle (localStorage)
- TripHeader: Edit modal, share link copy

**Dependencies:**
- Badge component (exists in UI lib)
- Button, Dialog (exists)
- Date utilities (create `lib/dates.ts`)

### Session 3.2: Itinerary Components

**Port:**
- `ItineraryTimeline.vue` → `itinerary-timeline.tsx`
- `ItineraryItemCard.vue` → `itinerary-item-card.tsx`
- `ItineraryItemForm.vue` → `itinerary-item-form.tsx`
- `ItineraryItemPanel.vue` → `itinerary-item-panel.tsx`

**Location:** `resources/js/components/itinerary/`

**Key Considerations:**
- Timeline: Group by date, sort by time
- ItemCard: Type icons, status badges
- ItemForm: Date/time pickers, type selector
- ItemPanel: Slide-over panel (Sheet component)

**Dependencies:**
- Calendar/DatePicker (check if exists, else port from shadcn)
- Select, Textarea (exists)
- Lucide icons for item types

### Session 3.3: Traveler Components

**Port:**
- `TravelerList.vue` → `traveler-list.tsx`
- `TravelerEntryCard.vue` → `traveler-entry-card.tsx`
- `TravelerForm.vue` → `traveler-form.tsx`
- `TravelerAssignPicker.vue` → `traveler-assign-picker.tsx`

**Location:** `resources/js/components/travelers/`

**Key Considerations:**
- List: Sidebar or main content layout
- EntryCard: Avatar, role badge, actions
- Form: Email validation, role input
- AssignPicker: Multi-select checkbox list

**Dependencies:**
- Avatar component
- Checkbox (exists)
- Combobox/multi-select pattern

### Session 3.4: Document Components

**Port:**
- `DocumentList.vue` → `document-list.tsx`
- `DocumentForm.vue` → `document-form.tsx`
- `DocumentEntries.vue` → `document-entries.tsx`
- `EventDocumentsPicker.vue` → `event-documents-picker.tsx`
- `EventTasksEditor.vue` → `event-tasks-editor.tsx`

**Location:** `resources/js/components/documents/`

**Key Considerations:**
- Upload handling (Inertia file uploads)
- Pin/unpin toggle
- File type icons
- Task checklist (inline editing)

**Dependencies:**
- File input component
- Pin icon (Lucide)
- Checkbox for tasks

### Session 3.5: Advanced Components

**Port:**
- `NotificationComposer.vue` → `notification-composer.tsx`
- `ResponseRollup.vue` → `response-rollup.tsx`
- `ItineraryProgress.vue` → `itinerary-progress.tsx`
- `ShareLinkButton.vue` → `share-link-button.tsx`
- `NewTripPanel.vue` → `new-trip-panel.tsx`

**Location:** `resources/js/components/features/`

**Key Considerations:**
- NotificationComposer: Textarea, channel selector (email/Telegram)
- ResponseRollup: Pie chart or stacked bar (simple CSS)
- Progress: Completion percentage calculation
- ShareLink: Copy to clipboard (navigator.clipboard)
- NewTripPanel: Multi-step form or simple dialog

**Dependencies:**
- Toast/Sonner (exists)
- Progress bar component

**Success Criteria (Phase 3):**
- ✅ All 22 components ported to React
- ✅ Components render without errors
- ✅ Radix UI components mapped correctly
- ✅ Styling matches mockup (Tailwind classes)
- ✅ Interactive states work (hover, focus, disabled)

---

## Phase 4: Pages (Inertia Views)

**Goal:** Compose components into full-page views

**Session Duration:** 2-3 sessions

### Session 4.1: Dashboard Page

**File:** `resources/js/pages/dashboard.tsx`

**Replace placeholder with:**
```tsx
import { Head } from '@inertiajs/react';
import { TripBoard } from '@/components/trips/trip-board';
import { NewTripPanel } from '@/components/features/new-trip-panel';

export default function Dashboard({ trips }) {
    return (
        <>
            <Head title="Dashboard" />
            <div className="container py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold">My Trips</h1>
                    <NewTripPanel />
                </div>
                <TripBoard trips={trips} />
            </div>
        </>
    );
}
```

**Props Type:**
```typescript
interface DashboardProps {
    trips: Array<{
        id: number;
        name: string;
        destination?: string;
        dateRange: { startDate: string | null; endDate: string | null };
        badge: TripBadge;
        tags: TripTag[];
        travelerCount: number;
        itemCount: number;
    }>;
}
```

**Tests:**
- Page renders trip cards
- Create new trip button works
- Empty state shows when no trips

### Session 4.2: Trip Detail Page

**File:** `resources/js/pages/trips/show.tsx`

**Layout:**
- Header (trip name, dates, actions)
- Main content (2/3): Itinerary timeline
- Sidebar (1/3): Travelers list, documents

**Props:**
```typescript
interface TripShowProps {
    trip: {
        id: number;
        name: string;
        destination?: string;
        dateRange: DerivedDateRange;
        description: string;
        badge: TripBadge;
        tags: TripTag[];
        autoNotifyOnAssign: boolean;
    };
    itinerary: ItineraryItem[];
    travelers: Traveler[];
    documents: Document[];
    responses: Response[];
}
```

**Interactions:**
- Add/edit/delete itinerary items
- Add/remove travelers
- Upload/delete documents
- Send notifications
- View response rollup

**Tests:**
- All CRUD operations work
- Authorization enforced
- Real-time updates (optimistic UI)

### Session 4.3: Traveler Share View

**File:** `resources/js/pages/trips/share.tsx`

**Route:** `/trips/{shareCode}` (public, no auth)

**Layout:**
- Read-only trip header
- Itinerary timeline (filtered by assigned items)
- Documents (filtered by assigned)
- Confirm/decline buttons per item

**Props:**
```typescript
interface TravelerViewProps {
    trip: {
        name: string;
        destination?: string;
        dateRange: DerivedDateRange;
        description: string;
    };
    traveler: {
        id: number;
        name: string;
        roleOnProduction: string;
    };
    itinerary: ItineraryItem[]; // filtered
    documents: Document[]; // filtered
    responses: Response[]; // traveler's responses
}
```

**Interactions:**
- View itinerary (read-only)
- Confirm/decline items
- View documents
- Contact curator (mailto link)

**Tests:**
- Share link works without login
- Invalid share code returns 404
- Responses persist
- Only assigned items visible

**Success Criteria (Phase 4):**
- ✅ All 3 pages functional
- ✅ Navigation works (Wayfinder routes)
- ✅ Props typed correctly
- ✅ Inertia form submissions work
- ✅ Optimistic UI updates feel instant

---

## Phase 5: Business Logic & Polish

**Goal:** Implement advanced features and production readiness

**Session Duration:** 2-3 sessions

### 5.1 Auto-Notification Logic

**Feature:** When `trip.auto_notify_on_assign` is true, send notification on first assignment

**Implementation:**
- Observer on `ItineraryItem` and `Document`
- Detect when `assigned_traveler_ids` changes
- Queue notification job
- Log in `notification_logs` table

**Channels:**
- Email (Laravel Mail)
- Telegram (optional: Telegram Bot API)

**Tests:**
- Auto-notify triggers on first assign
- Manual notify always works
- Notification logs created

### 5.2 Response Aggregation

**Feature:** Display rollup of confirmed/declined/pending per item

**Implementation:**
- Accessor on `ItineraryItem`: `response_rollup`
- Counts by status
- Percentage calculations

**UI:**
- Badge on timeline cards
- Detailed view in item panel
- Dashboard summary stats

### 5.3 Date Derivation

**Feature:** Auto-calculate trip dates from itinerary when not set manually

**Implementation:**
- Accessor on `Trip`: `derived_date_range`
- Uses min/max of itinerary item dates
- Falls back to manual `start_date`/`end_date`

### 5.4 Authorization Policies

**Policies:**
- `TripPolicy` (view, update, delete)
- `ItineraryItemPolicy` (update, delete via trip)
- `TravelerPolicy` (update, delete via trip)

**Rules:**
- Curator can only manage own trips
- Public can view via valid share code
- No cross-trip data leakage

**Tests:**
- Policy tests for all actions
- Unauthorized access returns 403

### 5.5 Validation & Error Handling

**Enhancements:**
- Form request validation messages
- Inertia error display
- Toast notifications for success/error
- Loading states on mutations

### 5.6 Performance Optimization

**Tasks:**
- Eager loading relationships (prevent N+1)
- Index on `share_code`, `user_id`, `date`
- Paginate dashboard trips (if needed)
- Cache trip stats

**Success Criteria (Phase 5):**
- ✅ Auto-notify works end-to-end
- ✅ Response rollup accurate
- ✅ Authorization locked down
- ✅ Error handling graceful
- ✅ Performance acceptable (< 100ms routes)

---

## Phase 6: Testing & QA

**Goal:** Comprehensive test coverage and bug fixes

### 6.1 Feature Tests

**Coverage:**
- Trip CRUD
- Itinerary CRUD
- Traveler CRUD
- Document upload/delete
- Response tracking
- Notifications
- Authorization

**Target:** 80%+ coverage on controllers

### 6.2 Browser Tests (Optional)

**Tools:** Vitest browser mode (already installed)

**Tests:**
- Full user flows (curator creates trip → adds items → invites travelers)
- Traveler responds via share link
- Document upload/download

### 6.3 Manual QA Checklist

- [ ] Dashboard shows all trips
- [ ] Create new trip works
- [ ] Edit trip details works
- [ ] Add/edit/delete itinerary items
- [ ] Add/remove travelers
- [ ] Upload/delete documents
- [ ] Send notifications (check logs)
- [ ] Traveler share link works
- [ ] Confirm/decline responses save
- [ ] Authorization prevents cross-user access
- [ ] Mobile responsive (basic check)

---

## Deployment Considerations

### Environment Variables

```env
# Add to .env
TELEGRAM_BOT_TOKEN=xxx (if implementing Telegram)
MAIL_MAILER=log (dev) / smtp (prod)
```

### Storage Setup

```bash
php artisan storage:link
```

Ensure `storage/app/documents` is writable

### Database

SQLite (dev) works fine. For production, consider MySQL/PostgreSQL.

### Caching

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## Success Metrics

### Hackathon Demo Ready

- [ ] Curator can create trip in < 30 seconds
- [ ] Adding 5 itinerary items takes < 2 minutes
- [ ] Traveler view loads instantly via share link
- [ ] Responses save and reflect in rollup
- [ ] No console errors
- [ ] Mobile layout doesn't break

### Production Ready (Post-Hackathon)

- [ ] 80%+ test coverage
- [ ] Authorization audit complete
- [ ] Error monitoring (Sentry, Flare, etc.)
- [ ] Email notifications working
- [ ] Performance profiled (no N+1 queries)
- [ ] Deployment to Laravel Cloud successful

---

## Risk Mitigation

### Known Challenges

**1. Context Limitations**
- **Risk:** Losing progress if sessions exceed context
- **Mitigation:** Work in small batches, commit frequently, document assumptions

**2. Vue → React Conversion**
- **Risk:** Subtle bugs from porting complex components
- **Mitigation:** Port component-by-component, test immediately, reference Vue source

**3. Inertia v3 Patterns**
- **Risk:** New API differences from docs/examples
- **Mitigation:** Use search-docs tool liberally, follow existing app patterns

**4. Time Pressure (Hackathon)**
- **Risk:** Cutting corners on testing/validation
- **Mitigation:** Prioritize Phase 1-4, treat Phase 5 as "nice to have"

### Contingency Plans

**If Behind Schedule:**
- Skip notification logs (focus on core CRUD)
- Use simple email instead of Telegram
- Skip document upload (use mock URLs)
- Reduce to 1 demo trip (Sundance example)

**If Ahead of Schedule:**
- Add advanced filters (date range, tags, badge)
- Implement search
- Add export to PDF (jsPDF, like mock)
- Polish animations (Framer Motion)

---

## Next Steps

### Immediate Actions

1. ✅ **`draft.yaml` created and validated** — schema parses, migrates, and casts correctly (see Phase 1.1)
2. ✅ **Factories generated** — use in tests; no mock-data seeder
3. **Review `draft.yaml`** - Confirm field names/types match team expectations before writing controllers against them
4. **Set up project board** - Track progress (GitHub Projects, Linear, etc.)

### Session Planning

**Recommended Order:**

1. ~~**Session 1:** Phase 1 (database, models, factories)~~ — done via Blueprint
2. **Session 2:** Trip management (routes, controller, tests)
3. **Session 3:** Itinerary + Travelers (routes, controllers, tests)
4. **Session 4:** Core components (TripCard, TripBoard, TripHeader)
5. **Session 5:** Itinerary components
6. **Session 6:** Dashboard page (wire it up)
7. **Session 7:** Trip detail page
8. **Session 8:** Traveler share view
9. **Session 9+:** Polish, testing, demo prep

---

## Conclusion

This strategy prioritizes:
1. **Solid foundation** (database, models)
2. **Backend completeness** (all CRUD working)
3. **Incremental frontend** (port components in batches)
4. **Early testing** (validate each slice)
5. **Demo readiness** (working end-to-end flows)

**The mockup is our blueprint.** We're not reinventing - we're translating a validated design into production code. Follow the types, follow the structure, and we'll have a working app fast.

Let's build! 🚀

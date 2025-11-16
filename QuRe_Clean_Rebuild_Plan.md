# QuRe Clean Rebuild Plan

## 1. Objective & Guardrails
- Rebuild `QuRe_Clean` so it is a pixel-perfect, feature-complete clone of the shipping app that lives in the project root while removing accumulated legacy cruft.
- Preserve all UX flows, gestures, animation timings, copy, and premium gating as implemented in `QuRe` today.
- Modernize the internals: modular file structure, isolated domain services, predictable state, and explicit async flows so future maintenance is easier.
- Keep the existing `QuRe` directory untouched as the reference implementation; deliver the new implementation inside `QuRe_Clean` with the same bundler entry (`expo-router`).

## 2. Reference Implementation Highlights (What Must Be Recreated)
- Home screen orchestration with gradient swiping, dual QR slots, capture/export flow, and premium-gated UI logic in `app/index.tsx:1`.
- Shared components for time display, action cards, position slider, gradient background, swipe indicator, and QR previews from `app/components/home/*.tsx`.
- Modal stack with QR creation/editing (`app/modal/qrcode.tsx:1`), QR detail view (`app/modal/view.tsx:1`), history selector (`app/modal/history.tsx:1`), settings (`app/modal/settings.tsx:1`), and premium paywall (`app/modal/premium.tsx:1`).
- Theme and global state contexts (`contexts/AppStateContext.tsx:1`, `contexts/ThemeContext.tsx:1`).
- Domain services and persistence helpers for QR storage, preferences, design assets, pricing, wallpaper export, and in-app purchases (`services/*.ts`).
- Constant definitions for gradients, QR metadata, and icon assets (`constants/*.ts`).

## 3. Rebuild Phases

### Phase 0 – Clean Slate & Environment
Status: ready

Steps (keep it simple):
- Empty `QuRe_Clean` directory to remove rebuild artifacts.
- Scaffold a minimal Expo Router app (SDK 53, RN 0.79) in `QuRe_Clean`.
- Add only essential deps used by parity scope: `expo-router`, `react-native-qrcode-svg`, `react-native-gesture-handler`, `react-native-reanimated`, `@react-native-async-storage/async-storage`, `expo-image`, `expo-linear-gradient`, `react-native-view-shot`, `expo-sharing`, `expo-image-picker`, `rn-wallpapers`, `react-native-iap`.
- Copy root configs that affect bundling/dev: `metro.config.js`, `tsconfig.json`, `eslint.config.js`, `expo-env.d.ts`, and align `app.config.ts` for a separate app ID within `QuRe_Clean`.

Blockers / notes:
- If Android/iOS native build steps complain, postpone native fixes until Phase 4 after UI parity is achieved. Keep dev in JS-only where possible.
- IAP and `rn-wallpapers` will fail on simulators; treat as no-op during local iteration.

### Phase 1 – Architecture & Infrastructure
Status: ready

Design principles for simplification:
- Keep contexts thin. Only globalize state that multiple screens need (theme, premium flag, assigned QR ids, selected gradient id). Everything else stays local to the feature.
- No extra state libs. Use React Context + hooks as in legacy, but reduce cross-talk.

Steps:
1. Proposed folder layout:
   - `app/` for Expo Router routes mirroring the existing modal stack.
   - `app/_layout.tsx` to wrap navigation with providers (Theme + AppState + gesture handler root).
   - `components/` for shared UI primitives (QR rendering, buttons, inputs, sliders).
   - `features/` to group home, onboarding, QR management, premium flows by domain (optional but encouraged for clarity).
   - `services/` for platform or persistence logic (AsyncStorage, wallpapers, IAP, pricing).
   - `state/` for hooks/context/store definitions (if opting for Zustand/Jotai/Context).
   - `constants/` for static data (gradients, QR type metadata, asset URIs).
   - `utils/` for helpers (formatting, animation timings, capture helpers).
2. Recreate global providers:
   - Theme provider maintaining light/dark palettes with AsyncStorage persistence (`ThemeService` parity).
   - App state provider exposing QR slot assignments, premium status, and gradient selection; ensure refresh hooks mirror original logic.
3. Navigation skeleton:
   - Stack router with same routes and presentation styles; implement `navigationService` duplicate navigation guard.
   - Restore status bar styling tied to theme mode.
4. Shared data contracts:
   - Port `types/QRCode.ts` and related interfaces to maintain schema compatibility with persisted data.
   - Define enums/constants for gradient presets, QR forms, and premium features matching legacy values for migration safety.

Blockers / notes:
- None expected; keep types identical to ensure AsyncStorage data loads.

### Phase 2 – Home Experience (Core Screen)
Status: ready

Simplifications (maintain exact UI):
- Keep one state source in Home for slider (x, y, scale) and debounce saves through `UserPreferencesService`. No extra derived states.
- Export pipeline: hide UI, `captureRef`, then restore; no intermediate preview screen.

Steps:
1. Layout & theming:
   - Implement gradient background transition component with Reanimated shared value as in `app/components/home/GradientBackground.tsx:1`.
   - Render time/date block (`TimeDisplay`) centered with identical typography.
   - Position QR slots container factoring in safe-area insets and slider-driven offsets; replicate single/double slot logic, placeholder cards, labels, and close buttons (`app/components/home/QRSlots.tsx:1`).
2. Gestures & state:
   - Swipe left/right to cycle gradients: use `GestureDetector` with inertia, cap index bounds, animate transitions, and persist selection.
   - Tap and long-press interactions for QR slots, plus gradient swipe indicator with dismissal counter stored in AsyncStorage (`SWIPE_INDICATOR_KEY`).
   - Maintain `Animated` opacity toggles for hiding UI during export sharing.
3. Position slider:
   - Expandable slider panel controlling X/Y/scale with snap-to-center haptics (`app/components/home/PositionSlider.tsx:1`).
   - Persist slider values with debounce, ensuring null-safe initial load (see `loadUserData` flows in `app/index.tsx:120`).
4. Action cards & wallpaper export:
   - “Set as Lock Screen” triggers capture via `react-native-view-shot`, saves to Photos (iOS) or sets wallpaper (Android) via `rn-wallpapers` (`services/WallpaperService.ts:1`).
   - Optional Share card gated by preference toggle; use `expo-sharing` fallback when wallpaper API unavailable.
5. Premium gating:
   - Only show secondary slot, share toggle, custom backgrounds, hide-title toggle when `isPremium` true; otherwise open premium modal.
6. Analytics hooks:
   - Re-fire EngagementPricingService events on session start/end, history visits, settings open, wallpaper exports, etc., keeping identical action keys for continuity.

Blockers / notes:
- Android wallpaper API requires real device; on emulator treat as success and show toast.

### Phase 3 – Modal & Flow Parity
Status: ready

Steps:
1. QR create/edit modal (`app/modal/qrcode.tsx:1`):
   - Tabbed interface for Content vs Design.
   - Type-specific forms for link, instagram, whatsapp, email, phone, contact, paypal, wise, bitcoin matching validation rules.
   - Design tab with color pickers, gradient toggle, logo upload, slider controls, and premium gating identical to `QRDesignForm` logic.
   - Save/update uses `QRGenerator` service to compute label/content, persists via `QRStorage`, and assigns to slot when opened from home.
   - Inline history picker (select existing code) with slot routing.
2. QR view modal:
   - Display selected QR details, data summary, created timestamp, actions for edit/change/close matching layout in `app/modal/view.tsx:1`.
3. History modal:
   - FlatList of saved codes with create/edit/delete actions; select-mode pipeline for assigning to slots, default card, empty state messaging per `app/modal/history.tsx:1`.
4. Settings modal:
   - Theme toggle, gradient picker, premium-only toggles (title visibility, single/double mode, custom background upload, share button).
   - Restore purchase CTA; navigation to premium for gated controls.
   - Simplify: move any dev toggles to development-only build flag; do not ship in production.
5. Premium modal:
   - Offer logic using EngagementPricingService to determine pricing tier/messages; fetch localized price via IAP products; show feature list and testimonials; handle purchase/restore flows.
   - Ensure safe handling on dev devices where billing unavailable.
6. Onboarding overlay:
   - Animated multi-page gradient slider with skip/next/get-started buttons replicating `app/components/Onboarding.tsx:1`.
   - Persist completion flag and only show once until cleared.

### Phase 4 – Services & Integration
Status: ready

1. Persistence layer:
   - Port `UserPreferencesService`, `QRStorage`; exclude unused helpers from legacy.
   - Keep migration for legacy keys (`qrVerticalOffset` → `qrYPosition`).
2. QR generation:
   - Recreate `QRGenerator` helper to produce QR payload strings for each type, plus `QRCodePreview` using `react-native-qrcode-svg` and design options (colors, gradient, logo overlay).
3. Wallpaper & share:
   - Maintain capture pipeline: hide UI elements, call `captureRef`, resume UI post-export, handle permission prompts gracefully.
4. Engagement pricing:
   - Clone `EngagementPricingService` metrics tracking, offer computation, and history logging to maintain dynamic pricing triggers.
5. In-app purchases:
   - `IAPService` wrapper with init, product fetching, purchase handling, restore; no-op on simulator/dev with user-friendly alerts.
6. Navigation service:
   - Provide singleton to gate duplicate modal pushes and clean modal state once dismissed.
7. Theme service:
   - Light/dark palettes identical to `services/ThemeService.ts:1`, with toggle and AsyncStorage persistence.

### Phase 5 – Polish, QA, and Tooling
Status: ready

1. Visual regression:
   - Capture baseline screenshots from current app; compare against rebuild in common breakpoints (iPhone 15, Pixel 7, iPad portrait) to confirm pixel parity.
2. Functional validation:
   - Manual QA checklist covering onboarding, gradient swipe, QR CRUD, slot assignment, wallpaper export (iOS + Android), premium purchase simulation, settings toggles, share sheet.
3. Automated tests:
   - Add Jest + RN Testing Library smoke tests for: Home render, slider snapping, gradient cycling, gating behaviors, storage roundtrips.
4. Performance:
   - Ensure Reanimated + Gesture Handler work without frame drops; profile gradient swipes and capture/export on mid-tier Android device.
5. Accessibility & localization:
   - Verify text scaling does not break layout; ensure voice-over labels on actionable elements (create, edit, delete, export, sliders).
6. Deployment readiness:
   - Confirm `expo-doctor` passes; run `expo prebuild`, `expo run:android`, `expo run:ios` in `QuRe_Clean`.
   - Update build scripts or README with steps for launching clean build.

## 4. Deliverables Summary
- Fully reconstructed Expo project in `QuRe_Clean` matching feature set and UX behavior of the legacy app.
- Updated documentation describing architecture decisions, premium feature flags, and testing strategy.
- QA checklist + test results to validate parity before handoff.
- (Optional) Migration notes if any AsyncStorage keys changed.

## 5. Open Questions for Follow-up (If Needed)
- Confirm whether to maintain developer-only switches (e.g., premium debug toggle) present in current settings screen.
- Clarify expectation for legacy data migration vs clean slate for existing users.
- Determine if launch discount logic in `EngagementPricingService` should be parameterized or remain hard-coded.
- Validate asset sources for icons/logos used in QR design (Base64 vs remote fetch).

## 6. Execution Log (to be updated during build)
- 0.0 Initialize plan: Created simplified, phase-based blueprint with parity targets. No blockers.
- 0.1 Environment: Cleared `QuRe_Clean` and scaffolded minimal Expo Router app structure.
- 0.2 Infra: Added ThemeService/ThemeContext and base layout. Status bar bound to theme. No blockers.
- 0.3 Home shell: Implemented GradientBackground crossfade, TimeDisplay, QR placeholders, and action row with parity styles.
- 0.4 Gestures & persistence: Added gradient swipe with crossfade and persisted selected gradient. Restores on load.
- 0.5 Modals: Stubbed qrcode/view/history/settings/premium routes.
- 0.6 Data layer: Added QR types and QRStorage (AsyncStorage). Implemented History list (empty + cards) with parity visuals.
- 0.7 Create modal: Implemented content tab (link/whatsapp/email/phone/contact/instagram), validations, and save flow.
- 0.8 View modal: Implemented basic details view with parity spacing and colors.

## 7. Minimal Milestone Checklist (stop the moment parity is achieved)
- M1: Boot app, display gradient background, time text, and empty QR placeholders with identical spacing.
- M2: Swipe gradients + persist selection; slider adjusts X/Y/scale + persists; UI export hides and resumes.
- M3: Create/edit QR; assign to slots; view details; history works.
- M4: Settings toggles work; premium gates redirect to paywall; custom background loads when premium.
- M5: Export/share works on iOS (save + share) and Android (set lock screen on device); analytics counters increment.
- M6: Premium flow shows offer, fetches localized price, purchase/restore succeeds on device; dev-safe no-op on simulator.

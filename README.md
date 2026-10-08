# Activity Logger

Activity Logger is an offline-first Expo app for recording activities, reflecting on your day, and reviewing how you spend your time. Activity records are stored locally on the device in SQLite.

## Features

- Daily dashboard with tracked time, activity count, category summary, and recent entries.
- Create, edit, review, and delete activities with a title, category, date, start/end times, notes, and comma-separated tags.
- Chronological history grouped by day and individual activity detail pages.
- Lightweight insights for daily totals, category totals, and the most-used category.
- Local SQLite persistence; data stays on the device and does not require an account or network connection.
- Light and dark theme palettes follow the device appearance.
- Existing journal tools are available from the Journal tab, including text, mood, and offline voice transcription, plus JSON export.

## Screenshots

Screenshots have not been captured yet.

## Tech stack

- React Native 0.86 and React 19
- Expo SDK 57 and Expo Router (file-based routes)
- TypeScript with strict checking
- `expo-sqlite` for on-device persistence
- `whisper.rn` with a bundled tiny model for offline voice transcription in the existing journal feature

## Requirements

- Node.js 22.13 or newer (Expo SDK 57 requirement)
- npm
- For native device builds: Android Studio/Android SDK or Xcode 26.4+ on macOS
- A development build is needed for native modules such as SQLite and Whisper; Expo Go may not include all required native modules.

## Installation

```bash
git clone https://github.com/learnershakil/activity-logger.git
cd activity-logger
npm install
```

## Running the app

Start the Expo development server:

```bash
npx expo start
```

Then use the Expo CLI prompts to open a configured simulator/device. To run a native development build locally:

```bash
npx expo run:android
npx expo run:ios
```

The iOS command requires macOS and Xcode. Web can be started with `npm run web`, though native SQLite and audio capabilities may differ on web.

## Project structure

```text
src/
├── app/                   # Expo Router dashboard, history, insights, and activity routes
├── components/            # Reusable navigation and interface components
├── database/              # SQLite connection and existing journal schema
├── features/activities/   # Activity model, validation, calculations, repository, hook
├── repositories/          # Existing journal persistence
├── services/              # Existing voice, transcription, and export services
├── theme/                 # Shared light/dark palettes and provider
├── types/                 # Existing journal and speech types
└── utils/                 # Date and ID utilities
__tests__/                  # Node-based TypeScript business-logic tests
```

## Architecture

Activity screens use Expo Router and shared components. Activity validation, duration calculations, grouping, and statistics live in `src/features/activities/`. `ActivityRepository` owns the SQLite table and persistence operations; the `useActivities` hook provides loading/error state and refreshable CRUD operations to screens.

```text
Expo Router screens → activity hook and domain utilities → ActivityRepository → expo-sqlite
```

A separate `activities` table is created with `CREATE TABLE IF NOT EXISTS`, preserving the existing journal table and data.

## Testing

```bash
npm test
npm run lint
npm run typecheck
```

The tests cover activity duration (including midnight crossing), validation, date grouping, summary statistics, service create/delete behavior, and the existing date, mood, and export-safety checks.

## Development

Useful commands:

```bash
npm run start       # Start Expo
npm run android     # Build/run the Android app
npm run ios         # Build/run the iOS app
npm run web         # Start web target
npm run lint        # Expo ESLint configuration
npm run typecheck   # TypeScript strict check
npm test            # TypeScript business-logic tests
```

Follow `AGENTS.md` for project-specific Expo guidance. Install Expo SDK packages with `npx expo install <package>` so versions match the SDK.

## Contributing

1. Create a focused feature branch.
2. Keep changes mobile-first and compatible with Expo SDK 57.
3. Add or update tests for behavior changes.
4. Run lint, tests, and typecheck before opening a pull request.
5. Describe tested platforms and any limitations accurately.

## License

This project includes the MIT license. See [LICENSE](LICENSE).

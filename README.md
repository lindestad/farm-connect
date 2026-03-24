# FarmConnect

FarmConnect is a mobile-first marketplace for local farms. Customers can browse weekly produce, reserve items, and choose a pickup slot at the farm or at a market day. Farmers can publish inventory, open pickup windows, and advertise recurring markets such as Saturdays.

The app is built with Expo, React Native, TypeScript, Expo Router, and Supabase.
Unit and component tests use Jest with Expo's `jest-expo` preset.

## Current scope

- customer landing and discovery flow
- farm pickup slots
- market day promotion
- farmer-side reservation and packing concepts
- Supabase bootstrap and env wiring

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Start the Expo dev server:

```bash
npm run start
```

You can also launch specific targets:

```bash
npm run android
npm run ios
npm run web
```

## Supabase setup

Copy the example environment file and add your project values:

```bash
cp .env.example .env.local
```

Expected variables:

```bash
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

The app uses Expo public env variables for the client-side URL and publishable key. `.env.local` is ignored by git.

## Quality checks

Run ESLint:

```bash
npm run lint
```

Run the TypeScript typecheck:

```bash
npm run typecheck
```

Run the Jest test suite:

```bash
npm test
```

Format the repository with Prettier:

```bash
npm run format
```

Check formatting without changing files:

```bash
npm run format:check
```

## CI

GitHub Actions runs the quality workflow on:

- pull requests
- pushes to `main`

The workflow currently runs:

- `test`
- `lint`
- `typecheck`
- `prettier`

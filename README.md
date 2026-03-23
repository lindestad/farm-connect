# FarmConnect

FarmConnect is a mobile-first marketplace for local farms. Customers can browse weekly produce, reserve items, and choose a pickup slot at the farm or at a market day. Farmers can publish inventory, open pickup windows, and advertise recurring markets such as Saturdays.

The app is built with Expo, React Native, TypeScript, and Expo Router.

## Current scope

- customer landing and discovery flow
- farm pickup slots
- market day promotion
- farmer-side reservation and packing concepts
- Supabase integration planned for a later pass

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

## Quality checks

Run ESLint:

```bash
npm run lint
```

Run the TypeScript typecheck:

```bash
npm run typecheck
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

- `lint`
- `typecheck`
- `prettier`

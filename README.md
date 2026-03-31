# FarmConnect

FarmConnect is a mobile-first marketplace for local farms. Customers can browse weekly produce, reserve items, and choose a pickup slot at the farm or at a market day. Farmers can publish inventory, open pickup windows, and advertise recurring markets such as Saturdays.

The app is built with Expo, React Native, TypeScript, Expo Router, and Supabase.
Unit and component tests use Jest with Expo's `jest-expo` preset.

## Current scope

- customer landing and discovery flow
- farm pickup slots
- market day promotion
- farmer-side reservation and packing concepts
- Supabase bootstrap, auth, and persisted sessions

## Payments

The app uses Stripe for payment processing via the `@stripe/stripe-react-native` SDK.

Payments are handled through a Supabase Edge Function (`create-payment-intent`) which creates a Stripe PaymentIntent server-side, keeping the secret key off the client. Edge function is deployed to Supabase.

The `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` is pulled automatically via `eas env:pull`.

> **Note:** Web builds will not work. The app targets Android platform. Reason: `@stripe/stripe-react-native` is a native-only library and cannot run in a browser environment. Expo Go is also not supported, create a local build with "npx expo run:android". Check `CONTRIBUTE.MD` for more detailed instructions.

To test a payment, use the following Stripe test card:

| Field  | Value                 |
| ------ | --------------------- |
| Number | `4242 4242 4242 4242` |
| Expiry | `05/55`               |
| CVC    | `555`                 |

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Install EAS CLI

   ```bash
   npm install --global eas-cli # Installs the tool globally on your system
   ```

   Project should be linked to expo.dev under our organization automically via the app.json,
   which now includes a project-id refrence. If you encounter any issues with below command run:
   `eas init # link to farm-connect` 3. Setup .env variables

   **Note:** You need to login first via the CLI: `eas login`

   ```bash
   eas env:pull # choose development when prompted
   ```

   4. Start the Expo dev server:

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

The app uses Expo public env variables for the client-side URL and publishable key. `.env.local` is ignored by git.

For email confirmation links to return to the app, add this redirect URL in the Supabase dashboard:

```bash
farmconnect://auth/confirm
```

The current auth flow includes:

- registration with email/password
- profile role selection for customer or farmer
- login with email/password
- persisted mobile sessions
- email confirmation redirect back into the app

To create the `profiles` table and policies, run the SQL migration in the Supabase SQL editor:

```bash
supabase/migrations/202603241945_create_profiles.sql
```

That migration creates:

- `public.profiles`
- row-level policies so users can read and update only their own profile
- a trigger that creates the profile row automatically from signup metadata

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

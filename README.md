# `FarmConnect`

FarmConnect is a mobile-first marketplace that connects customers with local farms. Users can browse, reserve, and schedule pickups for fresh produce, while farmers manage inventory, pickup windows, and recurring market events—all in one streamlined platform.

---

<details>
<summary><strong>View Progress (Features Implemented)</strong></summary>

- **Demo Landing Page** (feature showcase, customer/farmer flow overview, mock phone preview UI)
- **Authentication System** (email/password login and registration, role selection, email confirmation redirect)
- **Account System** (customer profile: display name, phone, location, bio, contact preference, pickup notes; farmer account access control)
- **Farm Profile** (create, view, edit, and delete farm profiles; owner-only controls)
- **Farmer Dashboard** (role-gated dashboard with navigation to market management)
- **Market Day Management** (full CRUD: create, edit, and delete market days with date/time pickers, location, notes, status filtering)
- **Produce Browser** (browse produce list with Norwegian/English names; detail view with full nutritional info sourced from Matvaretabellen)
- **Map** (Google Maps integration displaying farm locations with markers, centered on Norway)
- **Payment System** (Stripe test mode via Supabase Edge Function; order screen with payment sheet, Google Pay support)

</details>

---

<details>
<summary><strong>Supabase Instructions</strong></summary>

For email confirmation links to return to the app, add this redirect URL in the Supabase dashboard:

```
farmconnect://auth/confirm
```

The current auth flow includes:

- Registration with email/password
- Profile role selection for customer or farmer
- Login with email/password
- Persisted mobile sessions
- Email confirmation redirect back into the app

To create the profiles table and policies, run the SQL migration in the Supabase SQL editor:

```
supabase/migrations/202603241945_create_profiles.sql
```

That migration creates:

- `public.profiles`
  <<<<<<< HEAD
- Row-level policies so users can read and update only their own profile
- # A trigger that creates the profile row automatically from signup metadata
- row-level policies so users can read and update only their own profile
- a trigger that creates the profile row automatically from signup metadata
  > > > > > > > 74f6d3a (Added CRUD polices, updated camera view and styles.)

</details>

---

<details>
<summary><strong>Stripe Instructions</strong></summary>

The app uses Stripe for payment processing via the `@stripe/stripe-react-native` SDK. Payments are handled through a Supabase Edge Function (`create-payment-intent`) which creates a Stripe PaymentIntent server-side, keeping the secret key off the client. Edge function is deployed to Supabase. To test a payment, use the following Stripe test card:

| Field  | Value                 |
| ------ | --------------------- |
| Number | `4242 4242 4242 4242` |
| Expiry | `05/55`               |
| CVC    | `555`                 |

</details>

---

<details>
<summary><strong>Generate Produce Data</strong></summary>

Run this script to generate `produceData.json` from Matvaretabellen data and the curated produce list in `src/data/produceList.ts`.

Each produce item in `src/data/produceList.ts` must include a `foodId` that matches the correct Matvaretabellen entry. This `foodId` is used as the stable reference when generating product data. New items must therefore be matched manually in Matvaretabellen before they are added to the list.

**Input:** `src/data/produceList.ts`

Run the script from the project root:

```bash
npx tsx scripts/generateProductData.ts
```

This regenerates: `src/data/produceData.json`

</details>

---

### `Getting Started`

See [CONTRIBUTE](CONTRIBUTE.md) for setup instructions and how to contribute.

---

### `Tech Stack`

| Layer     | Technology                                |
| --------- | ----------------------------------------- |
| Framework | React Native (Expo)                       |
| Routing   | Expo Router                               |
| Backend   | Supabase (Auth, Database, Edge Functions) |
| Payments  | Stripe (`@stripe/stripe-react-native`)    |
| Maps      | Google Maps (`react-native-maps`)         |
| Language  | TypeScript                                |

---

### `Quality Checks`

CI runs on every pull request and push to `main`. Recommended to install `Prettier` extension. You can run the checks locally:

```bash
npm run lint          # ESLint
npm run typecheck     # TypeScript
npm run format:check  # Prettier
npm test              # Jest
```

---

# <<<<<<< HEAD

<details>
<summary><strong>Camera functionality</strong></summary>

`src/components/CameraCapture.tsx` handles:

- camera permission
- camera preview
- taking a picture
- previewing the image
- retaking the image
- confirming the image

`src/lib/image-helpers/image-create.ts` handles uploading images
`src/lib/image-helpers/image-delete.ts` handles deleting images

How to use the camera functionality in another screen:

```ts
import CameraCapture from "@/components/CameraCapture";
```

Then create a function that receives the confirmed image URI. This runs after the user presses **Use Photo**.

```ts
const handlePhotoConfirmed = async (uri: string) => {
  // Do something with the image URI here.
};
```

If the image should be uploaded immediately, call the upload helper inside that function:

```ts
import uploadConfirmedImage from "@/lib/image-helpers/image-create";

const handlePhotoConfirmed = async (uri: string) => {
  const { imageUrl, imagePath } = await uploadConfirmedImage(uri);

  // imageUrl is the public URL for showing the uploaded image.
  // imagePath is the file path used to locate or delete the image in Storage later.
};
```

Finally, render the camera component and pass the function to `onPhotoConfirmed`.

```ts
return <CameraCapture onPhotoConfirmed={handlePhotoConfirmed} />;
```

</details>
>>>>>>> 74f6d3a (Added CRUD polices, updated camera view and styles.)

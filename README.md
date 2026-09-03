# Receipt Printer Interaction

A standalone React Native + Expo experiment where the phone interface becomes the payment terminal: ₦24,500 checkout, approval, physical receipt printing, and a draggable tear-off gesture.

## Run it

Requires Node.js 20+ and Expo Go or a simulator.

```bash
npm install
npm start
```

Scan the QR code with Expo Go, or press `a` / `i` for a simulator. A physical phone gives the intended haptic experience.

## Demo flow

1. Tap **Pay** on the checkout.
2. Payment enters a guarded processing state, so repeated taps cannot retrigger it.
3. Approval feedback fires and the receipt feeds from the interface slot.
4. Grab the printed receipt and pull down.
5. Release early for spring-back, or cross the threshold to tear it off.
6. Tap **Done** to reset.

The happy path is designed for roughly 7–15 seconds depending on the user’s pace.

## Architecture

- `App.tsx` owns the payment state machine and screen choreography.
- `src/components/ReceiptPrinter.tsx` owns print timing, clipping, gesture physics, thresholds, haptics, and detachment.
- `src/components/Receipt.tsx` contains the reusable thermal receipt visual.
- `src/theme.ts` centralizes the restrained dark palette.

Reanimated drives the motion, Gesture Handler drives the pull, and SVG adds the subtle torn edge. Skia is intentionally not included. Reduced Motion shortens nonessential animation while retaining the state changes and tear gesture. Controls and status changes have accessibility labels/live-region cues.

## Validate

```bash
npm run typecheck
npm run doctor
```

The minimal Expo template has no linter configured, so there is no lint script.

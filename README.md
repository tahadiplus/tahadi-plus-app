# Tahadi Plus — iPhone demo

Expo / React Native prototype for iPhone. It includes an eight-question challenge,
two-player pass-and-play PK, locally created Konkan rooms, a solo Okey draw/discard
game, demo coins, a local leaderboard, and a profile name.

The app works without a server. Rooms are not shared with another phone, voice chat
is not connected, coins cannot be purchased or redeemed, and scores do not persist
after the app closes. There are no fake LIVE players or fake purchases.

## Test on an iPhone

Install **Expo Go** on the iPhone. A GitHub repository by itself does not produce
an Expo Go QR code. If you have a Mac or another machine with Node.js available:

```sh
git clone https://github.com/tahadiplus/tahadi-plus-app.git
cd tahadi-plus-app
npm install
npx expo start --tunnel
```

Scan the QR code from the iPhone to open in Expo Go. No Windows machine is needed.
For a completely phone-only workflow, an Expo account and a published hosted
preview/build are needed; the GitHub Actions iOS bundle check validates JavaScript
but does not publish an installable iPhone app.

## Developer checks

```sh
node --test gameLogic.test.js
npx expo export --platform ios --output-dir dist
```

Okey rules cover sets, runs (including 12-13-1), indicated jokers, and seven pairs.
Online multiplayer, authentication, voice and real-money payments need a separate
backend and App Store payment integration in a later phase.

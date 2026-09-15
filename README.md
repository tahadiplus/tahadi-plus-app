# تەحەدی پڵەس — وەشانی تاقیکردنەوەی ئایفۆن

Expo / React Native prototype for iPhone. It includes an eight-question challenge,
two-player pass-and-play PK, locally created Konkan rooms, a solo Okey draw/discard
game, demo coins and locally collectible gifts, a local leaderboard, and a profile
name. The interface uses a charcoal/gold arcade look with a PK arena, game modes,
room cards, an Okey table and a bottom navigation bar. The Kurdish identity uses a
code-native Kurdistan flag and an original Zagros citadel illustration. The KonKan
practice table deals tiles, checks non-joker melds, scores them, enforces an
81-point Erbil opening and supports draw/discard and a solo finish.

KonKan is a solo rules practice, not a complete four-player game: jokers, joker
stealing, discard-pick restrictions, dynamic openings, team turns and scoring are
not implemented yet. The app works without a server. Rooms are not shared with another phone, voice chat
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

Scan the QR code from the iPhone. Expo Go on iOS only supports the SDK version
bundled with its current App Store release; this repository's Expo SDK may
require a dedicated development build instead of Expo Go. A separate temporary
Snack preview can use an Expo-Go-compatible SDK for direct phone testing; an
older guest preview does not automatically include subsequent repository edits. No
Windows machine is needed. For a stable hosted link or an installable app,
connect an Expo account and publish a preview/build. GitHub Actions validates
the iOS JavaScript bundle but does not publish an installable iPhone app.

## Developer checks

```sh
node --test gameLogic.test.js konkanLogic.test.js
npx expo export --platform ios --output-dir dist
```

Okey rules cover sets, runs (including 12-13-1), indicated jokers, and seven pairs.
Online multiplayer, authentication, voice and real-money payments need a separate
backend and App Store payment integration in a later phase.

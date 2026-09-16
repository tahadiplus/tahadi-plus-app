# Tahadi Plus — iPhone release readiness

## Built in this branch

- Kurdish UI, Kurdistan flag, Zagros artwork and 1024px iOS icon.
- Solo Okey, solo basic KonKan practice, pass-and-play quiz, local rooms, and demo coin/gift inventory.
- Local save and restore of wallet, profile, rooms, Okey and KonKan boards.
- EAS `preview` and `production` build profiles and automated iOS JavaScript export.

## Work still required for the requested full product

1. Implement an authoritative server for identities, invitations, 2v2 KonKan matches,
   turns, timers, reconnection, team scoring and anti-cheat. The current rooms only
   exist on one device. Complete the remaining KonKan rules, including joker
   stealing, dynamic opening minimum, discard restrictions and rounds.
2. Provision a real-time voice provider/backend, microphone permission and
   consent flow, mute, moderation, reporting and user blocking. A room card or
   permission prompt alone does not provide voice chat.
3. Implement server-side coin ledger and Apple in-app purchase products for any
   paid digital currency. Verify purchases on a trusted server; add restoration,
   refunds, abuse controls and the real gift catalog. Existing wallet is a demo.
4. Publish privacy policy, terms and support contact for the final online service.
   Add content moderation, reporting and blocking for user-created rooms and voice.
5. Test on real iPhones, capture current App Store screenshots, confirm bundle ID
   ownership, prepare App Store metadata and complete App Review questions.

## Required accounts and submission

- The owner needs a paid Apple Developer Program membership and an Expo account.
  These accounts are not connected to this repository.
- Connect the accounts, configure iOS signing through EAS, then run
  `npx eas-cli build --platform ios --profile production`.
- Review the resulting build in TestFlight, then run
  `npx eas-cli submit --platform ios --profile production` and request App Review
  in App Store Connect. EAS Submit alone does not publish to the App Store.

Until the first five items are implemented and reviewed, do not describe this as
the full online game or a production-ready paid app.

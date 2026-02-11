# Proof — Marketing Website

Official website for **Proof**, a cryptographic visit verification app for iOS and iPad.

**Live at:** [https://proofapp.site](https://proofapp.site)

## About Proof

Proof lets customers cryptographically prove they visited a business — no accounts, no personal data. Business owners get real-time analytics, loyalty insights, and a privacy-first verification system powered by QR codes and HMAC-SHA256 signatures.

### Key Features

- **Cryptographic Verification** — SHA-256 signed visit proofs, tamper-proof and shareable
- **QR Code Scanning** — Instant business lookup and visit recording
- **Business Analytics** — Real-time dashboard with visit trends and customer patterns
- **Privacy First** — Customers need no account; all visit data stays on-device
- **Auto-rotating Words** — Configurable verification word management for businesses
- **iPad Kiosk Mode** — Dedicated counter display for businesses

### Tech Stack (iOS App)

- **Frontend:** Swift 6.2, SwiftUI, SwiftData
- **Security:** CryptoKit, HMAC-SHA256
- **Backend:** Supabase (Auth, Postgres, Edge Functions)
- **Payments:** StoreKit 2
- **QR:** Core Image, AVFoundation

## Status

**Beta live on TestFlight.** Request an invite at [proofapp.site](https://proofapp.site).

## This Repository

Source code for the Proof marketing website:

- HTML5 with Tailwind CSS (CDN)
- Vanilla JavaScript
- Hosted on GitHub Pages with custom domain

### Local Development

1. Clone this repository
2. Open `index.html` in your browser
3. Edit HTML files directly — Tailwind is loaded via CDN

## Links

- **Website:** [https://proofapp.site](https://proofapp.site)
- **Developer:** [@mirsadra](https://github.com/mirsadra)
- **X (Twitter):** [@Mirsadraa](https://x.com/Mirsadraa)

---

Built by [Parkinsad Ltd](https://proofapp.site) (UK)

# 🏡 Bhopal Farmline

> Bhopal's curated, zero-commission directory for discovering and comparing private countryside farmhouses across Kerwa Dam, Ratibad, Kolar Road, Vidisha Road, and suburban Bhopal.

Connects event hosts, families, and guests directly with verified farmhouse owners via WhatsApp and direct call — zero booking fees, zero broker commissions.

---

## ✨ Features

- **Direct Inquiries**: One-click WhatsApp and direct phone calls with verified property owners.
- **Editorial Search & Faceted Filters**: Real-time client-side search by name, address, or description, with multi-select amenity chips (Pool, DJ Allowed, AC Rooms, Bonfire, etc.) and area filters.
- **Rotating Hero Video Showcase**: Cycles through real video walkthroughs of approved properties with cross-fade transitions and metadata overlays.
- **Interactive Detail Page**: Photo gallery with full-screen Lightbox, video player integration, capacity badges, event suitability tags, and Google Maps directions.
- **Frictionless Owner Submissions**: Dedicated submission form with an ownership gate, client-side photo compression (<200KB), optional video upload (<20MB), and honeypot spam protection.
- **Google Analytics 4 Tracking**: GA4 custom events (`contact_click`, `farmhouse_submitted`, `listing_shared`) to monitor visitor engagement and lead generation.

---

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML5, Modern CSS (Editorial-Neumorphic design system), Vanilla JavaScript (ES2022).
- **Backend & Storage**: [Supabase](https://supabase.com) (PostgreSQL database + S3 Storage buckets).
- **Client Libraries**:
  - `@supabase/supabase-js` (Database & Storage API)
  - `browser-image-compression` (Client-side image optimization)
- **Typography**: Fraunces, Plus Jakarta Sans, JetBrains Mono (Google Fonts).
- **Analytics**: Google Analytics 4 (GA4).

---

## 🚀 Getting Started

### Local Development

1. Clone or download the repository:
   ```bash
   git clone https://github.com/Wasil728/bhopal-farmline.git
   cd bhopal-farmline
   ```

2. Start a local HTTP server:
   ```bash
   # Using Python
   python -m http.server 8080

   # Or using Node.js / npx
   npx serve .
   ```

3. Open your browser at `http://localhost:8080`.

---

## 📄 Documentation

- [`PRD.md`](PRD.md) — Product Requirements Document
- [`TRD.md`](TRD.md) — Technical Requirements Document
- [`Backend-Schema.md`](Backend-Schema.md) — Database schema, API queries, and storage configuration
- [`UIUX-Design.md`](UIUX-Design.md) — Editorial-Neumorphic design system, tokens, and wireframes

---

## ⚖️ License

Distributed under the MIT License. See `LICENSE` for more information.

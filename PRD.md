# Product Requirements Document (PRD) — Bhopal Farmline

---

## Overview

Bhopal Farmline is a curated, zero-commission web directory dedicated to listing and discovering private farmhouses across the outskirts and rural belts of Bhopal (such as Kerwa Dam, Ratibad, Kolar Road, and Vidisha Road). Built specifically for event hosts, families, and local property owners, the platform bypasses opaque booking agencies and middleman markups by connecting prospective guests directly to verified farmhouse owners via direct WhatsApp messaging and cellular calls. The product operates strictly as a transparent directory and enquiry vehicle rather than an automated transaction or payment processor, guaranteeing zero listing fees for owners and zero booking surcharges for consumers.

---

## Goals

- **Direct Consumer-to-Owner Connection**: Enable guests to initiate direct inquiries via WhatsApp or phone call without platform mediation, service fees, or checkout markups.
- **Structured Discovery & Instant Comparison**: Provide guests with searchable, granular filters (geographic regions, capacity, tariffs, and amenity requirements like pools, DJ permits, and overnight stay facilities) to quickly compare countryside venues side-by-side.
- **Free Visibility for Farmhouse Owners**: Give local property owners a clean, dedicated digital storefront to list their facilities, upload verified photographs and video reels, and receive qualified bookings without recurring SaaS or agency fees.
- **De-fragment Social Media Hunting**: Eliminate the reliance on unstructured Instagram reels, broken WhatsApp group links, and outdated local classifieds by establishing a single source of truth for Bhopal farmhouses.
- **Editorial Quality & Curation**: Maintain a high aesthetic and editorial quality standard through human owner verification before listings go live on the public directory.

---

## Target Users

### 1. Guests & Event Organizers (Visitors)
- **Profile**: Couples planning destination weddings, sangeet ceremonies, families organizing weekend picnics or reunions, corporate leads booking offsite retreats, and youth organizing birthdays or pool parties.
- **Core Needs**:
  - Clear, authentic photography and video walkthroughs of the grounds.
  - Transparent pricing ranges (tariffs per 24-hour session) and capacity thresholds.
  - Granular amenities checklist (e.g., DJ permitted hours, swimming pool, catering flexibility, power backup, AC rooms).
  - Accurate landmark directions with Google Maps links.
  - One-click contact with the owner to check availability and negotiate directly.

### 2. Farmhouse Owners & Property Custodians
- **Profile**: Private individuals, agricultural landowners, and hospitality custodians operating event farmhouses across the Bhopal perimeter.
- **Core Needs**:
  - Free, frictionless listing creation without complex registration software or account passwords.
  - A professional presentation for their estate that elevates perceived value.
  - Clear ownership boundaries and privacy controls (confidential verification telephone line kept private; public enquiry line displayed only for verified leads).
  - Inquiries delivered straight to their personal WhatsApp or mobile number without handling an extraneous dashboard.

---

## Key Features

### 1. Home Page (`index.html`)
- **Editorial Header & Navigation**: Minimal brand bar with logo (`🏡 Bhopal Farmline`), responsive mobile menu toggle, direct links to `Browse`, `About`, and a neumorphic CTA pill for `List Your Farmhouse`.
- **Hero Split Section**:
  - Editorial typography headline with subtle staggered line reveals (`revealUp`).
  - Real-time animated number tickers (`animateNumberCountUp`) tracking approved farmhouse counts, total Bhopal regions covered, and 100% zero booking fee guarantee.
  - **Dynamic Rotating Video Showcase**: Automatically loads approved farmhouses with uploaded video reels, cross-fading every 8 seconds with an editorial caption overlay (Property Name and Area tag). Falls back seamlessly to an earthy static placeholder when no video reels are active.
- **Real-Time Live Search Bar**: Instant client-side search across farmhouse name, area, address, and description keywords with clear (`✕`) action.
- **Dual Neumorphic Filter Panel**:
  - **Region / Location Chips**: Dynamic area pills featuring pre-set Bhopal regions (Kolar Road, Ratibad, Kerwa Dam, etc.) with automatic discovery of custom locations submitted by live properties (e.g., Kardai Village).
  - **Amenity Chips**: Multi-select tactile chips with custom iconography (Pool 🏊, DJ Allowed 🎵, Bonfire/BBQ 🔥, AC Rooms ❄️, Overnight Stay 🌙, Catering 🍽️, Parking 🅿️, etc.).
  - Real-time selection counter and clear all filters action.
- **"Naya Aaya" (Recently Added) Section**: Horizontal scroll ribbon highlighting the latest approved property listings with `NEW LISTING` editorial badges.
- **Editorial Farmhouse Card Grid**:
  - Magazine-style flat cards separated by thin hairline rules without heavy bordered boxes.
  - Image banner with lazy loading, decoding async, and fixed aspect ratio to eliminate layout shift (CLS = 0).
  - Caption-style metadata in monospace (`📍 Region`), headline serif title, capacity and price stat pairs, and top-3 amenity pills.
  - Tactile Neumorphic Buttons: Separate `.neu-raised` **WhatsApp** (pre-filled enquiry string) and **Call** buttons.
  - Scroll-triggered card reveal animations and 4–6° subtle cursor 3D tilt interaction.
- **Empty State**: Playful, informative zero-results card with one-click filter reset and a prompt to list a new farmhouse.
- **Footer**: Three-column editorial footer containing brand mission statement, directory navigation links, and administrative contact channels.

### 2. Property Detail Page (`farmhouse.html`)
- **Deep-Link State Handling**: URL parameter parsing (`?id=...`) to dynamically fetch and bind listing data from Supabase or memory cache.
- **Asymmetric 2-Column Editorial Layout**:
  - **Media Gallery (Left Column)**:
    - Interactive 4:3 showcase featuring either the primary photograph or an embedded HTML5 video player with native controls.
    - Horizontal thumbnail strip allowing smooth switching between the featured Property Video (`🎥 Video`) and photo gallery.
    - High-resolution modal **Lightbox** overlay with next/previous controls and backdrop dismissal.
  - **Property Specifications (Right Column)**:
    - Editorial region tag and oversized serif headline (`Fraunces`).
    - Neumorphic badge pills for verified guest capacity and tariff range.
    - Event suitability tags (`Wedding 💒`, `Birthday 🎂`, `Picnic 🧺`, `Corporate 💼`).
    - Primary conversion actions: Full-width `.btn-whatsapp` ("WhatsApp Owner") with pre-filled inquiry text, `.btn-call` ("Call Owner"), and Web Share API ("Share Link") with fallback clipboard copying tooltip.
    - Full amenities grid with corresponding custom emojis.
- **Extended Information Sections**:
  - **About this Farmhouse**: Detailed narrative describing lawn boundaries, house rules, and amenities.
  - **Verified Reviews**: Community guest reviews showcasing name, event type, and feedback.
  - **Property FAQs**: Neumorphic accordion drawer expanding and collapsing frequently asked questions using CSS grid row transitions.
  - **Location & Navigation**: Physical address pairing with a one-click Google Maps search link.

### 3. Farmhouse Submission Page (`add-farmhouse.html`)
- **Ownership Gate**: Full-viewport gate requiring users to explicitly declare whether they are the genuine property owner/authorized custodian before uncovering the form.
- **Numbered Editorial Sections**:
  - `01 — BASIC INFORMATION`: Farmhouse name, area selection (dropdown with "Other" field triggering a dynamic text input), guest capacity, physical address, and tariff range.
  - `02 — CONTACT DETAILS`: Confidential verification telephone number (strictly internal), public customer inquiry telephone number, and public WhatsApp line (with "Same as Phone" auto-fill sync).
  - `03 — SPECIFICATIONS & AMENITIES`: Overview/house rules textarea, tactile toggle chips for all supported amenities, and event suitability checkboxes with animated checkmarks (`✓`).
  - `04 — PROPERTY PHOTOGRAPHY & VIDEO`:
    - Multi-photo upload area supporting up to 5 images with client-side preview thumbnails and individual deletion controls.
    - Optional Property Video upload supporting MP4, WebM, and MOV formats (strict client-side cap at 20MB) with an inline video preview player, file metadata, and remove/replace actions.
  - `05 — CONFIRMATION & SUBMISSION`: Affirmation checkbox enabling the final submit button; anti-spam honeypot input field (`website`) invisible to humans.
- **Submission Feedback**: Loading state with dynamic status text ("Compressing & uploading photos...", "Uploading property video...") followed by a clean success confirmation page explaining the 24–48 hour verification window.

### 4. Static Informational Pages (`about.html` & `privacy.html`)
- **About Page**: Contextual background on why Bhopal Farmline was founded (demolishing the broker cartel, transparent standard, operational workflow, community verification).
- **Privacy Policy**: Clear transparency disclosures explaining that end-users are tracked with zero advertising trackers, property data is stored securely in Supabase, and telephone numbers supplied for internal verification are permanently segregated from the public web.

---

## Success Metrics

1. **Total Inquiries Generated (`enquiry_count`)**: Primary business metric tracking visitor intent via clicks on WhatsApp and Call buttons across cards and detail pages.
2. **Approved Active Listings**: Cumulative count of verified, active farmhouses published on the live directory.
3. **Regional Coverage**: Number of distinct Bhopal sub-districts and suburban roads represented with at least one active listing.
4. **Owner Submission Velocity**: Frequency of weekly/monthly property listings submitted through `add-farmhouse.html`.
5. **Engagement & Media Interaction**: Ratio of visitors engaging with the rotating hero video showcase and viewing gallery photos before clicking contact channels.

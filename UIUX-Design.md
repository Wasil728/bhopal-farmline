# UI/UX Design System & Specification — Bhopal Farmline

---

## Typography

Bhopal Farmline pairs classic editorial publishing typography with contemporary geometric and monospace letterforms, drawing inspiration from high-end print publications (*Kinfolk*, *Cereal*, *The Gentlewoman*).

| Font Family | CSS Variable | Fallback Stack | Roles & Visual Rationale |
| :--- | :--- | :--- | :--- |
| **Fraunces** | `--font-display` | `Georgia, serif` | **Headlines & Editorial Titles**: An expressive, high-contrast serif with soft optical curves that evokes heritage warmth and Indian countryside luxury. Used for large hero titles, property names, modal headers, and section statements. |
| **Plus Jakarta Sans** | `--font-body` | `system-ui, sans-serif` | **Body & Narrative Text**: A clean, highly legible modern geometric sans-serif tuned for extended reading comfort on mobile screens. Used for property descriptions, review feedback, form labels, and FAQs. |
| **JetBrains Mono** | `--font-mono` | `monospace` | **Metadata, Data Labels & Stats**: A disciplined monospace font used for timestamps, numbers, uppercase category eyebrows, geographical coordinates, and pricing markers. Provides clear data contrast against serif headlines. |

---

## Color Tokens & Palette

The color system is derived from natural earth tones: warm clay, tactile parchment, and soft stone.

| Design Token | Hex / Value | Semantic Role & Purpose |
| :--- | :--- | :--- |
| **`--bg-base`** | `#eef0ec` | The universal neumorphic foundation; a calm, low-saturation warm off-white/sage stone upon which all shadows cast. |
| **`--bg-white`** | `#f6f8f5` | Elevated crisp surface highlight used for high-contrast card accents and modal backdrops. |
| **`--neu-shadow-dark`**| `#c8ccc4` | The lower-right cast shadow creating physical depth and elevation on interactive components. |
| **`--neu-shadow-light`**| `#ffffff` | The upper-left specular light bounce reflecting simulated directional ambient light. |
| **`--ink-primary`** | `#14150f` | Near-black charcoal used for primary headlines, card names, and prominent typography. |
| **`--ink-body`** | `#4a4d43` | Deep olive-slate providing optimal 65–75 character readability for long-form descriptions. |
| **`--ink-secondary`**| `#4a4d43` | Secondary text color for input values, subtitle copy, and specifications. |
| **`--ink-muted`** | `#8a8d80` | Soft mineral grey for uppercase mono eyebrows, caption labels, and inactive icon states. |
| **`--ink-rule`** | `rgba(20,21,15,0.12)` | Subtle hairline divider tone separating cards, header segments, and sections. |
| **`--ink-rule-strong`**| `rgba(20,21,15,0.22)` | Emphasized divider tone for major editorial transitions. |
| **`--accent`** | `#b5502f` | Terracotta / earthen clay rust; the primary conversion color for CTA pills, active chips, and brand accents. |
| **`--accent-hover`** | `#9c4227` | Deeper burnt rust triggered during hover states on active buttons. |
| **`--accent-subtle`**| `rgba(181,80,47,0.08)`| Soft rust tint used as background highlight for selected checkboxes and active filter chips. |
| **`--success`** | `#3e6b4a` | Forest olive green used for WhatsApp conversion moments and copied-link indicators. |
| **`--error`** | `#8b3d3d` | Brick red used for destructive actions (e.g. photo deletion) and validation warnings. |
| **`--warning`** | `#8b6a2c` | Muted amber used for caution notices and pending listing indicators. |

---

## UI Components & Patterns

### 1. Neumorphic Buttons & Interactive Controls
- **`.neu-raised`**: Simulates a physical component extruded from the background plane using dual box-shadows (`6px 6px 12px var(--neu-shadow-dark), -6px -6px 12px var(--neu-shadow-light)`). On hover, shadows deepen (`8px 8px 16px`).
- **`.neu-pressed`**: Inverts shadows to inset (`inset 4px 4px 8px var(--neu-shadow-dark), inset -4px -4px 8px var(--neu-shadow-light)`), visually depressing the control into the page surface.
- **Tactile Active Depress**: Under `:active` states, buttons scale down subtly (`scale(0.975)`) with an immediate inset shadow, delivering physical haptic feedback on touch and click.

### 2. Editorial Magazine Farmhouse Cards
- Moves entirely away from heavy bordered boxes and boxed dashboards.
- Features a full-width, clean landscape photograph with fixed 8px border radius and 400x220 aspect ratio.
- Caption-style metadata sits directly below the image in monospace (`📍 Kolar Road`).
- Farmhouse title rendered in serif `Fraunces`.
- Pricing and capacity paired as editorial stat couplets rather than colorful stickers.
- WhatsApp and Call buttons provide the sole raised neumorphic tactile accent on an otherwise restrained, flat editorial card.
- Cards feature scroll-triggered fade-in animations and 4–6° cursor-guided 3D tilt interaction.

### 3. Dual Filter Chips & Accordions
- **Region Chips**: Raised tactile pills that invert into pressed chips with a crisp `1.5px solid var(--accent)` border and terracotta tint upon selection.
- **Amenity Chips**: Multi-select toggle chips pairing custom emoji iconography with clean typography and dynamic active indicators.
- **Eyebrow Headers**: Small, uppercase, letter-spaced monospace labels (`0.65rem`, `letter-spacing: 0.14em`) anchoring filter categories.

### 4. Full-Bleed Ownership Gate
- Centered editorial dialogue on `add-farmhouse.html`.
- Oversized serif inquiry: *"Do you own or manage this farmhouse?"* with a hairline divider.
- Side-by-side neumorphic decision buttons: "Yes, I am the Owner / Custodian" (which uncovers the form) and "No, I'm a Guest" (redirecting to `index.html`).

### 5. Numbered Form Sections
- Multi-step visual progression organized into numbered editorial segments:
  - `01 — BASIC INFORMATION`
  - `02 — CONTACT DETAILS`
  - `03 — SPECIFICATIONS & AMENITIES`
  - `04 — PROPERTY PHOTOGRAPHY & VIDEO`
  - `05 — CONFIRMATION & SUBMISSION`
- Inputs, selects, and textareas are `.neu-raised` by default and depress smoothly to `.neu-pressed` upon `:focus`.
- Checkboxes feature an animated checkmark (`✓`) sliding into place on selection.

---

## Wireframes & Page Layouts

### 1. Home Page (`index.html`)
- **Header**: Fixed top bar (72px height) containing left-aligned logo (`🏡 Bhopal Farmline`), right-aligned navigation items (`Browse`, `About`), and a raised CTA pill (`List Your Farmhouse`).
- **Hero Split**:
  - *Left Column (Content)*: Monospace metadata bar (`Bhopal's Curated Farmhouse Directory · 2026 Edition`), oversized multi-line serif headline (*"Escape the City.<br>Book Directly with Farmhouse Owners."*), explanatory paragraph, and a 3-column glass-morphic stat counter box (Farmhouses, Areas Covered, 100% Free).
  - *Right Column (Media)*: Rounded media container with soft neumorphic cast shadows. Plays a rotating showcase of real approved property video reels with a frosted glass caption in the bottom-left; falls back to an earthy countryside placeholder when zero video reels exist.
- **Search & Filter Bar**:
  - Centered search card containing an inset input box with a magnifying glass prefix and clear button.
  - Two distinct chip rows below: Region / Area row and Amenities row, accompanied by an active selection counter badge.
- **"Naya Aaya" Showcase**: Horizontal scrolling reel with recent additions.
- **Listings Column**: Section header with total count and a 3-column CSS Grid (`minmax(320px, 1fr)`) of editorial farmhouse cards.
- **Footer**: Three-column editorial footer with copyright, navigation, and contact lines.

### 2. Property Detail Page (`farmhouse.html`)
- **Header & Breadcrumb**: Sticky navigation bar followed by an editorial back link: `← Back to all listings`.
- **Asymmetric 2-Column Split Layout**:
  - *Left Column (Media Showcase - 1.4fr)*: Large 4:3 gallery container. Houses either the native HTML5 property video player (with controls) or primary photograph. Directly beneath sits an interactive thumbnail strip with a dedicated `🎥 Video` chip and photo thumbnails that launch a full-screen image lightbox.
  - *Right Column (Specifications - 1.0fr)*: Sticky summary card with uppercase location tag, large serif property name, badge chips for capacity/tariffs, event suitability pills, full amenities checklist, and primary action buttons (WhatsApp, Call, Share).
- **Lower Editorial Blocks**: Full-width stacked sections for "About this Farmhouse", guest reviews, frequently asked questions (accordion), and a Google Maps launch button.

### 3. Farmhouse Submission Page (`add-farmhouse.html`)
- **State A (The Gate)**: Centered full-screen question checking owner authenticity.
- **State B (The Application Form)**: Centered, max-width 780px editorial form layout structured by the 5 numbered sections. Inputs feature neumorphic depth. Photo and video areas feature drag-and-drop dashed zones with live preview chips. Bottom sticky submission row with confirmation checkbox and primary action button.

---

## User Flows

### 1. Visitor / Host Booking Flow
```
[ Land on Home Page ]
         |
         v
[ Filter by Region / Amenity OR Enter Search Query ]
         |
         v
[ Scan Editorial Farmhouse Cards ]
         |
         v
[ Click Card -> Open Farmhouse Detail Page ]
         |
         v
[ Watch Video Reel / Browse Photo Gallery / Check Tariffs & Rules ]
         |
         +-----------------------------+
         |                             |
         v                             v
[ Click "WhatsApp Owner" ]      [ Click "Call Owner" ]
         |                             |
         v                             v
[ Opens WhatsApp with pre-filled ] [ Initiates direct cellular ]
[ inquiry string:                ] [ phone call to owner.      ]
[ "Hi! I saw [Name] on Bhopal    ]
[ Farmline and want to check..." ]
```

### 2. Farmhouse Owner Listing Flow
```
[ Click "List Your Farmhouse" CTA ]
         |
         v
[ Pass Ownership Gate ("Yes, I am the Owner / Custodian") ]
         |
         v
[ Fill Basic Property Details & Tariffs ]
         |
         v
[ Supply Confidential Verification Phone & Public WhatsApp Line ]
         |
         v
[ Select Amenities & Event Suitability Chips ]
         |
         v
[ Upload up to 5 Photos (Compressed Client-Side) + Optional Video ]
         |
         v
[ Confirm Authenticity Affirmation & Click "Submit Listing" ]
         |
         v
[ Listing saved to Supabase with status = 'pending' ]
         |
         v
[ Directory Admin receives submission -> Calls verification number ]
         |
         v
[ Admin updates status to 'approved' in Supabase ]
         |
         v
[ Farmhouse instantly appears live on Directory and Hero Showcase ]
```

---

## Design System Rationale: "Editorial-Neumorphic"

Bhopal Farmline establishes an intentional synthesis between two opposing design languages: **Classic Editorial Publishing** and **Tactile Neumorphism**.

### Why This Separation Was Chosen
1. **Preventing Neumorphic Fatigue**: Pure neumorphism across large surfaces, card bodies, and backgrounds causes severe accessibility problems, muddy contrast ratios, and visual confusion. By restricting neumorphism strictly to *small interactive elements* (buttons, filter chips, checkboxes, and input fields), the interface provides rich tactile feedback without cluttering content.
2. **Editorial Restraint for High-Value Venues**: Countryside farmhouses and wedding retreats represent premium lifestyle decisions. Framing properties through crisp serif typography (`Fraunces`), generous whitespace, disciplined hairline rules, and high-resolution photography establishes dignity, authenticity, and editorial trust.
3. **Touch-First Mobile Ergonomics**: Neumorphic raised and pressed states provide intuitive physical confirmation on touch devices, confirming when an amenity filter is toggled or when a contact action has been registered.

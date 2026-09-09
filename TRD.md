# Technical Requirements Document (TRD) — Bhopal Farmline

---

## System Architecture

Bhopal Farmline employs a Jamstack client-server architecture pairing a lightweight, build-free static frontend (vanilla ECMAScript 2022, HTML5 semantic markup, and custom modern CSS) with a managed Backend-as-a-Service (BaaS) powered by Supabase. The static assets (`index.html`, `farmhouse.html`, `add-farmhouse.html`, `about.html`, `privacy.html`, `css/style.css`, `js/main.js`, and `js/data.js`) require no compilation, Node.js runtime, or server-side hydration, enabling global edge delivery via static web hosts such as GitHub Pages, Netlify, or Vercel. Database storage, object asset hosting, and security enforcement are offloaded to Supabase's hosted PostgreSQL engine and Amazon S3-backed Storage API, interfacing directly over encrypted HTTPS REST APIs via the Supabase JavaScript client library.

```
+-----------------------------------------------------------------------+
|                       CLIENT BROWSER (EDGE)                           |
|  index.html | farmhouse.html | add-farmhouse.html | about.html        |
|  CSS Tokens / Neumorphic Engine (style.css)                           |
|  Runtime Engine & State Cache (main.js & data.js)                     |
+-------------------+-------------------------------+-------------------+
                    |                               |
           REST API / HTTPS                 Direct Storage CDN
                    |                               |
+-------------------v-------------------------------+-------------------+
|                        SUPABASE PLATFORM                              |
|  +--------------------------------+  +-----------------------------+  |
|  |       PostgreSQL Engine        |  |       Object Storage        |  |
|  | - farmhouses (table)           |  | - farmhouse-photos (bucket) |  |
|  | - Row Level Security (RLS)     |  | - farmhouse-videos (bucket) |  |
|  | - RPC enquiry incrementer      |  |                             |  |
|  +--------------------------------+  +-----------------------------+  |
+-----------------------------------------------------------------------+
```

---

## Functional Requirements

### 1. Client-Side Search & Multi-Faceted Filtering
- **Keyword Filtering**: Matches user queries in real-time across property title (`name`), zone (`area`), street address (`address`), and full narrative (`description`).
- **Dynamic Region Tagging**: Evaluates `allFarmhouses` in memory; builds filter chips by merging predefined static areas from `window.areas` with unique custom areas extracted from active listings, normalizing casing to eliminate duplication.
- **Conjunctive Amenity Filtering**: Implements an `Array.prototype.every` set intersection algorithm ensuring displayed properties satisfy 100% of all selected amenity chips simultaneously.
- **Empty & Active Filter State**: Dynamically mounts zero-result state cards and triggers selection counter badges with dedicated "Clear All Filters" controls.

### 2. Form Ingestion & Multi-Stage Validation
- **Ownership Verification Gate**: Pre-submission gate checking custodian consent before rendering the form fields into the DOM tree.
- **Strict Input Constraints**:
  - Telephone & WhatsApp inputs enforce a 10-digit numerical cap via regex replacement (`/[^0-9]/g.slice(0, 10)`).
  - Area dropdown triggers custom text input fields dynamically when `"Other"` is selected.
  - "Same as Phone" checkbox synchronizes public phone digits to WhatsApp in real-time.
  - Required fields and confirmation check (`#formPermission`) toggle the submission button disabled state.
- **Bot Mitigation Honeypot**: Invisible honeypot trap input (`input[name="website"]`); submissions containing data in this field abort immediately with zero network requests dispatched.

### 3. Client-Side Media Compression & Storage Uploads
- **Image Compression Pipeline**: Processes up to 5 concurrent images client-side via `browser-image-compression` (capped at max 0.2MB / 200KB, max dimension 1280px, WebWorker execution).
- **Unique Asset Key Generation**: Files receive collision-resistant keys:
  `farm_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`.
- **Property Video Handling**:
  - Validates video payload client-side prior to network dispatch (`file.size <= 20 * 1024 * 1024` bytes; MIME validation strictly checks `video/mp4`, `video/webm`, `video/quicktime`).
  - Dispatches raw video binary directly to the `farmhouse-videos` bucket, with automatic resilience fallback to `farmhouse-photos` if dedicated video storage is unconfigured.
  - Non-blocking error handling ensures database listing submission proceeds smoothly even if media upload encounters a transient network timeout.

### 4. Rotating Hero Video Showcase
- **Video Query Filter**: Identifies approved properties possessing a valid, non-null `video_url`.
- **Lazy Stream Cycling**: Avoids preloading all video binaries at once; injects the video stream URL directly into the active `.hero-video` DOM node on cycle, swapping streams every 8,000ms.
- **Smooth Opacity Cross-Fade**: Employs a 300ms CSS opacity transition (`.video-fade`) to prevent jarring visual jump-cuts between clips.
- **Accessibility & Motion Preference**: Evaluates `window.matchMedia('(prefers-reduced-motion: reduce)')`; halts automated carousel intervals when reduced motion is requested by the OS.

### 5. Detail Page & Deep Linking
- **Query Parameter Routing**: Reads `?id=...` parameter from `window.location.search`.
- **Hybrid Source Retrieval**: Queries Supabase directly by ID (`.eq('id', id).single()`); falls back to in-memory `window.farmhouses` if offline or during testing.
- **Dual Gallery Media Switcher**: Exposes global methods `showGalleryVideo()` and `changeMainImage(url, el, index)`, dynamically swapping between native video players and responsive photo lightboxes.

### 6. Contact & Enquiry Click Tracking
- **Click Signals**: WhatsApp and Call buttons format target links with sanitized telephone digits (`https://wa.me/91XXXXXXXXXX?text=...` and `tel:+91XXXXXXXXXX`).
- **Counter Invocation**: Connects to the database to increment the listing's `enquiry_count` metric asynchronously via Supabase RPC (`increment_enquiry`), logging lead volume without disrupting visitor redirection.

---

## Integrations & APIs

| Service / Dependency | Version / Source | Purpose |
| :--- | :--- | :--- |
| **`@supabase/supabase-js`** | `v2.x` (jsDelivr CDN) | Direct PostgreSQL database client, authentication layer, and storage bucket asset dispatcher. |
| **`browser-image-compression`**| `v2.0.1` (jsDelivr CDN) | Multi-threaded client-side image compression reducing 5MB+ phone photos to ~200KB prior to cloud upload. |
| **Google Fonts API** | `fonts.googleapis.com` | High-performance CDN distribution of font families: *Fraunces* (Display), *Plus Jakarta Sans* (Body), and *JetBrains Mono* (Code/Data). |
| **HTML5 Media APIs** | Native Browser DOM | Native video playback controls, full-screen capability, and Web Worker execution pools. |
| **Web Share API** | `navigator.share` / `clipboard` | Native device sharing sheet with automatic fallback to clipboard writing. |
| **Intersection Observer API** | Native Browser DOM | Viewport-triggered scroll reveals, 3D tilt effects, draw-in divider lines, and number counters. |

---

## Security & Compliance

- **Row Level Security (RLS)**:
  - **Public Read (`SELECT`)**: Restricted via Postgres RLS policy to records where `status = 'approved'` (or unmoderated local environments).
  - **Public Creation (`INSERT`)**: Anonymous users can insert listings, but the database schema restricts inserted status defaults strictly to `'pending'`.
  - **Modification / Deletion (`UPDATE` / `DELETE`)**: Blocked for anonymous anon tokens; accessible only to authenticated project administrators.
- **Confidential Information Protection**:
  - The submitter's confidential phone number (`formSubmitterPhone`) is collected solely for manual human telephone verification by the administrator and is never mapped to public listing attributes or serialized into frontend HTML.
- **Cross-Site Scripting (XSS) Prevention**:
  - All dynamic data rendered into template literals undergoes sanitization via `escapeHTML()`, replacing `&`, `<`, `>`, `"`, and `'` with escaped HTML character entities.
- **Anti-Spam Honeypot**:
  - An invisible dummy field (`input[name="website"]`) traps automated spam scrapers, terminating execution before storage or database queries execute.
- **Storage Bucket Constraints**:
  - Image uploads are bounded by client-side compression (<200KB); video uploads are checked against an explicit 20MB ceiling before initiating HTTP payload transfers.

---

## Infrastructure & Deployment

- **Static Frontend Hosting**: Zero-configuration deployment compatible with GitHub Pages, Netlify, Cloudflare Pages, or Amazon S3/CloudFront. Supports immediate global CDN distribution and SSL termination.
- **Supabase Cloud Infrastructure (Free Tier)**:
  - **PostgreSQL Database**: 500 MB relational database storage.
  - **Object Storage**: 1 GB asset storage with CDN distribution.
  - **Monthly Bandwidth & API Cap**: 50,000 monthly active API requests and 2 GB egress bandwidth.
- **Client Caching Architecture (`sessionStorage`)**:
  - Listing payloads fetched from Supabase are serialized to `sessionStorage` under `bhopal_farmhouses_live_v4` with an active Time-To-Live (TTL) of 2 minutes.
  - Repeated page reloads and back-navigation read directly from memory cache, minimizing database read requests by over 90%.

---

## Constraints & Assumptions

1. **Zero-Dollar Operational Budget**: System must run entirely within free tiers of Supabase, CDN providers, and static hosting services without incurring infrastructure charges.
2. **Manual Admin Moderation Workflow**: No complex administrative UI is built into the frontend; administrator moderates and publishes pending listings directly using the Supabase Table Editor or SQL Console (`status = 'approved'`).
3. **No User Authentication Footprint**: End-users and farmhouse owners are not required to create passwords, manage JWTs, or maintain persistent profiles.
4. **Media Storage Thresholds**:
   - Photographs: Client-compressed to ~200KB each (allowing ~5,000 photos per 1 GB bucket).
   - Video Walkthroughs: Capped at 20MB per property (allowing ~50 full-length reels on the free storage tier before requiring retention archiving or upgraded storage).

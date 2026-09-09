# Backend & Database Schema Specification — Bhopal Farmline

---

## System Overview

Bhopal Farmline leverages Supabase as an all-in-one Backend-as-a-Service (BaaS) to deliver enterprise-grade PostgreSQL reliability, object storage, and secure client-side querying without maintaining a dedicated backend application server (Node.js/Python/Go). Supabase provides a fully managed PostgreSQL database with Row-Level Security (RLS), S3-compatible asset storage buckets for property photography and video walkthroughs, and automated RESTful PostgREST APIs. This architectural selection minimizes infrastructure complexity, offers generous free-tier limits (500 MB database, 1 GB storage), and empowers the static frontend to communicate directly with PostgreSQL securely over HTTPS using the public Anonymous (`anon`) API key.

---

## Database Schema

All property listings, administrative moderation statuses, media paths, and structured customer feedback reside within the primary `farmhouses` PostgreSQL table.

### `farmhouses` Table Definition

| Column Name | Data Type | Default Value | Nullable | Description / Usage |
| :--- | :--- | :--- | :--- | :--- |
| **`id`** | `UUID` | `gen_random_uuid()` | `NO` | Unique primary key identifying the farmhouse listing. |
| **`name`** | `TEXT` | `None` | `NO` | Official commercial name of the farmhouse (e.g. *"Green Land Farm House"*). |
| **`area`** | `TEXT` | `None` | `NO` | Geographic cluster or road in Bhopal (e.g. *"Kolar Road"*, *"Ratibad"*, *"Kardai Village"*). |
| **`address`** | `TEXT` | `None` | `NO` | Complete physical postal address and navigation landmark description. |
| **`capacity`** | `INTEGER` | `50` | `NO` | Maximum guest capacity recommended for daytime/evening events. |
| **`price_range`** | `TEXT` | `None` | `NO` | Indicative 24-hour tariff string (e.g. *"₹12,000 – ₹18,000"* or *"4000-5000"*). |
| **`phone`** | `VARCHAR(15)` | `None` | `NO` | Public customer inquiry telephone line displayed on listing cards and detail page. |
| **`whatsapp`** | `VARCHAR(15)` | `None` | `NO` | Direct 10-digit mobile number for WhatsApp inquiry message redirection. |
| **`description`** | `TEXT` | `''` | `YES` | Long-form editorial narrative covering lawn area, rules, and property vibe. |
| **`image_urls`** | `TEXT[]` | `ARRAY[]::TEXT[]` | `NO` | Array of public Supabase CDN URLs pointing to compressed property photographs. |
| **`video_url`** | `TEXT` | `NULL` | `YES` | Public URL pointing to optional 10–20 second property walkthrough/drone video reel. |
| **`amenities`** | `TEXT[]` | `ARRAY[]::TEXT[]` | `NO` | Array of amenity tokens (e.g. `['Pool', 'DJ Allowed', 'Bonfire/BBQ', 'AC Rooms']`). |
| **`best_for`** | `TEXT[]` | `ARRAY[]::TEXT[]` | `NO` | Event suitability classifications (e.g. `['Wedding', 'Birthday', 'Picnic']`). |
| **`reviews`** | `JSONB` | `'[]'::JSONB` | `NO` | Structured guest reviews array containing objects with `name`, `event`, and `text`. |
| **`faqs`** | `JSONB` | `'[]'::JSONB` | `NO` | Structured frequently asked questions array containing `{ q: string, a: string }` objects. |
| **`enquiry_count`**| `INTEGER` | `0` | `NO` | Metric tracking total customer leads generated (WhatsApp + Phone Call clicks). |
| **`status`** | `VARCHAR(20)` | `'pending'` | `NO` | Moderation state: `'pending'` (awaiting verification) or `'approved'` (live). |
| **`owner_confirmed`**| `BOOLEAN` | `true` | `NO` | Legal affirmation flag recorded during ownership gate submission. |
| **`submitted_at`**| `TIMESTAMPTZ` | `NOW()` | `NO` | Exact timestamp when the property listing was submitted by the custodian. |
| **`verified_at`** | `TIMESTAMPTZ` | `NULL` | `YES` | Timestamp when the administrator verified and approved the property. |

---

## API Endpoints & Queries

The frontend interfaces with the database through the `@supabase/supabase-js` client library executing standardized PostgREST requests:

### 1. Fetch Approved Listings (Home Page & Directory)
```javascript
const { data, error } = await supabaseClient
  .from('farmhouses')
  .select('*')
  .order('submitted_at', { ascending: false });

// Filter approved rows in runtime
const approved = data.filter(item => !item.status || item.status.toLowerCase() === 'approved');
```

### 2. Fetch Single Farmhouse by ID (Detail Page)
```javascript
const { data, error } = await supabaseClient
  .from('farmhouses')
  .select('*')
  .eq('id', id)
  .single();
```

### 3. Ingest New Farmhouse Submission (`add-farmhouse.html`)
```javascript
const { error } = await supabaseClient
  .from('farmhouses')
  .insert([{
    name: "Green Valley Retreat",
    area: "Kerwa Dam",
    address: "Near Kerwa Dam, Bhopal",
    capacity: 100,
    price_range: "₹12,000 – ₹18,000",
    phone: "9826000001",
    whatsapp: "9826000001",
    description: "Lush lawn with private pool...",
    amenities: ["Pool", "DJ Allowed", "AC Rooms"],
    best_for: ["Wedding", "Birthday"],
    image_urls: ["https://.../farm_1.jpg", "https://.../farm_2.jpg"],
    video_url: "https://.../video_1.mp4",
    owner_confirmed: true,
    status: "pending"
  }]);
```

### 4. Increment Farmhouse Enquiry Counter (Stored Procedure / RPC)
```sql
CREATE OR REPLACE FUNCTION increment_enquiry(farmhouse_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE farmhouses
  SET enquiry_count = enquiry_count + 1
  WHERE id = farmhouse_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```
*Frontend execution:*
```javascript
await supabaseClient.rpc('increment_enquiry', { farmhouse_id: farmId });
```

---

## Data Models & Relationships

- **Single-Table Design**: At the platform's current operational scale (~100–500 properties), all data is intentionally consolidated into a single flat `farmhouses` relation. This eliminates relational joins, simplifies client-side state caching, and reduces database query latency to under 50ms.
- **Embedded JSONB Documents**:
  - `reviews` is stored as an embedded array of JSON objects:
    ```json
    [
      { "name": "Rahul Sharma", "event": "Birthday Party", "text": "Stunning pool and cooperative host." },
      { "name": "Priya Singh", "event": "Family Gathering", "text": "Loved the greenery and serenity." }
    ]
    ```
  - `faqs` is stored as an embedded key-value collection:
    ```json
    [
      { "q": "Is DJ permitted past 10 PM?", "a": "DJ is permitted in indoor hall after 10 PM." },
      { "q": "Is outside catering allowed?", "a": "Yes, outside catering is fully supported." }
    ]
    ```
- **Arrays (`TEXT[]`)**: Used for `amenities`, `best_for`, and `image_urls`, allowing PostgreSQL native array queries and indexing without intermediate lookup tables.

---

## Authentication & Authorization

- **Client Authentication**: No consumer login, session cookies, or user auth tokens exist. The client uses the public Supabase Anonymous token (`SUPABASE_ANON_KEY`).
- **PostgreSQL Row Level Security (RLS) Policies**:
  ```sql
  -- 1. Enable RLS
  ALTER TABLE farmhouses ENABLE ROW LEVEL SECURITY;

  -- 2. Public SELECT policy: Visitors can only read approved listings
  CREATE POLICY "Public Read Approved"
  ON farmhouses FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

  -- 3. Public INSERT policy: Anyone can submit, but status defaults to pending
  CREATE POLICY "Public Insert Pending"
  ON farmhouses FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'pending');

  -- 4. UPDATE/DELETE policy: Locked strictly to admin roles
  CREATE POLICY "Admin Full Access"
  ON farmhouses FOR ALL
  TO service_role
  USING (true);
  ```
- **Administrative Moderation**: The directory administrator logs in via the official Supabase Dashboard to review submissions, review uploaded photos/videos, conduct the phone verification, and approve rows (`UPDATE farmhouses SET status = 'approved' WHERE id = ...;`).

---

## Infrastructure & Object Storage

The platform provisions two dedicated Supabase Storage Buckets backed by Amazon S3:

### 1. `farmhouse-photos` Bucket
- **Public Visibility**: Enabled (Public Read).
- **MIME Types**: `image/jpeg`, `image/png`, `image/webp`.
- **Target Size**: ~200 KB per photograph (pre-compressed client-side).
- **Public URL Format**:
  `https://jgardnqycrpvgkhwzdkw.supabase.co/storage/v1/object/public/farmhouse-photos/[filename].jpg`

### 2. `farmhouse-videos` Bucket
- **Public Visibility**: Enabled (Public Read).
- **MIME Types**: `video/mp4`, `video/webm`, `video/quicktime`.
- **Size Limit**: 20 MB hard ceiling enforced client-side prior to transfer.
- **Resilience Fallback**: If the dedicated `farmhouse-videos` bucket is omitted, the frontend automatically routes video uploads into `farmhouse-photos` transparently.

---

## Scalability & Monitoring

1. **Storage Capacity Projections (Free Tier 1 GB Bucket)**:
   - *Photographs*: At an average compressed payload of ~200 KB per photo, 1 GB accommodates approximately 5,000 photos (~1,000 farmhouses with 5 photos each).
   - *Videos*: At an average video size of 15 MB, 1 GB accommodates ~60 full property reels before needing storage upgrades or S3 offloading.
2. **Database Throughput (Free Tier 500 MB Postgres)**:
   - A single farmhouse row consumes approximately 1.5 KB of storage including embedded JSONB and text arrays. 500 MB can store over 300,000 listings.
3. **Session Caching Minimization**:
   - `sessionStorage` caching (`TTL = 2-5 minutes`) collapses redundant read requests during user browsing sessions, keeping monthly API operations well beneath the 50,000 monthly request free threshold.
4. **Zero Continuous Overhead**:
   - Realtime WebSocket channels (`supabase.channel`) are deliberately disabled to prevent persistent connection leaks and memory overhead on mobile browsers.

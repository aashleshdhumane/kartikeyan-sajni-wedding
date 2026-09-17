# 🪷 Kartikeyan & Sajni — Digital Wedding Invitation

A premium, mobile-first digital wedding invitation website designed for sharing via WhatsApp.  
Built as a static HTML project — no server, no framework, no build step required.

---

## Project Structure

```
wedding-invitation/
│
├── index.html                  ← Main invitation page
├── manifest.json               ← PWA manifest
├── README.md
│
├── assets/
│   ├── gift-qr.png             ← Replace with your actual UPI QR code image
│   ├── images/
│   │   └── share-preview.jpg   ← OG/WhatsApp preview image (replace with couple photo)
│   ├── gallery/                ← Add couple/pre-wedding photos here
│   └── icons/
│       ├── icon-192.png        ← PWA app icon (192×192)
│       └── icon-512.png        ← PWA app icon (512×512)
│
├── css/
│   └── styles.css              ← Full design system (do not scatter styles elsewhere)
│
├── js/
│   ├── config.js               ← ⭐ EDIT THIS FILE to customise the invitation
│   ├── app.js                  ← Main orchestration (wires everything together)
│   ├── countdown.js            ← Timezone-aware wedding countdown
│   ├── guestbookService.js     ← Guestbook abstraction (local → Firebase/Supabase)
│   ├── calendar.js             ← .ics calendar event generator
│   └── sharing.js              ← Web Share API + WhatsApp + clipboard fallback
│
└── data/
    └── guestbook.json          ← Sample guestbook messages (for reference only)
```

---

## 1. Running Locally

No installation needed. From the project folder:

```bash
# Python 3
python -m http.server 8000

# Python 2 (fallback)
python -m SimpleHTTPServer 8000

# Node.js (if you have npx)
npx serve .
```

Then open: **http://localhost:8000**

> ⚠️ Always run via a local server (not by opening index.html directly as a `file://` URL),  
> because some browser security rules block features like the Share API and localStorage  
> on `file://` URLs.

---

## 2. Customising the Invitation

**Everything is controlled from one file: `js/config.js`**

Open `js/config.js` and update:

### Couple names
```js
groom: { name: "Kartikeyan Gupta", firstName: "Kartikeyan", lastName: "Gupta" },
bride:  { name: "Sajni Suvarna",   firstName: "Sajni",       lastName: "Suvarna" },
```

### Wedding date & time
```js
wedding: {
    dateTime:    "2027-02-14T19:00:00",   // ISO format, in the configured timezone
    timezone:    "Asia/Kolkata",
    dateDisplay: "Saturday, 14 February 2027",
    timeDisplay: "7:00 PM onwards"
}
```

### Events (Mehendi, Haldi, Sangeet, Wedding, Reception)
```js
events: [
    {
        id:      "wedding",
        enabled: true,
        name:    "Wedding Ceremony",
        date:    "Saturday, 14 February 2027",
        time:    "7:00 PM onwards",
        venue:   "Grand Palace Banquet Hall",
        address: "123 MG Road, Bengaluru 560001",
        mapsUrl: "https://maps.google.com/?q=..."  // paste your Google Maps share link
    }
    // ... add/remove events as needed
]
```

Set `enabled: false` on any event to hide it automatically.

### Family members
```js
groomFamily: {
    intro:    "The Gupta Family",
    parents:  [ { name: "Ramesh Gupta",  relation: "Father" }, ... ],
    siblings: [ ... ],
    elders:   [ ... ],
    others:   [ ... ]
},
brideFamily: { ... }
```

### Couple story
```js
story: "They met in 2021 through common friends..."
// Leave empty ("") to hide the story section entirely
```

### Contacts / RSVP
```js
contacts: [
    { label: "Groom's Family", name: "Ramesh Gupta", phone: "+919876543210", whatsapp: "+919876543210" },
    { label: "Bride's Family", name: "...",           phone: "...",           whatsapp: "..."           }
]
```

### Hashtag
```js
hashtag: "#KartikeyanWedsSajni"
// Leave empty ("") to hide
```

### Logistics (dress code, parking, travel, etc.)
```js
logistics: {
    dressCode:     "Traditional or formal attire. Preferred colours: Ivory, Gold, Maroon.",
    parking:       "Complimentary valet parking at the venue entrance.",
    accommodation: "Outstation guests: Hotel Grand, MG Road — mention 'K&S wedding' for reserved rate.",
    shuttle:       "Shuttle from Hotel Grand at 6:30 PM.",
    travel:        "Nearest airport: Kempegowda International (BLR), 45 min from venue."
}
// Leave any field as "" to hide it
```

---

## 3. Replacing the QR Code

1. Generate your UPI QR code from your bank app or Google Pay.
2. Save the image as `assets/gift-qr.png` (overwrite the placeholder).
3. Optionally set `gift.upiId` in `config.js` to display the UPI ID below the QR code.

```js
gift: {
    enabled: true,
    qrImage: "assets/gift-qr.png",
    upiId:   "kartikeyan@upi"
}
```

---

## 4. Adding Photos (Gallery)

1. Add your images to `assets/gallery/`.
2. Register them in `config.js`:

```js
gallery: {
    enabled: true,
    images: [
        { src: "assets/gallery/photo1.jpg", alt: "Kartikeyan & Sajni at the beach" },
        { src: "assets/gallery/photo2.jpg", alt: "Engagement evening" },
        { src: "assets/gallery/photo3.jpg", alt: "With family" }
    ]
}
```

Set `enabled: false` to hide the gallery entirely.

---

## 5. Replacing the Share Preview Image

The image shown when the invitation link is shared on WhatsApp, iMessage, etc. is:

```
assets/images/share-preview.jpg
```

Replace it with a beautiful couple photo or designed invitation graphic.  
Recommended dimensions: **1200 × 630 px** (standard OG image size).

---

## 6. Deploying for Free

### Option A — GitHub Pages (recommended)

1. Create a free account at [github.com](https://github.com).
2. Create a new repository (e.g. `kartikeyan-sajni-wedding`).
3. Upload all project files.
4. Go to **Settings → Pages → Source → Deploy from branch → main / root**.
5. Your invitation will be live at:  
   `https://yourusername.github.io/kartikeyan-sajni-wedding`

Set `sharing.invitationUrl` in `config.js` to this URL before sharing.

### Option B — Netlify (drag and drop, no Git needed)

1. Go to [app.netlify.com](https://app.netlify.com).
2. Drag the entire `wedding-invitation/` folder onto the Netlify dashboard.
3. Get an instant URL like `https://random-name.netlify.app`.
4. Optionally connect a custom domain.

### Option C — Cloudflare Pages

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com).
2. Connect your GitHub repository.
3. No build command needed — just set the root as `/`.
4. Deploys automatically on every push.

### Option D — Vercel

1. Install: `npm i -g vercel`
2. From the project folder: `vercel --prod`
3. Follow the prompts — done.

---

## 7. Connecting the Guestbook to a Backend

The guestbook currently stores messages in **localStorage** (per device).  
To have messages sync across all guests' phones, connect a real backend.

### Recommended: Supabase (free tier, easiest)

1. Create a free account at [supabase.com](https://supabase.com).
2. Create a new project → create a table called `guestbook`:

```sql
create table guestbook (
  id         uuid default gen_random_uuid() primary key,
  name       text not null,
  message    text not null,
  timestamp  bigint not null,
  created_at timestamp with time zone default now()
);

-- Allow public read
create policy "Public read" on guestbook for select using (true);
-- Allow public insert (add rate limiting via Supabase dashboard)
create policy "Public insert" on guestbook for insert with check (true);
alter table guestbook enable row level security;
```

3. Get your `SUPABASE_URL` and `SUPABASE_ANON_KEY` from project settings.
4. Add the Supabase client to `index.html` (before your scripts):

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
```

5. In `js/guestbookService.js`, uncomment the `supabaseProvider` block and fill in your credentials:

```js
const supabase = window.supabase.createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY');
```

6. Change `weddingConfig.guestbook.provider` to `"supabase"` in `config.js`.

> 🔒 **Security note:** Only use the public `anon` key in frontend code.  
> Never paste the `service_role` key into any browser-facing file.

### Alternative: Firebase Firestore

1. Go to [console.firebase.google.com](https://console.firebase.google.com).
2. Create a project → enable Firestore → set rules to allow public read/write (restrict after testing).
3. Add the Firebase SDK to `index.html`.
4. Uncomment the `firebaseProvider` block in `guestbookService.js`.
5. Change `provider` to `"firebase"` in `config.js`.

---

## 8. Music

To add optional background music:

1. Place an MP3 in `assets/` (e.g. `assets/wedding-song.mp3`).
2. Update `config.js`:

```js
music: {
    enabled: true,
    src:     "assets/wedding-song.mp3",
    title:   "Our Song"
}
```

Music **never autoplays** — the guest must tap the music button.  
Their preference (play/pause) is saved locally across page refreshes.

---

## 9. What to Change When Final Details Are Confirmed

When the actual wedding details are finalised, update these fields in `config.js`:

| Field | What to update |
|---|---|
| `wedding.dateTime` | Actual ceremony date/time |
| `wedding.dateDisplay` | Human-readable date |
| `wedding.timeDisplay` | Human-readable time |
| `events[*].date` | Each event's confirmed date |
| `events[*].time` | Each event's confirmed time |
| `events[*].venue` | Confirmed venue name |
| `events[*].address` | Full address |
| `events[*].mapsUrl` | Google Maps share link for each venue |
| `groomFamily.*` | Real family member names |
| `brideFamily.*` | Real family member names |
| `contacts[*].phone` | Real contact phone numbers |
| `contacts[*].whatsapp` | Real WhatsApp numbers |
| `gift.upiId` | Real UPI ID |
| `sharing.invitationUrl` | Live hosted URL |
| `hashtag` | Wedding hashtag if changing |

Then replace:
- `assets/gift-qr.png` → actual UPI QR code
- `assets/images/share-preview.jpg` → couple photo (1200×630 px)
- `assets/gallery/*.jpg` → pre-wedding / engagement photos

---

## 10. Browser Support

Tested and designed for:

| Browser | Support |
|---|---|
| Chrome (Android) | ✅ Full |
| Safari (iPhone) | ✅ Full |
| WhatsApp in-app browser | ✅ Full |
| Chrome (Desktop) | ✅ Full |
| Firefox | ✅ Full |
| Samsung Internet | ✅ Full |

Features with graceful fallbacks:
- **Web Share API** → falls back to WhatsApp deep link
- **Clipboard API** → falls back to `execCommand('copy')`
- **localStorage** (guestbook) → can be swapped for Firebase/Supabase
- **Google Fonts** → falls back to Georgia / Arial system fonts if offline
- **Animations** → disabled/reduced for `prefers-reduced-motion: reduce`

---

## 11. Performance Notes

- No JavaScript framework (React, Vue, etc.) — vanilla JS only
- No CSS framework — hand-crafted design system
- Google Fonts loaded with `display=swap` — no render blocking
- Images lazy-loaded
- Animations use CSS transforms (GPU composited)
- Initial HTML renders immediately, JS enhances progressively
- Total JS: ~5 files, ~25 KB unminified

---

*With love, from the Gupta & Suvarna families.*  
*Built with care for every guest who receives this invitation.*

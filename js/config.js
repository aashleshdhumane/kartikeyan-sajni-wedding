/**
 * ============================================================
 * WEDDING INVITATION — CENTRAL CONFIGURATION
 * ============================================================
 * Edit this file to customise the entire invitation.
 * Do NOT scatter wedding details across other files.
 * ============================================================
 */

const weddingConfig = {

    // ── Couple ───────────────────────────────────────────────
    groom: {
        name:       "Kartikeyan Gupta",
        firstName:  "Kartikeyan",
        lastName:   "Gupta"
    },

    bride: {
        name:       "Sajni Suvarna",
        firstName:  "Sajni",
        lastName:   "Suvarna"
    },

    // ── Wedding hashtag (leave empty to hide) ────────────────
    hashtag: "#KartikeyanWedsSajni",

    // ── Main wedding event (used for countdown, hero, meta) ──
    wedding: {
        // ISO date string — set your actual date/time here
        // Format: "YYYY-MM-DDTHH:MM:SS"
        dateTime:  "2027-02-14T19:00:00",
        timezone:  "Asia/Kolkata",

        // Display-friendly strings (auto-derived if left empty)
        dateDisplay: "Saturday, 14 February 2027",
        timeDisplay: "7:00 PM onwards"
    },

    // ── Individual events ────────────────────────────────────
    // Set `enabled: false` or remove an entry to hide it.
    events: [
        {
            id:          "mehendi",
            enabled:     true,
            icon:        "🌿",
            name:        "Mehendi",
            description: "An intimate evening of colour, music and togetherness as the bride's hands are adorned.",
            date:        "Thursday, 11 February 2027",
            time:        "4:00 PM onwards",
            venue:       "Gupta Residence",
            address:     "[Full address — to be confirmed]",
            mapsUrl:     ""   // paste Google Maps share link here
        },
        {
            id:          "haldi",
            enabled:     true,
            icon:        "🌼",
            name:        "Haldi",
            description: "A joyful morning of blessings, laughter and the golden glow of turmeric.",
            date:        "Friday, 12 February 2027",
            time:        "10:00 AM onwards",
            venue:       "Gupta Residence",
            address:     "[Full address — to be confirmed]",
            mapsUrl:     ""
        },
        {
            id:          "sangeet",
            enabled:     true,
            icon:        "🎶",
            name:        "Sangeet",
            description: "An evening of music, dance and celebration with family and friends.",
            date:        "Friday, 12 February 2027",
            time:        "7:00 PM onwards",
            venue:       "[Sangeet Venue Name]",
            address:     "[Full address — to be confirmed]",
            mapsUrl:     ""
        },
        {
            id:          "wedding",
            enabled:     true,
            icon:        "🪷",
            name:        "Wedding Ceremony",
            description: "The sacred ceremony uniting Kartikeyan and Sajni in the presence of family, elders and loved ones.",
            date:        "Saturday, 14 February 2027",
            time:        "7:00 PM onwards",
            venue:       "[Wedding Hall Name]",
            address:     "[Full address, City — to be confirmed]",
            mapsUrl:     ""
        },
        {
            id:          "reception",
            enabled:     true,
            icon:        "✨",
            name:        "Reception",
            description: "An evening of dinner, joy and celebration to welcome the newlyweds.",
            date:        "Sunday, 15 February 2027",
            time:        "7:30 PM onwards",
            venue:       "[Reception Venue Name]",
            address:     "[Full address — to be confirmed]",
            mapsUrl:     ""
        }
    ],

    // ── Groom's family ───────────────────────────────────────
    groomFamily: {
        intro: "The Gupta Family",
        parents: [
            { name: "[Father's Name]",  relation: "Father" },
            { name: "[Mother's Name]",  relation: "Mother" }
        ],
        siblings: [
            { name: "[Brother / Sister Name]", relation: "Brother" },
            { name: "[Brother / Sister Name]", relation: "Sister"  }
        ],
        elders: [
            { name: "[Elder's Name]", relation: "Grandfather" },
            { name: "[Elder's Name]", relation: "Grandmother" }
        ],
        others: [
            { name: "[Family Member]", relation: "Uncle" },
            { name: "[Family Member]", relation: "Aunt"  }
        ]
    },

    // ── Bride's family ───────────────────────────────────────
    brideFamily: {
        intro: "The Suvarna Family",
        parents: [
            { name: "[Father's Name]",  relation: "Father" },
            { name: "[Mother's Name]",  relation: "Mother" }
        ],
        siblings: [
            { name: "[Brother / Sister Name]", relation: "Brother" },
            { name: "[Brother / Sister Name]", relation: "Sister"  }
        ],
        elders: [
            { name: "[Elder's Name]", relation: "Grandfather" },
            { name: "[Elder's Name]", relation: "Grandmother" }
        ],
        others: [
            { name: "[Family Member]", relation: "Uncle" },
            { name: "[Family Member]", relation: "Aunt"  }
        ]
    },

    // ── Couple story (leave empty to hide section) ────────────
    story: "",
    // Example:
    // story: "They met in 2021 through common friends in Bengaluru. What began as long conversations over chai slowly grew into something neither had planned. Kartikeyan proposed on a quiet evening at their favourite café, and Sajni said yes before he could finish his sentence.",

    // ── Gift / blessings ─────────────────────────────────────
    gift: {
        enabled:    true,
        qrImage:    "assets/gift-qr.png",
        upiId:      "",          // e.g. "kartikeyan@upi"
        upiName:    "Kartikeyan Gupta",
        note:       "Your presence is our greatest joy. If you would like to bless the couple, a simple transfer means the world to us."
    },

    // ── Contacts / RSVP ──────────────────────────────────────
    contacts: [
        {
            label:    "Groom's Family",
            name:     "[Contact Name]",
            phone:    "",          // e.g. "+919876543210"
            whatsapp: ""           // same number, or different
        },
        {
            label:    "Bride's Family",
            name:     "[Contact Name]",
            phone:    "",
            whatsapp: ""
        }
    ],

    // ── Gallery ───────────────────────────────────────────────
    // Set enabled: false to hide gallery.
    gallery: {
        enabled: true,
        images: [
            // { src: "assets/gallery/photo1.jpg", alt: "Kartikeyan & Sajni" },
            // { src: "assets/gallery/photo2.jpg", alt: "Engagement evening" }
        ]
    },

    // ── Music ─────────────────────────────────────────────────
    music: {
        enabled: false,
        src:     "",   // e.g. "assets/wedding-song.mp3"
        title:   "Our Song"
    },

    // ── Guestbook ─────────────────────────────────────────────
    guestbook: {
        enabled:   true,
        provider:  "local",   // "local" | "firebase" | "supabase"
        maxLength: 300
    },

    // ── Guest info / logistics ────────────────────────────────
    logistics: {
        dressCode:      "",     // e.g. "Traditional or Formal attire. Preferred colours: Ivory, Gold, Maroon"
        parking:        "",     // e.g. "Complimentary valet parking available at the venue entrance"
        accommodation:  "",     // e.g. "Outstation guests: [Hotel Name], [Address] — mention 'Kartikeyan-Sajni wedding' for a reserved rate"
        shuttle:        "",     // e.g. "Shuttle service from [Hotel Name] at 6:30 PM"
        travel:         ""      // e.g. "Nearest airport: Kempegowda International, Bengaluru (BLR)"
    },

    // ── Sharing ───────────────────────────────────────────────
    sharing: {
        // The URL where this invitation will be hosted
        // Leave empty to use window.location.href
        invitationUrl: "",
        message:       "With love and happiness, we invite you to celebrate the wedding of Kartikeyan & Sajni ❤️\n\nWe would be delighted to have you with us.\n\n"
    },

    // ── SEO / Meta ────────────────────────────────────────────
    meta: {
        title:       "The Wedding of Kartikeyan & Sajni | 14 February 2027",
        description: "With the blessings of our families, we joyfully invite you to celebrate the wedding of Kartikeyan Gupta and Sajni Suvarna.",
        previewImage: "assets/images/share-preview.jpg"
    }

};

// Make config immutable at runtime to prevent accidental mutation
Object.freeze(weddingConfig);

// Export for module-aware environments; safe to ignore in plain HTML
if (typeof module !== "undefined") {
    module.exports = weddingConfig;
}

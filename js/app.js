/**
 * app.js
 * ─────────────────────────────────────────────────────────────
 * Main orchestration for the wedding invitation.
 * Initialises all modules, builds dynamic DOM from config,
 * wires up all interactions.
 *
 * Load order in index.html:
 *   config.js → countdown.js → guestbookService.js →
 *   calendar.js → sharing.js → app.js
 * ─────────────────────────────────────────────────────────────
 */

(function () {
    "use strict";

    const cfg = weddingConfig;

    // ── Utility helpers ───────────────────────────────────────

    /** Create an element with optional classes and text */
    function el(tag, classes, text) {
        const e = document.createElement(tag);
        if (classes) e.className = classes;
        if (text !== undefined) e.textContent = text;
        return e;
    }

    /** Safely set text content — never innerHTML with user data */
    function setText(id, value) {
        const node = document.getElementById(id);
        if (node && value) node.textContent = value;
    }

    /** Show a section; hide if condition is false */
    function showSection(id, condition) {
        const section = document.getElementById(id);
        if (!section) return;
        if (!condition) {
            section.classList.add("hidden");
        } else {
            section.classList.remove("hidden");
        }
    }

    /** Show a short toast notification */
    function showToast(message, duration = 3000) {
        const toast = document.getElementById("toast");
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), duration);
    }

    // ── 1. Loading & Opening Screen ───────────────────────────

    function initLoadingAndOpening() {
        const loading = document.getElementById("loading-screen");
        const opening = document.getElementById("opening-screen");
        const main    = document.getElementById("main-content");
        const nav     = document.getElementById("site-nav");

        // Hide loader after fonts/assets settle
        window.addEventListener("load", () => {
            setTimeout(() => {
                if (loading) loading.classList.add("hidden");
            }, 600);
        });

        // Fallback: always hide loader after 2 s
        setTimeout(() => {
            if (loading) loading.classList.add("hidden");
        }, 2000);

        function revealMain() {
            if (opening) opening.classList.add("hidden");
            if (main)    main.classList.add("visible");
            if (nav)     setTimeout(() => nav.classList.add("visible"), 800);
        }

        // Opening screen: tap/click to enter
        if (opening) {
            opening.addEventListener("click", revealMain);
            opening.addEventListener("keydown", e => {
                if (e.key === "Enter" || e.key === " ") revealMain();
            });
            opening.setAttribute("tabindex", "0");
            opening.setAttribute("role", "button");
            opening.setAttribute("aria-label", "Tap to open your invitation");
        } else {
            // No opening screen — show main immediately
            if (main) main.classList.add("visible");
            if (nav)  setTimeout(() => nav.classList.add("visible"), 400);
        }
    }

    // ── 2. Navigation ─────────────────────────────────────────

    function initNavigation() {
        const menuBtn  = document.getElementById("nav-menu-btn");
        const dropdown = document.getElementById("nav-dropdown");

        if (!menuBtn || !dropdown) return;

        menuBtn.addEventListener("click", () => {
            const isOpen = dropdown.classList.contains("open");
            dropdown.classList.toggle("open");
            menuBtn.classList.toggle("open");
            menuBtn.setAttribute("aria-expanded", String(!isOpen));
        });

        // Close on nav link click
        dropdown.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                dropdown.classList.remove("open");
                menuBtn.classList.remove("open");
                menuBtn.setAttribute("aria-expanded", "false");
            });
        });

        // Close on outside click
        document.addEventListener("click", e => {
            if (!menuBtn.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove("open");
                menuBtn.classList.remove("open");
                menuBtn.setAttribute("aria-expanded", "false");
            }
        });
    }

    // ── 3. Scroll behaviours ──────────────────────────────────

    function initScroll() {
        const progressBar = document.getElementById("scroll-progress");
        const backToTop   = document.getElementById("back-to-top");

        function onScroll() {
            const scrolled = window.scrollY;
            const total    = document.documentElement.scrollHeight - window.innerHeight;

            // Progress bar
            if (progressBar && total > 0) {
                progressBar.style.width = `${(scrolled / total) * 100}%`;
            }

            // Back to top
            if (backToTop) {
                if (scrolled > 400) backToTop.classList.add("visible");
                else                backToTop.classList.remove("visible");
            }
        }

        window.addEventListener("scroll", onScroll, { passive: true });

        if (backToTop) {
            backToTop.addEventListener("click", () => {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        }
    }

    // ── 4. Scroll Reveal ──────────────────────────────────────

    function initScrollReveal() {
        const items = document.querySelectorAll(".reveal");
        if (!items.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
        );

        items.forEach(item => observer.observe(item));
    }

    // ── 5. Floating Petals ────────────────────────────────────

    function initPetals() {
        const canvas = document.getElementById("hero-petals-canvas");
        if (!canvas) return;

        // Respect reduced-motion preference
        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReduced) return;

        const petalCount = 18;
        const colors = [
            "rgba(212,175,87,0.35)",
            "rgba(255,255,255,0.2)",
            "rgba(184,151,58,0.25)",
            "rgba(255,200,180,0.2)"
        ];

        for (let i = 0; i < petalCount; i++) {
            const petal = document.createElement("div");
            const size  = 6 + Math.random() * 10;
            const delay = Math.random() * 12;
            const dur   = 8 + Math.random() * 10;
            const left  = Math.random() * 100;
            const color = colors[Math.floor(Math.random() * colors.length)];

            petal.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${left}%;
                top: -${size}px;
                background: ${color};
                border-radius: 50% 0 50% 0;
                animation: petal-fall ${dur}s linear ${delay}s infinite;
                pointer-events: none;
            `;
            canvas.appendChild(petal);
        }
    }

    // ── 6. Hero dynamic content ───────────────────────────────

    function populateHero() {
        setText("hero-groom-name",    cfg.groom.firstName);
        setText("hero-bride-name",    cfg.bride.firstName);
        setText("hero-date-value",    cfg.wedding.dateDisplay || cfg.wedding.dateTime || "");
        setText("hero-time-value",    cfg.wedding.timeDisplay || "");

        const hashtagEl = document.getElementById("hero-hashtag");
        if (hashtagEl) {
            if (cfg.hashtag) {
                hashtagEl.textContent = cfg.hashtag;
            } else {
                hashtagEl.classList.add("hidden");
            }
        }
    }

    // ── 7. Event Summary Card ─────────────────────────────────

    function populateEventSummary() {
        const mainEvent = cfg.events.find(e => e.id === "wedding" && e.enabled);
        if (!mainEvent) {
            showSection("event-summary", false);
            return;
        }

        setText("summary-venue",   mainEvent.venue || "");
        setText("summary-date",    mainEvent.date  || "");
        setText("summary-time",    mainEvent.time  || "");
        setText("summary-address", mainEvent.address || "");

        // Maps button
        const mapsBtn = document.getElementById("summary-maps-btn");
        if (mapsBtn) {
            if (mainEvent.mapsUrl) {
                mapsBtn.href = mainEvent.mapsUrl;
            } else {
                mapsBtn.classList.add("hidden");
            }
        }
    }

    // ── 8. Events Section ─────────────────────────────────────

    function populateEvents() {
        const container = document.getElementById("events-container");
        if (!container) return;

        const activeEvents = cfg.events.filter(e => e.enabled);
        if (!activeEvents.length) {
            showSection("events-section", false);
            return;
        }

        container.innerHTML = "";

        activeEvents.forEach((ev, idx) => {
            const card = document.createElement("article");
            card.className = "event-card reveal" + (idx > 0 ? ` reveal-delay-${Math.min(idx, 4)}` : "");
            card.setAttribute("aria-label", ev.name);

            // Venue block
            const venueHtml = `
                <div class="event-venue-block">
                    <div class="event-venue-name">${_safe(ev.venue)}</div>
                    ${ev.address ? `<div class="event-venue-address">${_safe(ev.address)}</div>` : ""}
                </div>`;

            // Maps button
            const mapsBtn = ev.mapsUrl
                ? `<a href="${_safe(ev.mapsUrl)}" target="_blank" rel="noopener noreferrer"
                      class="btn btn-ghost btn-sm" aria-label="Get directions to ${_safe(ev.name)}">
                      📍 Get Directions
                   </a>`
                : "";

            card.innerHTML = `
                <div class="event-card-header">
                    <div class="event-icon" aria-hidden="true">${_safe(ev.icon)}</div>
                    <div class="event-title-group">
                        <h3 class="event-name">${_safe(ev.name)}</h3>
                        <p class="event-date-time">${_safe(ev.date)}${ev.time ? " &nbsp;·&nbsp; " + _safe(ev.time) : ""}</p>
                    </div>
                </div>
                ${ev.description ? `<p class="event-description">${_safe(ev.description)}</p>` : ""}
                ${ev.venue ? venueHtml : ""}
                <div class="event-actions">
                    ${mapsBtn}
                </div>`;

            container.appendChild(card);
        });
    }

    // Escape for safe innerHTML insertion (text content only)
    function _safe(str) {
        return String(str || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    // ── 9. Family Section ─────────────────────────────────────

    function _buildFamilyCard(family) {
        const card = document.createElement("div");
        card.className = "family-card reveal";

        const title = el("h3", "family-card-title", family.intro || "");
        card.appendChild(title);

        const groups = [
            { label: "Parents",             members: family.parents   || [] },
            { label: "Brothers & Sisters",  members: family.siblings  || [] },
            { label: "Elders",              members: family.elders    || [] },
            { label: "Family",              members: family.others    || [] }
        ];

        groups.forEach(group => {
            // Filter out placeholder entries that haven't been filled
            const filled = group.members.filter(m =>
                m.name && !m.name.startsWith("[")
            );
            if (!filled.length) return;

            const groupEl = el("div", "family-group");
            groupEl.innerHTML = `<p class="family-group-label">${_safe(group.label)}</p>`;

            filled.forEach(member => {
                const memberEl = el("div", "family-member");
                memberEl.innerHTML = `
                    <span class="family-member-name">${_safe(member.name)}</span>
                    <span class="family-member-relation">${_safe(member.relation || "")}</span>`;
                groupEl.appendChild(memberEl);
            });

            card.appendChild(groupEl);
        });

        return card;
    }

    function populateFamily() {
        const container = document.getElementById("family-container");
        if (!container) return;

        const groomCard = _buildFamilyCard(cfg.groomFamily);
        const brideCard = _buildFamilyCard(cfg.brideFamily);

        // Check if either card has any real content beyond the title
        const groomHasContent = groomCard.querySelectorAll(".family-member").length > 0;
        const brideHasContent = brideCard.querySelectorAll(".family-member").length > 0;

        if (!groomHasContent && !brideHasContent) {
            // Placeholders only — still render with placeholder names
            const pGroomCard = _buildFamilyCardWithPlaceholders(cfg.groomFamily);
            const pBrideCard = _buildFamilyCardWithPlaceholders(cfg.brideFamily);
            container.appendChild(pGroomCard);
            container.appendChild(pBrideCard);
        } else {
            container.appendChild(groomCard);
            container.appendChild(brideCard);
        }
    }

    function _buildFamilyCardWithPlaceholders(family) {
        const card = document.createElement("div");
        card.className = "family-card reveal";

        const title = el("h3", "family-card-title", family.intro || "");
        card.appendChild(title);

        const groups = [
            { label: "Parents",             members: family.parents  || [] },
            { label: "Brothers & Sisters",  members: family.siblings || [] },
            { label: "Elders",              members: family.elders   || [] },
            { label: "Family",              members: family.others   || [] }
        ];

        groups.forEach(group => {
            if (!group.members.length) return;

            const groupEl = el("div", "family-group");
            groupEl.innerHTML = `<p class="family-group-label">${_safe(group.label)}</p>`;

            group.members.forEach(member => {
                const memberEl = el("div", "family-member");
                memberEl.innerHTML = `
                    <span class="family-member-name">${_safe(member.name)}</span>
                    <span class="family-member-relation">${_safe(member.relation || "")}</span>`;
                groupEl.appendChild(memberEl);
            });

            card.appendChild(groupEl);
        });

        return card;
    }

    // ── 10. Story Section ─────────────────────────────────────

    function populateStory() {
        const section = document.getElementById("story-section");
        const el      = document.getElementById("story-text");

        if (!cfg.story || !cfg.story.trim()) {
            showSection("story-section", false);
            return;
        }

        if (el) el.textContent = cfg.story;
    }

    // ── 11. Gallery ───────────────────────────────────────────

    function populateGallery() {
        if (!cfg.gallery?.enabled || !cfg.gallery?.images?.length) {
            showSection("gallery-section", false);
            return;
        }

        const grid = document.getElementById("gallery-grid");
        if (!grid) return;

        let currentIndex = 0;
        const images = cfg.gallery.images;

        images.forEach((imgCfg, i) => {
            const item = document.createElement("div");
            item.className = "gallery-item";
            item.setAttribute("role", "button");
            item.setAttribute("tabindex", "0");
            item.setAttribute("aria-label", `View photo: ${imgCfg.alt || i + 1}`);

            const img = document.createElement("img");
            img.src     = imgCfg.src;
            img.alt     = imgCfg.alt || `Photo ${i + 1}`;
            img.loading = "lazy";
            img.decoding = "async";

            item.appendChild(img);

            const openLightbox = () => {
                currentIndex = i;
                _openLightbox(images, currentIndex);
            };

            item.addEventListener("click", openLightbox);
            item.addEventListener("keydown", e => {
                if (e.key === "Enter" || e.key === " ") openLightbox();
            });

            grid.appendChild(item);
        });
    }

    function _openLightbox(images, index) {
        const lb    = document.getElementById("lightbox");
        const lbImg = document.getElementById("lightbox-img");
        if (!lb || !lbImg) return;

        let current = index;

        function show(i) {
            current = (i + images.length) % images.length;
            lbImg.src = images[current].src;
            lbImg.alt = images[current].alt || "";
        }

        show(current);
        lb.classList.add("open");
        document.body.style.overflow = "hidden";

        const close  = lb.querySelector(".lightbox-close");
        const prev   = lb.querySelector(".lightbox-prev");
        const next   = lb.querySelector(".lightbox-next");

        const closeFn = () => {
            lb.classList.remove("open");
            document.body.style.overflow = "";
        };

        const onKey = e => {
            if (e.key === "ArrowLeft")  show(current - 1);
            if (e.key === "ArrowRight") show(current + 1);
            if (e.key === "Escape")     closeFn();
        };

        lb.onclick = e => { if (e.target === lb) closeFn(); };
        if (close) close.onclick = closeFn;
        if (prev)  prev.onclick  = e => { e.stopPropagation(); show(current - 1); };
        if (next)  next.onclick  = e => { e.stopPropagation(); show(current + 1); };

        document.addEventListener("keydown", onKey);
        lb.addEventListener("click", function cleanup() {
            document.removeEventListener("keydown", onKey);
            lb.removeEventListener("click", cleanup);
        }, { once: true });
    }

    // ── 12. Gift / Blessings ──────────────────────────────────

    function populateGift() {
        if (!cfg.gift?.enabled) {
            showSection("gift-section", false);
            return;
        }

        const noteEl = document.getElementById("gift-note");
        if (noteEl && cfg.gift.note) noteEl.textContent = cfg.gift.note;

        const qrImg = document.getElementById("gift-qr-img");
        if (qrImg) {
            if (cfg.gift.qrImage) {
                qrImg.src = cfg.gift.qrImage;
                qrImg.alt = "Scan to send your blessings";
            } else {
                qrImg.closest(".gift-qr-wrapper")?.classList.add("hidden");
            }
        }

        const upiEl = document.getElementById("gift-upi");
        if (upiEl) {
            if (cfg.gift.upiId) {
                upiEl.textContent = cfg.gift.upiId;
            } else {
                upiEl.classList.add("hidden");
            }
        }
    }

    // ── 13. Logistics Section ─────────────────────────────────

    function populateLogistics() {
        const logistics = cfg.logistics || {};
        const items = [
            { key: "dressCode",     icon: "👗", label: "Dress Code",    id: "logistics-dresscode"     },
            { key: "parking",       icon: "🚗", label: "Parking",       id: "logistics-parking"       },
            { key: "accommodation", icon: "🏨", label: "Stay",          id: "logistics-accommodation" },
            { key: "shuttle",       icon: "🚌", label: "Shuttle",       id: "logistics-shuttle"       },
            { key: "travel",        icon: "✈️", label: "Getting Here",  id: "logistics-travel"        }
        ];

        const hasAny = items.some(i => logistics[i.key] && logistics[i.key].trim());
        if (!hasAny) {
            showSection("logistics-section", false);
            return;
        }

        const grid = document.getElementById("logistics-grid");
        if (!grid) return;

        grid.innerHTML = "";

        items.forEach(item => {
            const val = logistics[item.key];
            if (!val || !val.trim()) return;

            const div = document.createElement("div");
            div.className = "logistics-item reveal";
            div.innerHTML = `
                <div class="logistics-item-icon" aria-hidden="true">${_safe(item.icon)}</div>
                <div class="logistics-item-label">${_safe(item.label)}</div>
                <div class="logistics-item-value">${_safe(val)}</div>`;
            grid.appendChild(div);
        });
    }

    // ── 14. RSVP ──────────────────────────────────────────────

    function initRSVP() {
        const yesBtn  = document.getElementById("rsvp-yes");
        const noBtn   = document.getElementById("rsvp-no");
        const confirm = document.getElementById("rsvp-confirmation");

        if (!yesBtn || !noBtn || !confirm) return;

        // Make sure confirmation is hidden on load regardless of CSS
        confirm.style.display = "none";
        confirm.classList.remove("visible");

        function handleRsvp(attending, showMessage) {
            const message = attending
                ? "We are so delighted to have you with us! We look forward to celebrating together. ❤️"
                : "We understand, and we will miss you dearly. Thank you for letting us know.";

            yesBtn.disabled = true;
            noBtn.disabled  = true;

            // Only animate the message if triggered by an actual button tap
            if (showMessage) {
                confirm.textContent  = message;
                confirm.style.display = "block";
                confirm.classList.add("visible");
                setTimeout(() => {
                    confirm.scrollIntoView({ behavior: "smooth", block: "nearest" });
                }, 100);

                // Persist choice
                try {
                    localStorage.setItem("rsvp_response", JSON.stringify({
                        attending,
                        timestamp: Date.now()
                    }));
                } catch (e) { /* silent */ }
            }
        }

        // Restore previous state: just lock buttons, don't show message on reload
        try {
            const saved = JSON.parse(localStorage.getItem("rsvp_response") || "null");
            if (saved) {
                handleRsvp(saved.attending, false);

                // Show which button was chosen subtly
                const chosenBtn = saved.attending ? yesBtn : noBtn;
                chosenBtn.style.opacity = "0.6";
                chosenBtn.style.cursor  = "default";
            }
        } catch (e) { /* silent */ }

        yesBtn.addEventListener("click", () => handleRsvp(true,  true));
        noBtn.addEventListener("click",  () => handleRsvp(false, true));
    }

    // ── 15. Contacts ──────────────────────────────────────────

    function populateContacts() {
        const container = document.getElementById("contact-cards-container");
        if (!container) return;

        const contacts = (cfg.contacts || []).filter(c => c.phone || c.whatsapp);

        if (!contacts.length) {
            showSection("contact-section", false);
            return;
        }

        container.innerHTML = "";

        contacts.forEach(contact => {
            const card = document.createElement("div");
            card.className = "contact-card reveal";

            let actionsHtml = "";

            if (contact.phone) {
                const clean = contact.phone.replace(/\s/g, "");
                actionsHtml += `<a href="tel:${_safe(clean)}" class="btn btn-outline-dark btn-sm" aria-label="Call ${_safe(contact.name)}">📞 Call</a>`;
            }

            if (contact.whatsapp) {
                const wa = contact.whatsapp.replace(/[^0-9]/g, "");
                actionsHtml += `<a href="https://wa.me/${_safe(wa)}" target="_blank" rel="noopener noreferrer" class="btn btn-ghost btn-sm" aria-label="WhatsApp ${_safe(contact.name)}">💬 WhatsApp</a>`;
            }

            card.innerHTML = `
                <p class="contact-card-label">${_safe(contact.label || "")}</p>
                <p class="contact-card-name">${_safe(contact.name || "")}</p>
                <div class="contact-card-actions">${actionsHtml}</div>`;

            container.appendChild(card);
        });
    }

    // ── 16. Guestbook ─────────────────────────────────────────

    function initGuestbook() {
        if (!cfg.guestbook?.enabled) {
            showSection("guestbook-section", false);
            return;
        }

        const form      = document.getElementById("guestbook-form");
        const nameInput = document.getElementById("guestbook-name");
        const msgInput  = document.getElementById("guestbook-message");
        const charCount = document.getElementById("guestbook-char-count");
        const submitBtn = document.getElementById("guestbook-submit");
        const errorEl   = document.getElementById("guestbook-error");
        const list      = document.getElementById("guestbook-messages");
        const emptyMsg  = document.getElementById("guestbook-empty");

        if (!form) return;

        const MAX = guestbookService.limits.message;

        // Character counter
        if (msgInput && charCount) {
            msgInput.setAttribute("maxlength", MAX);
            msgInput.addEventListener("input", () => {
                const remaining = MAX - msgInput.value.length;
                charCount.textContent = `${msgInput.value.length} / ${MAX}`;
                charCount.style.color = remaining < 30 ? "#c0392b" : "";
            });
        }

        // Load existing messages
        async function loadMessages() {
            try {
                const messages = await guestbookService.getMessages();
                renderMessages(messages);
            } catch (e) {
                console.warn("[Guestbook] Could not load messages:", e);
            }
        }

        function renderMessages(messages) {
            if (!list) return;
            list.innerHTML = "";

            if (!messages || !messages.length) {
                if (emptyMsg) emptyMsg.style.display = "block";
                return;
            }

            if (emptyMsg) emptyMsg.style.display = "none";

            messages.forEach(msg => {
                const card = _buildMessageCard(msg);
                list.appendChild(card);
            });
        }

        function _buildMessageCard(msg) {
            const card = document.createElement("div");
            card.className = "guestbook-message-card";
            card.setAttribute("aria-label", `Message from ${msg.name}`);

            // msg.name and msg.message are already escaped by guestbookService
            const nameSpan = el("span", "guestbook-message-author", msg.name);
            const textEl   = el("p",    "guestbook-message-text",   msg.message);

            card.appendChild(textEl);
            card.appendChild(nameSpan);
            return card;
        }

        // Form submission
        form.addEventListener("submit", async e => {
            e.preventDefault();
            if (!nameInput || !msgInput) return;

            const name    = nameInput.value;
            const message = msgInput.value;

            if (errorEl) {
                errorEl.textContent = "";
                errorEl.classList.remove("visible");
            }

            if (submitBtn) {
                submitBtn.disabled     = true;
                submitBtn.textContent  = "Sending…";
            }

            try {
                const entry = await guestbookService.addMessage(name, message);

                // Prepend new message to top of list
                if (list && emptyMsg) emptyMsg.style.display = "none";
                if (list) {
                    const card = _buildMessageCard(entry);
                    list.prepend(card);
                }

                // Reset form
                nameInput.value = "";
                msgInput.value  = "";
                if (charCount) charCount.textContent = `0 / ${MAX}`;

                showToast("Your message has been sent! ❤️");

            } catch (err) {
                if (errorEl) {
                    errorEl.textContent = err.message;
                    errorEl.classList.add("visible");
                }
            } finally {
                if (submitBtn) {
                    submitBtn.disabled    = false;
                    submitBtn.textContent = "Send Congratulations ❤️";
                }
            }
        });

        loadMessages();
    }

    // ── 17. Sharing buttons ───────────────────────────────────

    function initSharing() {
        const shareBtn  = document.getElementById("share-btn");
        const waBtn     = document.getElementById("share-whatsapp-btn");
        const copyBtn   = document.getElementById("share-copy-btn");
        const saveBtn   = document.getElementById("save-date-btn");
        const saveBtnHero = document.getElementById("save-date-btn-hero");

        if (shareBtn) {
            shareBtn.addEventListener("click", () => InvitationSharing.share());
        }

        if (waBtn) {
            waBtn.addEventListener("click", () => InvitationSharing.shareWhatsApp());
        }

        if (copyBtn) {
            copyBtn.addEventListener("click", async () => {
                const ok = await InvitationSharing.copyLink();
                showToast(ok ? "Link copied to clipboard!" : "Could not copy — please copy manually.");
            });
        }

        const calendarHandler = () => CalendarGenerator.saveWeddingDate();
        if (saveBtn)     saveBtn.addEventListener("click", calendarHandler);
        if (saveBtnHero) saveBtnHero.addEventListener("click", calendarHandler);
    }

    // ── 18. Music Player ──────────────────────────────────────

    function initMusic() {
        if (!cfg.music?.enabled || !cfg.music?.src) {
            showSection("music-player", false);
            return;
        }

        const player  = document.getElementById("music-player");
        const btn     = document.getElementById("music-btn");
        const icon    = document.getElementById("music-icon");
        const audio   = document.createElement("audio");

        audio.src    = cfg.music.src;
        audio.loop   = true;
        audio.preload = "none";
        audio.setAttribute("aria-label", cfg.music.title || "Wedding music");

        if (player) player.classList.add("visible");

        // Restore preference
        const wasPaused = localStorage.getItem("music_paused") !== "false";
        let playing = false;

        function toggleMusic() {
            if (playing) {
                audio.pause();
                playing = false;
                if (btn)  btn.classList.remove("playing");
                if (icon) icon.textContent = "🎵";
                localStorage.setItem("music_paused", "true");
            } else {
                audio.play().then(() => {
                    playing = true;
                    if (btn)  btn.classList.add("playing");
                    if (icon) icon.textContent = "⏸";
                    localStorage.setItem("music_paused", "false");
                }).catch(err => {
                    console.warn("[Music] Playback blocked:", err);
                });
            }
        }

        if (btn) btn.addEventListener("click", toggleMusic);
    }

    // ── 19. Meta / SEO ────────────────────────────────────────

    function applyMeta() {
        const m = cfg.meta;
        if (!m) return;

        if (m.title)       document.title = m.title;

        _setMeta("description",         m.description);
        _setMeta("og:title",            m.title,       "property");
        _setMeta("og:description",      m.description, "property");
        _setMeta("og:image",            m.previewImage,"property");
        _setMeta("og:type",             "website",     "property");
        _setMeta("twitter:card",        "summary_large_image");
        _setMeta("twitter:title",       m.title);
        _setMeta("twitter:description", m.description);
        _setMeta("twitter:image",       m.previewImage);
    }

    function _setMeta(name, content, attr = "name") {
        if (!content) return;
        let tag = document.querySelector(`meta[${attr}="${name}"]`);
        if (!tag) {
            tag = document.createElement("meta");
            tag.setAttribute(attr, name);
            document.head.appendChild(tag);
        }
        tag.setAttribute("content", content);
    }

    // ── 20. Opening screen couple names ───────────────────────

    function populateOpeningScreen() {
        setText("opening-groom-name", cfg.groom.firstName);
        setText("opening-bride-name", cfg.bride.firstName);
    }

    // ── 21. Footer ────────────────────────────────────────────

    function populateFooter() {
        setText("footer-groom", cfg.groom.firstName);
        setText("footer-bride", cfg.bride.firstName);
        setText("footer-date",  cfg.wedding.dateDisplay || "");

        const hashEl = document.getElementById("footer-hashtag");
        if (hashEl) {
            if (cfg.hashtag) hashEl.textContent = cfg.hashtag;
            else             hashEl.classList.add("hidden");
        }
    }

    // ── 22. Invitation message ────────────────────────────────

    function populateMessage() {
        // Message is static copy in HTML — no dynamic replacement needed
        // unless config overrides it in future
    }

    // ── INIT ──────────────────────────────────────────────────

    function init() {
        try {
            applyMeta();
            populateOpeningScreen();
            populateHero();
            populateEventSummary();
            populateEvents();
            populateFamily();
            populateStory();
            populateGallery();
            populateGift();
            populateLogistics();
            populateContacts();
            populateFooter();

            Countdown.init();
            initRSVP();
            initGuestbook();
            initSharing();
            initMusic();

            // UI interactions
            initLoadingAndOpening();
            initNavigation();
            initScroll();
            initScrollReveal();
            initPetals();

        } catch (err) {
            console.error("[App] Initialisation error:", err);
            // Fail gracefully — basic HTML content remains readable
        }
    }

    // Run after DOM is ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})();

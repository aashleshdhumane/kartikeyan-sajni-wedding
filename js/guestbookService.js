/**
 * guestbookService.js
 * ─────────────────────────────────────────────────────────────
 * Abstraction layer for guestbook read/write operations.
 *
 * Current provider: "local" (localStorage)
 *
 * To switch to Firebase or Supabase, implement the same
 * interface below and change weddingConfig.guestbook.provider.
 *
 * Interface:
 *   guestbookService.getMessages()        → Promise<Message[]>
 *   guestbookService.addMessage(name, msg) → Promise<Message>
 *
 * Message shape:
 *   { id: string, name: string, message: string, timestamp: number }
 * ─────────────────────────────────────────────────────────────
 */

const guestbookService = (() => {

    const STORAGE_KEY  = "wedding_guestbook_messages";
    const MAX_NAME_LEN = 60;
    const MAX_MSG_LEN  = weddingConfig?.guestbook?.maxLength || 300;
    const MIN_MSG_LEN  = 5;

    // ── Sanitisation ──────────────────────────────────────────
    /**
     * Escape HTML special characters to prevent XSS.
     * Never inject raw user content as innerHTML.
     */
    function _escapeHtml(str) {
        return String(str)
            .replace(/&/g,  "&amp;")
            .replace(/</g,  "&lt;")
            .replace(/>/g,  "&gt;")
            .replace(/"/g,  "&quot;")
            .replace(/'/g,  "&#x27;")
            .replace(/\//g, "&#x2F;");
    }

    function _sanitise(str, maxLen) {
        if (typeof str !== "string") return "";
        // Collapse excessive whitespace but preserve single newlines
        return _escapeHtml(str.trim().slice(0, maxLen));
    }

    // ── Validation ────────────────────────────────────────────
    function _validate(name, message) {
        const errors = [];

        if (!name || name.trim().length === 0) {
            errors.push("Please enter your name.");
        } else if (name.trim().length > MAX_NAME_LEN) {
            errors.push(`Name must be ${MAX_NAME_LEN} characters or fewer.`);
        }

        if (!message || message.trim().length === 0) {
            errors.push("Please write a short message.");
        } else if (message.trim().length < MIN_MSG_LEN) {
            errors.push(`Message must be at least ${MIN_MSG_LEN} characters.`);
        } else if (message.trim().length > MAX_MSG_LEN) {
            errors.push(`Message must be ${MAX_MSG_LEN} characters or fewer.`);
        }

        // Basic spam-pattern check (repeated characters)
        if (message && /(.)\1{9,}/.test(message)) {
            errors.push("Message contains repeated characters.");
        }

        return errors;
    }

    // ── ID generation ─────────────────────────────────────────
    function _generateId() {
        return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }

    // ──────────────────────────────────────────────────────────
    // LOCAL PROVIDER  (localStorage)
    // ──────────────────────────────────────────────────────────
    const localProvider = {

        _load() {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                return raw ? JSON.parse(raw) : [];
            } catch (e) {
                console.warn("[Guestbook] Could not read localStorage.", e);
                return [];
            }
        },

        _save(messages) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
            } catch (e) {
                console.warn("[Guestbook] Could not write to localStorage.", e);
            }
        },

        async getMessages() {
            return this._load();
        },

        async addMessage(name, message) {
            const errors = _validate(name, message);
            if (errors.length) {
                throw new Error(errors[0]);
            }

            const entry = {
                id:        _generateId(),
                name:      _sanitise(name, MAX_NAME_LEN),
                message:   _sanitise(message, MAX_MSG_LEN),
                timestamp: Date.now()
            };

            const messages = this._load();

            // Soft duplicate check (same name + very similar message within 60 s)
            const isDupe = messages.some(m =>
                m.name === entry.name &&
                Math.abs(m.timestamp - entry.timestamp) < 60000 &&
                m.message.slice(0, 20) === entry.message.slice(0, 20)
            );

            if (isDupe) {
                throw new Error("It looks like you already sent this message. Thank you!");
            }

            messages.unshift(entry); // newest first
            this._save(messages);
            return entry;
        }
    };

    // ──────────────────────────────────────────────────────────
    // FIREBASE PROVIDER  (stub — wire up when ready)
    // ──────────────────────────────────────────────────────────
    // const firebaseProvider = {
    //     async getMessages() {
    //         const snapshot = await getDocs(
    //             query(collection(db, "guestbook"), orderBy("timestamp", "desc"))
    //         );
    //         return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    //     },
    //     async addMessage(name, message) {
    //         const errors = _validate(name, message);
    //         if (errors.length) throw new Error(errors[0]);
    //         const entry = {
    //             name:      _sanitise(name, MAX_NAME_LEN),
    //             message:   _sanitise(message, MAX_MSG_LEN),
    //             timestamp: serverTimestamp()
    //         };
    //         const ref = await addDoc(collection(db, "guestbook"), entry);
    //         return { id: ref.id, ...entry };
    //     }
    // };

    // ──────────────────────────────────────────────────────────
    // SUPABASE PROVIDER  (stub — wire up when ready)
    // ──────────────────────────────────────────────────────────
    // const supabaseProvider = {
    //     async getMessages() {
    //         const { data, error } = await supabase
    //             .from("guestbook")
    //             .select("*")
    //             .order("timestamp", { ascending: false });
    //         if (error) throw error;
    //         return data;
    //     },
    //     async addMessage(name, message) {
    //         const errors = _validate(name, message);
    //         if (errors.length) throw new Error(errors[0]);
    //         const { data, error } = await supabase
    //             .from("guestbook")
    //             .insert([{
    //                 name:      _sanitise(name, MAX_NAME_LEN),
    //                 message:   _sanitise(message, MAX_MSG_LEN),
    //                 timestamp: Date.now()
    //             }])
    //             .select()
    //             .single();
    //         if (error) throw error;
    //         return data;
    //     }
    // };

    // ── Provider selection ────────────────────────────────────
    function _getProvider() {
        const providerName = weddingConfig?.guestbook?.provider || "local";
        switch (providerName) {
            // case "firebase":  return firebaseProvider;
            // case "supabase":  return supabaseProvider;
            case "local":
            default:
                return localProvider;
        }
    }

    // ── Public API ────────────────────────────────────────────
    return {
        /**
         * Fetch all guestbook messages.
         * @returns {Promise<Array<{id,name,message,timestamp}>>}
         */
        getMessages() {
            return _getProvider().getMessages();
        },

        /**
         * Add a new guestbook message.
         * Throws an Error with a user-readable message on validation failure.
         * @param {string} name
         * @param {string} message
         * @returns {Promise<{id,name,message,timestamp}>}
         */
        addMessage(name, message) {
            return _getProvider().addMessage(name, message);
        },

        /** Expose max lengths for UI use */
        limits: {
            name:    MAX_NAME_LEN,
            message: MAX_MSG_LEN
        }
    };

})();

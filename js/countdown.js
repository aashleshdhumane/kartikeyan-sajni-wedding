/**
 * countdown.js
 * Manages the wedding countdown timer.
 * Reads target date/time from weddingConfig.
 * Timezone-aware using Intl.DateTimeFormat.
 */

const Countdown = (() => {

    let _intervalId = null;

    /**
     * Parse the configured dateTime string into a UTC timestamp.
     * We treat the dateTime as being in the configured timezone by
     * constructing an equivalent UTC time via the browser's Intl API.
     */
    function _getTargetTimestamp() {
        const cfg = weddingConfig.wedding;
        if (!cfg || !cfg.dateTime) return null;

        // cfg.dateTime is "YYYY-MM-DDTHH:MM:SS" (no TZ offset)
        // We need to interpret it as Asia/Kolkata (or configured TZ)
        const tz = cfg.timezone || "Asia/Kolkata";

        try {
            // Use a trick: format a known UTC date in the target TZ,
            // then find the UTC time that corresponds to the local string.
            const localDateStr = cfg.dateTime; // "2027-02-14T19:00:00"

            // Parse into parts
            const [datePart, timePart] = localDateStr.split("T");
            const [year, month, day] = datePart.split("-").map(Number);
            const [hour, minute, second] = (timePart || "00:00:00").split(":").map(Number);

            // Build a Date in local (browser) time first for rough estimate
            const roughUtc = Date.UTC(year, month - 1, day, hour, minute, second || 0);

            // Use Intl to find the offset at that approximate time for the target TZ
            const fmt = new Intl.DateTimeFormat("en-US", {
                timeZone: tz,
                year:  "numeric", month: "2-digit", day:  "2-digit",
                hour:  "2-digit", minute: "2-digit", second: "2-digit",
                hour12: false
            });

            // Binary-search for the exact UTC ms that gives us the desired local time
            // Simple approach: compute offset once (accurate enough for a countdown)
            const sampleDate = new Date(roughUtc);
            const parts = Object.fromEntries(
                fmt.formatToParts(sampleDate)
                   .filter(p => p.type !== "literal")
                   .map(p => [p.type, parseInt(p.value, 10)])
            );

            const localInUtcMs = Date.UTC(
                parts.year, parts.month - 1, parts.day,
                parts.hour % 24, parts.minute, parts.second
            );

            const offsetMs = roughUtc - localInUtcMs;
            return roughUtc + offsetMs;

        } catch (e) {
            // Fallback: treat dateTime as local browser time
            console.warn("[Countdown] TZ parse failed, falling back to local time.", e);
            return new Date(cfg.dateTime).getTime();
        }
    }

    function _pad(n) {
        return String(Math.max(0, n)).padStart(2, "0");
    }

    function _tick(targetMs, elements) {
        const now  = Date.now();
        const diff = targetMs - now;

        if (diff <= 0) {
            // Wedding day has arrived (or passed)
            _stop();
            elements.grid.classList.add("hidden");
            elements.message.style.display = "block";
            return;
        }

        const totalSeconds = Math.floor(diff / 1000);
        const days    = Math.floor(totalSeconds / 86400);
        const hours   = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const prev = {
            d: elements.days.textContent,
            h: elements.hours.textContent,
            m: elements.minutes.textContent,
            s: elements.seconds.textContent
        };

        elements.days.textContent    = _pad(days);
        elements.hours.textContent   = _pad(hours);
        elements.minutes.textContent = _pad(minutes);
        elements.seconds.textContent = _pad(seconds);

        // Micro-animation on change
        [
            [elements.days,    _pad(days),    prev.d],
            [elements.hours,   _pad(hours),   prev.h],
            [elements.minutes, _pad(minutes), prev.m],
            [elements.seconds, _pad(seconds), prev.s]
        ].forEach(([el, curr, old]) => {
            if (curr !== old) {
                el.classList.remove("tick");
                void el.offsetWidth; // reflow to restart animation
                el.classList.add("tick");
                setTimeout(() => el.classList.remove("tick"), 250);
            }
        });
    }

    function _stop() {
        if (_intervalId !== null) {
            clearInterval(_intervalId);
            _intervalId = null;
        }
    }

    /**
     * Initialise the countdown.
     * Expects DOM elements with the following IDs (created in index.html):
     *   #countdown-days, #countdown-hours, #countdown-minutes, #countdown-seconds
     *   #countdown-grid, #countdown-message
     */
    function init() {
        const grid    = document.getElementById("countdown-grid");
        const message = document.getElementById("countdown-message");
        const days    = document.getElementById("countdown-days");
        const hours   = document.getElementById("countdown-hours");
        const minutes = document.getElementById("countdown-minutes");
        const seconds = document.getElementById("countdown-seconds");

        if (!grid || !days || !hours || !minutes || !seconds) {
            console.warn("[Countdown] Required DOM elements not found.");
            return;
        }

        const targetMs = _getTargetTimestamp();
        if (!targetMs || isNaN(targetMs)) {
            // No date configured — hide the section gracefully
            const section = document.getElementById("countdown-section");
            if (section) section.classList.add("hidden");
            return;
        }

        const elements = { grid, message, days, hours, minutes, seconds };

        // Run immediately then on interval
        _tick(targetMs, elements);
        _intervalId = setInterval(() => _tick(targetMs, elements), 1000);
    }

    return { init };

})();

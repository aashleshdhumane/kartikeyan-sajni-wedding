/**
 * calendar.js
 * Generates an .ics calendar event file client-side
 * and triggers a download. Works with:
 *   - Apple Calendar (iPhone / Mac)
 *   - Google Calendar (imports .ics)
 *   - Microsoft Outlook
 *   - Any standards-compliant calendar app
 */

const CalendarGenerator = (() => {

    /**
     * Format a JS Date to iCalendar UTC timestamp: YYYYMMDDTHHMMSSZ
     */
    function _toIcsDate(date) {
        const pad = n => String(n).padStart(2, "0");
        return (
            date.getUTCFullYear() +
            pad(date.getUTCMonth() + 1) +
            pad(date.getUTCDate()) +
            "T" +
            pad(date.getUTCHours()) +
            pad(date.getUTCMinutes()) +
            pad(date.getUTCSeconds()) +
            "Z"
        );
    }

    /**
     * Fold long lines to 75-character limit as per RFC 5545.
     */
    function _fold(line) {
        const LIMIT = 75;
        if (line.length <= LIMIT) return line;
        let result = "";
        while (line.length > LIMIT) {
            result += line.slice(0, LIMIT) + "\r\n ";
            line = line.slice(LIMIT);
        }
        return result + line;
    }

    /**
     * Escape commas, semicolons, and backslashes in iCal text values.
     */
    function _escapeIcs(str) {
        return String(str || "")
            .replace(/\\/g, "\\\\")
            .replace(/;/g,  "\\;")
            .replace(/,/g,  "\\,")
            .replace(/\n/g, "\\n");
    }

    /**
     * Parse the config dateTime + timezone into a UTC Date object.
     * Reuses the same offset trick as countdown.js.
     */
    function _parseConfigDate(dateTimeStr, tz) {
        if (!dateTimeStr) return null;
        try {
            const [datePart, timePart] = dateTimeStr.split("T");
            const [year, month, day] = datePart.split("-").map(Number);
            const [hour, minute, second] = (timePart || "00:00:00").split(":").map(Number);

            const roughUtc = Date.UTC(year, month - 1, day, hour, minute, second || 0);

            const fmt = new Intl.DateTimeFormat("en-US", {
                timeZone: tz || "Asia/Kolkata",
                year: "numeric", month: "2-digit", day: "2-digit",
                hour: "2-digit", minute: "2-digit", second: "2-digit",
                hour12: false
            });

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

            return new Date(roughUtc + (roughUtc - localInUtcMs));
        } catch (e) {
            console.warn("[Calendar] Date parse error:", e);
            return new Date(dateTimeStr);
        }
    }

    /**
     * Generate a UID for the calendar event.
     */
    function _uid() {
        return `${Date.now()}-${Math.random().toString(36).slice(2)}@kartikeyan-sajni-wedding`;
    }

    /**
     * Build the full .ics file content string.
     */
    function _buildIcs({ title, startDate, endDate, location, address, description, url }) {
        const dtStamp = _toIcsDate(new Date());
        const dtStart = _toIcsDate(startDate);
        const dtEnd   = _toIcsDate(endDate);

        const lines = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Kartikeyan & Sajni Wedding//EN",
            "CALSCALE:GREGORIAN",
            "METHOD:PUBLISH",
            "BEGIN:VEVENT",
            _fold(`UID:${_uid()}`),
            _fold(`DTSTAMP:${dtStamp}`),
            _fold(`DTSTART:${dtStart}`),
            _fold(`DTEND:${dtEnd}`),
            _fold(`SUMMARY:${_escapeIcs(title)}`),
            _fold(`LOCATION:${_escapeIcs(location + (address ? ", " + address : ""))}`),
            _fold(`DESCRIPTION:${_escapeIcs(description)}`),
            _fold(`URL:${url || ""}`),
            "STATUS:CONFIRMED",
            "TRANSP:OPAQUE",
            "BEGIN:VALARM",
            "TRIGGER:-PT1D",
            "ACTION:DISPLAY",
            _fold("DESCRIPTION:Reminder: Wedding tomorrow!"),
            "END:VALARM",
            "BEGIN:VALARM",
            "TRIGGER:-PT2H",
            "ACTION:DISPLAY",
            _fold("DESCRIPTION:Wedding starts in 2 hours!"),
            "END:VALARM",
            "END:VEVENT",
            "END:VCALENDAR"
        ];

        return lines.join("\r\n");
    }

    /**
     * Trigger a file download of the .ics content.
     */
    function _download(filename, content) {
        const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
        const url  = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href     = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
    }

    /**
     * Public: generate and download the wedding calendar event.
     */
    function saveWeddingDate() {
        const cfg     = weddingConfig;
        const wedding = cfg.wedding;
        const groom   = cfg.groom.firstName;
        const bride   = cfg.bride.firstName;

        // Find the main wedding event from events array
        const weddingEvent = cfg.events.find(e => e.id === "wedding" && e.enabled) || {};

        if (!wedding.dateTime) {
            alert("Wedding date is not yet confirmed. Please check back soon!");
            return;
        }

        const tz = wedding.timezone || "Asia/Kolkata";
        const startDate = _parseConfigDate(wedding.dateTime, tz);
        if (!startDate) {
            console.error("[Calendar] Could not parse wedding date.");
            return;
        }

        // End time: 4 hours after start
        const endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000);

        const title = `Wedding of ${groom} & ${bride}`;
        const location = weddingEvent.venue || "To be confirmed";
        const address  = weddingEvent.address || "";
        const invitationUrl = cfg.sharing?.invitationUrl || "";

        const description =
            `You are warmly invited to celebrate the wedding of ${cfg.groom.name} and ${cfg.bride.name}.\n\n` +
            (weddingEvent.description || "") +
            (invitationUrl ? `\n\nInvitation: ${invitationUrl}` : "");

        const ics = _buildIcs({
            title,
            startDate,
            endDate,
            location,
            address,
            description,
            url: invitationUrl
        });

        const filename = `${groom}-${bride}-Wedding.ics`
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "");

        _download(filename, ics);
    }

    return { saveWeddingDate };

})();

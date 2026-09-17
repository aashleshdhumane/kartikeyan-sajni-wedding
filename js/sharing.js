/**
 * sharing.js
 * Handles invitation sharing via:
 *   1. Web Share API (native share sheet on mobile)
 *   2. WhatsApp deep link fallback
 *   3. Clipboard copy fallback
 */

const InvitationSharing = (() => {

    function _getInvitationUrl() {
        const configured = weddingConfig?.sharing?.invitationUrl;
        return (configured && configured.trim())
            ? configured.trim()
            : window.location.href;
    }

    function _buildShareText() {
        const cfg     = weddingConfig;
        const groom   = cfg.groom.firstName;
        const bride   = cfg.bride.firstName;
        const date    = cfg.wedding?.dateDisplay || "";
        const baseMsg = cfg.sharing?.message ||
            `With love and happiness, we invite you to celebrate the wedding of ${groom} & ${bride} ❤️\n\nWe would be delighted to have you with us.\n\n`;

        return baseMsg + _getInvitationUrl();
    }

    /**
     * Main share function.
     * Tries: Web Share API → WhatsApp → clipboard.
     */
    async function share() {
        const url   = _getInvitationUrl();
        const text  = _buildShareText();
        const title = `The Wedding of ${weddingConfig.groom.firstName} & ${weddingConfig.bride.firstName}`;

        // 1. Native Web Share API (best experience on mobile)
        if (navigator.share) {
            try {
                await navigator.share({ title, text, url });
                return;
            } catch (err) {
                // User cancelled or API unavailable — fall through
                if (err.name === "AbortError") return; // user cancelled
            }
        }

        // 2. WhatsApp fallback
        _shareViaWhatsApp(text);
    }

    /**
     * Open WhatsApp with a pre-filled message.
     */
    function _shareViaWhatsApp(text) {
        const encoded = encodeURIComponent(text);
        // wa.me works on both mobile (opens app) and desktop (opens web.whatsapp.com)
        const waUrl = `https://wa.me/?text=${encoded}`;
        window.open(waUrl, "_blank", "noopener,noreferrer");
    }

    /**
     * Copy the invitation URL to the clipboard.
     * Returns a Promise that resolves to true on success.
     */
    async function copyLink() {
        const url = _getInvitationUrl();
        try {
            await navigator.clipboard.writeText(url);
            return true;
        } catch (e) {
            // Fallback for older browsers
            try {
                const ta = document.createElement("textarea");
                ta.value = url;
                ta.style.cssText = "position:fixed;left:-9999px;top:-9999px;opacity:0";
                document.body.appendChild(ta);
                ta.focus();
                ta.select();
                document.execCommand("copy");
                document.body.removeChild(ta);
                return true;
            } catch (e2) {
                console.warn("[Sharing] Copy failed:", e2);
                return false;
            }
        }
    }

    /**
     * Share specifically to WhatsApp (can be wired to a dedicated button).
     */
    function shareWhatsApp() {
        _shareViaWhatsApp(_buildShareText());
    }

    return {
        share,
        shareWhatsApp,
        copyLink,
        getUrl: _getInvitationUrl
    };

})();

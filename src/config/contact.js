/** SpaceBorne support line — use everywhere (call, WhatsApp, display). */
export const SUPPORT_PHONE_E164 = '+254724440293';
export const SUPPORT_PHONE_DISPLAY = '+254724440293';
export const SUPPORT_PHONE_DISPLAY_SPACED = '+254 724 440293';
export const SUPPORT_PHONE_WA = '254724440293';
export const SUPPORT_PHONE_LOCAL = '0724440293';

export const SUPPORT_TEL_URL = `tel:${SUPPORT_PHONE_E164}`;
export const SUPPORT_WHATSAPP_URL = `https://wa.me/${SUPPORT_PHONE_WA}`;

export const supportWhatsAppUrl = (prefill = '') =>
  prefill
    ? `${SUPPORT_WHATSAPP_URL}?text=${encodeURIComponent(prefill)}`
    : SUPPORT_WHATSAPP_URL;

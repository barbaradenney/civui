/** Shared size limits for tool parameter validation. */

/** 50 MB base64 ≈ ~37.5 MB decoded PDF — generous but bounded. */
export const MAX_PDF_BASE64_LENGTH = 50 * 1024 * 1024;

/** 10 MB HTML — large enough for any real form page, prevents memory issues. */
export const MAX_HTML_LENGTH = 10 * 1024 * 1024;

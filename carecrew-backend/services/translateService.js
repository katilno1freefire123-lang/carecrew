/**
 * translateService.js
 * Thin wrapper around the Google Cloud Translation REST API v2.
 * No SDK needed — one fetch call.
 *
 * Supported targetLang values: "ne" (Nepali) | "en" (English)
 * If API key is missing or call fails, original text is returned silently.
 */

const TRANSLATE_URL = "https://translation.googleapis.com/language/translate/v2";

/**
 * Translate a single string or an array of strings.
 *
 * @param {string | string[]} text   - Text(s) to translate
 * @param {"ne"|"en"}         targetLang - Target language code
 * @returns {Promise<string | string[]>} - Translated text(s), same shape as input
 */
export const translate = async (text, targetLang) => {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;

  // No key — return original text silently, no crash
  if (!apiKey) return text;

  const isArray = Array.isArray(text);
  const inputs  = isArray ? text : [text];

  // Filter out empty strings — API rejects them
  const nonEmpty = inputs.filter((t) => t && t.trim().length > 0);
  if (nonEmpty.length === 0) return isArray ? inputs : inputs[0];

  try {
    const response = await fetch(`${TRANSLATE_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q:      nonEmpty,
        target: targetLang,
        format: "text",
      }),
    });

    // API returned an error — return original text silently
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.warn("Google Translate API error:", err?.error?.message || response.status);
      return text;
    }

    const data         = await response.json();
    const translations = data.data.translations.map((t) => t.translatedText);

    // Re-map back to original positions (preserving empty strings)
    if (!isArray) return translations[0];

    let tIdx = 0;
    return inputs.map((t) =>
      t && t.trim().length > 0 ? translations[tIdx++] : t
    );

  } catch (error) {
    // Network failure, timeout, or anything else — return original text silently
    console.warn("Translation failed, using original text:", error.message);
    return text;
  }
};
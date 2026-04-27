/**
 * translateController.js
 *
 * POST /api/translate
 * Body: { text: string | string[], targetLang: "ne" | "en" }
 *
 * Used exclusively for user-entered content (name, address, review comment, etc.).
 * Admin-controlled content (services) already has both language fields in DB — no translation needed.
 *
 * The API key never leaves the backend.
 */

import { translate } from "../services/translateService.js";

const SUPPORTED_LANGS = ["ne", "en"];

export const translateText = async (req, res) => {
  try {
    const { text, targetLang } = req.body;

    if (!text) {
      return res.status(400).json({ message: "text is required." });
    }

    if (!targetLang || !SUPPORTED_LANGS.includes(targetLang)) {
      return res.status(400).json({
        message: `targetLang must be one of: ${SUPPORTED_LANGS.join(", ")}`,
      });
    }

    // Accept single string or array — return same shape
    const translatedText = await translate(text, targetLang);

    return res.status(200).json({ translatedText });
  } catch (error) {
    return res.status(500).json({ message: "Translation failed.", error: error.message });
  }
};

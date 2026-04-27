import { createContext, useContext, useState } from "react";
import ne from "../locales/ne.js";
import en from "../locales/en.js";

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState("ne"); // Nepali default
  const t = lang === "ne" ? ne : en;
  const toggle = () => setLang((l) => (l === "ne" ? "en" : "ne"));

  // Helper: pick correct field from bilingual admin content
  // e.g. service.name vs service.nameNe
  const pick = (obj, field) => {
    if (!obj) return "";
    const neField = field + "Ne";
    if (lang === "ne") return obj[neField] || obj[field] || "";
    return obj[field] || obj[neField] || "";
  };

  return (
    <LangContext.Provider value={{ lang, t, toggle, pick }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);

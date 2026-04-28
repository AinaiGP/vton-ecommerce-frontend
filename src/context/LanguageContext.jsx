import React, { createContext, useContext, useState, useEffect } from "react";
import { en } from "../locales/en";
import { ar } from "../locales/ar";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("ainai_language") || "en";
  });

  const translations = { en, ar };

  useEffect(() => {
    localStorage.setItem("ainai_language", lang);
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lang);
    
    // Add a css class to body for easy global font overrides if needed
    if (lang === "ar") {
      document.body.classList.add("lang-ar");
    } else {
      document.body.classList.remove("lang-ar");
    }
  }, [lang]);

  const toggleLanguage = () => {
    setLang(prev => (prev === "en" ? "ar" : "en"));
  };

  const t = (key) => {
    return translations[lang][key] || key;
  };

  // Switch specifically to 'ar' or 'en'
  const setLanguage = (newLang) => {
    setLang(newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, toggleLanguage, t, dir: lang === "ar" ? "rtl" : "ltr" }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

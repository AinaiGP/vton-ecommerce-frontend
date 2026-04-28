import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import styles from "../../styles/SearchBar.module.css";

export default function SearchBar({ value = "", onChange }) {
  const { t } = useLanguage();
  const [inputValue, setInputValue] = useState(value);
  const skipDebounceRef = useRef(false);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (skipDebounceRef.current) {
      skipDebounceRef.current = false;
      return;
    }
    if (inputValue === value) return;
    const timeout = setTimeout(() => {
      onChange?.(inputValue);
    }, 400);
    return () => clearTimeout(timeout);
  }, [inputValue, onChange, value]);

  const handleClear = () => {
    skipDebounceRef.current = true;
    setInputValue("");
    onChange?.("");
  };

  return (
    <div className={styles.searchBarWrapper}>
      <div className={styles.searchBarContainer}>
        <Search className={styles.searchIcon} size={20} />
        <input
          type="text"
          placeholder={t("search.placeholder")}
          className={styles.searchInput}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        {inputValue && (
          <button
            className={styles.clearButton}
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X size={20} />
          </button>
        )}
      </div>
    </div>
  );
}

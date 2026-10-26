import React, { useState, useEffect, useRef, useMemo } from "react";
import "../../styles/CustomAutocomplete.scss";

const CustomAutocomplete = ({
  options = [],
  value = "",
  onChange,
  onInputChange,
  placeholder = "Search...",
  disabled = false,
  freeSolo = false,
  error = false,
  noOptionsText = "No options found",
  label = "",
  required = false,
  loading = false,
  variant = "standard",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Helper to normalize option format { value, label }
  const normalizedOptions = useMemo(() => {
    if (!Array.isArray(options)) return [];
    return options.map((opt) => {
      if (typeof opt === "string") {
        return { value: opt, label: opt, raw: opt };
      }
      const val = opt.value ?? opt.code ?? opt.bnfCode ?? opt.locId ?? opt.label ?? "";
      const lbl = opt.label ?? opt.name ?? opt.bnfName ?? opt.vesselNm ?? opt.vesselName ?? opt.value ?? "";
      return {
        value: val,
        label: lbl,
        raw: opt,
      };
    });
  }, [options]);

  // Find currently selected option
  const selectedOption = useMemo(() => {
    if (value === null || value === undefined || value === "") return null;
    const strVal = String(value).toUpperCase().trim();
    return (
      normalizedOptions.find(
        (opt) =>
          String(opt.value).toUpperCase().trim() === strVal ||
          String(opt.label).toUpperCase().trim() === strVal
      ) || (freeSolo ? { value: value, label: value, raw: value } : null)
    );
  }, [value, normalizedOptions, freeSolo]);

  // Sync display text when value or selectedOption changes
  useEffect(() => {
    if (!isTyping) {
      if (selectedOption) {
        setInputValue(selectedOption.label);
      } else if (value !== null && value !== undefined && value !== "") {
        setInputValue(String(value));
      } else {
        setInputValue("");
      }
    }
  }, [selectedOption, value, isTyping]);

  // Filtered options based on user typing
  const filteredOptions = useMemo(() => {
    if (!isTyping) {
      return normalizedOptions.slice(0, 200);
    }
    const query = inputValue.trim().toLowerCase();
    if (!query) return normalizedOptions.slice(0, 200);

    const startsWith = [];
    const containsOnly = [];

    for (let i = 0; i < normalizedOptions.length; i++) {
      const opt = normalizedOptions[i];
      const lbl = String(opt.label).toLowerCase();
      const val = String(opt.value).toLowerCase();

      if (lbl.startsWith(query) || val.startsWith(query)) {
        startsWith.push(opt);
      } else if (lbl.includes(query) || val.includes(query)) {
        containsOnly.push(opt);
      }
    }

    return [...startsWith, ...containsOnly].slice(0, 200);
  }, [inputValue, normalizedOptions, isTyping]);

  // Outside click listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setIsTyping(false);
        if (!freeSolo) {
          setInputValue(selectedOption ? selectedOption.label : "");
        } else if (onChange && inputValue !== value) {
          onChange(inputValue);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedOption, freeSolo, inputValue, value, onChange]);

  // Auto-scroll highlighted item into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll(".dropdown-item");
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleInputChange = (e) => {
    const newText = e.target.value;
    setInputValue(newText);
    setIsTyping(true);
    setIsOpen(true);
    setHighlightedIndex(0);

    if (onInputChange) {
      onInputChange(newText);
    }

    if (freeSolo && onChange) {
      onChange(newText);
    }
  };

  const handleSelectOption = (opt) => {
    const selectedVal = opt ? opt.value : "";
    setInputValue(opt ? opt.label : "");
    setIsTyping(false);
    setIsOpen(false);
    setHighlightedIndex(-1);

    if (onChange) {
      onChange(selectedVal, opt?.raw || opt);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setInputValue("");
    setIsTyping(true);
    setIsOpen(true);
    setHighlightedIndex(-1);
    if (onChange) onChange("");
    if (onInputChange) onInputChange("");
    if (inputRef.current) inputRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setIsTyping(false);
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (isOpen) {
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
      }
    } else if (e.key === "Enter") {
      if (isOpen && highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
        e.preventDefault();
        handleSelectOption(filteredOptions[highlightedIndex]);
      } else if (isOpen && freeSolo) {
        e.preventDefault();
        setIsOpen(false);
        setIsTyping(false);
        if (onChange) onChange(inputValue);
      }
    } else if (e.key === "Escape" || e.key === "Tab") {
      setIsOpen(false);
      setIsTyping(false);
      if (!freeSolo) {
        setInputValue(selectedOption ? selectedOption.label : "");
      }
    }
  };

  const handleFocus = () => {
    if (!disabled) {
      setIsOpen(true);
      setIsTyping(false);
      if (selectedOption) {
        const idx = filteredOptions.findIndex((o) => o.value === selectedOption.value);
        setHighlightedIndex(idx >= 0 ? idx : 0);
      }
      setTimeout(() => {
        inputRef.current?.select();
      }, 0);
    }
  };

  const handleToggleOpen = (e) => {
    e.stopPropagation();
    if (disabled) return;
    if (isOpen) {
      setIsOpen(false);
      setIsTyping(false);
    } else {
      setIsOpen(true);
      setIsTyping(false);
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  };

  return (
    <div
      className={`custom-autocomplete variant-${variant} ${disabled ? "disabled" : ""} ${className}`}
      ref={containerRef}
    >
      <div className={`input-wrapper ${error ? "has-error" : ""} ${isOpen ? "focused" : ""}`}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
        />

        {inputValue && !disabled && (
          <button type="button" className="clear-btn" onClick={handleClear} title="Clear">
            &times;
          </button>
        )}

        <div className={`arrow-icon ${isOpen ? "open" : ""}`} onClick={handleToggleOpen}>
          ▼
        </div>
      </div>

      {isOpen && !disabled && (
        <ul className="dropdown-menu" ref={listRef}>
          {loading ? (
            <li className="dropdown-info">Loading...</li>
          ) : filteredOptions.length > 0 ? (
            filteredOptions.map((opt, idx) => {
              const isSelected = selectedOption && selectedOption.value === opt.value;
              const isHighlighted = idx === highlightedIndex;
              return (
                <li
                  key={`${opt.value}-${idx}`}
                  className={`dropdown-item ${isSelected ? "selected" : ""} ${isHighlighted ? "highlighted" : ""}`}
                  onMouseDown={(e) => {
                    e.preventDefault(); // prevent blur
                    handleSelectOption(opt);
                  }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                >
                  <span className="item-label">{opt.label}</span>
                  {opt.value && opt.value !== opt.label && (
                    <span className="item-code">({opt.value})</span>
                  )}
                </li>
              );
            })
          ) : (
            <li className="dropdown-info">{noOptionsText}</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default CustomAutocomplete;


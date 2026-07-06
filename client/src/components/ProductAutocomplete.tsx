import { useEffect, useRef, useState } from "react";
import { searchProducts, type Product } from "@/api/client";
import "./ProductAutocomplete.css";

interface Props {
  value: string;
  onSelect: (product: Product) => void;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ProductAutocomplete({
  value,
  onSelect,
  onChange,
  disabled = false,
}: Props) {
  const [inputValue, setInputValue] = useState(value);
  const [results, setResults] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const requestId = useRef(0);
  const isTyping = useRef(false);

  // Sync parent value without opening dropdown
  useEffect(() => {
    if (!isTyping.current) {
      setInputValue(value);
      setResults([]);
      setOpen(false);
    }
  }, [value]);

  // Search only while user types
  useEffect(() => {
    if (!isTyping.current) return;

    const q = inputValue.trim();

    requestId.current++;
    const currentRequest = requestId.current;

    if (!q) {
      setResults([]);
      setLoading(false);
      setOpen(false);
      return;
    }

    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const data = await searchProducts(q);

        if (currentRequest !== requestId.current) return;

        setResults(data);
        setOpen(true);
      } catch {
        if (currentRequest !== requestId.current) return;

        setResults([]);
        setOpen(false);
      } finally {
        if (currentRequest === requestId.current) {
          setLoading(false);
        }
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [inputValue]);

  return (
    <div className="product-autocomplete">
      <input
        value={inputValue}
        disabled={disabled}
        autoComplete="off"
        placeholder="Search products"
        aria-label="Search products"
        className="product-autocomplete__input"
        onChange={(e) => {
          isTyping.current = true;

          const next = e.target.value;

          setInputValue(next);
          onChange(next);
        }}
        onFocus={() => {
          if (results.length > 0) {
            setOpen(true);
          }
        }}
        onBlur={() => {
          setTimeout(() => {
            setOpen(false);
            isTyping.current = false;
          }, 150);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />

      {open && (
        <div className="product-autocomplete__dropdown">
          {loading && (
            <div className="product-autocomplete__status">
              Searching...
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="product-autocomplete__status--empty">
              No products found
            </div>
          )}

          {!loading &&
            results.map((product) => (
              <div
                key={product._id}
                className="product-autocomplete__option"
                onMouseDown={(e) => {
                  e.preventDefault();

                  isTyping.current = false;

                  setInputValue(product.name);
                  onChange(product.name);
                  onSelect(product);

                  setResults([]);
                  setOpen(false);
                }}
              >
                <div>
                  <div className="product-autocomplete__name">
                    {product.name}
                  </div>

                  <div className="product-autocomplete__meta">
                    Used {product.timesUsed} times
                  </div>
                </div>

                <div className="product-autocomplete__pricing">
                  <div>₹{product.latestRate}</div>

                  <div className="product-autocomplete__unit">
                    {product.unit}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
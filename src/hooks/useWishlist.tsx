"use client";

import { useCallback, useEffect, useState } from "react";

const WISHLIST_KEY = "gi_wishlist";

function readWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeWishlist(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event("gi_wishlist_changed"));
}

export function useWishlist() {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIds(readWishlist());
    setReady(true);

    const onChanged = () => setIds(readWishlist());
    window.addEventListener("gi_wishlist_changed", onChanged);
    window.addEventListener("storage", onChanged);
    return () => {
      window.removeEventListener("gi_wishlist_changed", onChanged);
      window.removeEventListener("storage", onChanged);
    };
  }, []);

  const add = useCallback((id: string) => {
    const next = Array.from(new Set([...readWishlist(), id]));
    writeWishlist(next);
    setIds(next);
  }, []);

  const remove = useCallback((id: string) => {
    const next = readWishlist().filter((x) => x !== id);
    writeWishlist(next);
    setIds(next);
  }, []);

  const clear = useCallback(() => {
    writeWishlist([]);
    setIds([]);
  }, []);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  return { ids, ready, add, remove, clear, has, count: ids.length };
}
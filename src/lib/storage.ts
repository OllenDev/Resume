type Json = null | boolean | number | string | Json[] | { [k: string]: Json }

export function loadJson<T extends Json>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function saveJson(key: string, value: Json) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore quota / privacy failures
  }
}

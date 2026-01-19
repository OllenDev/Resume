declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

export function trackPageView(path: string) {
  if (!window.gtag) return
  window.gtag('event', 'page_view', { page_path: path })
}

export function trackEvent(name: string, params?: Record<string, any>) {
  if (!window.gtag) return
  window.gtag('event', name, params ?? {})
}

export const STUDIO_URL =
  process.env.NEXT_PUBLIC_STUDIO_URL?.trim() ||
  process.env.INTEROPMED_STUDIO_URL?.trim() ||
  (process.env.NODE_ENV === 'production' ? 'https://studio.interopmed.com' : 'http://127.0.0.1:3100')

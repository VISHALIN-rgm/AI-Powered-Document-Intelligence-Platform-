import type { MetadataRoute } from 'next'
export default function sitemap(): MetadataRoute.Sitemap { return ['/', '/analyze', '/history', '/how-it-works'].map((url) => ({ url: `https://resumelens.vercel.app${url}`, lastModified: new Date() })) }

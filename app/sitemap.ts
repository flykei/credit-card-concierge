import { MetadataRoute } from 'next';
import { getAllCards } from '@/lib/cards';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://your-domain.com'; // デプロイ時に実際のURLに変更

  const cards = getAllCards();
  const cardPages: MetadataRoute.Sitemap = cards.map((card) => ({
    url: `${baseUrl}/cards/${card.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...cardPages,
  ];
}

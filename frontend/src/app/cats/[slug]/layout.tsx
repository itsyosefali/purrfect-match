import type { Metadata } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await fetch(`${API_URL}/api/cats/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return { title: "Cat not found — Purrfect Match" };
    const json = await res.json();
    const cat = json.data;
    return {
      title: `${cat.name} — ${cat.breed} for Adoption | Purrfect Match`,
      description: cat.description?.slice(0, 160) ?? `Adopt ${cat.name}, a ${cat.breed} in ${cat.location}.`,
      openGraph: {
        title: `${cat.name} for Adoption`,
        description: cat.description?.slice(0, 160),
        images: cat.primary_photo_url ? [cat.primary_photo_url] : [],
      },
    };
  } catch {
    return { title: "Purrfect Match — Cat Adoption" };
  }
}

export default function CatSlugLayout({ children }: { children: React.ReactNode }) {
  return children;
}

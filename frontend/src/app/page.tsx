"use client";

import { useEffect, useState } from "react";

type Post = {
  id: number;
  title: string | null;
  url: string;
  tags?: string[];
  analysis?: string | null;
};

export default function Dashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then((data) => setPosts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-6">Chargement…</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Mes posts</h1>
      <ul className="space-y-3">
        {posts.map((p) => (
          <li key={p.id} className="border border-neutral-800 rounded p-4">
            <a href={`/post/${p.id}`} className="font-semibold">
              {p.title || "Sans titre"}
            </a>

            {p.tags && p.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {p.tags.map((tag, idx) => (
                  <span
                    key={`${p.id}-tag-${idx}`}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-800 text-neutral-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <p className="text-sm text-blue-400 mt-2">{p.url}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

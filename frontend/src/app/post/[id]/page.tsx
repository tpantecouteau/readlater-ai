"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Post = {
  id: number;
  title: string | null;
  url: string;
  content?: string | null;
  analysis?: string | null;
  tags?: string[];
};

export default function PostDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/posts/${id}`)
      .then((r) => r.json())
      .then(setPost)
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Supprimer ce post ?")) return;
    setDeleting(true);
    const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/");
    } else {
      alert("Erreur lors de la suppression");
      setDeleting(false);
    }
  };

  if (loading) return <p className="p-6">Chargement…</p>;
  if (!post) return <p className="p-6 text-red-500">Post introuvable</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center">
        <Link href="/" className="text-sm text-neutral-400">
          ← Retour
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 rounded disabled:opacity-50"
        >
          {deleting ? "Suppression..." : "Supprimer"}
        </button>
      </div>
      <h1 className="text-2xl font-bold mt-4">{post.title || "Sans titre"}</h1>
      <a href={post.url} target="_blank" className="text-blue-400">
        {post.url}
      </a>

      {post.content && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Contenu</h2>
          <pre className="whitespace-pre-wrap text-neutral-200">
            {post.content}
          </pre>
        </div>
      )}
      {post.analysis && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Analyse</h2>
          <pre className="whitespace-pre-wrap text-neutral-100">
            {post.analysis}
          </pre>
        </div>
      )}
    </div>
  );
}

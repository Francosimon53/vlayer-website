import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Blog - vlayer",
  description: "Articles on HIPAA compliance, healthcare security, and building compliant applications.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Blog</h1>
          <p className="text-lg text-gray-500 mb-12">
            HIPAA compliance, healthcare security, and building compliant applications.
          </p>

          <div className="space-y-10">
            {posts.map((post) => (
              <article key={post.slug} className="group">
                <Link href={`/blog/${post.slug}`} className="block">
                  <time className="text-sm text-gray-400 font-mono">
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <h2 className="text-xl font-semibold text-gray-900 mt-1 group-hover:text-[#0066CC] transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-500 mt-2 leading-relaxed">
                    {post.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

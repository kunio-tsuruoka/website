import { ArrowRight } from 'lucide-react'

export function NewsSection() {
  return (
    <section id="news" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">News</h2>
        <div className="mb-8">
          <p className="text-lg mb-2">ホームページ開設いたしました。</p>
          <a
            href="#"
            className="inline-flex items-center text-purple-700 hover:text-purple-900 transition-colors group"
          >
            VIEW MORE
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  )
}


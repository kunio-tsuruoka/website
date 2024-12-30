// src/components/service-card.tsx
interface ServiceCardProps {
  id: string; // IDを追加
  title: string;
  description: string;
}

export function ServiceCard({ id, title, description }: ServiceCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <a
        href={`/services/${id}`} // IDを使用してリンクを生成
        className="inline-flex items-center text-purple-700 hover:text-purple-900 transition-colors group"
      >
        VIEW MORE
        <svg
          className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 8l4 4m0 0l-4 4m4-4H3"
          />
        </svg>
      </a>
    </div>
  );
}

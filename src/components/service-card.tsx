// src/components/service-card.tsx
interface ServiceCardProps {
  id: string; // IDを追加
  title: string;
  description: string;
}

export function ServiceCard({ id, title, description }: ServiceCardProps) {
  return (
    <div className="relative bg-white p-6 rounded-[32px] group border border-neutral-100 shadow-soft hover:shadow-medium transition-shadow duration-200">
      <a
        href={`/services/${id}`} // IDを使用してリンクを生成
        className="h-full w-full"
      >
        <h3 className="text-xl font-bold mb-4 text-neutral-900">{title}</h3>
        <p className="text-neutral-600 mb-4">{description}</p>
        <div>
          <p className="absolute bottom-3 right-12 font-Poppins text-transparent group-hover:text-accent-600 duration-300">
            view more
          </p>
          <div className="absolute bottom-2 right-2 bg-accent-600 rounded-full size-8 flex justify-center items-center group-hover:rotate-45 duration-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="white"
              className="size-6"
            >
              <title>view more</title>
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </div>
        </div>
      </a>
    </div>
  );
}

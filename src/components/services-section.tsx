import { ServiceCard } from "./service-card"

export function ServicesSection() {
  const services = [
    {
      title: "WEBアプリ・モバイルアプリ開発",
      description:
        "モバイルアプリの設計・プロトタイプ制作・デザイン・構築を行います。",
    },
    {
      title: "プロトタイプ・POC作成",
      description:
        "プロダクトやサービスのアイデアをさまざまな形で具体化し、ニーズを検証。より良いアイデアへと昇華させます。",
    },
    {
      title: "海外向けサービス・サイト作成",
      description:
        "海外向けのWebサイト・サービスのグロースハックを支援します。",
    },
  ]

  return (
    <section id="services" className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">SERVICE</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service) => (
            <ServiceCard
              id={service.title}
              key={service.title}
              title={service.title}
              description={service.description}            />
          ))}
        </div>
      </div>
    </section>
  )
}


export function ContactSection() {
  return (
    <section id="contact" className="py-20">
      <div className="container mx-auto px-4 max-w-md">
        <h2 className="text-5xl font-bold text-center mb-8">Contact</h2>
        <form className="space-y-6">
          <div>
            <label htmlFor="name" className="block mb-2">
              氏名・会社名 *
            </label>
            <input
              type="text"
              id="name"
              required
              className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="email" className="block mb-2">
              Eメール *
            </label>
            <input
              type="email"
              id="email"
              required
              className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="message" className="block mb-2">
              本文 *
            </label>
            <textarea
              id="message"
              required
              rows={5}
              className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            送信
          </button>
        </form>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-navy-950 py-8">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-white/70">
          © {new Date().getFullYear()} Beekle. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

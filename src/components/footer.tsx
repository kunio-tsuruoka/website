export function Footer() {
  return (
    <footer className="bg-gray-50 py-8">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} Beekle. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

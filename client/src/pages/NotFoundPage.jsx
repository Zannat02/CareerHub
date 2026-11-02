import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <section className="flex flex-col items-center py-24 text-center">
      <p className="text-6xl font-extrabold text-brand-400">404</p>
      <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-slate-300">
        The page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="mt-8 rounded-xl bg-linear-to-r from-brand-500 to-accent-400 px-6 py-3 font-semibold text-white transition hover:opacity-90"
      >
        Back to application form
      </Link>
    </section>
  )
}

export default NotFoundPage
import { Link, Outlet } from 'react-router-dom'
import Logo from '../components/Logo'

const currentYear = new Date().getFullYear()

function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-navy-950 bg-[radial-gradient(60rem_40rem_at_90%_-10%,rgba(124,92,255,0.35),transparent_60%),radial-gradient(50rem_35rem_at_-10%_110%,rgba(79,195,247,0.18),transparent_60%)] text-white">
      <header className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between border-b border-white/10 py-6">
          <Link to="/" aria-label="CareerHub home">
            <Logo />
          </Link>
          <p className="hidden text-sm text-slate-300 sm:block">
            Better Opportunities. Brighter Future.
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>

      <footer className="py-8 text-center text-sm text-slate-400">
        &copy; {currentYear} CareerHub. All rights reserved.
      </footer>
    </div>
  )
}

export default MainLayout
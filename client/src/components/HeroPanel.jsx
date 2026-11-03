import { Heart, Laptop, TrendingUp, Users } from 'lucide-react'
import HeroIllustration from './HeroIllustration'

const FEATURES = [
  { icon: Laptop, title: 'Flexible Work', text: 'Work from anywhere' },
  { icon: TrendingUp, title: 'Career Growth', text: 'Learn and grow with us' },
  { icon: Users, title: 'Great Team', text: 'Supportive & friendly environment' },
]

function HeroPanel() {
  return (
    <aside className="flex flex-col bg-linear-to-b from-navy-900 to-navy-950 p-8 text-white sm:p-10">
      <span className="w-fit rounded-full bg-brand-500/30 px-4 py-1.5 text-sm font-medium text-white">
        Join Our Team
      </span>

      <h2 className="mt-8 text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl">
        Build Your Future{' '}
        <span className="bg-linear-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
          With Us
        </span>
      </h2>

      <p className="mt-5 max-w-sm text-lg leading-relaxed text-slate-300">
        We&apos;re always looking for talented individuals who are passionate about
        technology and innovation.
      </p>

      <ul className="mt-10 space-y-6">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-accent-400">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="font-semibold">{title}</p>
              <p className="text-sm text-slate-400">{text}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-auto hidden pt-10 md:block">
        <HeroIllustration />
        <p className="mt-2 flex items-center gap-2 font-script text-3xl -rotate-6 text-brand-400">
          Good luck! <Heart className="h-5 w-5" aria-hidden="true" />
        </p>
      </div>
    </aside>
  )
}

export default HeroPanel
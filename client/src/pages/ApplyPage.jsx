import ApplicationForm from '../components/ApplicationForm'
import HeroPanel from '../components/HeroPanel'

function ApplyPage() {
  return (
    <section className="grid overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-black/40 lg:grid-cols-[5fr_8fr]">
      <HeroPanel />
      <ApplicationForm />
    </section>
  )
}

export default ApplyPage
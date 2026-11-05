import { useEffect, useRef, useState } from 'react'
import {
  AtSign,
  Briefcase,
  CalendarDays,
  ChevronDown,
  CircleUserRound,
  Clock,
  Layers,
  LoaderCircle,
  Mail,
  MessageSquare,
  Phone,
  Send,
  ShieldCheck,
  Smartphone,
  Upload,
  User,
  UserPlus,
} from 'lucide-react'
import FormField from './FormField'
import FileUpload from './FileUpload'
import Toast from './Toast'
import { controlClass } from '../utils/formStyles'
import { submitApplication } from '../utils/api'
import { MESSAGE_MAX, POSITIONS } from '../utils/constants'
import {
  FIELD_NAMES,
  RESUME_CONTENT_ERROR,
  getMaxDate,
  getMinDate,
  hasValidResumeContent,
  validateField,
  validateForm,
} from '../utils/validation'

const INITIAL_VALUES = {
  fullName: '',
  email: '',
  phone: '',
  position: '',
  availableFrom: '',
  resume: null,
  message: '',
}

const TEXT_FIELDS = ['fullName', 'email', 'phone', 'position', 'availableFrom', 'message']

// Server e pathanor jonno FormData (file shoho)
const buildFormData = (values) => {
  const formData = new FormData()
  for (const name of TEXT_FIELDS) formData.append(name, values[name].trim())
  formData.append('resume', values.resume)
  return formData
}

// Error toast er message
const errorMessage = (err, hasFieldErrors) => {
  if (err.status === 400 && hasFieldErrors) {
    return 'The server found problems with some fields. Please fix the highlighted errors and try again.'
  }
  return err.message
}

function ApplicationForm() {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [touched, setTouched] = useState({})
  const [serverErrors, setServerErrors] = useState({})
  const [resumeContentError, setResumeContentError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [slow, setSlow] = useState(false)
  const [toast, setToast] = useState(null)
  const resumeCheck = useRef(0)
  const [focusRequest, setFocusRequest] = useState(null)
  const focusHandled = useRef(null)

  // Client-side errors (resume er content check alada, async)
  const baseErrors = validateForm(values)
  const errors =
    !baseErrors.resume && resumeContentError
      ? { ...baseErrors, resume: resumeContentError }
      : baseErrors

  // Server er error shobsomoy dekhabe, client er error shudhu touched field e
  const shown = (name) => serverErrors[name] || (touched[name] ? errors[name] : '')
  const touch = (name) => setTouched((t) => ({ ...t, [name]: true }))
  const clearServerError = (name) =>
    setServerErrors((prev) => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
    clearServerError(name)
    // select ar date e blur na-o hote pare, tai change e-i touched
    if (name === 'position' || name === 'availableFrom') touch(name)
  }

  const handleBlur = (e) => touch(e.target.name)

  const handleResume = (file) => {
    const token = ++resumeCheck.current
    setValues((v) => ({ ...v, resume: file }))
    setResumeContentError('')
    clearServerError('resume')
    touch('resume')

    if (file && !validateField('resume', file)) {
      hasValidResumeContent(file)
        .then((ok) => {
          if (!ok && token === resumeCheck.current) {
            setResumeContentError(RESUME_CONTENT_ERROR)
          }
        })
        .catch(() => {})
    }
  }

  const focusField = (name) => {
    const id = name === 'resume' ? 'resume-button' : name
    document.getElementById(id)?.focus()
  }

  // Server error er prothom field e focus. Submit sesh hoye field enable hole tarpor
  // (disabled field e focus jay na). Prottek request ek-bar-i focus kore.
  useEffect(() => {
    if (!focusRequest || submitting || focusHandled.current === focusRequest) return
    focusHandled.current = focusRequest
    focusField(focusRequest.name)
  }, [focusRequest, submitting])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return

    setTouched(Object.fromEntries(FIELD_NAMES.map((name) => [name, true])))

    // 1. Client-side validation
    const finalErrors = validateForm(values)
    if (
      !finalErrors.resume &&
      values.resume &&
      !(await hasValidResumeContent(values.resume))
    ) {
      finalErrors.resume = RESUME_CONTENT_ERROR
      setResumeContentError(RESUME_CONTENT_ERROR)
    }

    const firstInvalid = FIELD_NAMES.find((name) => finalErrors[name])
    if (firstInvalid) {
      focusField(firstInvalid)
      setToast({
        type: 'error',
        title: 'Please check the form',
        message: 'Some fields need your attention. Fix the highlighted errors and try again.',
      })
      return
    }

    // 2. Server e pathano (server o abar validate kore)
    setServerErrors({})
    setSubmitting(true)
    const slowTimer = setTimeout(() => setSlow(true), 6000)

    try {
      const data = await submitApplication(buildFormData(values))
      setToast({
        type: 'success',
        title: 'Application submitted!',
        message: `${data.message} We'll get back to you soon.`,
      })
      setValues(INITIAL_VALUES)
      setTouched({})
      setResumeContentError('')
    } catch (err) {
      const fieldErrors = err.errors || {}
      const firstServerError = FIELD_NAMES.find((name) => fieldErrors[name])
      setServerErrors(fieldErrors)
      if (firstServerError) setFocusRequest({ name: firstServerError })
      setToast({
        type: 'error',
        title: "Couldn't submit your application",
        message: errorMessage(err, Boolean(firstServerError)),
      })
    } finally {
      clearTimeout(slowTimer)
      setSlow(false)
      setSubmitting(false)
    }
  }

  const common = (name) => ({
    id: name,
    name,
    value: values[name],
    onChange: handleChange,
    onBlur: handleBlur,
    'aria-invalid': Boolean(shown(name)),
    'aria-describedby': shown(name) ? `${name}-error` : undefined,
    'aria-required': true,
  })

  return (
    <div className="bg-white p-6 sm:p-10">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="mb-8 flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-brand-500 to-accent-400 text-white shadow-lg shadow-brand-500/30">
          <UserPlus className="h-7 w-7" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-3xl font-bold text-navy-900">Job Application Form</h1>
          <p className="mt-1 text-slate-500">
            Fill in the details below to apply for the position. We&apos;ll get back to
            you soon!
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <fieldset
          disabled={submitting}
          className="m-0 grid min-w-0 gap-x-6 gap-y-3 border-0 p-0 sm:grid-cols-2"
        >
          <FormField
            id="fullName"
            label="Full Name"
            icon={CircleUserRound}
            leadingIcon={User}
            required
            error={shown('fullName')}
          >
            <input
              {...common('fullName')}
              type="text"
              autoComplete="name"
              placeholder="Enter your full name"
              className={controlClass(shown('fullName'), true)}
            />
          </FormField>

          <FormField
            id="email"
            label="Email Address"
            icon={Mail}
            leadingIcon={AtSign}
            required
            error={shown('email')}
          >
            <input
              {...common('email')}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={controlClass(shown('email'), true)}
            />
          </FormField>

          <FormField
            id="phone"
            label="Phone Number"
            icon={Phone}
            leadingIcon={Smartphone}
            required
            error={shown('phone')}
          >
            <input
              {...common('phone')}
              type="tel"
              autoComplete="tel"
              placeholder="+8801XXXXXXXXX"
              className={controlClass(shown('phone'), true)}
            />
          </FormField>

          <FormField
            id="position"
            label="Applying For"
            icon={Briefcase}
            leadingIcon={Layers}
            required
            error={shown('position')}
          >
            <select
              {...common('position')}
              className={[
                controlClass(shown('position'), true, true),
                'appearance-none',
                values.position ? '' : 'text-slate-400',
              ].join(' ')}
            >
              <option value="">Select a position</option>
              {POSITIONS.map((position) => (
                <option key={position} value={position} className="text-navy-900">
                  {position}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-slate-500"
              aria-hidden="true"
            />
          </FormField>

          <FormField
            id="availableFrom"
            label="Available From"
            icon={CalendarDays}
            leadingIcon={Clock}
            required
            error={shown('availableFrom')}
          >
            <input
              {...common('availableFrom')}
              type="date"
              min={getMinDate()}
              max={getMaxDate()}
              className={[
                controlClass(shown('availableFrom'), true),
                values.availableFrom ? '' : 'text-slate-400',
              ].join(' ')}
            />
          </FormField>

          <FormField
            id="resume"
            label="Upload Resume"
            icon={Upload}
            required
            error={shown('resume')}
          >
            <FileUpload
              id="resume"
              file={values.resume}
              onChange={handleResume}
              error={shown('resume')}
              disabled={submitting}
            />
          </FormField>

          <div className="sm:col-span-2">
            <FormField
              id="message"
              label="Why are you applying?"
              icon={MessageSquare}
              required
              error={shown('message')}
              counter={`${values.message.length}/${MESSAGE_MAX}`}
            >
              <textarea
                {...common('message')}
                rows={5}
                placeholder="Tell us a little about yourself, your experience and why you're a great fit..."
                className={[controlClass(shown('message')), 'resize-y'].join(' ')}
              />
            </FormField>
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={submitting}
          aria-busy={submitting}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-brand-500 to-accent-400 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:opacity-95 focus:ring-4 focus:ring-brand-500/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send className="h-5 w-5" aria-hidden="true" />
          Submit Application
        </button>

        <div
          className="mt-3 flex min-h-6 flex-col items-center justify-center gap-1 text-sm text-slate-600"
          aria-live="polite"
        >
          {submitting && (
            <>
              <span className="flex items-center gap-2">
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                Submitting...
              </span>
              {slow && (
                <span className="text-xs text-slate-500">
                  The server is waking up. This can take up to a minute.
                </span>
              )}
            </>
          )}
        </div>

        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Your information is safe with us. We respect your privacy.
        </p>
      </form>
    </div>
  )
}

export default ApplicationForm
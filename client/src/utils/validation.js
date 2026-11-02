import {
  POSITIONS,
  MAX_RESUME_SIZE,
  RESUME_EXTENSIONS,
  MESSAGE_MIN,
  MESSAGE_MAX,
} from './constants.js'



export const FIELD_NAMES = [
  'fullName',
  'email',
  'phone',
  'position',
  'availableFrom',
  'resume',
  'message',
]

export const RESUME_CONTENT_ERROR =
  'The file content does not match a valid PDF, DOC or DOCX file.'

const clean = (value) => (typeof value === 'string' ? value.trim() : '')


export const normalizePhone = (phone) => phone.replace(/[\s\-().]/g, '')


const isValidPhone = (phone) =>
  /^\+[1-9]\d{6,14}$/.test(phone) || /^0\d{7,14}$/.test(phone)

const isRealDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [y, m, d] = value.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  )
}


export const getMinDate = () => new Date().toISOString().slice(0, 10)

export const getMaxDate = () => {
  const max = new Date()
  max.setUTCFullYear(max.getUTCFullYear() + 1)
  return max.toISOString().slice(0, 10)
}


const rules = {
  fullName(value) {
    const name = clean(value)
    if (!name) return 'Full name is required.'
    if (name.length < 3 || name.length > 60) {
      return 'Full name must be between 3 and 60 characters.'
    }
    if (!/^[A-Za-z][A-Za-z .'-]*$/.test(name)) {
      return 'Full name can only contain letters, spaces, dots, hyphens and apostrophes.'
    }
    return ''
  },

  email(value) {
    const email = clean(value)
    if (!email) return 'Email address is required.'
    if (email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return 'Please enter a valid email address.'
    }
    return ''
  },

  phone(value) {
    const phone = clean(value)
    if (!phone) return 'Phone number is required.'
    if (!isValidPhone(normalizePhone(phone))) {
      return 'Enter a valid phone number with country code (e.g. +8801712345678).'
    }
    return ''
  },

  position(value) {
    const position = clean(value)
    if (!position) return 'Please select a position.'
    if (!POSITIONS.includes(position)) {
      return 'Please select a valid position from the list.'
    }
    return ''
  },

  availableFrom(value) {
    const date = clean(value)
    if (!date) return 'Please select a date.'
    if (!isRealDate(date)) return 'Please enter a valid date (YYYY-MM-DD).'
    if (date < getMinDate()) return 'Available date cannot be in the past.'
    if (date > getMaxDate()) {
      return 'Available date must be within the next 12 months.'
    }
    return ''
  },

  message(value) {
    const message = clean(value)
    if (!message) return 'This field is required.'
    if (message.length < MESSAGE_MIN) {
      return `Please write at least ${MESSAGE_MIN} characters.`
    }
    if (message.length > MESSAGE_MAX) {
      return `Message cannot exceed ${MESSAGE_MAX} characters.`
    }
    return ''
  },

  resume(file) {
    if (!file) return 'Please upload your resume.'
    const name = (file.name || '').toLowerCase()
    if (!RESUME_EXTENSIONS.some((ext) => name.endsWith(ext))) {
      return 'Resume must be a PDF, DOC or DOCX file.'
    }
    if (file.size === 0) return 'The uploaded resume file is empty.'
    if (file.size > MAX_RESUME_SIZE) return 'Resume must be 5MB or smaller.'
    return ''
  },
}


export function validateField(name, value) {
  return rules[name] ? rules[name](value) : ''
}


export function validateForm(values) {
  const errors = {}
  for (const name of FIELD_NAMES) {
    const message = validateField(name, values[name])
    if (message) errors[name] = message
  }
  return errors
}


export async function hasValidResumeContent(file) {
  const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer())
  const startsWith = (sig) =>
    bytes.length >= sig.length && sig.every((b, i) => bytes[i] === b)
  return (
    startsWith([0x25, 0x50, 0x44, 0x46]) || // %PDF
    startsWith([0x50, 0x4b, 0x03, 0x04]) || // PK.. (docx)
    startsWith([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]) // doc
  )
}
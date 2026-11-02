const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000'
).replace(/\/+$/, '')


export async function submitApplication(formData) {
  let res
  try {
    res = await fetch(`${API_URL}/applications`, {
      method: 'POST',
      body: formData, 
    })
  } catch {
    const err = new Error(
      'Cannot reach the server. Please check your connection and try again.'
    )
    err.status = 0
    err.errors = {}
    throw err
  }

  let data = {}
  try {
    data = await res.json()
  } catch {
    // empty response body, do nothing
  }

  if (!res.ok) {
    const err = new Error(
      data.error || 'Something went wrong. Please try again.'
    )
    err.status = res.status
    err.errors = data.errors || {}
    throw err
  }

  return data
}
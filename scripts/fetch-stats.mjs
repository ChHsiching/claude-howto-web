import { writeFileSync } from 'node:fs'

const UMAMI_API_URL = process.env.UMAMI_API_URL
const UMAMI_USERNAME = process.env.UMAMI_USERNAME
const UMAMI_PASSWORD = process.env.UMAMI_PASSWORD
const UMAMI_WEBSITE_ID = process.env.UMAMI_WEBSITE_ID

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options)
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}

// Authenticate
const { token } = await fetchJSON(`${UMAMI_API_URL}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: UMAMI_USERNAME, password: UMAMI_PASSWORD }),
})

const headers = { Authorization: `Bearer ${token}` }
const now = Date.now()
const todayStart = new Date()
todayStart.setUTCHours(0, 0, 0, 0)

// Fetch today's visitors
const today = await fetchJSON(
  `${UMAMI_API_URL}/api/websites/${UMAMI_WEBSITE_ID}/stats?startAt=${todayStart.getTime()}&endAt=${now}`,
  { headers },
)

// Fetch total visitors
const total = await fetchJSON(
  `${UMAMI_API_URL}/api/websites/${UMAMI_WEBSITE_ID}/stats?startAt=0&endAt=${now}`,
  { headers },
)

const todayVisitors = today.visitors ?? 0
const totalVisitors = total.visitors ?? 0

// Write stats.json
const updatedAt = new Date().toLocaleString('sv-SE', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit',
}).replace(' ', 'T') + '+08:00'

const stats = { todayVisitors, totalVisitors, updatedAt }
writeFileSync('docs/stats.json', JSON.stringify(stats, null, 2) + '\n')

// Output for GITHUB_OUTPUT
const outputFile = process.env.GITHUB_OUTPUT
if (outputFile) {
  const { appendFileSync } = await import('node:fs')
  appendFileSync(outputFile, `today=${todayVisitors}\n`)
  appendFileSync(outputFile, `total=${totalVisitors}\n`)
}

console.log(`Today: ${todayVisitors}, Total: ${totalVisitors}`)

import { writeFileSync, appendFileSync } from 'node:fs'

const BASE = process.env.UMAMI_API_URL
const WID = process.env.UMAMI_WEBSITE_ID
const PATH_PREFIX = '/claude-howto-web'

async function getStats(headers, startAt, endAt, path) {
  let url = `${BASE}/api/websites/${WID}/stats?startAt=${startAt}&endAt=${endAt}`
  if (path) url += `&path=${encodeURIComponent(path)}`
  const data = await fetch(url, { headers }).then(r => r.json())
  return data.pageviews ?? 0
}

async function getMetrics(headers, startAt, endAt) {
  const url = `${BASE}/api/websites/${WID}/metrics?type=path&startAt=${startAt}&endAt=${endAt}`
  return fetch(url, { headers }).then(r => r.json())
}

const { token } = await fetch(`${BASE}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: process.env.UMAMI_USERNAME,
    password: process.env.UMAMI_PASSWORD,
  }),
}).then(r => r.json())

const authHeaders = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
}

const now = Date.now()
const todayStart = new Date()
todayStart.setUTCHours(0, 0, 0, 0)
const todayMs = todayStart.getTime()

const allPaths = await getMetrics(authHeaders, 0, now)
const ourPaths = allPaths.filter(p => p.x.startsWith(PATH_PREFIX))

let todayViews, totalViews

if (ourPaths.length === allPaths.length) {
  todayViews = await getStats(authHeaders, todayMs, now)
  totalViews = await getStats(authHeaders, 0, now)
} else {
  todayViews = 0
  totalViews = 0
  for (const p of ourPaths) {
    todayViews += await getStats(authHeaders, todayMs, now, p.x)
    totalViews += await getStats(authHeaders, 0, now, p.x)
  }
}

const updatedAt = new Date().toLocaleString('sv-SE', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit',
}).replace(' ', 'T') + '+08:00'

const stats = { todayViews, totalViews, updatedAt }
writeFileSync('docs/stats.json', JSON.stringify(stats, null, 2) + '\n')

const outputFile = process.env.GITHUB_OUTPUT
if (outputFile) {
  appendFileSync(outputFile, `today=${todayViews}\n`)
  appendFileSync(outputFile, `total=${totalViews}\n`)
}

console.log(`Today: ${todayViews}, Total: ${totalViews}`)

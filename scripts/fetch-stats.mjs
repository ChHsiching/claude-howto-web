import { writeFileSync, appendFileSync } from 'node:fs'

const BASE = process.env.UMAMI_API_URL
const WID = process.env.UMAMI_WEBSITE_ID
const PATH_PREFIX = '/claude-howto-web'

async function getVisitors(headers, startAt, endAt) {
  const url = `${BASE}/api/websites/${WID}/metrics?type=path&startAt=${startAt}&endAt=${endAt}`
  const paths = await fetch(url, { headers }).then(r => r.json())
  return paths
    .filter(p => p.x.startsWith(PATH_PREFIX))
    .reduce((sum, p) => sum + p.y, 0)
}

// Authenticate
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

const todayVisitors = await getVisitors(authHeaders, todayStart.getTime(), now)
const totalVisitors = await getVisitors(authHeaders, 0, now)

const updatedAt = new Date().toLocaleString('sv-SE', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit',
}).replace(' ', 'T') + '+08:00'

const stats = { todayVisitors, totalVisitors, updatedAt }
writeFileSync('docs/stats.json', JSON.stringify(stats, null, 2) + '\n')

const outputFile = process.env.GITHUB_OUTPUT
if (outputFile) {
  appendFileSync(outputFile, `today=${todayVisitors}\n`)
  appendFileSync(outputFile, `total=${totalVisitors}\n`)
}

console.log(`Today: ${todayVisitors}, Total: ${totalVisitors}`)

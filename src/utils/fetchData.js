// src/utils/fetchData.js

// Public CORS proxy (no API key, but subject to rate-limits)
const CORS_PROXY = 'https://api.allorigins.win/raw?url='

// Build the full URL to the balloon endpoint through the proxy
function balloonUrl(hour) {
  const target = `https://a.windbornesystems.com/treasure/${hour}.json`
  return `${CORS_PROXY}${encodeURIComponent(target)}`
}

export async function fetchBalloonHistory() {
  const allPoints = []

  for (let h = 0; h < 24; h++) {
    const hour = String(h).padStart(2, '0')
    try {
      const res = await fetch(balloonUrl(hour))
      if (!res.ok) continue
      const txt = await res.text()
      if (!txt.trim()) continue
      const d = JSON.parse(txt)

      // handle [[lat,lon,alt], …]
      if (Array.isArray(d) && Array.isArray(d[0])) {
        d.forEach(([lat, lon, alt]) => {
          if (typeof lat === 'number' && typeof lon === 'number') {
            allPoints.push({ lat, lon, alt })
          }
        })
      }
      // (you can keep your other parsing branches here if needed)
    } catch {
      // skip 404s, parse errors, proxy errors…
    }
  }

  return allPoints
}

export async function fetchWeather(lat, lon) {
  // Open-Meteo supports CORS out of the box
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
  const res = await fetch(url)
  if (!res.ok) throw new Error(res.status)
  return (await res.json()).current_weather
}

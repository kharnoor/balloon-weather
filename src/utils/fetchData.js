// src/utils/fetchData.js

export async function fetchBalloonHistory() {
  const allPoints = []

  for (let h = 0; h < 24; h++) {
    const hour = String(h).padStart(2, '0')
    try {
      // CRA dev proxy will forward this to https://a.windbornesystems.com/treasure/XX.json
      const res = await fetch(`/treasure/${hour}.json`)
      if (!res.ok) continue

      const text = await res.text()
      if (!text.trim()) continue

      const d = JSON.parse(text)

      // Case A: top-level array of [lat, lon, alt] triples
      if (Array.isArray(d) && Array.isArray(d[0])) {
        d.forEach(([lat, lon, alt]) => {
          if (typeof lat === 'number' && typeof lon === 'number') {
            allPoints.push({ lat, lon, alt })
          }
        })
      }
      // Case B: array of objects
      else if (Array.isArray(d)) {
        allPoints.push(
          ...d.filter(
            b => b && typeof b.lat === 'number' && typeof b.lon === 'number'
          )
        )
      }
      // Case C: single object or nested arrays in an object
      else if (d && typeof d === 'object') {
        if ('lat' in d && 'lon' in d) {
          allPoints.push(d)
        } else {
          Object.values(d).forEach(val => {
            if (Array.isArray(val)) {
              val.forEach(item => {
                if (
                  item &&
                  typeof item.lat === 'number' &&
                  typeof item.lon === 'number'
                ) {
                  allPoints.push(item)
                }
              })
            }
          })
        }
      }
    } catch {
      // skip 404s, empty bodies, parse errors, etc.
    }
  }

  return allPoints
}

export async function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
  const res = await fetch(url)
  if (!res.ok) throw new Error(res.status)
  const { current_weather } = await res.json()
  return current_weather
}

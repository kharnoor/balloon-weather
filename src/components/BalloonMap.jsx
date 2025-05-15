import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { fetchBalloonHistory, fetchWeather } from '../utils/fetchData'

export default function BalloonMap() {
  const [data, setData] = useState([])
  const [loaded, setLoaded] = useState(0)
  const [loading, setLoading] = useState(true)
  const [onlyValid, setOnlyValid] = useState(false)
  const TOTAL = 24

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const allPoints = []
      for (let h = 0; h < TOTAL; h++) {
        const hour = String(h).padStart(2, '0')
        try {
          const res = await fetch(`/treasure/${hour}.json`)
          if (res.ok) {
            const txt = await res.text()
            if (txt.trim()) {
              const d = JSON.parse(txt)
              if (Array.isArray(d) && Array.isArray(d[0])) {
                d.forEach(([lat, lon, alt]) => {
                  if (typeof lat === 'number' && typeof lon === 'number')
                    allPoints.push({ lat, lon, alt })
                })
              }
            }
          }
        } catch {}
        if (mounted) setLoaded(h + 1)
      }

      const enriched = await Promise.all(
        allPoints.map(async b => {
          try {
            const wRes = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${b.lat}&longitude=${b.lon}&current_weather=true`
            )
            if (!wRes.ok) throw 0
            const { current_weather } = await wRes.json()
            return { ...b, weather: current_weather }
          } catch {
            return { ...b, weather: null }
          }
        })
      )

      if (mounted) {
        setData(enriched)
        setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  if (loading) {
    return (
      <div style={{
        position:'absolute',top:0,left:0,width:'100%',height:'100%',
        display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',
        background:'rgba(255,255,255,0.8)',zIndex:1000
      }}>
        <div style={{marginBottom:8}}>
          Loading balloon data… {loaded}/{TOTAL}
        </div>
        <progress value={loaded} max={TOTAL} style={{width:'80%'}}/>
      </div>
    )
  }

  // decide which points to render
  const display = onlyValid
    ? data.filter(b => b.weather)
    : data

  return (
    <div style={{position:'relative',height:'100%',width:'100%'}}>
      {/* Control panel */}
      <div style={{
        position:'absolute',top:10,left:10,zIndex:1000,
        background:'white',padding:'6px 10px',borderRadius:4,boxShadow:'0 1px 4px rgba(0,0,0,0.3)'
      }}>
        <label style={{fontSize:'0.9rem',cursor:'pointer'}}>
          <input
            type="checkbox"
            checked={onlyValid}
            onChange={e=>setOnlyValid(e.target.checked)}
            style={{marginRight:6}}
          />
          Show/Hide Balloons with Missing Data
        </label>
      </div>

      <MapContainer center={[0,0]} zoom={2} style={{height:'100%',width:'100%'}}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
        {display.map((b,i)=>(
          <CircleMarker
            key={i}
            center={[b.lat,b.lon]}
            radius={12 + (b.weather?.temperature||0)/2}
            pathOptions={{
              color: b.weather ? 'blue' : 'red',
              fillOpacity:0.7,
              stroke:false
            }}
          >
            <Popup>
              <div>
                <strong>Balloon {i}</strong><br/>
                Alt: {b.alt?.toFixed(0) ?? 'n/a'} m<br/>
                Temp: {b.weather?.temperature ?? 'n/a'} °C<br/>
                Wind: {b.weather?.windspeed ?? 'n/a'} m/s
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}

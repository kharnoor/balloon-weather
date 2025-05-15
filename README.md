# Balloon Weather

Dynamic, interactive map of the WindBorne Systems balloon constellation enriched with live local weather data.

## Live Demo

The app is deployed to GitHub Pages at:

```
https://kharnoor.github.io/balloon-weather
```


## Features

* Fetches the last 24 h of balloon positions from WindBorne's live API
* Skips any corrupted or missing data
* Enriches each balloon point with current temperature and wind speed from the Open-Meteo API
* Displays data on a Leaflet world map, with marker size proportional to local temperature
* Updates every 5 minutes for fresh data

## Setup

1. Clone the repo:

   ```bash
   git clone https://github.com/kharnoor/balloon-weather.git
   cd balloon-weather
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Local development server:

   ```bash
   npm start
   ```

   Opens at `http://localhost:3000`.


## Notes

* Data is refreshed every 5 minutes via `setInterval` in `BalloonMap.jsx`.
* I chose the Open-Meteo API because it’s free, requires no authentication, and seamlessly enriches live positional data with local weather.

---

*This project was built for the WindBorne Systems Atlas Software Intern engineering challenge.*


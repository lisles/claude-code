# Today vs Yesterday

A beautifully simple single-serving weather app that answers the question you actually care about: **Is today going to be warmer or colder than yesterday?**

Plus, now you can also look ahead: **Is Saturday going to be warmer or colder than today?**

## Features

- **Two comparison modes:**
  - Compare today with yesterday
  - Compare any future day (up to 7 days) with today
- Simple, focused message with the answer
- Clean, minimalist design
- Works for any city worldwide
- No API key required
- Remembers your location and mode preference

## Live Demo

**[Try it now: https://lisles.github.io/claude-code/](https://lisles.github.io/claude-code/)**

Bookmark it on your phone for quick daily checks!

## How to Use

1. Visit the live URL (or open `index.html` locally)
2. Choose your comparison mode:
   - **vs Yesterday**: See if today is warmer/colder than yesterday
   - **vs Future**: See if a future day is warmer/colder than today (select 1-7 days ahead)
3. Enter your city name
4. Get your answer instantly

That's it!

## How It Works

The app uses the free [Open-Meteo API](https://open-meteo.com/) to fetch weather data and compare temperatures:

**Yesterday mode:**
- Fetches yesterday's actual high temperature
- Fetches today's forecasted high temperature
- Compares them and tells you if today will be warmer or colder

**Future mode:**
- Fetches today's forecasted high temperature
- Fetches the selected future day's forecasted high temperature
- Compares them and tells you if that day will be warmer or colder than today

## Running Locally

Simply open the `index.html` file in any modern web browser. No build process, no dependencies, no server required.

```bash
# Just open it
open index.html

# Or use a simple HTTP server if you prefer
python -m http.server 8000
# Then visit http://localhost:8000
```

## Customization

Want to change the colors or style? Edit `style.css`. The gradient and fonts are all easily customizable.

## Why?

Sometimes you don't need a detailed 10-day forecast with hourly breakdowns and radar maps. Sometimes you just need to know: **should I dress warmer or cooler than yesterday?**

This app does exactly that. Nothing more, nothing less.

## Credits

Weather data provided by [Open-Meteo](https://open-meteo.com/) - a fantastic free weather API.

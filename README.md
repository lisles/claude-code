# Today vs Yesterday

A beautifully simple single-serving weather app that answers one question: **Is today going to be warmer or colder than yesterday?**

## Features

- Simple, focused message comparing today's temperature to yesterday's
- Clean, minimalist design
- Works for any city worldwide
- No API key required
- Remembers your location preference

## How to Use

1. Open `index.html` in your web browser
2. Enter your city name
3. Get your answer instantly

That's it!

## How It Works

The app uses the free [Open-Meteo API](https://open-meteo.com/) to fetch:
- Yesterday's actual high temperature
- Today's forecasted high temperature

It then compares them and gives you a simple, clear answer.

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

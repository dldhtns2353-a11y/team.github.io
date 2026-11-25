/**
 * Halla University Startpage Script
 * Open-Meteo Real-time Weather (Wonju, Seoul, Jeju) with Wind Speed & Humidity
 * Curated Quotes with initial match to design
 */

// 1. City coordinates
const CITIES = {
  wonju: {
    name: '원주',
    badge: 'Wonju',
    lat: 37.3422,
    lon: 127.9202
  },
  seoul: {
    name: '서울',
    badge: 'Seoul',
    lat: 37.5665,
    lon: 126.9780
  },
  jeju: {
    name: '제주',
    badge: 'Jeju',
    lat: 33.4996,
    lon: 126.5312
  }
};

// Weather Code (WMO) Translation & SVG Icons matching the clean modern aesthetic
function getWeatherInfo(code) {
  // Clear Sky / Sunny
  if (code === 0) {
    return {
      desc: '맑음',
      icon: `<svg viewBox="0 0 48 48" width="42" height="42"><circle cx="24" cy="24" r="10" fill="#F59E0B"/><path d="M24 4v5M24 39v5M4 24h5M39 24h5M9.86 9.86l3.54 3.54M34.6 34.6l3.54 3.54M9.86 38.14l3.54-3.54M34.6 13.4l3.54-3.54" stroke="#F59E0B" stroke-width="3" stroke-linecap="round"/></svg>`
    };
  }
  // Partly Cloudy
  if (code === 1 || code === 2) {
    return {
      desc: code === 1 ? '대체로 맑음' : '구름 조금',
      icon: `<svg viewBox="0 0 48 48" width="42" height="42"><circle cx="18" cy="18" r="8" fill="#F59E0B"/><path d="M34 38H18a9 9 0 0 1-1.6-17.86A11 11 0 0 1 37.2 24 7 7 0 0 1 34 38z" fill="#60A5FA" opacity="0.95"/></svg>`
    };
  }
  // Overcast
  if (code === 3) {
    return {
      desc: '흐림',
      icon: `<svg viewBox="0 0 48 48" width="42" height="42"><path d="M35 36H16a8 8 0 0 1-1.4-15.87A10 10 0 0 1 33.9 22 6.5 6.5 0 0 1 35 36z" fill="#94A3B8"/></svg>`
    };
  }
  // Fog
  if (code === 45 || code === 48) {
    return {
      desc: '안개',
      icon: `<svg viewBox="0 0 48 48" width="42" height="42"><path d="M10 20h28M8 26h32M12 32h24" stroke="#94A3B8" stroke-width="3.5" stroke-linecap="round"/></svg>`
    };
  }
  // Drizzle / Rain
  if (code >= 51 && code <= 67) {
    return {
      desc: '비',
      icon: `<svg viewBox="0 0 48 48" width="42" height="42"><path d="M34 28H16a8 8 0 0 1-1.4-15.87A10 10 0 0 1 33.9 14 6.5 6.5 0 0 1 34 28z" fill="#64748B"/><path d="M17 34l-3 7M25 34l-3 7M33 34l-3 7" stroke="#3B82F6" stroke-width="3" stroke-linecap="round"/></svg>`
    };
  }
  // Snow
  if (code >= 71 && code <= 86) {
    return {
      desc: '눈',
      icon: `<svg viewBox="0 0 48 48" width="42" height="42"><path d="M34 28H16a8 8 0 0 1-1.4-15.87A10 10 0 0 1 33.9 14 6.5 6.5 0 0 1 34 28z" fill="#94A3B8"/><circle cx="16" cy="36" r="2" fill="#93C5FD"/><circle cx="24" cy="40" r="2" fill="#93C5FD"/><circle cx="32" cy="36" r="2" fill="#93C5FD"/></svg>`
    };
  }
  // Thunderstorm
  if (code >= 95) {
    return {
      desc: '뇌우',
      icon: `<svg viewBox="0 0 48 48" width="42" height="42"><path d="M34 26H16a8 8 0 0 1-1.4-15.87A10 10 0 0 1 33.9 12 6.5 6.5 0 0 1 34 26z" fill="#334155"/><polygon points="25,27 20,35 24,35 21,43 29,33 25,33" fill="#F59E0B"/></svg>`
    };
  }
  return {
    desc: '맑음',
    icon: `<svg viewBox="0 0 48 48" width="42" height="42"><circle cx="24" cy="24" r="10" fill="#F59E0B"/></svg>`
  };
}

// Fallback matching user reference screenshot
const FALLBACK_WEATHER = {
  wonju: { temp: 0, desc: '맑음', humidity: 57, wind: '6.9', code: 0 },
  seoul: { temp: 1, desc: '맑음', humidity: 48, wind: '3.9', code: 0 },
  jeju:  { temp: 10, desc: '구름 조금', humidity: 63, wind: '12.2', code: 2 }
};

// 2. Fetch Weather Data with wind_speed_10m
async function fetchCityWeather(cityKey) {
  const city = CITIES[cityKey];
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&wind_speed_unit=ms&timezone=Asia%2FSeoul`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const current = data.current;

    return {
      temp: Math.round(current.temperature_2m),
      humidity: Math.round(current.relative_humidity_2m),
      wind: current.wind_speed_10m ? Number(current.wind_speed_10m).toFixed(1) : FALLBACK_WEATHER[cityKey].wind,
      code: current.weather_code,
      isLive: true
    };
  } catch (err) {
    console.warn(`[Weather] ${city.name} 실시간 데이터를 가져오지 못해 기본 데이터를 사용합니다:`, err.message);
    return {
      ...FALLBACK_WEATHER[cityKey],
      isLive: false
    };
  }
}

async function updateAllWeather() {
  const refreshBtn = document.getElementById('refreshWeatherBtn');
  if (refreshBtn) refreshBtn.classList.add('spinning');

  const cityKeys = Object.keys(CITIES);
  const results = await Promise.all(cityKeys.map(k => fetchCityWeather(k)));

  cityKeys.forEach((key, index) => {
    const data = results[index];
    const info = getWeatherInfo(data.code);

    const tempEl = document.getElementById(`temp-${key}`);
    const descEl = document.getElementById(`desc-${key}`);
    const iconEl = document.getElementById(`icon-${key}`);
    const humidityEl = document.getElementById(`humidity-${key}`);
    const windEl = document.getElementById(`wind-${key}`);

    if (tempEl) tempEl.textContent = `${data.temp}°C`;
    if (descEl) descEl.textContent = data.desc || info.desc;
    if (iconEl) iconEl.innerHTML = info.icon;
    if (humidityEl) humidityEl.textContent = `${data.humidity}%`;
    if (windEl) windEl.textContent = `${data.wind} m/s`;
  });

  if (refreshBtn) {
    setTimeout(() => refreshBtn.classList.remove('spinning'), 600);
  }
}

// 3. Quotes Collection (Initial quote matches screenshot)
const QUOTES = [
  {
    quote: "우리가 두려워해야 할 유일한 것은 두려움 그 자체다.",
    author: "프랭클린 D. 루스벨트"
  },
  {
    quote: "가장 큰 위험은 어떠한 위험도 감수하지 않는 것이다.",
    author: "마크 저커버그"
  },
  {
    quote: "늘 갈망하고, 우직하게 나아가라. (Stay hungry, stay foolish.)",
    author: "스티브 잡스"
  },
  {
    quote: "시작하는 방법은 말하는 것을 그만두고 행동하는 것이다.",
    author: "월트 디즈니"
  },
  {
    quote: "어제와 똑같이 살면서 다른 미래를 기대하는 것은 잘못이다.",
    author: "알베르트 아인슈타인"
  },
  {
    quote: "별을 노래하는 마음으로 모든 죽어가는 것을 사랑해야지.",
    author: "윤동주 시인"
  },
  {
    quote: "길이 없으면 길을 찾아라. 찾아도 없으면 길을 닦아 나가라.",
    author: "정주영 회장"
  },
  {
    quote: "천 리 길도 한 걸음부터 시작된다.",
    author: "노자"
  },
  {
    quote: "당신이 할 수 있다고 믿든, 할 수 없다고 믿든, 믿는 대로 될 것이다.",
    author: "헨리 포드"
  },
  {
    quote: "인생은 속도가 아니라 방향이다.",
    author: "괴테"
  }
];

let currentQuoteIndex = 0;

function displayQuote(index) {
  const quote = QUOTES[index];
  const quoteTextEl = document.getElementById('quoteText');
  const quoteAuthorEl = document.getElementById('quoteAuthor');

  if (quoteTextEl && quoteAuthorEl) {
    quoteTextEl.style.opacity = '0';
    quoteAuthorEl.style.opacity = '0';

    setTimeout(() => {
      quoteTextEl.textContent = `“${quote.quote}”`;
      quoteAuthorEl.textContent = `— ${quote.author}`;
      quoteTextEl.style.opacity = '1';
      quoteAuthorEl.style.opacity = '1';
    }, 150);
  }
}

function nextQuote() {
  let nextIdx;
  do {
    nextIdx = Math.floor(Math.random() * QUOTES.length);
  } while (nextIdx === currentQuoteIndex && QUOTES.length > 1);

  currentQuoteIndex = nextIdx;
  displayQuote(currentQuoteIndex);
}

// 4. Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Initial display of quote matching user design
  displayQuote(0);

  // Weather fetch
  updateAllWeather();

  const refreshWeatherBtn = document.getElementById('refreshWeatherBtn');
  if (refreshWeatherBtn) {
    refreshWeatherBtn.addEventListener('click', updateAllWeather);
  }

  const newQuoteBtn = document.getElementById('newQuoteBtn');
  if (newQuoteBtn) {
    newQuoteBtn.addEventListener('click', nextQuote);
  }

  // Auto-refresh weather every 30 minutes
  setInterval(updateAllWeather, 30 * 60 * 1000);
});

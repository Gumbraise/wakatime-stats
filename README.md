<div align="center">
  <h1>📊 WakaTime Stats</h1>
  <p>Embed a beautiful GitHub-style WakaTime activity heatmap in your README!</p>
</div>

<p align="center">
  <a href="https://github.com/Gumbraise/wakatime-stats/stargazers">
    <img alt="GitHub Stars" src="https://img.shields.io/github/stars/Gumbraise/wakatime-stats?color=f0e040&style=flat-square" />
  </a>
  <a href="https://github.com/Gumbraise/wakatime-stats/issues">
    <img alt="GitHub Issues" src="https://img.shields.io/github/issues/Gumbraise/wakatime-stats?color=0088ff&style=flat-square" />
  </a>
  <a href="https://github.com/Gumbraise/wakatime-stats/pulls">
    <img alt="GitHub Pull Requests" src="https://img.shields.io/github/issues-pr/Gumbraise/wakatime-stats?color=0088ff&style=flat-square" />
  </a>
  <a href="https://github.com/Gumbraise/wakatime-stats/blob/main/LICENSE">
    <img alt="License" src="https://img.shields.io/github/license/Gumbraise/wakatime-stats?style=flat-square" />
  </a>
</p>

<p align="center">
  <a href="#demo">View Demo</a>
  ·
  <a href="https://github.com/Gumbraise/wakatime-stats/issues/new">Report Bug</a>
  ·
  <a href="https://github.com/Gumbraise/wakatime-stats/issues/new">Request Feature</a>
</p>

---

<details>
<summary>Table of contents</summary>

- [About](#about)
- [Demo](#demo)
- [Usage](#usage)
  - [Basic usage](#basic-usage)
  - [Parameters](#parameters)
  - [Themes](#themes)
- [Error handling](#error-handling)
- [Deploy on your own](#deploy-on-your-own)
  - [On Vercel](#on-vercel)
- [Local development](#local-development)

</details>

---

## About

**WakaTime Stats** is a [Next.js](https://nextjs.org) API route that fetches your [WakaTime](https://wakatime.com) daily coding activity and renders it as an SVG heatmap — identical in style to GitHub's contribution graph.

Key features:
- 🟩 **GitHub-style heatmap** — familiar contribution-graph look
- 🌙 **Light & dark themes** — matches any README style
- ⚡ **Cached responses** — 6-hour server-side cache via Next.js + `Cache-Control` headers
- 🔒 **No API key required** — uses WakaTime's public insights endpoint
- ♿ **Accessible SVG** — includes `role`, `aria-labelledby`, `<title>`, and `<desc>`

## Demo

[![Gumbraise's WakaTime stats](https://wakatime-stats.sc1utou1720.universe.wf/?user=Gumbraise)](https://wakatime.com/@Gumbraise)

> The heatmap above is generated live from [wakatime-stats.sc1utou1720.universe.wf](https://wakatime-stats.sc1utou1720.universe.wf).

## Usage

### Basic usage

Paste this into any Markdown file and replace `YOUR_USERNAME` with your WakaTime username:

```md
![WakaTime stats](https://wakatime-stats.sc1utou1720.universe.wf/?user=YOUR_USERNAME)
```

To make the image a clickable link to your WakaTime profile:

```md
[![WakaTime stats](https://wakatime-stats.sc1utou1720.universe.wf/?user=YOUR_USERNAME)](https://wakatime.com/@YOUR_USERNAME)
```

> [!NOTE]
> Your WakaTime profile must be **public** for this to work. You can change the visibility in your [WakaTime account settings](https://wakatime.com/settings/account).

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `user` | `string` | — | **Required.** Your WakaTime username. |
| `theme` | `"light"` \| `"dark"` | `"light"` | Color theme for the heatmap. |
| `dark` | `"1"` \| `"true"` | — | Shorthand to enable dark theme. |

### Themes

**Light theme** (default):

```md
![WakaTime stats](https://wakatime-stats.sc1utou1720.universe.wf/?user=Gumbraise)
```

[![Light theme demo](https://wakatime-stats.sc1utou1720.universe.wf/?user=Gumbraise&theme=light)](https://wakatime.com/@Gumbraise)

**Dark theme:**

```md
![WakaTime stats](https://wakatime-stats.sc1utou1720.universe.wf/?user=Gumbraise&theme=dark)
```

[![Dark theme demo](https://wakatime-stats.sc1utou1720.universe.wf/?user=Gumbraise&theme=dark)](https://wakatime.com/@Gumbraise)

## Error handling

When the username is not found or the profile is private, the API returns an SVG error card instead of failing silently.

| Scenario | Error message |
|----------|--------------|
| Unknown username | `User "xyz" was not found on WakaTime.` |
| Private profile | `User "xyz" has a private WakaTime profile.` |

## Deploy on your own

Want to host your own instance? Here's how.

### On Vercel

The easiest way is to deploy directly to [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FGumbraise%2Fwakatime-stats)

Or manually:

1. Fork this repository
2. Go to [vercel.com/new](https://vercel.com/new) and import your fork
3. No environment variables are required — deploy and you're done!
4. Your API will be available at `https://<your-deployment>.vercel.app/?user=YOUR_USERNAME`

> [!TIP]
> WakaTime's public insights endpoint doesn't require an API key, so no configuration is needed.

## Local development

```bash
# Clone the repo
git clone https://github.com/Gumbraise/wakatime-stats.git
cd wakatime-stats

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000/?user=YOUR_USERNAME](http://localhost:3000/?user=YOUR_USERNAME) to test it locally.

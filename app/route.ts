import { renderGitHubContributionsSvg } from "@/components/github-contributions";
import { getWakaTimeContributions } from "@/lib/wakatime";

export const revalidate = 21600;

function getThemeFromSearchParams(searchParams: URLSearchParams): "light" | "dark" {
  const theme = searchParams.get("theme")?.toLowerCase();
  const dark = searchParams.get("dark")?.toLowerCase();

  if (theme === "dark" || dark === "1" || dark === "true") {
    return "dark";
  }

  return "light";
}

export async function GET(request: Request) {
  const contributions = await getWakaTimeContributions();
  const theme = getThemeFromSearchParams(new URL(request.url).searchParams);
  const svg = renderGitHubContributionsSvg(contributions, theme);

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=3600",
      "Content-Disposition": 'inline; filename="wakatime-stats.svg"',
      "Access-Control-Allow-Origin": "*",
    },
  });
}

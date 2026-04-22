import {
  renderErrorSvg,
  renderGitHubContributionsSvg,
} from "@/components/github-contributions";
import {
  getWakaTimeContributions,
  WakaTimeUserForbiddenError,
  WakaTimeUserNotFoundError,
} from "@/lib/wakatime";

export const revalidate = 21600;

function getThemeFromSearchParams(searchParams: URLSearchParams): "light" | "dark" {
  const theme = searchParams.get("theme")?.toLowerCase();
  const dark = searchParams.get("dark")?.toLowerCase();

  if (theme === "dark" || dark === "1" || dark === "true") {
    return "dark";
  }

  return "light";
}

function getUsernameFromSearchParams(searchParams: URLSearchParams): string | undefined {
  return searchParams.get("user")?.trim();
}

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const theme = getThemeFromSearchParams(searchParams);
  const username = getUsernameFromSearchParams(searchParams);

  let svg: string;

  if (!username) {
    svg = renderErrorSvg('Missing required query parameter: "user".', theme);
  } else {
  try {
    const contributions = await getWakaTimeContributions(username);
    svg = renderGitHubContributionsSvg(contributions, theme);
  } catch (error) {
    if (
      error instanceof WakaTimeUserNotFoundError ||
      error instanceof WakaTimeUserForbiddenError
    ) {
      svg = renderErrorSvg(error.message, theme);
    } else {
      throw error;
    }
  }
  }

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=3600",
      "Content-Disposition": 'inline; filename="wakatime-stats.svg"',
      "Access-Control-Allow-Origin": "*",
    },
  });
}

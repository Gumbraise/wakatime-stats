import { renderGitHubContributionsSvg } from "@/components/github-contributions";
import { getWakaTimeContributions } from "@/lib/wakatime";

export const revalidate = 21600;

export async function GET() {
  const contributions = await getWakaTimeContributions();
  const svg = renderGitHubContributionsSvg(contributions);

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=3600",
      "Content-Disposition": 'inline; filename="wakatime-stats.svg"',
      "Access-Control-Allow-Origin": "*",
    },
  });
}

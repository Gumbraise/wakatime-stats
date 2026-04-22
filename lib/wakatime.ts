import type { Contribution } from "@/components/github-contributions";

type WakaTimeDay = {
  date: string;
  total: number;
};

type WakaTimeInsightsResponse = {
  data?: {
    days?: WakaTimeDay[];
  };
};

function getContributionLevel(total: number, maxTotal: number): 0 | 1 | 2 | 3 | 4 {
  if (total <= 0 || maxTotal <= 0) {
    return 0;
  }

  const ratio = total / maxTotal;

  if (ratio >= 0.75) return 4;
  if (ratio >= 0.5) return 3;
  if (ratio >= 0.25) return 2;
  return 1;
}

export async function getWakaTimeContributions(): Promise<Contribution[]> {
  const response = await fetch(
    "https://wakatime.com/api/v1/users/@gumbraise/insights/days",
    {
      next: { revalidate: 21600 },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch WakaTime insights: ${response.status}`);
  }

  const payload = (await response.json()) as WakaTimeInsightsResponse;
  const days = payload.data?.days ?? [];
  const maxTotal = Math.max(...days.map((day) => day.total), 0);

  return days.map((day) => ({
    date: day.date,
    count: day.total,
    level: getContributionLevel(day.total, maxTotal),
  }));
}

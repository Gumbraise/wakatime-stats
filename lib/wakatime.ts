import type { Contribution } from "@/components/github-contributions";

const DEFAULT_WAKATIME_USER = "@gumbraise";

type WakaTimeDay = {
  date: string;
  total: number;
};

type WakaTimeInsightsResponse = {
  data?: {
    days?: WakaTimeDay[];
  };
  error?: string;
};

export class WakaTimeUserNotFoundError extends Error {
  constructor(username: string) {
    super(`User "${username}" was not found on WakaTime.`);
    this.name = "WakaTimeUserNotFoundError";
  }
}

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

export async function getWakaTimeContributions(
  username: string = DEFAULT_WAKATIME_USER,
): Promise<Contribution[]> {
  const response = await fetch(
    `https://wakatime.com/api/v1/users/${encodeURIComponent(username)}/insights/days`,
    {
      next: { revalidate: 21600 },
    },
  );

  const payload = (await response.json()) as WakaTimeInsightsResponse;

  if (payload.error === "Not found.") {
    throw new WakaTimeUserNotFoundError(username);
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch WakaTime insights: ${response.status}`);
  }

  const days = payload.data?.days ?? [];
  const maxTotal = Math.max(...days.map((day) => day.total), 0);

  return days.map((day) => ({
    date: day.date,
    count: day.total,
    level: getContributionLevel(day.total, maxTotal),
  }));
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const CONTRIBUTION_COLORS = [
  "#ebedf0",
  "#9be9a8",
  "#40c463",
  "#30a14e",
  "#216e39",
] as const;

type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export interface Contribution {
  date: string;
  count: number;
  level: ContributionLevel;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function formatTrackedTime(totalSeconds: number): string {
  if (totalSeconds <= 0) {
    return "No activity";
  }

  const totalMinutes = Math.round(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m tracked`;
  }

  if (minutes === 0) {
    return `${hours}h tracked`;
  }

  return `${hours}h ${minutes}m tracked`;
}

function getMonthLabelColumns(data: Contribution[]) {
  const lastWeekCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  return data.reduce<Array<{ label: string; x: number }>>((acc, contribution, i) => {
    const date = new Date(contribution.date);
    const isStartOfWeek = i % 7 === 0;
    const isWithinFirstWeekOfMonth = date.getDate() >= 1 && date.getDate() <= 7;
    const isBeforeLastWeek = date < lastWeekCutoff;

    if (
      i === 0 ||
      (isStartOfWeek && isWithinFirstWeekOfMonth && isBeforeLastWeek)
    ) {
      acc.push({
        label: date.toLocaleString("en-US", { month: "short" }),
        x: Math.floor(i / 7),
      });
    }

    return acc;
  }, []);
}

function getContributionsByDay(data: Contribution[]) {
  return data.reduce<Record<number, Contribution[]>>((acc, contribution) => {
    const day = new Date(contribution.date).getDay();
    acc[day] ??= [];
    acc[day].push(contribution);
    return acc;
  }, {});
}

export function renderGitHubContributionsSvg(data: Contribution[]): string {
  const cellSize = 10;
  const cellGap = 3;
  const step = cellSize + cellGap;
  const leftPadding = 32;
  const topPadding = 28;
  const rightPadding = 16;
  const bottomPadding = 18;
  const rowCount = 7;
  const columnCount = Math.max(Math.ceil(data.length / 7), 1);
  const width = leftPadding + rightPadding + columnCount * step;
  const height = topPadding + bottomPadding + rowCount * step;
  const contributionsByDay = getContributionsByDay(data);
  const monthLabels = getMonthLabelColumns(data);

  const monthText = monthLabels
    .map(
      ({ label, x }) =>
        `<text x="${leftPadding + x * step}" y="14" fill="#656d76" font-size="10" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace">${escapeXml(label)}</text>`,
    )
    .join("");

  const weekdayText = [1, 3, 5]
    .map((day) => {
      const y = topPadding + day * step + 8;
      return `<text x="0" y="${y}" fill="#656d76" font-size="10" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace">${WEEKDAYS[day]}</text>`;
    })
    .join("");

  const cells = Array.from({ length: rowCount }, (_, day) =>
    (contributionsByDay[day] ?? [])
      .map((contribution, index) => {
        const x = leftPadding + index * step;
        const y = topPadding + day * step;
        const label = `${formatTrackedTime(contribution.count)} on ${new Date(
          contribution.date,
        ).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`;

        return `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2" ry="2" fill="${CONTRIBUTION_COLORS[contribution.level]}"><title>${escapeXml(label)}</title></rect>`;
      })
      .join(""),
  ).join("");

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">`,
    `<title id="title">WakaTime activity heatmap</title>`,
    `<desc id="desc">Daily WakaTime tracked time rendered as a GitHub-style contributions chart.</desc>`,
    `<rect width="${width}" height="${height}" fill="#ffffff"/>`,
    monthText,
    weekdayText,
    cells,
    `</svg>`,
  ].join("");
}

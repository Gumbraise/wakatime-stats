const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

type Theme = "light" | "dark";

const THEMES = {
  light: {
    text: "#656d76",
    contributionColors: ["#9be9a8", "#40c463", "#30a14e", "#216e39"],
  },
  dark: {
    text: "#8b949e",
    contributionColors: ["#0e4429", "#006d32", "#26a641", "#39d353"],
  },
} as const;

// Derived from the average delta between GitHub's empty-cell colors and their
// light/dark backgrounds so a single translucent neutral works on transparent SVGs.
const EMPTY_CELL_COLOR = "#9e9e9e";
const EMPTY_CELL_OPACITY = "0.18";

type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export interface Contribution {
  date: string;
  count: number;
  level: ContributionLevel;
}

function getPalette(theme: Theme) {
  return THEMES[theme];
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

function getContributionFill(level: ContributionLevel, theme: Theme) {
  if (level === 0) {
    return {
      color: EMPTY_CELL_COLOR,
      opacity: EMPTY_CELL_OPACITY,
    };
  }

  return {
    color: getPalette(theme).contributionColors[level - 1],
    opacity: undefined,
  };
}

export function renderGitHubContributionsSvg(
  data: Contribution[],
  theme: Theme = "light",
): string {
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
  const palette = getPalette(theme);

  const monthText = monthLabels
    .map(
      ({ label, x }) =>
        `<text x="${leftPadding + x * step}" y="14" fill="${palette.text}" font-size="10" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace">${escapeXml(label)}</text>`,
    )
    .join("");

  const weekdayText = [1, 3, 5]
    .map((day) => {
      const y = topPadding + day * step + 8;
      return `<text x="0" y="${y}" fill="${palette.text}" font-size="10" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace">${WEEKDAYS[day]}</text>`;
    })
    .join("");

  const cells = Array.from({ length: rowCount }, (_, day) =>
    (contributionsByDay[day] ?? [])
      .map((contribution, index) => {
        const x = leftPadding + index * step;
        const y = topPadding + day * step;
        const fill = getContributionFill(contribution.level, theme);
        const label = `${formatTrackedTime(contribution.count)} on ${new Date(
          contribution.date,
        ).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`;

        return `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2" ry="2" fill="${fill.color}"${fill.opacity ? ` fill-opacity="${fill.opacity}"` : ""}><title>${escapeXml(label)}</title></rect>`;
      })
      .join(""),
  ).join("");

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">`,
    `<title id="title">WakaTime activity heatmap</title>`,
    `<desc id="desc">Daily WakaTime tracked time rendered as a GitHub-style contributions chart.</desc>`,
    monthText,
    weekdayText,
    cells,
    `</svg>`,
  ].join("");
}

export function renderErrorSvg(message: string, theme: Theme = "light"): string {
  const width = 720;
  const height = 96;
  const palette = getPalette(theme);

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">`,
    `<title id="title">WakaTime heatmap error</title>`,
    `<desc id="desc">${escapeXml(message)}</desc>`,
    `<rect x="16" y="16" width="688" height="64" rx="8" ry="8" fill="${theme === "dark" ? "#161b22" : "#f6f8fa"}"/>`,
    `<text x="32" y="42" fill="${palette.text}" font-size="12" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace">WakaTime heatmap unavailable</text>`,
    `<text x="32" y="64" fill="${palette.text}" font-size="12" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace">${escapeXml(message)}</text>`,
    `</svg>`,
  ].join("");
}

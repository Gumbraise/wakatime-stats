const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

type Theme = "light" | "dark";

const THEMES = {
    light: {
        text: "#656d76",
    },
    dark: {
        text: "#8b949e",
    },
} as const;

const CONTRIBUTION_BASE_COLOR = "#2da44e";
const CONTRIBUTION_OPACITY_BY_LEVEL: Record<ContributionLevel, string> = {
    0: "0.04",
    1: "0.32",
    2: "0.5",
    3: "0.72",
    4: "1",
};

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

const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_MONTH_LABEL_GAP = 3;

type PositionedContribution = Contribution & {
    parsedDate: Date;
    column: number;
    row: number;
};

// Dates are "YYYY-MM-DD" strings, parsed as UTC midnight; all date math stays in UTC.
function positionContributions(data: Contribution[]): PositionedContribution[] {
    if (data.length === 0) {
        return [];
    }

    const firstDate = new Date(data[0].date);
    const gridStart = firstDate.getTime() - firstDate.getUTCDay() * DAY_MS;

    return data.map((contribution) => {
        const date = new Date(contribution.date);
        const dayIndex = Math.round((date.getTime() - gridStart) / DAY_MS);

        return {
            ...contribution,
            parsedDate: date,
            column: Math.floor(dayIndex / 7),
            row: date.getUTCDay(),
        };
    });
}

function getMonthLabelColumns(cells: PositionedContribution[]) {
    const labels: Array<{ label: string; x: number }> = [];
    let previousMonth: number | undefined;

    for (const cell of cells) {
        const month = cell.parsedDate.getUTCMonth();

        if (month === previousMonth) {
            continue;
        }

        previousMonth = month;
        // A month starting mid-week gets its label on the following column, like GitHub.
        const x = cell.row === 0 || labels.length === 0 ? cell.column : cell.column + 1;
        const label = cell.parsedDate.toLocaleString("en-US", {month: "short", timeZone: "UTC"});

        const last = labels.at(-1);
        if (last && x - last.x < MIN_MONTH_LABEL_GAP) {
            labels.pop();
        }

        labels.push({label, x});
    }

    return labels;
}

function getContributionFill(level: ContributionLevel) {
    return {
        color: level === 0 ? "#000" : CONTRIBUTION_BASE_COLOR,
        opacity: CONTRIBUTION_OPACITY_BY_LEVEL[level],
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
    const positioned = positionContributions(data);
    const columnCount = Math.max((positioned.at(-1)?.column ?? 0) + 1, 1);
    const width = leftPadding + rightPadding + columnCount * step;
    const height = topPadding + bottomPadding + rowCount * step;
    const monthLabels = getMonthLabelColumns(positioned);
    const palette = getPalette(theme);

    const monthText = monthLabels
        .map(
            ({label, x}) =>
                `<text x="${leftPadding + x * step}" y="14" fill="${palette.text}" font-size="10" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace">${escapeXml(label)}</text>`,
        )
        .join("");

    const weekdayText = [1, 3, 5]
        .map((day) => {
            const y = topPadding + day * step + 8;
            return `<text x="0" y="${y}" fill="${palette.text}" font-size="10" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace">${WEEKDAYS[day]}</text>`;
        })
        .join("");

    const cells = positioned
        .map((contribution) => {
            const x = leftPadding + contribution.column * step;
            const y = topPadding + contribution.row * step;
            const fill = getContributionFill(contribution.level);
            const label = `${formatTrackedTime(contribution.count)} on ${contribution.parsedDate.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                timeZone: "UTC",
            })}`;

            return `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2" ry="2" fill="${fill.color}"${fill.opacity ? ` fill-opacity="${fill.opacity}"` : ""}><title>${escapeXml(label)}</title></rect>`;
        })
        .join("");

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

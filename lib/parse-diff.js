import parse from "parse-diff";

const markerPattern = /^(?<indent>[ \t]*)(?<marker>[+-])(?=\s|$)/;

export function parseDiff(value) {
  const lines = value.split("\n");
  const files = parse(value);
  const markerErrors = [];
  let line = 0;

  if (files.length === 0) {
    const relaxedDiff = parseRelaxedDiff(lines);

    return relaxedDiff
      ? { parseFailed: false, markerErrors: relaxedDiff }
      : { parseFailed: true, markerErrors };
  }

  for (const file of files) {
    for (const chunk of file.chunks) {
      for (const change of chunk.changes) {
        while (line < lines.length && lines[line] !== change.content) line++;

        if (line === lines.length) continue;

        const currentLine = line++;

        if (change.type !== "normal") continue;

        const misplacedMarker = markerPattern.exec(change.content);

        if (misplacedMarker?.groups.indent) {
          markerErrors.push({ line: currentLine, column: misplacedMarker.groups.indent.length });
        }
      }
    }
  }

  return { parseFailed: false, markerErrors };
}

function parseRelaxedDiff(lines) {
  const markerErrors = [];
  const markers = new Set();
  let firstLine = 0;
  let lastLine = lines.length;

  while (firstLine < lastLine && lines[firstLine].trim() === "") firstLine++;
  while (lastLine > firstLine && lines[lastLine - 1].trim() === "") lastLine--;

  for (let line = firstLine; line < lastLine; line++) {
    const content = lines[line];
    const match = markerPattern.exec(content);

    if (!match) continue;

    markers.add(match.groups.marker);

    if (match.groups.indent) {
      markerErrors.push({ line, column: match.groups.indent.length });
    }
  }

  return markers.size === 2 ? markerErrors : null;
}

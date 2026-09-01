const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, ShadingType, PageOrientation,
} = require("docx");
const fs = require("fs");
const path = require("path");

// ─── Styles (repris de generate-docs.js pour cohérence visuelle) ──────────────

const COLORS = {
  primary:   "C2185B",
  secondary: "6C3483",
  header:    "1A1A2E",
  tableHead: "2C3E50",
  tableRow1: "FDFEFE",
  tableRow2: "F2F3F4",
  border:    "BDC3C7",
  muted:     "7F8C8D",
  white:     "FFFFFF",
  light:     "ECF0F1",
};

const BORDERS = {
  top:    { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
  left:   { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
  right:  { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
  insideH: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
  insideV: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
};

// ─── Rendu inline (gras **texte**) ─────────────────────────────────────────────

function parseInlineRuns(text, baseOpts = {}) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter((p) => p.length > 0);
  if (parts.length === 0) return [new TextRun({ text: " ", ...baseOpts })];
  return parts.map((p) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return new TextRun({ text: p.slice(2, -2), bold: true, ...baseOpts });
    }
    return new TextRun({ text: p, ...baseOpts });
  });
}

// ─── Blocs ──────────────────────────────────────────────────────────────────────

const HEADING_STYLE = {
  1: { heading: HeadingLevel.HEADING_1, size: 32, color: COLORS.header, before: 400, after: 200 },
  2: { heading: HeadingLevel.HEADING_2, size: 26, color: COLORS.primary, before: 300, after: 150 },
  3: { heading: HeadingLevel.HEADING_3, size: 22, color: COLORS.secondary, before: 200, after: 100 },
};

function headingParagraph(text, level) {
  const s = HEADING_STYLE[level];
  return new Paragraph({
    heading: s.heading,
    spacing: { before: s.before, after: s.after },
    children: parseInlineRuns(text, { bold: true, size: s.size, color: s.color }),
  });
}

function bodyParagraph(text) {
  return new Paragraph({
    children: parseInlineRuns(text, { size: 20 }),
    spacing: { after: 100 },
  });
}

function bulletParagraph(text) {
  return new Paragraph({
    children: [new TextRun({ text: "• ", size: 20 }), ...parseInlineRuns(text, { size: 20 })],
    spacing: { after: 80 },
    indent: { left: 360 },
  });
}

function numberedParagraph(text) {
  return new Paragraph({
    children: parseInlineRuns(text, { size: 20 }),
    spacing: { after: 80 },
    indent: { left: 360 },
  });
}

function separator() {
  return new Paragraph({
    text: "",
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border } },
    spacing: { before: 200, after: 200 },
  });
}

function codeBlock(lines) {
  const paras = lines.map((l) => new Paragraph({
    children: [new TextRun({ text: l.length ? l : " ", font: "Consolas", size: 18, color: COLORS.header })],
    spacing: { after: 20 },
  }));
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: BORDERS,
    rows: [new TableRow({ children: [new TableCell({ children: paras, shading: { type: ShadingType.SOLID, fill: COLORS.light } })] })],
  });
}

function buildTable(headerCells, dataRows) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: headerCells.map((h) => new TableCell({
      children: [new Paragraph({
        children: parseInlineRuns(h, { bold: true, color: COLORS.white, size: 18 }),
        alignment: AlignmentType.CENTER,
      })],
      shading: { type: ShadingType.SOLID, fill: COLORS.tableHead },
    })),
  });
  const rows = dataRows.map((cells, i) => new TableRow({
    children: cells.map((c) => new TableCell({
      children: [new Paragraph({ children: parseInlineRuns(c, { size: 18 }) })],
      shading: { type: ShadingType.SOLID, fill: i % 2 === 0 ? COLORS.tableRow1 : COLORS.tableRow2 },
    })),
  }));
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders: BORDERS, rows: [headerRow, ...rows] });
}

function coverPage(title, subtitle, version = "1.0", date = "2026") {
  return [
    new Paragraph({ text: "", spacing: { before: 1200 } }),
    new Paragraph({
      children: [new TextRun({ text: "🔒 TASKY", bold: true, size: 48, color: COLORS.primary })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 44, color: COLORS.header })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: subtitle, size: 24, color: COLORS.muted })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Version ${version}   `, size: 20, color: COLORS.muted }),
        new TextRun({ text: `•   ${date}   `, size: 20, color: COLORS.muted }),
        new TextRun({ text: "•   Confidentiel", size: 20, color: COLORS.muted }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ text: "", pageBreakBefore: true }),
  ];
}

// ─── Parseur Markdown → éléments docx ──────────────────────────────────────────

function isTableSeparator(line) {
  return /^\|?[\s:|-]+\|?$/.test(line.trim()) && line.includes("-");
}

function splitRow(line) {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
}

function parseMarkdown(content) {
  const rawLines = content.replace(/\r\n/g, "\n").split("\n");

  // Titre et sous-titre (2 premières lignes non vides : "# Titre" puis "## Sous-titre")
  let idx = 0;
  while (rawLines[idx] !== undefined && rawLines[idx].trim() === "") idx++;
  const title = rawLines[idx].replace(/^#\s+/, "").trim();
  idx++;
  while (rawLines[idx] !== undefined && rawLines[idx].trim() === "") idx++;
  const subtitle = rawLines[idx].replace(/^##\s+/, "").trim();
  idx++;

  const elements = [...coverPage(title, subtitle)];

  for (let i = idx; i < rawLines.length; i++) {
    const rawLine = rawLines[i];
    const line = rawLine.trim();

    if (line === "") continue;

    if (line === "---") {
      elements.push(separator());
      continue;
    }

    if (line.startsWith("```")) {
      const inner = [];
      i++;
      while (i < rawLines.length && !rawLines[i].trim().startsWith("```")) {
        inner.push(rawLines[i]);
        i++;
      }
      elements.push(codeBlock(inner));
      continue;
    }

    if (line.startsWith("### ")) {
      elements.push(headingParagraph(line.slice(4), 3));
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(headingParagraph(line.slice(3), 2));
      continue;
    }
    if (line.startsWith("# ")) {
      elements.push(headingParagraph(line.slice(2), 1));
      continue;
    }

    if (line.startsWith("|")) {
      const tableLines = [];
      while (i < rawLines.length && rawLines[i].trim().startsWith("|")) {
        tableLines.push(rawLines[i].trim());
        i++;
      }
      i--; // remettre l'index sur la dernière ligne consommée (la boucle for fera i++)
      const headerCells = splitRow(tableLines[0]);
      const dataRows = [];
      for (let r = 1; r < tableLines.length; r++) {
        if (isTableSeparator(tableLines[r])) continue;
        dataRows.push(splitRow(tableLines[r]));
      }
      elements.push(buildTable(headerCells, dataRows));
      continue;
    }

    if (line.startsWith("- ")) {
      elements.push(bulletParagraph(line.slice(2)));
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      elements.push(numberedParagraph(line));
      continue;
    }

    elements.push(bodyParagraph(line));
  }

  return elements;
}

// ─── Génération ───────────────────────────────────────────────────────────────

async function generate() {
  const docs = [
    { md: "cahier-specs-client.md", out: "06-cahier-specs-client.docx" },
    { md: "cahier-specs-prestataire.md", out: "07-cahier-specs-prestataire.docx" },
    { md: "cahier-specs-admin.md", out: "08-cahier-specs-admin.docx" },
    { md: "clientTest.md", out: "clientTest.docx", landscape: true },
    { md: "prestataireTest.md", out: "prestataireTest.docx", landscape: true },
    { md: "adminTest.md", out: "adminTest.docx", landscape: true },
  ];

  const wordDir = path.join(__dirname, "word");
  if (!fs.existsSync(wordDir)) fs.mkdirSync(wordDir);

  for (const { md, out, landscape } of docs) {
    const content = fs.readFileSync(path.join(__dirname, md), "utf8");
    const children = parseMarkdown(content);
    const sectionProps = landscape
      ? { properties: { page: { size: { orientation: PageOrientation.LANDSCAPE, width: 16838, height: 11906 } } }, children }
      : { children };
    const doc = new Document({ sections: [sectionProps] });
    const buffer = await Packer.toBuffer(doc);
    try {
      fs.writeFileSync(path.join(wordDir, out), buffer);
      console.log(`✅ ${out}`);
    } catch (err) {
      if (err.code === "EBUSY") {
        console.warn(`⚠️  ${out} ignoré (fichier ouvert/verrouillé) — fermez-le puis relancez le script`);
      } else {
        throw err;
      }
    }
  }
  console.log("\n📁 Fichiers générés dans docs/word/");
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});

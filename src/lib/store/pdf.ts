// Server-side PDF generation for purchased digital products.
// Builds a clean, paginated A4 document from the long-form e-book / template
// content the admin wrote in the Digital Products editor.

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const PAGE_W = 595.28; // A4 width in points
const PAGE_H = 841.89; // A4 height in points
const MARGIN = 56;

// Standard PDF fonts use WinAnsi encoding — replace characters it cannot
// encode (e.g. the naira sign ₦) before drawing, or pdf-lib throws.
function sanitize(text: string): string {
  return text
    .replace(/₦/g, "NGN ")
    .replace(/[^\x00-\xFF]/g, "?");
}

export async function buildPdf(title: string, body: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page = pdf.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  const newPage = () => {
    page = pdf.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN;
  };

  const draw = (text: string, size: number, f: typeof font, extraGap = 0) => {
    if (y < MARGIN + size * 2) newPage();
    page.drawText(sanitize(text), {
      x: MARGIN,
      y,
      size,
      font: f,
      color: rgb(0.09, 0.09, 0.11),
    });
    y -= size * 1.55 + extraGap;
  };

  const maxWidth = PAGE_W - MARGIN * 2;
  const writeParagraph = (text: string, size: number, f: typeof font, gap: number) => {
    const words = sanitize(text).split(/\s+/).filter(Boolean);
    if (!words.length) return;
    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (line && f.widthOfTextAtSize(candidate, size) > maxWidth) {
        draw(line, size, f);
        line = word;
      } else {
        line = candidate;
      }
    }
    draw(line, size, f, gap);
  };

  // Title block
  draw(title, 22, bold, 6);
  draw("FRAN-X Technologies — Digital Store", 10, font, 18);

  // Body: lines starting with # are headings, blank lines are paragraph spacing
  for (const raw of body.split(/\r?\n/)) {
    const isHeading = /^#{1,6}\s/.test(raw);
    const text = isHeading ? raw.replace(/^#+\s*/, "") : raw.trim();
    if (!text) {
      y -= 8;
      continue;
    }
    if (isHeading) writeParagraph(text, 14, bold, 10);
    else writeParagraph(text, 11, font, 6);
  }

  return await pdf.save();
}

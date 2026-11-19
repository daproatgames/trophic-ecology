import type { AppState, ExamResult } from '../types';
import { QUESTION_MAP } from '../data/questions';
import { formatAnswer } from './grading';
import { buildPrintPaper, type PrintPaper } from './printPaper';

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 54;
const CONTENT_W = PAGE_W - MARGIN * 2;
const BODY = 10.5;
const LINE = 13.2;

type Doc = import('jspdf').jsPDF;

const PDF_SUBSTITUTIONS: [RegExp, string][] = [
  [/[₀]/g, '0'], [/[₁]/g, '1'], [/[₂]/g, '2'], [/[₃]/g, '3'], [/[₄]/g, '4'],
  [/[₅]/g, '5'], [/[₆]/g, '6'], [/[₇]/g, '7'], [/[₈]/g, '8'], [/[₉]/g, '9'],
  [/[⁰]/g, '0'], [/[¹]/g, '1'], [/[²]/g, '2'], [/[³]/g, '3'], [/[⁴]/g, '4'],
  [/[⁵]/g, '5'], [/[⁶]/g, '6'], [/[⁷]/g, '7'], [/[⁸]/g, '8'], [/[⁹]/g, '9'],
  [/[→➜➔]/g, '->'], [/[←]/g, '<-'], [/[↔]/g, '<->'],
  [/[–—]/g, '-'], [/[’‘]/g, "'"], [/[“”]/g, '"'], [/[•]/g, '-'],
  [/[×]/g, 'x'], [/[÷]/g, '/'], [/[≈]/g, '~'], [/[≥]/g, '>='], [/[≤]/g, '<='],
  [/[…]/g, '...'], [/[·]/g, '-'], [/\u00a0/g, ' '],
];

function pdfSafe(value: string) {
  let text = value;
  for (const [pattern, replacement] of PDF_SUBSTITUTIONS) text = text.replace(pattern, replacement);
  return text.replace(/[^\x00-\x7F]/g, '?');
}

function makeDocSafe(doc: Doc) {
  const originalText = doc.text.bind(doc);
  (doc as unknown as { text: (text: string | string[], x: number, y: number, options?: unknown) => Doc }).text = (text, x, y, options) =>
    originalText(Array.isArray(text) ? text.map(pdfSafe) : pdfSafe(String(text)), x, y, options as never);
  const originalSplit = doc.splitTextToSize.bind(doc);
  (doc as unknown as { splitTextToSize: (text: string, size: number, options?: unknown) => string[] }).splitTextToSize = (text, size, options) =>
    originalSplit(pdfSafe(String(text)), size, options as never);
}


function wrap(doc: Doc, text: string, width: number) {
  return doc.splitTextToSize(text || ' ', width) as string[];
}

function pageMarker(doc: Doc, page: number) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120, 128, 124);
  doc.text('PT', PAGE_W - MARGIN, 30, { align: 'right' });
  doc.text(String(page), PAGE_W / 2, PAGE_H - 28, { align: 'center' });
  doc.setTextColor(24, 28, 26);
}

function newPage(doc: Doc, page: number) {
  doc.addPage();
  const next = page + 1;
  pageMarker(doc, next);
  return next;
}

function sectionHeader(doc: Doc, y: number, title: string, instructions: string, marks: string) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(title, MARGIN, y);
  doc.setFontSize(10.5);
  doc.text(marks, PAGE_W - MARGIN, y, { align: 'right' });
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9.6);
  doc.setTextColor(58, 65, 61);
  const lines = wrap(doc, instructions, CONTENT_W);
  doc.text(lines, MARGIN, y + 15);
  doc.setTextColor(24, 28, 26);
  return y + 15 + lines.length * 12 + 12;
}

function drawTotals(doc: Doc, y: number) {
  const boxes = [
    { label: 'K', total: '/22', color: [30, 120, 60] },
    { label: 'A', total: '/9', color: [180, 70, 40] },
    { label: 'C', total: '/12', color: [180, 100, 20] },
    { label: 'T', total: '/7', color: [50, 75, 160] },
  ];
  const boxW = 92;
  const gap = 13;
  const start = MARGIN + 24;
  boxes.forEach((box, index) => {
    const x = start + index * (boxW + gap);
    doc.setDrawColor(80, 85, 82);
    doc.setLineWidth(0.7);
    doc.rect(x, y, boxW, 32);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(box.color[0], box.color[1], box.color[2]);
    doc.text(`${box.label}:`, x + 8, y + 21);
    doc.setTextColor(24, 28, 26);
    doc.text(box.total, x + boxW - 8, y + 21, { align: 'right' });
  });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Overall Mark:', MARGIN + 150, y + 56);
  doc.line(MARGIN + 238, y + 52, MARGIN + 296, y + 52);
  doc.text('/50', MARGIN + 304, y + 56);
}

function drawPaperHeader(doc: Doc, paper: PrintPaper, answerKey: boolean) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Name:', MARGIN, 50);
  doc.line(MARGIN + 35, 46, MARGIN + 205, 46);
  doc.text('Date:', PAGE_W - MARGIN - 110, 50);
  doc.line(PAGE_W - MARGIN - 70, 46, PAGE_W - MARGIN, 46);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(answerKey ? 'Biology Test – Practice Test — Answer Key' : paper.title, PAGE_W / 2, 88, { align: 'center' });
  if (answerKey) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text(`Teacher copy · Form ${paper.form} · 50 marks`, PAGE_W / 2, 105, { align: 'center' });
  }
  doc.setTextColor(24, 28, 26);
}

function drawMcq(doc: Doc, y: number, paper: PrintPaper, page: number) {
  y = sectionHeader(doc, y, 'Part A: Multiple Choice', 'Choose the most correct answer, circle it on the page.', '[9K/6A]');
  paper.mcq.forEach((question, index) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(BODY);
    const prompt = `${index + 1}. ${question.prompt}`;
    const promptLines = wrap(doc, prompt, CONTENT_W - 6);
    const options = question.options ?? [];
    const half = Math.ceil(options.length / 2);
    const left = options.slice(0, half);
    const right = options.slice(half);
    const optWidth = (CONTENT_W - 28) / 2;
    const leftLines = left.map((opt, i) => wrap(doc, `${String.fromCharCode(97 + i)}. ${opt}`, optWidth));
    const rightLines = right.map((opt, i) => wrap(doc, `${String.fromCharCode(97 + half + i)}. ${opt}`, optWidth));
    const leftH = leftLines.reduce((sum, lines) => sum + lines.length * 12, 0);
    const rightH = rightLines.reduce((sum, lines) => sum + lines.length * 12, 0);
    const height = promptLines.length * LINE + Math.max(leftH, rightH) + 18;
    if (y + height > PAGE_H - 54) { page = newPage(doc, page); y = 48; }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(BODY);
    doc.text(promptLines, MARGIN, y);
    let optionY = y + promptLines.length * LINE + 3;
    let leftY = optionY;
    leftLines.forEach((lines) => {
      doc.text(lines, MARGIN + 18, leftY);
      leftY += lines.length * 12;
    });
    let rightY = optionY;
    rightLines.forEach((lines) => {
      doc.text(lines, MARGIN + 18 + optWidth + 14, rightY);
      rightY += lines.length * 12;
    });
    y = Math.max(leftY, rightY) + 12;
  });
  return { y, page };
}

function drawMatching(doc: Doc, y: number, paper: PrintPaper, page: number) {
  if (y + 145 > PAGE_H - 54) { page = newPage(doc, page); y = 48; }
  y = sectionHeader(doc, y, 'Part B: Mix and Match', 'Identify all the processes that each organism/thing does. Answers can be used once, more than once, or not at all.', '[5K]');
  const letters = ['a', 'b', 'c', 'd', 'e', 'f'];
  const bank = paper.matching.processes;
  const colW = CONTENT_W / 3;
  for (let i = 0; i < bank.length; i++) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.8);
    doc.text(`${letters[i]}.  ${bank[i]}`, MARGIN + col * colW, y + row * 17);
  }
  y += 2 * 17 + 12;
  paper.matching.items.forEach((item, index) => {
    if (y + 24 > PAGE_H - 54) { page = newPage(doc, page); y = 48; }
    doc.setDrawColor(80, 85, 82);
    doc.line(MARGIN + 14, y + 2, MARGIN + 84, y + 2);
    doc.setFontSize(9.8);
    doc.text(`${16 + index}.`, MARGIN + 104, y);
    doc.text(item.label, MARGIN + 128, y);
    y += 22;
  });
  return { y: y + 10, page };
}

function drawTf(doc: Doc, y: number, paper: PrintPaper, page: number) {
  if (y + 110 > PAGE_H - 54) { page = newPage(doc, page); y = 48; }
  y = sectionHeader(doc, y, 'Part C: Modified True and False', 'Circle whether the statement is true or false. If false, change the identified word to make the statement true.', '[4K/1A]');
  paper.tf.forEach((question, index) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(BODY);
    const statementLines = wrap(doc, `${21 + index}.  ${question.prompt}`, CONTENT_W - 52);
    const height = statementLines.length * 12 + 36;
    if (y + height > PAGE_H - 54) { page = newPage(doc, page); y = 48; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('T', MARGIN + 6, y);
    doc.text('F', MARGIN + 28, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(BODY);
    doc.text(statementLines, MARGIN + 52, y);
    y += statementLines.length * 12;
    doc.setFontSize(9.2);
    doc.setTextColor(75, 80, 76);
    doc.text('If false, correction:', MARGIN + 52, y + 8);
    doc.setDrawColor(110, 115, 110);
    doc.line(MARGIN + 145, y + 10, PAGE_W - MARGIN, y + 10);
    doc.setTextColor(24, 28, 26);
    y += 26;
  });
  return { y: y + 8, page };
}

function drawWritten(doc: Doc, y: number, paper: PrintPaper, page: number) {
  if (y + 110 > PAGE_H - 54) { page = newPage(doc, page); y = 48; }
  y = sectionHeader(doc, y, 'Part D: Short Answer', 'Answer in complete sentences. Use precise scientific terminology and show your reasoning. Marks are shown at the right of each question.', '[4K/2A/12C/7T]');
  const categories = ['K', 'A', 'A', 'C', 'C', 'C', 'T', 'T'];
  paper.written.forEach((question, index) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(BODY);
    const points = paper.writtenPoints[index] ?? 3;
    const promptLines = wrap(doc, `${26 + index}.  ${question.prompt}`, CONTENT_W - 58);
    const contextLines = question.context ? wrap(doc, question.context, CONTENT_W - 70) : [];
    const drawBox = /draw|diagram|label the/i.test(`${question.prompt} ${question.context ?? ''}`);
    const answerHeight = drawBox ? 150 : (points <= 2 ? 48 : points === 3 ? 80 : 96);
    const height = promptLines.length * 12 + contextLines.length * 11 + answerHeight + 26;
    const isLast = index === paper.written.length - 1;
    if (y + height > PAGE_H - 54 || (isLast && y + height + 110 > PAGE_H - 54)) { page = newPage(doc, page); y = 48; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.2);
    doc.text(`[${points}${categories[index]}]`, PAGE_W - MARGIN, y, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(BODY);
    doc.text(promptLines, MARGIN, y);
    y += promptLines.length * 12;
    if (contextLines.length) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9.2);
      doc.setTextColor(65, 70, 66);
      doc.text(contextLines, MARGIN + 18, y + 2);
      doc.setTextColor(24, 28, 26);
      y += contextLines.length * 11 + 4;
    }
    if (drawBox) {
      doc.setDrawColor(135, 140, 136);
      doc.setLineWidth(0.5);
      doc.rect(MARGIN + 18, y + 4, CONTENT_W - 36, 136);
      y += 150;
    } else {
      const lines = points <= 2 ? 3 : points === 3 ? 5 : 6;
      doc.setDrawColor(185, 190, 185);
      doc.setLineWidth(0.4);
      for (let line = 0; line < lines; line++) {
        const lineY = y + 18 + line * 15;
        doc.line(MARGIN + 18, lineY, PAGE_W - MARGIN, lineY);
      }
      y += 18 + lines * 15 + 10;
    }
  });
  return { y: y + 4, page };
}

function drawAnswerKey(doc: Doc, paper: PrintPaper) {
  let page = 1;
  let y = 154;
  const heading = (title: string) => {
    if (y + 45 > PAGE_H - 54) { page = newPage(doc, page); y = 48; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(title, MARGIN, y);
    y += 22;
  };
  const answerBlock = (text: string, indent = 0, size = 9.6) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(size);
    const lines = wrap(doc, text, CONTENT_W - indent);
    if (y + lines.length * 12 > PAGE_H - 54) { page = newPage(doc, page); y = 48; }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(size);
    doc.text(lines, MARGIN + indent, y);
    y += lines.length * 12 + 5;
  };

  heading('Part A: Multiple Choice');
  paper.mcq.forEach((q, index) => {
    const answer = typeof q.answer === 'number' ? q.options?.[q.answer] : '';
    answerBlock(`${index + 1}. ${String.fromCharCode(97 + (typeof q.answer === 'number' ? q.answer : 0))}. ${answer || '—'}  —  ${q.explanation}`, 0, 9.4);
  });
  heading('Part B: Mix and Match');
  paper.matching.items.forEach((item, index) => {
    const letters = item.answers.map((answer) => String.fromCharCode(97 + answer)).join(', ');
    answerBlock(`${16 + index}. ${item.label}: ${letters}`, 0, 9.6);
  });
  answerBlock('Bank: ' + paper.matching.processes.map((process, index) => `${String.fromCharCode(97 + index)}. ${process}`).join('  '), 0, 9.2);
  heading('Part C: Modified True and False');
  paper.tf.forEach((q, index) => {
    const truth = q.answer === 0 ? 'True' : 'False';
    answerBlock(`${21 + index}. ${truth}. ${q.explanation.replace(/^(True|False)\.\s*/i, '')}`, 0, 9.4);
  });
  heading('Part D: Short Answer — model answers and marking points');
  paper.written.forEach((q, index) => {
    const points = paper.writtenPoints[index] ?? 3;
    answerBlock(`${26 + index}. [${points} marks] ${q.modelAnswer || q.explanation || formatAnswer(q)}`, 0, 9.4);
    (q.rubric ?? []).forEach((group) => answerBlock(`• ${group.label}`, 16, 9.1));
    y += 3;
  });
  return { page, y };
}

async function generatePracticePdf(paper: PrintPaper, answerKey: boolean) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'letter', compress: true });
  makeDocSafe(doc);
  doc.setLineHeightFactor(1.25);
  doc.setTextColor(24, 28, 26);
  pageMarker(doc, 1);
  drawPaperHeader(doc, paper, answerKey);
  if (answerKey) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const lines = wrap(doc, 'This teacher copy shows the accepted matching letters, correct choices and model answers. Award written marks for the ideas in the marking points, not for exact wording.', CONTENT_W);
    doc.text(lines, MARGIN, 128);
    drawAnswerKey(doc, paper);
  } else {
    let page = 1;
    let y = 126;
    const a = drawMcq(doc, y, paper, page); y = a.y; page = a.page;
    const b = drawMatching(doc, y, paper, page); y = b.y; page = b.page;
    const c = drawTf(doc, y, paper, page); y = c.y; page = c.page;
    const d = drawWritten(doc, y, paper, page); y = d.y; page = d.page;
    if (y + 80 > PAGE_H - 54) { page = newPage(doc, page); y = 48; }
    drawTotals(doc, y + 10);
  }
  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(`Biology-Practice-Test-${paper.form}-${stamp}${answerKey ? '-Answer-Key' : ''}.pdf`);
}

function recentPrintIds() {
  try {
    const parsed = JSON.parse(localStorage.getItem('trophic-print-recent') ?? '[]') as string[];
    return Array.isArray(parsed) ? parsed.slice(-80) : [];
  } catch {
    return [];
  }
}

function rememberPrintIds(ids: string[]) {
  try {
    const merged = [...new Set([...recentPrintIds(), ...ids])].slice(-80);
    localStorage.setItem('trophic-print-recent', JSON.stringify(merged));
  } catch { /* ignore */ }
}

function loadStoredPaper(): PrintPaper | null {
  try {
    const raw = sessionStorage.getItem('trophic-print-paper');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PrintPaper;
    return parsed && Array.isArray(parsed.mcq) && Array.isArray(parsed.written) ? parsed : null;
  } catch { return null; }
}

function storePaper(paper: PrintPaper) {
  try { sessionStorage.setItem('trophic-print-paper', JSON.stringify(paper)); } catch { /* ignore */ }
}

export async function downloadPracticePaper(state: AppState, answerKey = false) {
  const stored = answerKey ? loadStoredPaper() : null;
  const paper = stored ?? buildPrintPaper(state, recentPrintIds());
  if (!stored) {
    storePaper(paper);
    rememberPrintIds([...paper.mcq, ...paper.tf, ...paper.written].map((q) => q.id));
  }
  await generatePracticePdf(paper, answerKey);
}

export async function downloadResultsPdf(exam: ExamResult) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'letter', compress: true });
  makeDocSafe(doc);
  doc.setLineHeightFactor(1.25);
  doc.setTextColor(24, 28, 26);
  pageMarker(doc, 1);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Biology Test – Practice Test', PAGE_W / 2, 64, { align: 'center' });
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Marked copy', PAGE_W / 2, 82, { align: 'center' });
  const pct = exam.totalPoints ? Math.round((exam.totalEarned / exam.totalPoints) * 100) : 0;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`${exam.blueprintName}  ·  ${exam.totalEarned}/${exam.totalPoints} marks  ·  ${pct}%`, PAGE_W / 2, 104, { align: 'center' });
  if (exam.aiGraded) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(70, 110, 55);
    doc.text(`Written answers marked by Gemini (${exam.aiModel ?? 'AI'}) against the model answers and marking points.`, PAGE_W / 2, 119, { align: 'center' });
    doc.setTextColor(24, 28, 26);
  } else if (exam.aiError) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(150, 95, 30);
    doc.text(exam.aiError, PAGE_W / 2, 119, { align: 'center' });
    doc.setTextColor(24, 28, 26);
  }

  let page = 1;
  let y = 150;
  let section = '';
  const ensure = (height: number) => {
    if (y + height > PAGE_H - 54) { page = newPage(doc, page); y = 48; }
  };
  exam.answers.forEach((answer, index) => {
    const question = QUESTION_MAP[answer.questionId];
    if (!question) return;
    const nextSection = answer.section ?? '';
    if (nextSection && nextSection !== section) {
      section = nextSection;
      ensure(34);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(section.replace(/-/g, ' ').toUpperCase(), MARGIN, y);
      y += 18;
    }
    const points = answer.points ?? 1;
    const score = answer.score ?? 0;
    const earned = Math.round(score * points * 10) / 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.6);
    const promptLines = wrap(doc, `${index + 1}. ${question.prompt}`, CONTENT_W - 46);
    const answerText = Array.isArray(answer.response) ? answer.response.join(', ') : String(answer.response ?? '');
    const answerLines = wrap(doc, answerText || '- blank -', CONTENT_W - 18);
    const model = question.modelAnswer || question.explanation || formatAnswer(question);
    const modelLines = wrap(doc, model || '-', CONTENT_W - 18);
    const feedbackLines = answer.ai ? wrap(doc, answer.ai.feedback, CONTENT_W - 18) : [];
    const explanationLines = wrap(doc, question.explanation, CONTENT_W - 18);
    const height = promptLines.length * 12 + 18 + answerLines.length * 11 + modelLines.length * 11 + feedbackLines.length * 11 + explanationLines.length * 10 + 95;
    if (y + height > PAGE_H - 54) { page = newPage(doc, page); y = 48; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`${earned}/${points}`, PAGE_W - MARGIN, y, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.2);
    doc.text(promptLines, MARGIN, y);
    y += promptLines.length * 12 + 7;
    doc.setFontSize(9.2);
    doc.setTextColor(65, 70, 66);
    doc.text('Your answer:', MARGIN, y);
    y += 11;
    doc.setTextColor(24, 28, 26);
    doc.setFontSize(9.6);
    doc.text(answerLines, MARGIN + 18, y);
    y += answerLines.length * 11 + 5;
    doc.setTextColor(65, 70, 66);
    doc.setFontSize(9.2);
    doc.text('Correct / model answer:', MARGIN, y);
    y += 11;
    doc.setTextColor(24, 28, 26);
    doc.setFontSize(9.6);
    doc.text(modelLines, MARGIN + 18, y);
    y += modelLines.length * 11 + 5;
    if (answer.ai) {
      doc.setTextColor(55, 110, 50);
      doc.setFontSize(9.2);
      doc.text(`AI feedback (${answer.ai.awarded}/${points}):`, MARGIN, y);
      y += 11;
      doc.setTextColor(24, 28, 26);
      doc.setFontSize(9.4);
      doc.text(feedbackLines, MARGIN + 18, y);
      y += feedbackLines.length * 11 + 5;
    }
    if (question.explanation) {
      doc.setTextColor(85, 90, 86);
      doc.setFontSize(9);
      doc.setTextColor(85, 90, 86);
      doc.text(explanationLines, MARGIN + 18, y);
      doc.setTextColor(24, 28, 26);
      y += explanationLines.length * 10 + 5;
    }
    y += 12;
  });

  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(`Biology-Practice-Test-Marked-${stamp}.pdf`);
}
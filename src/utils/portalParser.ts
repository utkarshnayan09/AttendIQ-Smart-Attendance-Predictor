/**
 * Attendance Data Ingestion Parser
 * 
 * Handles parsing attendance copied from university portals (SRM Student Portal, ERP, CollPoll),
 * TSV/tab-delimited tables, comma-separated values (CSV), structured JSON, vertical line dumps,
 * or OCR recognized text from screenshots.
 * 
 * SRM Student Portal Format:
 * [Subject Code] | [Subject Description] | [Classes Conducted] | [Present(P)] | [Absent(A)] | [OD/ML Taken] | [Present %] | [OD ML % approved] | [Attendance %]
 */

export interface ParsedSubject {
  name: string;
  totalClasses: number;
  attendedClasses: number;
}

function cleanText(text: string): string {
  return text.trim().replace(/^["']|["']$/g, '');
}

export function parseAttendanceText(rawText: string): ParsedSubject[] {
  if (!rawText || !rawText.trim()) return [];

  const trimmed = rawText.trim();

  // 1. Try JSON parsing
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        const jsonResults: ParsedSubject[] = [];
        for (const item of parsed) {
          const name = String(item.name || item.subject || item.course || item.courseName || '').trim();
          const total = parseInt(item.totalClasses || item.total || item.conducted || item.hoursConducted || '0', 10);
          const attended = parseInt(item.attendedClasses || item.attended || item.present || item.hoursAttended || '0', 10);

          if (name && !isNaN(total) && !isNaN(attended) && total >= 0 && attended >= 0) {
            jsonResults.push({
              name,
              totalClasses: total,
              attendedClasses: Math.min(attended, total),
            });
          }
        }
        if (jsonResults.length > 0) return jsonResults;
      }
    } catch {
      // Continue
    }
  }

  const lines = trimmed.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const results: ParsedSubject[] = [];

  // 2. Specific Line Parsing (Recognizing SRM Portal structure)
  for (const line of lines) {
    // Delimiters: tab, pipe, comma, semicolon, or multi-space
    let tokens: string[] = [];
    if (line.includes('\t')) {
      tokens = line.split('\t');
    } else if (line.includes('|')) {
      tokens = line.split('|');
    } else if (line.includes(';')) {
      tokens = line.split(';');
    } else if (line.includes(',')) {
      tokens = line.split(',');
    } else {
      tokens = line.split(/\s{2,}/);
    }

    tokens = tokens.map(cleanText).filter(Boolean);

    // If space-separated line with SRM course pattern like:
    // "CSE 202 OBJECT ORIENTED PROGRAMMING WITH C++ 56 45 11 0 80.36 0.00 80.36"
    if (tokens.length <= 2 && line.length > 15) {
      // Match SRM Subject Code pattern at start e.g. "CSE 202" or "SEC 203" or "SOC 249A"
      const srmRegex = /^([A-Z]{3,4}\s*\d{3}[A-Z]?)\s+([A-Za-z0-9\s&+\-–/]+?)\s+(\d{1,3})\s+(\d{1,3})(?:\s+(\d{1,3}))?/;
      const match = line.match(srmRegex);
      if (match) {
        const courseName = match[2].trim();
        const conducted = parseInt(match[3], 10);
        const present = parseInt(match[4], 10);
        if (courseName && conducted > 0) {
          results.push({
            name: courseName,
            totalClasses: conducted,
            attendedClasses: Math.min(present, conducted),
          });
          continue;
        }
      }
    }

    if (tokens.length < 2) continue;

    // Skip table headers
    const lowerTokens = tokens.map(t => t.toLowerCase());
    if (
      lowerTokens.some(t =>
        t.includes('subject code') ||
        t.includes('subject description') ||
        t.includes('classes conducted') ||
        t.includes('attendance entered') ||
        t.includes('od/ml') ||
        t.includes('period :')
      )
    ) {
      continue;
    }

    const numericTokens: number[] = [];
    const textTokens: string[] = [];

    tokens.forEach((token) => {
      const numClean = token.replace(/%/g, '').trim();
      const num = Number(numClean);
      if (!isNaN(num) && numClean.length > 0 && /^\d+(\.\d+)?$/.test(numClean)) {
        numericTokens.push(Math.round(num));
      } else if (token.length > 1) {
        textTokens.push(token);
      }
    });

    if (textTokens.length === 0 || numericTokens.length < 2) {
      continue;
    }

    // Filter out code e.g. "CSE 202" or "SEC 203"
    const descriptiveNames = textTokens.filter(t => !/^[A-Z]{2,4}\s*\d{3,4}[A-Z]?$/i.test(t));
    const subjectName = descriptiveNames.length > 0
      ? descriptiveNames.sort((a, b) => b.length - a.length)[0]
      : textTokens.join(' ');

    // For SRM Portal:
    // First integer is Conducted, second integer is Present(P)
    // Example: 56, 45, 11, 0, 80, 0, 80
    let totalClasses = numericTokens[0];
    let attendedClasses = numericTokens[1];

    if (attendedClasses > totalClasses && numericTokens.length >= 2) {
      // In case order is reversed:
      totalClasses = Math.max(numericTokens[0], numericTokens[1]);
      attendedClasses = Math.min(numericTokens[0], numericTokens[1]);
    }

    if (totalClasses > 0 && subjectName) {
      results.push({
        name: subjectName,
        totalClasses,
        attendedClasses: Math.min(attendedClasses, totalClasses),
      });
    }
  }

  if (results.length > 0) {
    return results;
  }

  // 3. Fallback: Sequential OCR text scan from image
  // Scans OCR stream for SRM course lines or [Subject] -> [Conducted] -> [Present]
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const srmRegex = /([A-Z]{3,4}\s*\d{3}[A-Z]?)\s+([A-Za-z0-9\s&+\-–/]+?)\s+(\d{1,3})\s+(\d{1,3})/;
    const m = line.match(srmRegex);
    if (m) {
      const name = m[2].trim();
      const total = parseInt(m[3], 10);
      const attended = parseInt(m[4], 10);
      if (name.length > 3 && total > 0 && !results.some(r => r.name === name)) {
        results.push({
          name,
          totalClasses: total,
          attendedClasses: Math.min(attended, total),
        });
      }
    }
  }

  return results;
}

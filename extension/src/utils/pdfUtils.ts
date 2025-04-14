import { jsPDF, TextOptionsLight } from "jspdf";
import {
  ResumeData,
  ResumeBasics,
  ResumeWorkItem,
  ResumeEducationItem,
  ResumeSkillItem,
  ResumeProjectItem,
} from "../types/resumeTypes"; // Adjusted path

// --- PDF Constants ---
const PDF_MARGIN_LEFT = 15;
const PDF_MARGIN_TOP = 20;
const PDF_MARGIN_RIGHT = 15;
const PDF_MARGIN_BOTTOM = 20;
const PDF_CONTENT_WIDTH = 210 - PDF_MARGIN_LEFT - PDF_MARGIN_RIGHT;
const PDF_LINE_HEIGHT_FACTOR = 1.2;
const PDF_SECTION_SPACE = 4;
const PDF_SECTION_TITLE_SPACE = 2;
const PDF_ITEM_SPACE = 0.5; // Space between bullet points within an item
const PDF_SUBHEADING_SPACE = 1; // Space after job/project title line
const PDF_POST_ITEM_SPACE = 3; // Space after a complete experience/project item

// --- Global state for PDF generation (consider refactoring to pass doc/yPos around) ---
let currentY = PDF_MARGIN_TOP;

// --- Helper: Add Text (Handles Y position and page breaks) ---
// (Keep addText function as is)
function addText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  options: TextOptionsLight & {
    fontSize?: number;
    fontStyle?: "normal" | "bold" | "italic" | "bolditalic";
    maxWidth?: number;
    lineHeightFactor?: number;
    baseline?:
      | "top"
      | "middle"
      | "bottom"
      | "alphabetic"
      | "hanging"
      | "ideographic";
    textColor?: [number, number, number]; // Enforce RGB array type
  } = {}
): { newY: number; pageAdded: boolean } {
  const fontSize = options.fontSize || 10; // Default body font size
  const fontStyle = options.fontStyle || "normal";
  const align = options.align || "left";
  const maxWidth = options.maxWidth || PDF_CONTENT_WIDTH;
  const lineHeightFactor = options.lineHeightFactor || PDF_LINE_HEIGHT_FACTOR;
  const textColor = options.textColor || [0, 0, 0]; // Default black

  doc.setFontSize(fontSize);
  doc.setFont("helvetica", fontStyle);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]); // Apply text color

  const lines = doc.splitTextToSize(text, maxWidth);
  const textHeight = lines.length * fontSize * 0.352778 * lineHeightFactor; // 0.352778 converts pt to mm

  let pageAdded = false;
  // Check if content fits, considering bottom margin
  if (y + textHeight > doc.internal.pageSize.height - PDF_MARGIN_BOTTOM) {
    // Check if it's just slightly over, maybe avoid adding a page for a tiny bit
    if (
      y === PDF_MARGIN_TOP &&
      textHeight >
        doc.internal.pageSize.height - PDF_MARGIN_TOP - PDF_MARGIN_BOTTOM
    ) {
      console.warn("Content too tall for a single page:", text);
      // Optionally truncate or skip adding text? For now, let it flow onto next page if possible.
      doc.addPage();
      currentY = PDF_MARGIN_TOP;
      y = currentY;
      pageAdded = true;
    } else if (y !== PDF_MARGIN_TOP) {
      // Avoid adding page if it's already top and doesn't fit
      doc.addPage();
      currentY = PDF_MARGIN_TOP;
      y = currentY;
      pageAdded = true;
    }
  }

  // Draw text using baseline 'top' for consistent positioning
  doc.text(lines, x, y, {
    align: align,
    maxWidth: maxWidth,
    baseline: "top",
  });

  // Update global Y position
  currentY = y + textHeight;

  // Return the new Y position and whether a page was added
  return { newY: currentY, pageAdded: pageAdded };
}

// --- Helper: Add PDF Header ---
function addPdfHeader(doc: jsPDF, basics: ResumeBasics) {
  currentY = PDF_MARGIN_TOP;
  let result;

  // Name
  result = addText(doc, basics.name.toUpperCase(), 105, currentY, {
    fontSize: 17,
    fontStyle: "bold",
    align: "center",
  });
  currentY = result.newY + 1;

  // Contact Info Line (Phone, Email, LinkedIn, GitHub, Portfolio URL)
  const contactParts = [
    basics.phone,
    basics.email,
    basics.profiles?.find((p) => p.network.toLowerCase() === "linkedin")?.url,
    basics.profiles?.find((p) => p.network.toLowerCase() === "github")?.url,
    basics.url && !basics.url.includes("github") ? basics.url : null, // Simple check for portfolio URL
  ]
    .filter(Boolean)
    .map((p) => p?.replace(/^(https?:\/\/)?(www\.)?/, "")); // Basic cleanup

  const contactLine = contactParts.join(" · ");

  if (contactLine) {
    result = addText(doc, contactLine, 105, currentY, {
      fontSize: 10,
      fontStyle: "normal",
      align: "center",
    });
    currentY = result.newY + 4; // Space after header
  } else {
    currentY += 2; // Add some space even if no contact info
  }
}

// --- Helper: Add Section Title ---
// (Keep addPdfSection function as is)
function addPdfSection(doc: jsPDF, title: string) {
  // Add space before the section title, unless it's the very first section
  if (currentY > PDF_MARGIN_TOP + 5) {
    // Check if not immediately after header
    currentY += PDF_SECTION_SPACE;
  }

  const checkY = currentY;
  const estimatedTitleHeight = 10; // Estimate height for page break check

  // Check for page break *before* adding the title/line
  if (
    checkY + estimatedTitleHeight >
    doc.internal.pageSize.height - PDF_MARGIN_BOTTOM
  ) {
    doc.addPage();
    currentY = PDF_MARGIN_TOP;
  }

  const titleY = currentY;

  // Use addText to draw the title and update currentY
  addText(doc, title.toUpperCase(), PDF_MARGIN_LEFT, titleY, {
    fontSize: 13, // Section title size
    fontStyle: "bold",
    maxWidth: PDF_CONTENT_WIDTH,
  });

  // Draw the line slightly below the baseline of the title text
  const fontSizePt = 13;
  const lineY = titleY + fontSizePt * 0.352778; // Approx baseline Y

  // Check for page break *again* just before drawing the line (unlikely but possible)
  if (lineY + 0.5 > doc.internal.pageSize.height - PDF_MARGIN_BOTTOM) {
    // Don't draw line if it would be on the next page
    // If line didn't fit, Y is already updated by addText, just add space
    currentY += PDF_SECTION_TITLE_SPACE;
  } else {
    doc.setDrawColor(0); // Black color
    doc.setLineWidth(0.3);
    doc.line(
      PDF_MARGIN_LEFT,
      lineY + 0.5, // Position line slightly below text baseline
      PDF_MARGIN_LEFT + PDF_CONTENT_WIDTH,
      lineY + 0.5
    );
    // Update currentY to be below the line
    currentY = lineY + 0.5 + PDF_SECTION_TITLE_SPACE;
  }
}

// --- Helper: Add Work Item ---
function addPdfWorkItem(doc: jsPDF, item: ResumeWorkItem) {
  const startY = currentY;
  let mainContentEndY = startY;
  let detailsEndY = startY;
  const titleFontSize = 11;
  const bodyFontSize = 10;
  const mainMaxWidth = PDF_CONTENT_WIDTH * 0.7;
  const detailsMaxWidth = PDF_CONTENT_WIDTH * 0.28;

  // --- Estimate Height for Page Break ---
  let estimatedHeight = 0;
  if (item.position)
    estimatedHeight +=
      doc.splitTextToSize(item.position, mainMaxWidth).length *
        titleFontSize *
        0.352778 *
        PDF_LINE_HEIGHT_FACTOR +
      PDF_SUBHEADING_SPACE;
  if (item.name)
    estimatedHeight +=
      doc.splitTextToSize(item.name, mainMaxWidth).length *
      bodyFontSize *
      0.352778 *
      PDF_LINE_HEIGHT_FACTOR;
  const detailsText = `${item.startDate} - ${item.endDate || "Present"}`;
  const detailsHeight =
    doc.splitTextToSize(detailsText, detailsMaxWidth).length *
    bodyFontSize *
    0.352778 *
    PDF_LINE_HEIGHT_FACTOR;
  let bulletsHeight = 0;
  item.highlights?.forEach((bullet) => {
    bulletsHeight +=
      doc.splitTextToSize(bullet, PDF_CONTENT_WIDTH - 4).length *
        bodyFontSize *
        0.352778 *
        PDF_LINE_HEIGHT_FACTOR +
      PDF_ITEM_SPACE;
  });
  estimatedHeight =
    Math.max(estimatedHeight, detailsHeight) +
    bulletsHeight +
    PDF_POST_ITEM_SPACE;
  // --- End Height Estimation ---

  // Check for page break before adding item
  if (
    startY + estimatedHeight >
      doc.internal.pageSize.height - PDF_MARGIN_BOTTOM &&
    currentY !== PDF_MARGIN_TOP
  ) {
    doc.addPage();
    currentY = PDF_MARGIN_TOP;
    // Optionally re-add section header here if needed
  }

  const itemStartY = currentY;

  // Add Position (Title)
  if (item.position) {
    const { newY } = addText(doc, item.position, PDF_MARGIN_LEFT, itemStartY, {
      fontSize: titleFontSize,
      fontStyle: "bold",
      maxWidth: mainMaxWidth,
    });
    mainContentEndY = newY;
  }

  // Add Dates (Details - Right Aligned)
  if (detailsText) {
    const { newY } = addText(
      doc,
      detailsText,
      PDF_MARGIN_LEFT + PDF_CONTENT_WIDTH,
      itemStartY,
      {
        fontSize: bodyFontSize,
        fontStyle: "normal",
        align: "right",
        maxWidth: detailsMaxWidth,
      }
    );
    detailsEndY = newY;
  }

  // Add Company Name (Subtitle)
  const subtitleY = item.position ? mainContentEndY : itemStartY;
  if (item.name) {
    const { newY } = addText(doc, item.name, PDF_MARGIN_LEFT, subtitleY, {
      fontSize: bodyFontSize,
      fontStyle: "normal",
      maxWidth: mainMaxWidth,
    });
    mainContentEndY = newY + PDF_SUBHEADING_SPACE;
  } else if (item.position) {
    mainContentEndY += PDF_SUBHEADING_SPACE; // Add space even if no subtitle if there was a title
  }

  // Ensure Y is below both left (title/subtitle) and right (details) content
  currentY = Math.max(mainContentEndY, detailsEndY);

  // Add Bullet Points (Highlights)
  if (item.highlights && item.highlights.length > 0) {
    item.highlights.forEach((bullet) => {
      const bulletStartY = currentY;
      const bulletIndent = 4; // Indentation for bullet text
      const bulletMaxWidth = PDF_CONTENT_WIDTH - bulletIndent;

      // Add bullet symbol (ensure Y pos aligns with text baseline nicely)
      const symbolYOffset =
        (bodyFontSize * 0.352778 * PDF_LINE_HEIGHT_FACTOR) / 2 -
        bodyFontSize * 0.352778 * 0.3; // Small adjustment for vertical alignment
      addText(
        doc,
        "\u2022",
        PDF_MARGIN_LEFT + 1.5,
        bulletStartY + symbolYOffset,
        { fontSize: bodyFontSize }
      );

      // Add bullet text
      const result = addText(
        doc,
        bullet,
        PDF_MARGIN_LEFT + bulletIndent,
        bulletStartY,
        {
          fontSize: bodyFontSize,
          maxWidth: bulletMaxWidth,
        }
      );
      currentY = result.newY + PDF_ITEM_SPACE; // Add space after each bullet
    });
  }
}

// --- Helper: Add Education Item ---
function addPdfEducationItem(doc: jsPDF, item: ResumeEducationItem) {
  const startY = currentY;
  let mainContentEndY = startY;
  let detailsEndY = startY;
  const titleFontSize = 11;
  const bodyFontSize = 10;
  const mainMaxWidth = PDF_CONTENT_WIDTH * 0.7;
  const detailsMaxWidth = PDF_CONTENT_WIDTH * 0.28;

  // Combine study type and area for the main title
  const titleText = `${item.studyType} in ${item.area}`;
  const detailsText = `${item.startDate} - ${item.endDate || "Present"}${
    item.gpa ? ` | GPA: ${item.gpa}` : ""
  }`;

  // --- Estimate Height (Similar to Work Item) ---
  let estimatedHeight = 0;
  estimatedHeight +=
    doc.splitTextToSize(titleText, mainMaxWidth).length *
      titleFontSize *
      0.352778 *
      PDF_LINE_HEIGHT_FACTOR +
    PDF_SUBHEADING_SPACE;
  if (item.institution)
    estimatedHeight +=
      doc.splitTextToSize(item.institution, mainMaxWidth).length *
      bodyFontSize *
      0.352778 *
      PDF_LINE_HEIGHT_FACTOR;
  const detailsHeight =
    doc.splitTextToSize(detailsText, detailsMaxWidth).length *
    bodyFontSize *
    0.352778 *
    PDF_LINE_HEIGHT_FACTOR;
  // No bullets usually in education, add space after item
  estimatedHeight =
    Math.max(estimatedHeight, detailsHeight) + PDF_POST_ITEM_SPACE;
  // --- End Height Estimation ---

  // Check for page break before adding item
  if (
    startY + estimatedHeight >
      doc.internal.pageSize.height - PDF_MARGIN_BOTTOM &&
    currentY !== PDF_MARGIN_TOP
  ) {
    doc.addPage();
    currentY = PDF_MARGIN_TOP;
  }

  const itemStartY = currentY;

  // Add Degree (Title)
  const { newY: titleEndY } = addText(
    doc,
    titleText,
    PDF_MARGIN_LEFT,
    itemStartY,
    {
      fontSize: titleFontSize,
      fontStyle: "bold",
      maxWidth: mainMaxWidth,
    }
  );
  mainContentEndY = titleEndY;

  // Add Dates & GPA (Details - Right Aligned)
  if (detailsText) {
    const { newY } = addText(
      doc,
      detailsText,
      PDF_MARGIN_LEFT + PDF_CONTENT_WIDTH,
      itemStartY,
      {
        fontSize: bodyFontSize,
        fontStyle: "normal",
        align: "right",
        maxWidth: detailsMaxWidth,
      }
    );
    detailsEndY = newY;
  }

  // Add Institution (Subtitle)
  if (item.institution) {
    const { newY } = addText(
      doc,
      item.institution,
      PDF_MARGIN_LEFT,
      mainContentEndY,
      {
        fontSize: bodyFontSize,
        fontStyle: "normal",
        maxWidth: mainMaxWidth,
      }
    );
    mainContentEndY = newY + PDF_SUBHEADING_SPACE;
  } else {
    mainContentEndY += PDF_SUBHEADING_SPACE;
  }

  // Ensure Y is below both columns
  currentY = Math.max(mainContentEndY, detailsEndY);
}

// --- Helper: Add Project Item ---
function addPdfProjectItem(doc: jsPDF, item: ResumeProjectItem) {
  const startY = currentY;
  let mainContentEndY = startY;
  let detailsEndY = startY; // For potential URL on right
  const titleFontSize = 11;
  const bodyFontSize = 10;
  const mainMaxWidth = PDF_CONTENT_WIDTH * 0.7; // Adjust if URL is present
  const detailsMaxWidth = PDF_CONTENT_WIDTH * 0.28; // For URL

  // --- Estimate Height ---
  let estimatedHeight = 0;
  estimatedHeight +=
    doc.splitTextToSize(item.name, PDF_CONTENT_WIDTH).length *
      titleFontSize *
      0.352778 *
      PDF_LINE_HEIGHT_FACTOR +
    PDF_SUBHEADING_SPACE;
  if (item.description)
    estimatedHeight +=
      doc.splitTextToSize(item.description, PDF_CONTENT_WIDTH).length *
        bodyFontSize *
        0.352778 *
        PDF_LINE_HEIGHT_FACTOR +
      PDF_ITEM_SPACE;
  const keywordsText = `Tech: ${item.keywords?.join(", ")}`;
  if (item.keywords && item.keywords.length > 0)
    estimatedHeight +=
      doc.splitTextToSize(keywordsText, PDF_CONTENT_WIDTH).length *
      bodyFontSize *
      0.352778 *
      PDF_LINE_HEIGHT_FACTOR *
      0.8; // Keywords might be smaller/italic
  let detailsHeight = 0;
  if (item.url)
    detailsHeight =
      doc.splitTextToSize(item.url, detailsMaxWidth).length *
      bodyFontSize *
      0.352778 *
      PDF_LINE_HEIGHT_FACTOR;
  estimatedHeight =
    Math.max(estimatedHeight, detailsHeight) + PDF_POST_ITEM_SPACE;
  // --- End Height Estimation ---

  // Check for page break
  if (
    startY + estimatedHeight >
      doc.internal.pageSize.height - PDF_MARGIN_BOTTOM &&
    currentY !== PDF_MARGIN_TOP
  ) {
    doc.addPage();
    currentY = PDF_MARGIN_TOP;
  }

  const itemStartY = currentY;

  // Add Project Name (Title) - Takes full width if no URL? Or keep consistent?
  const titleMaxWidth = item.url ? mainMaxWidth : PDF_CONTENT_WIDTH;
  const { newY: titleEndY } = addText(
    doc,
    item.name,
    PDF_MARGIN_LEFT,
    itemStartY,
    {
      fontSize: titleFontSize,
      fontStyle: "bold",
      maxWidth: titleMaxWidth,
    }
  );
  mainContentEndY = titleEndY;

  // Add URL (Details - Right Aligned)
  if (item.url) {
    const cleanUrl = item.url.replace(/^(https?:\/\/)?(www\.)?/, "");
    const { newY } = addText(
      doc,
      cleanUrl,
      PDF_MARGIN_LEFT + PDF_CONTENT_WIDTH,
      itemStartY,
      {
        fontSize: bodyFontSize,
        fontStyle: "normal",
        align: "right",
        maxWidth: detailsMaxWidth,
        textColor: [0, 0, 255], // Blue color for link
      }
    );
    detailsEndY = newY;
    // Make URL clickable (optional)
    // doc.link(PDF_MARGIN_LEFT + PDF_CONTENT_WIDTH - detailsMaxWidth, itemStartY, detailsMaxWidth, (newY - itemStartY), { url: item.url });
  }

  // Ensure Y is below Title/URL before adding description
  currentY = Math.max(mainContentEndY, detailsEndY);
  currentY += PDF_SUBHEADING_SPACE; // Add space after title/URL line

  // Add Description
  if (item.description) {
    const { newY } = addText(doc, item.description, PDF_MARGIN_LEFT, currentY, {
      fontSize: bodyFontSize,
      fontStyle: "normal",
      maxWidth: PDF_CONTENT_WIDTH,
    });
    currentY = newY + PDF_ITEM_SPACE;
  }

  // Add Keywords (like a bullet point, maybe italic?)
  if (item.keywords && item.keywords.length > 0) {
    const bulletStartY = currentY;
    const bulletIndent = 4;
    const bulletMaxWidth = PDF_CONTENT_WIDTH - bulletIndent;
    addText(
      doc,
      "\u2022",
      PDF_MARGIN_LEFT + 1.5,
      bulletStartY +
        (bodyFontSize * 0.352778 * PDF_LINE_HEIGHT_FACTOR) / 2 -
        bodyFontSize * 0.352778 * 0.3,
      { fontSize: bodyFontSize }
    );
    const result = addText(
      doc,
      `Tech: ${item.keywords.join(", ")}`,
      PDF_MARGIN_LEFT + bulletIndent,
      bulletStartY,
      {
        fontSize: bodyFontSize,
        fontStyle: "italic",
        maxWidth: bulletMaxWidth,
      }
    );
    currentY = result.newY; // No extra space after keywords?
  }
}

// --- Helper: Add Skills Section ---
function addPdfSkills(doc: jsPDF, skills: ResumeSkillItem[]) {
  const bodyFontSize = 10;
  skills.forEach((skill) => {
    const skillStartY = currentY;
    const categoryText = skill.name + ":";
    const keywords = skill.keywords.join(", ");
    const fullText = `${categoryText} ${keywords}`;

    // --- Estimate Height ---
    const textLines = doc.splitTextToSize(fullText, PDF_CONTENT_WIDTH);
    const textHeight =
      textLines.length * bodyFontSize * 0.352778 * PDF_LINE_HEIGHT_FACTOR +
      PDF_ITEM_SPACE; // Include space after
    // --- End Estimation ---

    // Check for page break before adding skill line
    if (
      skillStartY + textHeight >
        doc.internal.pageSize.height - PDF_MARGIN_BOTTOM &&
      currentY !== PDF_MARGIN_TOP
    ) {
      doc.addPage();
      currentY = PDF_MARGIN_TOP;
    }

    const itemStartY = currentY; // Y pos after potential break

    // Calculate width of the category text to align keywords
    doc.setFont("helvetica", "bold");
    doc.setFontSize(bodyFontSize);
    const categoryWidth =
      (doc.getStringUnitWidth(categoryText) * bodyFontSize) /
      doc.internal.scaleFactor;

    // Add Category (Bold)
    addText(doc, categoryText, PDF_MARGIN_LEFT, itemStartY, {
      fontSize: bodyFontSize,
      fontStyle: "bold",
      maxWidth: categoryWidth + 5, // Allow slight overflow
    });

    // Add Keywords (Normal, starting after category)
    const keywordsX = PDF_MARGIN_LEFT + categoryWidth + 1; // Start keywords 1mm after category
    const keywordsMaxWidth = PDF_CONTENT_WIDTH - (keywordsX - PDF_MARGIN_LEFT);
    if (keywordsMaxWidth > 5) {
      // Only add keywords if there's space
      const result = addText(doc, keywords, keywordsX, itemStartY, {
        // Align baseline with category
        fontSize: bodyFontSize,
        fontStyle: "normal",
        maxWidth: keywordsMaxWidth,
        baseline: "top", // Use top baseline consistently
      });
      // currentY is updated by the keywords addText call
      currentY = result.newY + PDF_ITEM_SPACE; // Space after the skill line
    } else {
      // Handle case where category is too long (e.g., wrap keywords below)
      const result = addText(doc, keywords, PDF_MARGIN_LEFT, currentY, {
        // Place below category
        fontSize: bodyFontSize,
        fontStyle: "normal",
        maxWidth: PDF_CONTENT_WIDTH,
      });
      currentY = result.newY + PDF_ITEM_SPACE;
    }
  });
}

// --- Main PDF Generation Function ---
export function generatePdf(resumeData: ResumeData): void {
  currentY = PDF_MARGIN_TOP; // Reset Y position for each generation
  const doc = new jsPDF("p", "mm", "a4");

  // 1. Header
  addPdfHeader(doc, resumeData.basics);

  // 2. Summary
  if (resumeData.basics.summary) {
    addPdfSection(doc, "SUMMARY");
    addText(doc, resumeData.basics.summary, PDF_MARGIN_LEFT, currentY, {
      fontSize: 10,
      fontStyle: "normal",
    });
    currentY += PDF_SECTION_TITLE_SPACE; // Add space after summary content
  }

  // 3. Work Experience
  if (resumeData.work && resumeData.work.length > 0) {
    addPdfSection(doc, "EXPERIENCE");
    resumeData.work.forEach((item, index) => {
      addPdfWorkItem(doc, item);
      // Add space between items, but not after the last one before next section
      if (index < resumeData.work.length - 1) {
        currentY += PDF_POST_ITEM_SPACE;
      }
    });
    currentY += PDF_ITEM_SPACE; // Small space after the last item of the section
  }

  // 4. Education
  if (resumeData.education && resumeData.education.length > 0) {
    addPdfSection(doc, "EDUCATION");
    resumeData.education.forEach((item, index) => {
      addPdfEducationItem(doc, item);
      if (index < resumeData.education.length - 1) {
        currentY += PDF_POST_ITEM_SPACE;
      }
    });
    currentY += PDF_ITEM_SPACE;
  }

  // 5. Projects
  if (resumeData.projects && resumeData.projects.length > 0) {
    addPdfSection(doc, "PROJECTS");
    resumeData.projects.forEach((item, index) => {
      addPdfProjectItem(doc, item);
      if (index < resumeData.projects.length - 1) {
        currentY += PDF_POST_ITEM_SPACE;
      }
    });
    currentY += PDF_ITEM_SPACE;
  }

  // 6. Skills
  if (resumeData.skills && resumeData.skills.length > 0) {
    addPdfSection(doc, "SKILLS");
    addPdfSkills(doc, resumeData.skills);
    // currentY is updated within addPdfSkills after the last skill
    currentY += PDF_SECTION_TITLE_SPACE; // Add final space after skills section
  }

  // 7. Certificates (Optional)
  if (resumeData.certificates && resumeData.certificates.length > 0) {
    addPdfSection(doc, "CERTIFICATES");
    resumeData.certificates.forEach((cert) => {
      const certText = `${cert.name} (${cert.issuer}) - ${cert.date}`;
      const { newY } = addText(doc, certText, PDF_MARGIN_LEFT, currentY, {
        fontSize: 10,
        fontStyle: "normal",
      });
      currentY = newY + PDF_ITEM_SPACE;
    });
    currentY += PDF_SECTION_TITLE_SPACE;
  }

  // 8. Languages (Optional)
  if (resumeData.languages && resumeData.languages.length > 0) {
    addPdfSection(doc, "LANGUAGES");
    const langText = resumeData.languages
      .map((l) => `${l.language} (${l.fluency})`)
      .join(", ");
    const { newY } = addText(doc, langText, PDF_MARGIN_LEFT, currentY, {
      fontSize: 10,
      fontStyle: "normal",
    });
    currentY = newY; // No extra space usually needed after languages list
    currentY += PDF_SECTION_TITLE_SPACE;
  }

  // --- Save the PDF ---
  doc.save("Tailored_Resume_JSON.pdf"); // Changed filename slightly
}

// --- Removed `parseResumeText` function ---

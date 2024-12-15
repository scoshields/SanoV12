import { SESSION_SECTIONS, ASSESSMENT_SECTIONS } from './constants';

function standardizeLineBreaks(content: string): string {
  return content
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
}

function ensureSectionSpacing(content: string): string {
  // Split on section headers while keeping the headers
  const sections = content.split(/(?=^[A-Z][A-Z\s/&]+:)/m);
  return sections
    .map(section => section.trim())
    .filter(Boolean)
    .join('\n\n\n');
}

function formatSection(section: string): string {
  const formatted = section
    .replace(/^\s+|\s+$/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\[\s*|\s*\]/g, '');
  
  // Ensure content after colon starts on a new line
  return formatted.replace(/^([^:]+):(.+)$/m, '$1:\n$2');
}

export function formatResponse(content: string, isAssessment: boolean): string {
  let formattedContent = standardizeLineBreaks(content);
  formattedContent = ensureSectionSpacing(formattedContent);

  const sections = isAssessment ? ASSESSMENT_SECTIONS : SESSION_SECTIONS;
  
  // Format each section while maintaining proper spacing
  sections.forEach(sectionHeader => {
    const sectionRegex = new RegExp(
      `(${sectionHeader}:)([^]*?)(?=(?:${sections.join(':|')}:)|$)`,
      'g'
    );
    
    formattedContent = formattedContent.replace(sectionRegex, (match) => {
      const [header, content] = match.split(':');
      const formattedSectionContent = formatSection(content || '');
      return `${header}:\n${formattedSectionContent.trim()}`;
    });
  });

  // Ensure consistent spacing between sections
  formattedContent = formattedContent
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/([A-Z][A-Z\s/&]+:)\s*/g, '$1\n')
    .trim();

  return formattedContent;
}
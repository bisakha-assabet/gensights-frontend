type ParseResult = {
  headers: string[];
  data: any[];
};

export const parseFile = (content: string, format: string): ParseResult => {
  switch (format.toLowerCase()) {
    case 'csv':
      return parseCSV(content);
    case 'json':
      return parseJSON(content);
    case 'txt':
      return parseTXT(content);
    default:
      throw new Error(`Unsupported file format: ${format}`);
  }
};

const parseCSV = (text: string): ParseResult => {
  const lines: string[] = [];
  let currentLine = '';
  let inQuotedField = false;

  // Handle line breaks within quoted fields
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    if (char === '"') {
      inQuotedField = !inQuotedField;
    }

    if (char === '\n' && !inQuotedField) {
      lines.push(currentLine);
      currentLine = '';
    } else {
      currentLine += char;
    }
  }
  lines.push(currentLine);

  if (lines.length === 0) return { headers: [], data: [] };

  // Detect delimiter
  const delimiters = [',', '\t', ';', '|'];
  let delimiter = ',';
  let maxFields = 0;

  for (const testDelimiter of delimiters) {
    const fieldCount = lines[0].split(testDelimiter).length;
    if (fieldCount > maxFields) {
      maxFields = fieldCount;
      delimiter = testDelimiter;
    }
  }

  // Parse headers and data
  const headers = parseCSVLine(lines[0], delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
  const data = lines.slice(1)
    .map(line => {
      const values = parseCSVLine(line, delimiter);
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = (values[index] || '').trim().replace(/^"|"$/g, '');
      });
      return row;
    })
    .filter(row => Object.values(row).some(v => v !== ''));

  return { headers, data };
};

const parseCSVLine = (line: string, delimiter: string): string[] => {
  const result: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      result.push(currentField);
      currentField = '';
    } else {
      currentField += char;
    }
  }

  result.push(currentField);
  return result;
};

const parseJSON = (text: string): ParseResult => {
  try {
    const jsonData = JSON.parse(text);
    if (Array.isArray(jsonData) && jsonData.length > 0) {
      return {
        headers: Object.keys(jsonData[0]),
        data: jsonData
      };
    }
    return { headers: [], data: [] };
  } catch (e) {
    throw new Error('Invalid JSON format');
  }
};

const parseTXT = (text: string): ParseResult => {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length === 0) return { headers: [], data: [] };
  
  // Detect delimiter
  const delimiters = ['\t', ',', ';', '|'];
  let bestDelimiter = ',';
  let maxColumns = 0;
  
  for (const delimiter of delimiters) {
    const columns = lines[0].split(delimiter).length;
    if (columns > maxColumns) {
      maxColumns = columns;
      bestDelimiter = delimiter;
    }
  }
  
  const headers = lines[0].split(bestDelimiter).map(header => header.trim().replace(/"/g, ''));
  const data = lines.slice(1).map(line => {
    const values = line.split(bestDelimiter).map(value => value.trim().replace(/"/g, ''));
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    return row;
  });
  
  return { headers, data };
};

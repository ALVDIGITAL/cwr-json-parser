export function getRecordType(line: string): string {
    // First 3 chars always record type
    return line.substring(0, 3);
  }

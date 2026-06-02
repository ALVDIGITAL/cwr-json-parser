
export function tokenize(raw: string): string[] {
    return raw
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .split('\n')
      .filter(line => line.trim().length > 0);
  }

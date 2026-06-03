import type { ErrorObject } from 'ajv';

export type ValidationIssue = {
  path: string;
  code: string;
  message: string;
  detail?: string;
};

const AJV_RULE_HINTS: Record<string, (err: ErrorObject, path: string) => ValidationIssue | null> = {
  pattern: (err, path) => {
    const pattern = (err.params as { pattern?: string })?.pattern;
    if (path.includes('/identifiers/') && pattern?.includes('T-')) {
      return {
        path,
        code: 'ISWC_FORMAT',
        message: 'ISWC must use display form T-NNNNNNNNN-C (e.g. T-702160594-9)',
        detail: err.message || undefined,
      };
    }
    if (path.endsWith('/ipi')) {
      return {
        path,
        code: 'IPI_FORMAT',
        message: 'IPI must be an 11-digit numeric string',
      };
    }
    if (path.includes('/isrc')) {
      return {
        path,
        code: 'ISRC_FORMAT',
        message: 'ISRC must match CC-XXX-YY-NNNNN (compact form accepted after normalize)',
      };
    }
    return {
      path,
      code: 'PATTERN',
      message: err.message || 'value does not match required format',
      detail: pattern ? `pattern: ${pattern}` : undefined,
    };
  },
  enum: (err, path) => {
    const allowed = (err.params as { allowedValues?: unknown[] })?.allowedValues;
    const field = path.split('/').pop() || 'value';
    if (field === 'role') {
      return {
        path,
        code: 'ROLE_CODE',
        message: `invalid party role "${formatValue(err.data)}"`,
        detail: allowed && allowed.length <= 16 ? `allowed: ${allowed.join(', ')}` : undefined,
      };
    }
    if (path.includes('/territory/include') || path.includes('/territory/exclude')) {
      return {
        path,
        code: 'TIS_CODE',
        message: `unknown or invalid TIS code "${formatValue(err.data)}"`,
      };
    }
    return {
      path,
      code: 'ENUM',
      message: `invalid ${field}: ${formatValue(err.data)}`,
      detail: allowed && allowed.length <= 8 ? `allowed: ${allowed.join(', ')}` : undefined,
    };
  },
  maxItems: (err, path) => {
    if (path.endsWith('/territory/include') || path.endsWith('/territory/exclude')) {
      return {
        path: territoryBasePath(path),
        code: 'OWN_TERRITORY_TIS',
        message:
          'ownership (shareTypes type "own") must use empty territory.include and territory.exclude',
        detail: 'collection (coll) TIS codes belong on a separate territories[] entry',
      };
    }
    if (path.endsWith('/shareTypes')) {
      return {
        path: territoryBasePath(path),
        code: 'OWN_COLL_MIXED',
        message: 'do not combine "own" and "coll" in the same territories[] entry',
        detail: 'use one shareTypes block per entry (split into two territory rows)',
      };
    }
    return { path, code: 'MAX_ITEMS', message: err.message || 'too many items' };
  },
  if: (err, path) => {
    if (path.includes('/territories/')) {
      return {
        path: territoryBasePath(path),
        code: 'TERRITORY_LAYOUT',
        message: 'territory entry does not satisfy ownership vs collection rules',
        detail: 'see OWN_TERRITORY_TIS / OWN_COLL_MIXED (auto-normalize may fix combined rows)',
      };
    }
    if (path.includes('/identifiers/')) {
      return {
        path,
        code: 'IDENTIFIER_RULE',
        message: 'identifier value does not match rules for its source type',
      };
    }
    return { path, code: 'IF', message: 'conditional schema rule failed', detail: path };
  },
  required: (err, path) => {
    const missing = (err.params as { missingProperty?: string })?.missingProperty;
    const full = missing ? appendPath(path, missing) : path;
    return {
      path: full,
      code: 'REQUIRED',
      message: `missing required field "${missing || 'property'}"`,
    };
  },
  additionalProperties: (err, path) => {
    const extra = (err.params as { additionalProperty?: string })?.additionalProperty;
    return {
      path,
      code: 'EXTRA_PROPERTY',
      message: `unexpected property "${extra}"`,
    };
  },
  type: (err, path) => {
    const expected = (err.params as { type?: string })?.type;
    return {
      path,
      code: 'TYPE',
      message: `expected ${expected}, got ${typeof err.data}`,
    };
  },
};

function formatValue(data: unknown): string {
  if (data === undefined) return '(missing)';
  if (typeof data === 'string') return data;
  return JSON.stringify(data);
}

function appendPath(base: string, segment: string): string {
  return base === '/' ? `/${segment}` : `${base}/${segment}`;
}

function territoryBasePath(path: string): string {
  const idx = path.indexOf('/territories/');
  if (idx === -1) return path;
  const rest = path.slice(idx + '/territories/'.length);
  const entryIndex = rest.split('/')[0];
  return `${path.slice(0, idx)}/territories/${entryIndex}`;
}

function formatPath(instancePath: string, err: ErrorObject): string {
  let path = instancePath.length ? instancePath : '/';
  if (err.keyword === 'required' && (err.params as { missingProperty?: string })?.missingProperty) {
    path = appendPath(path, (err.params as { missingProperty: string }).missingProperty);
  }
  return path;
}

export function ajvErrorToIssue(err: ErrorObject): ValidationIssue {
  const path = formatPath(err.instancePath, err);
  const mapper = AJV_RULE_HINTS[err.keyword];
  if (mapper) {
    const mapped = mapper(err, path);
    if (mapped) return mapped;
  }
  return {
    path,
    code: (err.keyword || 'INVALID').toUpperCase(),
    message: err.message || 'invalid value',
  };
}

function issueKey(issue: ValidationIssue): string {
  return `${issue.code}|${issue.path}`;
}

export function formatIssue(issue: ValidationIssue, index: number): string {
  const detail = issue.detail ? ` (${issue.detail})` : '';
  return `${index}. ${issue.path} [${issue.code}]: ${issue.message}${detail}`;
}

/** Collapse duplicate paths (e.g. if + maxItems on same territory) and re-number. */
export function dedupeIssues(issues: ValidationIssue[]): ValidationIssue[] {
  const seen = new Map<string, ValidationIssue>();
  for (const issue of issues) {
    let key = issueKey(issue);
    if (issue.code === 'PUB_OWN_E_ONLY') {
      const subKey = `${issue.path}|SUBPUB_NO_OWN`;
      if (seen.has(subKey)) continue;
    }
    if (issue.code === 'SUBPUB_NO_OWN') {
      key = `${issue.path}|SUBPUB_NO_OWN`;
    }
    if (!seen.has(key)) seen.set(key, issue);
  }
  return [...seen.values()];
}

export function formatSemanticError(line: string): ValidationIssue | null {
  const match = line.match(/^(?:\d+\.\s+)?(\S+)\s+\[([A-Z_]+)\]:\s*(.+)$/);
  if (!match) return null;
  return { path: match[1], code: match[2], message: match[3] };
}

export function issuesToStrings(issues: ValidationIssue[]): string[] {
  return issues.map((issue, i) => formatIssue(issue, i + 1));
}

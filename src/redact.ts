export type RedactionResult = {
  text: string;
  count: number;
};

type SecretPattern = {
  name: string;
  pattern: RegExp;
  replace(match: string, ...captures: string[]): string;
};

const patterns: SecretPattern[] = [
  {
    name: 'aws-access-key',
    pattern: /\b(AKIA|ASIA)[A-Z0-9]{16}\b/g,
    replace: () => '[REDACTED:aws-access-key]'
  },
  {
    name: 'github-token',
    pattern: /\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{20,}\b/g,
    replace: () => '[REDACTED:github-token]'
  },
  {
    name: 'slack-token',
    pattern: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g,
    replace: () => '[REDACTED:slack-token]'
  },
  {
    name: 'private-key',
    pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
    replace: () => '[REDACTED:private-key]'
  },
  {
    name: 'assignment-secret',
    pattern: /\b(api[_-]?key|token|secret|password|passwd|authorization)\s*[:=]\s*(["']?)([^\s"']{8,})\2/gi,
    replace: (match: string, key: string) => `${key}=[REDACTED:${key.toLowerCase()}]`
  },
  {
    name: 'bearer-token',
    pattern: /\bBearer\s+[A-Za-z0-9._~+/=-]{12,}/gi,
    replace: () => 'Bearer [REDACTED:bearer-token]'
  },
  {
    name: 'url-credential',
    pattern: /(https?:\/\/)([^\s:/@]+):([^\s/@]+)@/gi,
    replace: (_match: string, protocol: string, user: string) => `${protocol}${user}:[REDACTED:url-password]@`
  }
];

export function redactText(input: string): RedactionResult {
  let text = input;
  let count = 0;

  for (const secret of patterns) {
    text = text.replace(secret.pattern, (...args: string[]) => {
      count += 1;
      return secret.replace(...args);
    });
  }

  return { text, count };
}

export function redactMaybe(input: string, enabled: boolean): RedactionResult {
  return enabled ? redactText(input) : { text: input, count: 0 };
}

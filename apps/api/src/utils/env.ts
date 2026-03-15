const loadEnv = <T>(
  key: string,
  {
    format,
    required,
    parse,
    defaultValue,
  }: {
    format: 'string' | 'number' | 'integer';
    required?: boolean;
    parse?: (val: unknown) => T;
    defaultValue?: T;
  }
): T => {
  const raw = process.env[key];
  if (!raw && required) {
    throw new Error(`Required environment variable was not found: ${key}`);
  }
  if (defaultValue) {
    return defaultValue;
  }
  if (parse) {
    const val = parse(raw);
    if (!val && required) {
      throw new Error(`Required environment variable was not found: ${key}`);
    }
    return val;
  }
  if (!required && raw === undefined) {
    return undefined as unknown as T;
  }
  if (!required && raw === null) {
    return null as unknown as T;
  }
  if (format === 'string') {
    return String(raw) as unknown as T;
  }
  if (format === 'number') {
    const num = Number(raw);
    if (Number.isNaN(num)) {
      throw new Error(`Invalid number: ${raw}`);
    }
    return num as unknown as T;
  }
  if (format === 'integer') {
    const num = parseInt(raw!, 10);
    if (Number.isNaN(num)) {
      throw new Error(`Invalid integer: ${raw}`);
    }
    return num as T;
  }
  return raw as T;
};

export { loadEnv };

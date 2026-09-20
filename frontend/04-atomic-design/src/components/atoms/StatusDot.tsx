interface StatusDotProps {
  connected: boolean;
}

/**
 * A tiny presence indicator. Purely presentational: it turns a boolean into a
 * coloured dot, nothing more.
 */
export function StatusDot({ connected }: StatusDotProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-300'}`}
    />
  );
}
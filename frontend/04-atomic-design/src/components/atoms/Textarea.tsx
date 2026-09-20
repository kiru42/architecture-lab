interface TextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  testId?: string;
}

export function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  className = '',
  testId,
}: TextareaProps) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      data-testid={testId}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md ${className}`}
    />
  );
}
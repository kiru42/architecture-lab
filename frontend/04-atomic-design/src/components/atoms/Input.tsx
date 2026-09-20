interface InputProps {
  id?: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  testId?: string;
}

export function Input({
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  className = '',
  testId,
}: InputProps) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      data-testid={testId}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md ${className}`}
    />
  );
}
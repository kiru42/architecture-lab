interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
  className?: string;
  testId?: string;
}

export function Checkbox({ checked, onChange, label, className = '', testId }: CheckboxProps) {
  return (
    <label className={`inline-flex items-center gap-2 ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        data-testid={testId}
        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
      />
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </label>
  );
}
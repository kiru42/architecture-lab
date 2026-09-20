import { Input } from '../atoms/Input';
import { Label } from '../atoms/Label';

interface FormFieldProps {
  id?: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  testId?: string;
}

export function FormField({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  error,
  testId,
}: FormFieldProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} testId={testId} />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
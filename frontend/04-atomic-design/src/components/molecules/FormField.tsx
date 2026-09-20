import { Input } from '../atoms/Input';
import { Label } from '../atoms/Label';

interface FormFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
}

export function FormField({ label, type, value, onChange, placeholder, error }: FormFieldProps) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={onChange} placeholder={placeholder} />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

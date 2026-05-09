interface LabelProps {
  children: React.ReactNode;
}

export function Label({ children }: LabelProps) {
  return <label className="block text-sm font-medium text-gray-700 mb-1">{children}</label>;
}

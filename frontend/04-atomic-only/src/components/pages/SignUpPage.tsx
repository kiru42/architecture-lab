import { AuthLayout } from '../templates/AuthLayout';
import { SignUpForm } from '../organisms/SignUpForm';

export function SignUpPage() {
  return (
    <AuthLayout title="Create Account">
      <SignUpForm />
    </AuthLayout>
  );
}

import { AuthLayout } from '../templates/AuthLayout';
import { SignInForm } from '../organisms/SignInForm';

export function SignInPage() {
  return (
    <AuthLayout title="Sign In to TaskFlow">
      <SignInForm />
    </AuthLayout>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FormField } from '../molecules/FormField';
import { Button } from '../atoms/Button';

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signin, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signin(email, password);
      // Each component owns its own auth state, so signing in does not by
      // itself move the router: without this the form would store the token,
      // stay on /signin, and the visitor would never reach the dashboard.
      navigate('/');
    } catch {
      // The error state lives in useAuth and is rendered below.
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        id="signin-email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        testId="signin-email"
      />
      <FormField
        id="signin-password"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        testId="signin-password"
      />
      {error && (
        <p data-testid="auth-error" className="text-red-600">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full" testId="signin-submit">
        Sign In
      </Button>
      <p className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <a href="/signup" className="text-blue-600 hover:underline">
          Sign up
        </a>
      </p>
    </form>
  );
}
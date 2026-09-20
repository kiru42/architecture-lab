import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FormField } from '../molecules/FormField';
import { Button } from '../atoms/Button';

export function SignUpForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signup, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup(email, name, password);
      // Same reason as SignInForm: the token is stored, the router is not moved.
      navigate('/');
    } catch {
      // The error state lives in useAuth and is rendered below.
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        id="signup-name"
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        testId="signup-name"
      />
      <FormField
        id="signup-email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        testId="signup-email"
      />
      <FormField
        id="signup-password"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        testId="signup-password"
      />
      {error && (
        <p data-testid="auth-error" className="text-red-600">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full" testId="signup-submit">
        Sign Up
      </Button>
      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <a href="/signin" className="text-blue-600 hover:underline">
          Sign in
        </a>
      </p>
    </form>
  );
}
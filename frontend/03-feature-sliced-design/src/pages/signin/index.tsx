import React from 'react';
import { Link } from 'react-router-dom';
import { SignInForm } from '../../features/auth/ui/SignInForm';

const SignInPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <SignInForm />
      <p className="text-center mt-4 text-gray-600">
        Don't have an account?{' '}
        <Link to="/signup" className="text-blue-600 hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
};

export default SignInPage;

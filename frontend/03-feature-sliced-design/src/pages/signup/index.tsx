import React from 'react';
import { Link } from 'react-router-dom';
import { SignUpForm } from '../../features/auth/ui/SignUpForm';

const SignUpPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <SignUpForm />
      <p className="text-center mt-4 text-gray-600">
        Already have an account?{' '}
        <Link to="/signin" className="text-blue-600 hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
};

export default SignUpPage;

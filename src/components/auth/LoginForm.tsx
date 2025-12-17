import { HiveLogin } from './HiveLogin';

export const LoginForm = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Welcome to CreatorHub</h1>
          <p className="text-gray-600 mt-2">Login with your Hive account</p>
        </div>

        <HiveLogin />

        <p className="text-center text-sm text-gray-500">
          Don't have a Hive account?{' '}
          <a
            href="https://signup.hive.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Create one free
          </a>
        </p>
      </div>
    </div>
  );
};

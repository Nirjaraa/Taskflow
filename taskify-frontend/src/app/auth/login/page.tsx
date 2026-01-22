'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { login, setToken } from '../../lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const { register, handleSubmit } = useForm<{ email: string; password: string }>();

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      const { data: res } = await login(data);

      // Save token if backend returns JWT
      if (res.token) {
        setToken(res.token); // saves to localStorage and sets axios header
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-800 text-white">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white text-purple-800 p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

        <input
          {...register('email')}
          placeholder="Email"
          className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <input
          {...register('password')}
          type="password"
          placeholder="Password"
          className="w-full mb-6 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold transition"
        >
          Login
        </button>

        <p className="text-center mt-4 text-sm text-purple-700">
          Don't have an account?{' '}
          <a href="/auth/register" className="underline hover:text-purple-900">
            Register
          </a>
        </p>
      </form>
    </div>
  );
}

'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { register as registerUser, setToken } from '../../lib/auth';

type RegisterForm = {
  name: string;
  email: string;
  password: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const { register, handleSubmit } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    try {
      const { data: res } = await registerUser(data);

      // Optional: auto-login after registration
      if (res.token) {
        setToken(res.token); // store token in localStorage + axios header
        router.push('/dashboard');
      } else {
        // fallback: go to login page
        router.push('/auth/login');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-800 text-white">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white text-purple-800 p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>

        <input
          {...register('name')}
          placeholder="Name"
          className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
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
          Register
        </button>

        <p className="text-center mt-4 text-sm text-purple-700">
          Already have an account?{' '}
          <a href="/auth/login" className="underline hover:text-purple-900">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}

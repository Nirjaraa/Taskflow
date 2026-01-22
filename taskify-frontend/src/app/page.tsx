'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { login, register as registerUser, setToken } from './lib/auth';

export default function LandingPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false); // toggle login/register form
  const [isRegister, setIsRegister] = useState(false); // toggle between login/register
  const { register, handleSubmit, reset } = useForm();

  const onLogin = async (data: any) => {
    try {
      const { data: res } = await login(data);
      setToken(res.token);
      router.push('/dashboard');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  const onRegister = async (data: any) => {
    try {
      await registerUser(data);
      alert('Registration successful. Please login.');
      setIsRegister(false);
      reset();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-500 to-purple-800 text-white px-4">
      {/* Welcome section */}
      <h1 className="text-5xl font-bold mb-6 text-center">Welcome to TaskFlow</h1>
      <p className="text-xl mb-10 text-center max-w-xl">
        Manage your projects, track tasks, and collaborate with your team efficiently.
      </p>

      {/* Toggle button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-white text-purple-700 font-semibold rounded-lg shadow hover:bg-gray-100 transition"
        >
          Click here to login
        </button>
      )}

      {/* Login/Register form */}
      {showForm && (
        <div className="mt-6 w-full max-w-md">
          <form
            onSubmit={handleSubmit(isRegister ? onRegister : onLogin)}
            className="bg-white text-purple-800 p-8 rounded-lg shadow-md"
          >
            <h2 className="text-2xl font-bold mb-6 text-center">
              {isRegister ? 'Register' : 'Login'}
            </h2>

            {isRegister && (
              <input
                {...register('name')}
                placeholder="Name"
                className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            )}

            <input
              {...register('email')}
              placeholder="Email"
              className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <input
              {...register('password')}
              type="password"
              placeholder="Password"
              className="w-full mb-6 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />

            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold transition">
              {isRegister ? 'Register' : 'Login'}
            </button>

            <p className="text-center mt-4 text-sm text-purple-700">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  reset();
                }}
                className="underline hover:text-purple-900"
              >
                {isRegister ? 'Login here' : 'Click here to register'}
              </button>
            </p>
          </form>
        </div>
      )}
    </div>
  );
}

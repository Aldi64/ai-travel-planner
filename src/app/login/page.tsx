'use client';

import { signIn, signUp } from '@/lib/auth-client';
import { useState } from 'react';

export default function LoginPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const result =
      mode === 'signup'
        ? await signUp.email({ name, email, password, callbackURL: '/plan' })
        : await signIn.email({ email, password, callbackURL: '/plan' });

    if (result.error) {
      setError(result.error.message ?? 'Something went wrong');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl text-ink">AI Budget Travel Planner</h1>
          <p className="mt-2 text-ink/70">
            Plan a trip you can actually afford.
          </p>
        </div>

        <div className="card-doc-elevated p-6">
          <button
            type="button"
            className="btn-secondary w-full"
            onClick={() =>
              signIn.social({ provider: 'google', callbackURL: '/plan' })
            }
          >
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-ink/10" />
            <span className="text-sm text-ink/50">or</span>
            <div className="h-px flex-1 bg-ink/10" />
          </div>

          <div className="seg-group mb-4">
            <button
              type="button"
              onClick={() => setMode('signin')}
              data-active={mode === 'signin'}
              className="seg-tab"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              data-active={mode === 'signup'}
              className="seg-tab"
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {mode === 'signup' && (
              <label className="flex flex-col gap-1 text-sm text-ink/70">
                Name
                <input
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </label>
            )}
            <label className="flex flex-col gap-1 text-sm text-ink/70">
              Email
              <input
                className="input-field"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-ink/70">
              Password
              <input
                className="input-field"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </label>

            {error && <p className="text-sm text-airmail">{error}</p>}

            <button type="submit" className="btn-primary mt-2">
              {mode === 'signup' ? 'Create account' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

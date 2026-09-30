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
    <div style={{ maxWidth: 320, margin: '40px auto' }}>
      <button
        onClick={() =>
          signIn.social({ provider: 'google', callbackURL: '/plan' })
        }
      >
        Continue with Google
      </button>

      <hr style={{ margin: '16px 0' }} />

      <div style={{ marginBottom: 12 }}>
        <button
          onClick={() => setMode('signin')}
          style={{ fontWeight: mode === 'signin' ? 'bold' : 'normal' }}
        >
          Sign in
        </button>
        {' | '}
        <button
          onClick={() => setMode('signup')}
          style={{ fontWeight: mode === 'signup' ? 'bold' : 'normal' }}
        >
          Sign up
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
      >
        {mode === 'signup' && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
          />
        )}
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password (min 8 characters)"
        />
        <button type="submit">
          {mode === 'signup' ? 'Sign up' : 'Sign in'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

'use client';

import { signIn } from '@/lib/auth-client';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div>
      <button
        onClick={() =>
          signIn.social({ provider: 'google', callbackURL: '/plan' })
        }
      >
        Continue with Google
      </button>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await signIn.email({ email, password, callbackURL: '/plan' });
        }}
      >
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
        />
        <button type="submit">Sign in</button>
      </form>
    </div>
  );
}

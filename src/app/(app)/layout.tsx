'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth-client';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push('/login');
  }

  return (
    <div>
      <nav
        style={{
          display: 'flex',
          gap: 16,
          padding: 16,
          borderBottom: '1px solid #ddd',
        }}
      >
        <Link href="/plan">New trip</Link>
        <Link href="/trips">My trips</Link>
        <Link href="/explore">Explore</Link>
        <Link href="/saved">Saved</Link>
        <button onClick={handleSignOut} style={{ marginLeft: 'auto' }}>
          Sign out
        </button>
      </nav>
      {children}
    </div>
  );
}

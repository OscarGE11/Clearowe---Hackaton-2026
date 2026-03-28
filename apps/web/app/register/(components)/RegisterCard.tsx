'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { api, setToken } from '@/lib/api';

export default function RegisterCard() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { access_token } = await api.auth.register(name, email, password);
      setToken(access_token);
      router.push('/groups');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center">
      <div className="flex flex-col w-1/2 gap-2">
        <Link href="/login" className="text-white/40 hover:text-primary">
          <span>/Login page</span>
        </Link>
        <Card>
          <CardHeader>
            <h1 className="text-white text-center text-2xl">Register</h1>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                type="text"
                placeholder="Name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                type="email"
                placeholder="Email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error && <p className="text-destructive text-xs text-center">{error}</p>}
              <div className="flex justify-center">
                <Button variant="default" type="submit" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create account'}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-end">
            <span className="text-white/40">
              Already have an account?{' '}
              <Link href="/login" className="text-primary underline">
                Log in
              </Link>
            </span>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

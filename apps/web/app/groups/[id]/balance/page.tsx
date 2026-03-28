'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { api, type BalanceResponse, type Group } from '@/lib/api';

export default function BalancePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [balance, setBalance] = useState<BalanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.groups.get(id), api.balance.get(id)])
      .then(([g, b]) => {
        setGroup(g);
        setBalance(b);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <p className="text-white/40 text-sm">Loading...</p>;
  if (error) return <p className="text-destructive text-sm">{error}</p>;
  if (!group || !balance) return null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href={`/groups/${id}`} className="text-white/40 hover:text-primary text-sm">
          /{group.name}
        </Link>
        <h1 className="text-white text-3xl font-bold mt-1">Balance</h1>
      </div>

      {/* Net balances */}
      <Card>
        <CardHeader>
          <span className="text-white/60 text-xs">Net balances</span>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {balance.balances.map(({ participant, net }) => (
            <div key={participant.id} className="flex items-center justify-between py-1">
              <span className="text-white text-sm">{participant.name}</span>
              <span
                className={`font-bold text-sm ${
                  net > 0 ? 'text-[var(--success)]' : net < 0 ? 'text-destructive' : 'text-white/40'
                }`}
              >
                {net > 0 ? '+' : ''}
                {Number(net).toFixed(2)} EUR
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Settlements */}
      <Card>
        <CardHeader>
          <span className="text-white/60 text-xs">
            Settlements · {balance.transactions.length} payment
            {balance.transactions.length !== 1 ? 's' : ''} to settle everything
          </span>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {balance.transactions.length === 0 && (
            <p className="text-white/40 text-sm text-center py-4">Everyone is settled up!</p>
          )}
          {balance.transactions.map((tx, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
            >
              <span className="text-destructive font-medium text-sm">{tx.from.name}</span>
              <ArrowRight size={14} className="text-white/40 shrink-0" />
              <span className="text-[var(--success)] font-medium text-sm">{tx.to.name}</span>
              <span className="ml-auto text-white font-bold text-sm">
                {Number(tx.amount).toFixed(2)} EUR
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

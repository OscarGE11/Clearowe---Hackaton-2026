'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChartBar, PlusCircle, Trash } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { api, getToken, type Expense, type Group } from '@/lib/api';

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    Promise.all([api.groups.get(id), api.expenses.list(id)])
      .then(([g, e]) => {
        setGroup(g);
        setExpenses(e);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, router]);

  async function handleDeleteExpense(expenseId: string) {
    try {
      await api.expenses.remove(expenseId);
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete expense');
    }
  }

  const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  if (loading) return <p className="text-white/40 text-sm">Loading...</p>;
  if (error) return <p className="text-destructive text-sm">{error}</p>;
  if (!group) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <Link href="/groups" className="text-white/40 hover:text-primary text-sm">
          /Groups
        </Link>
        <div className="flex items-center justify-between mt-1">
          <h1 className="text-white text-3xl font-bold">{group.name}</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/groups/${id}/balance`)}>
              <ChartBar size={16} className="mr-2" />
              Balance
            </Button>
            <Button variant="default" onClick={() => router.push(`/groups/${id}/expenses/new`)}>
              <PlusCircle size={16} className="mr-2" />
              Add Expense
            </Button>
          </div>
        </div>
      </div>

      {/* Participants */}
      <Card>
        <CardHeader>
          <span className="text-white/60 text-xs">Participants</span>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {group.participants.map((p) => (
            <span
              key={p.id}
              className="bg-primary/20 text-primary text-xs px-3 py-1 rounded-full border border-primary/30"
            >
              {p.name}
            </span>
          ))}
        </CardContent>
      </Card>

      {/* Expenses */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-white/60 text-xs">
            Expenses · {expenses.length} total · {totalAmount.toFixed(2)} EUR
          </span>
        </div>

        {expenses.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-white/40 text-sm">No expenses yet. Add your first one!</p>
            </CardContent>
          </Card>
        )}

        {expenses.map((expense) => (
          <Card key={expense.id}>
            <CardContent className="flex items-center justify-between py-2">
              <div className="flex flex-col gap-1">
                <span className="text-white font-medium">{expense.description}</span>
                <span className="text-white/40 text-xs">
                  Paid by {expense.paidBy.name} ·{' '}
                  {expense.splits.map((s) => s.participant.name).join(', ')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-primary font-bold">
                  {Number(expense.amount).toFixed(2)} {expense.currency}
                </span>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteExpense(expense.id)}>
                  <Trash size={14} className="text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

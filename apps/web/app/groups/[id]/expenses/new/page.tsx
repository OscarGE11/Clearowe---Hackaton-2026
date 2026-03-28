'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { api, type Group } from '@/lib/api';

type Mode = 'text' | 'manual';

export default function NewExpensePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [mode, setMode] = useState<Mode>('text');

  // Text mode
  const [rawText, setRawText] = useState('');

  // Manual mode
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidById, setPaidById] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.groups.get(id).then((g) => {
      setGroup(g);
      if (g.participants.length > 0) {
        setPaidById(g.participants[0].id);
        setSelectedParticipants(g.participants.map((p) => p.id));
      }
    });
  }, [id]);

  function toggleParticipant(participantId: string) {
    setSelectedParticipants((prev) =>
      prev.includes(participantId)
        ? prev.filter((pid) => pid !== participantId)
        : [...prev, participantId],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'text') {
        if (!rawText.trim()) {
          setError('Please enter a description');
          return;
        }
        await api.expenses.create(id, { rawText: rawText.trim() });
      } else {
        if (!description.trim() || !amount || !paidById || selectedParticipants.length === 0) {
          setError('Please fill all fields and select at least one participant');
          return;
        }
        await api.expenses.create(id, {
          description: description.trim(),
          amount: parseFloat(amount),
          paidById,
          participantIds: selectedParticipants,
        });
      }
      router.push(`/groups/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create expense');
    } finally {
      setLoading(false);
    }
  }

  if (!group) return <p className="text-white/40 text-sm">Loading...</p>;

  return (
    <div className="flex justify-center">
      <div className="flex flex-col w-1/2 gap-2">
        <Link href={`/groups/${id}`} className="text-white/40 hover:text-primary">
          <span>/{group.name}</span>
        </Link>
        <Card>
          <CardHeader>
            <h1 className="text-white text-center text-2xl">Add Expense</h1>
          </CardHeader>
          <CardContent>
            {/* Mode toggle */}
            <div className="flex border border-border rounded-lg overflow-hidden mb-6">
              <button
                type="button"
                onClick={() => setMode('text')}
                className={`flex-1 py-2 text-xs transition-colors ${
                  mode === 'text'
                    ? 'bg-primary text-white'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                AI text mode
              </button>
              <button
                type="button"
                onClick={() => setMode('manual')}
                className={`flex-1 py-2 text-xs transition-colors ${
                  mode === 'manual'
                    ? 'bg-primary text-white'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                Manual
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {mode === 'text' ? (
                <div className="flex flex-col gap-2">
                  <label className="text-white/60 text-xs">Describe the expense naturally</label>
                  <Input
                    type="text"
                    placeholder='e.g. "Dinner 60€ paid by Juan with Ana and Pedro"'
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                  />
                  <p className="text-white/30 text-xs">
                    The AI parser will extract the amount, who paid, and participants automatically.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-white/60 text-xs">Description</label>
                    <Input
                      type="text"
                      placeholder="e.g. Dinner..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-white/60 text-xs">Amount (EUR)</label>
                    <Input
                      type="number"
                      placeholder="60.00"
                      min="0.01"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-white/60 text-xs">Paid by</label>
                    <select
                      value={paidById}
                      onChange={(e) => setPaidById(e.target.value)}
                      className="bg-background border border-input rounded-md px-3 py-1.5 text-white text-xs h-8"
                    >
                      {group.participants.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-white/60 text-xs">Split between</label>
                    <div className="flex flex-wrap gap-2">
                      {group.participants.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => toggleParticipant(p.id)}
                          className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                            selectedParticipants.includes(p.id)
                              ? 'bg-primary/20 text-primary border-primary/50'
                              : 'text-white/40 border-white/20 hover:border-white/40'
                          }`}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {error && <p className="text-destructive text-xs">{error}</p>}

              <div className="flex justify-center mt-2">
                <Button variant="default" type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Expense'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Trash } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

export default function NewGroupPage() {
  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [participants, setParticipants] = useState<string[]>(['', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function addParticipant() {
    setParticipants((p) => [...p, '']);
  }

  function removeParticipant(index: number) {
    setParticipants((p) => p.filter((_, i) => i !== index));
  }

  function updateParticipant(index: number, value: string) {
    setParticipants((p) => p.map((name, i) => (i === index ? value : name)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const validParticipants = participants.map((p) => p.trim()).filter(Boolean);
    if (!groupName.trim()) {
      setError('Group name is required');
      return;
    }
    if (validParticipants.length < 2) {
      setError('Add at least 2 participants');
      return;
    }
    setLoading(true);
    try {
      const group = await api.groups.create(groupName.trim(), validParticipants);
      router.push(`/groups/${group.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center">
      <div className="flex flex-col w-1/2 gap-2">
        <Link href="/groups" className="text-white/40 hover:text-primary">
          <span>/Groups</span>
        </Link>
        <Card>
          <CardHeader>
            <h1 className="text-white text-center text-2xl">New Group</h1>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-white/60 text-xs">Group name</label>
                <Input
                  type="text"
                  placeholder="e.g. Trip to Ibiza..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-white/60 text-xs">Participants</label>
                <div className="flex flex-col gap-2">
                  {participants.map((name, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        type="text"
                        placeholder={`Participant ${i + 1}...`}
                        value={name}
                        onChange={(e) => updateParticipant(i, e.target.value)}
                      />
                      {participants.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeParticipant(i)}
                        >
                          <Trash size={14} className="text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="self-start text-white/40 hover:text-primary"
                  onClick={addParticipant}
                >
                  <Plus size={14} className="mr-1" />
                  Add participant
                </Button>
              </div>

              {error && <p className="text-destructive text-xs">{error}</p>}

              <div className="flex justify-center">
                <Button variant="default" type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Group'}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter />
        </Card>
      </div>
    </div>
  );
}

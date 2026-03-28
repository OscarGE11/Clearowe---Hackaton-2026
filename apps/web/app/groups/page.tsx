'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle, Users } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { api, getToken, type Group } from '@/lib/api';

export default function GroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    api.groups
      .list()
      .then(setGroups)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/40 text-sm">/Groups</p>
          <h1 className="text-white text-3xl font-bold mt-1">My Groups</h1>
        </div>
        <Button variant="default" onClick={() => router.push('/groups/new')}>
          <PlusCircle className="mr-2" size={16} />
          New Group
        </Button>
      </div>

      {loading && <p className="text-white/40 text-sm">Loading groups...</p>}
      {error && <p className="text-destructive text-sm">{error}</p>}

      {!loading && groups.length === 0 && !error && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Users size={48} className="text-white/20" />
            <p className="text-white/40 text-sm text-center">
              No groups yet.
              <br />
              Create one to start splitting expenses.
            </p>
            <Button variant="default" onClick={() => router.push('/groups/new')}>
              Create your first group
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-3">
        {groups.map((group) => (
          <Link key={group.id} href={`/groups/${group.id}`}>
            <Card className="hover:ring-primary/50 transition-all cursor-pointer">
              <CardContent className="flex items-center justify-between py-2">
                <div className="flex flex-col gap-1">
                  <span className="text-white font-medium">{group.name}</span>
                  <span className="text-white/40 text-xs">
                    {group.participants.length} participant
                    {group.participants.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <span className="text-white/20 text-xs">
                  {new Date(group.createdAt).toLocaleDateString()}
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

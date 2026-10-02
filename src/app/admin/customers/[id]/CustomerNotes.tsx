'use client';

import { useState, useTransition } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { updateCustomerNotes } from '../actions';

export default function CustomerNotes({ customerId, initialNotes }: { customerId: string; initialNotes: string | null }) {
  const [notes, setNotes] = useState(initialNotes || '');
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateCustomerNotes(customerId, notes);
        toast.success('Notes saved.');
      } catch (error: any) {
        toast.error(error.message || 'Failed to save notes.');
      }
    });
  };

  return (
    <div className="space-y-2">
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Admin-only notes about this customer..."
        className="min-h-[100px]"
      />
      <Button size="sm" onClick={handleSave} disabled={isPending}>
        {isPending ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
        Save Notes
      </Button>
    </div>
  );
}

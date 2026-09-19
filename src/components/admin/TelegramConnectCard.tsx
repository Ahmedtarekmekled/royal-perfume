'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Loader2, Send, CheckCircle2, ExternalLink, Unplug, MessageCircle } from 'lucide-react';

type ConnectionStatus =
  | { status: 'loading' }
  | { status: 'disconnected' }
  | { status: 'expired' }
  | { status: 'pending'; expiresAt: string }
  | { status: 'connected'; telegramUsername: string | null; telegramFirstName: string | null };

const POLL_INTERVAL_MS = 3000;

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export default function TelegramConnectCard() {
  const [state, setState] = useState<ConnectionStatus>({ status: 'loading' });
  const [starting, setStarting] = useState(false);
  const [testing, setTesting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/telegram/connect');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load status');

      if (data.status === 'connected') {
        stopPolling();
        setState({ status: 'connected', telegramUsername: data.telegramUsername, telegramFirstName: data.telegramFirstName });
      } else if (data.status === 'pending') {
        if (new Date(data.expiresAt) < new Date()) {
          stopPolling();
          setState({ status: 'expired' });
        } else {
          setState({ status: 'pending', expiresAt: data.expiresAt });
        }
      } else {
        stopPolling();
        setState({ status: 'disconnected' });
      }
    } catch {
      setState({ status: 'disconnected' });
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    return stopPolling;
  }, [fetchStatus]);

  useEffect(() => {
    if (state.status === 'pending') {
      pollRef.current = setInterval(fetchStatus, POLL_INTERVAL_MS);
    } else {
      stopPolling();
    }
    return stopPolling;
  }, [state.status, fetchStatus]);

  const connect = async () => {
    setStarting(true);
    try {
      const res = await fetch('/api/telegram/connect', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start connection');
      setState({ status: 'pending', expiresAt: data.expiresAt });
      window.open(data.deepLink, '_blank', 'noopener,noreferrer');
    } catch (error) {
      toast.error(errorMessage(error, 'Failed to start connection'));
    } finally {
      setStarting(false);
    }
  };

  const cancelPending = () => {
    stopPolling();
    setState({ status: 'disconnected' });
  };

  const sendTest = async () => {
    setTesting(true);
    try {
      const res = await fetch('/api/telegram/test', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send test message');
      toast.success('Test message sent — check your Telegram.');
    } catch (error) {
      toast.error(errorMessage(error, 'Failed to send test message'));
    } finally {
      setTesting(false);
    }
  };

  const disconnect = async () => {
    setDisconnecting(true);
    try {
      const res = await fetch('/api/telegram/connect', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to disconnect');
      setConfirmOpen(false);
      setState({ status: 'disconnected' });
      toast.success('Telegram disconnected.');
    } catch (error) {
      toast.error(errorMessage(error, 'Failed to disconnect'));
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div id="telegram" className="bg-white p-6 rounded-lg border shadow-sm max-w-2xl scroll-mt-24">
      <h2 className="text-lg font-semibold mb-1">Telegram</h2>

      {state.status === 'loading' && (
        <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
          <Loader2 className="h-4 w-4 animate-spin" /> Checking connection...
        </div>
      )}

      {state.status === 'disconnected' && (
        <div className="space-y-4 pt-2">
          <p className="text-sm text-gray-600">
            Connect your Telegram account to receive RoyalPerfume order notifications.
          </p>
          <Button type="button" disabled={starting} onClick={connect}>
            {starting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageCircle className="mr-2 h-4 w-4" />}
            Connect Telegram
          </Button>
        </div>
      )}

      {state.status === 'pending' && (
        <div className="space-y-3 pt-2">
          <div className="rounded-lg border p-4 bg-amber-50 border-amber-200">
            <p className="text-sm font-medium text-amber-800 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Waiting for Telegram authorization...
            </p>
            <p className="text-sm text-amber-700 mt-1">
              Open Telegram and press <b>Start</b> on the RoyalPerfume bot. This page updates automatically.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={cancelPending}>
            Cancel
          </Button>
        </div>
      )}

      {state.status === 'expired' && (
        <div className="space-y-3 pt-2">
          <p className="text-sm text-gray-600">Telegram connection expired.</p>
          <Button type="button" disabled={starting} onClick={connect}>
            {starting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageCircle className="mr-2 h-4 w-4" />}
            Connect Again
          </Button>
        </div>
      )}

      {state.status === 'connected' && (
        <div className="space-y-4 pt-2">
          <div className="rounded-lg border p-4 flex items-center justify-between bg-emerald-50 border-emerald-200">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Connected
              </p>
              <p className="text-sm text-emerald-700">
                {state.telegramUsername ? `@${state.telegramUsername}` : state.telegramFirstName || 'Telegram account connected'}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-500">Notifications are enabled.</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" disabled={testing} onClick={sendTest}>
              {testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Send Test Message
            </Button>
            {state.telegramUsername && (
              <a href={`https://t.me/${state.telegramUsername}`} target="_blank" rel="noopener noreferrer">
                <Button type="button" variant="outline">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Telegram
                </Button>
              </a>
            )}
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmOpen(true)}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            >
              <Unplug className="mr-2 h-4 w-4" />
              Disconnect
            </Button>
          </div>
        </div>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Disconnect Telegram?</DialogTitle>
            <DialogDescription>
              You&apos;ll stop receiving RoyalPerfume order notifications on Telegram until you reconnect.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConfirmOpen(false)} disabled={disconnecting}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={disconnect} disabled={disconnecting}>
              {disconnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Disconnect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2, Send, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';

type Status = { configured: boolean; botUsername?: string } | null;

export default function TelegramSettingsCard() {
  const [status, setStatus] = useState<Status>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetch('/api/telegram/status')
      .then((res) => res.json())
      .then(setStatus)
      .catch(() => setStatus({ configured: false }))
      .finally(() => setLoadingStatus(false));
  }, []);

  const sendTest = async () => {
    setTesting(true);
    try {
      const res = await fetch('/api/telegram/test', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send test message');
      toast.success('Test message sent — check your Telegram chat.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send test message');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div id="telegram" className="bg-white p-6 rounded-lg border shadow-sm max-w-2xl scroll-mt-24">
      <h2 className="text-lg font-semibold mb-4">Telegram Order Notifications</h2>

      <div className="rounded-lg border p-4 flex items-center justify-between mb-4">
        <div className="space-y-0.5">
          <p className="text-base font-medium text-black">Connection Status</p>
          <p className="text-sm text-gray-500">
            {loadingStatus
              ? 'Checking...'
              : status?.configured
              ? `Connected to @${status.botUsername}`
              : 'Not connected'}
          </p>
        </div>
        {loadingStatus ? (
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        ) : status?.configured ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        ) : (
          <XCircle className="h-5 w-5 text-rose-500" />
        )}
      </div>

      {status?.configured ? (
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" disabled={testing} onClick={sendTest}>
            {testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Send Test Message
          </Button>
          <a href={`https://t.me/${status.botUsername}`} target="_blank" rel="noopener noreferrer">
            <Button type="button" variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Bot in Telegram
            </Button>
          </a>
        </div>
      ) : (
        !loadingStatus && (
          <div className="text-sm text-gray-600 space-y-2">
            <p>To get new orders sent to Telegram as they come in:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Message <b>@BotFather</b> on Telegram, send <code>/newbot</code>, and follow the prompts to get a <b>Bot Token</b>.</li>
              <li>Message your new bot (or <b>@userinfobot</b>) to get your <b>Chat ID</b>.</li>
              <li>Add <code>TELEGRAM_BOT_TOKEN</code> and <code>TELEGRAM_CHAT_ID</code> to the server&apos;s environment variables and restart the app.</li>
            </ol>
            <p>Once set, this page will show &quot;Connected&quot; and every new order will post here automatically, invoice attached.</p>
          </div>
        )
      )}
    </div>
  );
}

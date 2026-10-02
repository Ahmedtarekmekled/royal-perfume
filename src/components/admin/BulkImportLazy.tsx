'use client';

import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet } from 'lucide-react';

// Pulls in the `xlsx` library (~400KB), which is only needed once an admin
// actually opens the bulk-import flow — not on every /admin/products load.
// `ssr: false` requires living in a Client Component in this Next.js
// version, hence this thin wrapper instead of calling dynamic() directly
// from the (server) products page.
// The fallback mirrors BulkImport's own two-button layout so there's no
// shift once the real component swaps in.
const BulkImport = dynamic(() => import('./BulkImport'), {
  ssr: false,
  loading: () => (
    <div className="flex gap-2">
      <Button variant="outline" disabled className="gap-2">
        <Download className="h-4 w-4" />
        Template
      </Button>
      <Button disabled>
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        Import Excel
      </Button>
    </div>
  ),
});

export default BulkImport;

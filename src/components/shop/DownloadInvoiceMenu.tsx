'use client';

import { useEffect, useState } from 'react';
import { Download, FileText, ChevronDown, Loader2, SlidersHorizontal, Ban } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import InvoicePDF from './InvoicePDF';
import CustomizePDFModal from './CustomizePDFModal';
import { Order, OrderItem } from '@/types';
import { EditableInvoiceItem } from '@/types/invoice';

interface DownloadInvoiceMenuProps {
  order: Order;
  items: OrderItem[];
  /** 'default' = large full-width button (customer success page), 'compact'
   *  = small inline button (admin order row). */
  variant?: 'default' | 'compact';
  /** When false (store-wide hide_prices is on), the "Default PDF" option is
   *  hidden and Customize PDF locks "Include Prices" off. Admin call sites
   *  omit this (always true) — staff always get full control. */
  showPricedOption?: boolean;
}

async function generateAndDownload(document: React.ReactElement<any>, filename: string) {
  const { pdf } = await import('@react-pdf/renderer');
  const blob = await pdf(document).toBlob();
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement('a');
  link.href = url;
  link.download = filename;
  window.document.body.appendChild(link);
  link.click();
  window.document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function DownloadInvoiceMenu({
  order,
  items,
  variant = 'default',
  showPricedOption = true,
}: DownloadInvoiceMenuProps) {
  const [isClient, setIsClient] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);

  useEffect(() => {
    // Avoid SSR "document is not defined" issues from @react-pdf/renderer.
    const timer = setTimeout(() => setIsClient(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const filename = `invoice-${order.id.slice(0, 8)}.pdf`;

  async function handleGenerate(doc: React.ReactElement<any>) {
    setIsGenerating(true);
    try {
      await generateAndDownload(doc, filename);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleDefault() {
    handleGenerate(<InvoicePDF order={order} items={items} />);
  }

  function handleNoPrices() {
    handleGenerate(<InvoicePDF order={order} items={items} hidePrices />);
  }

  async function handleCustomConfirm(
    customItems: EditableInvoiceItem[],
    options: { includePrices: boolean }
  ) {
    setIsGenerating(true);
    try {
      await generateAndDownload(
        <InvoicePDF order={order} items={items} customItems={customItems} hidePrices={!options.includePrices} />,
        filename
      );
      setCustomizeOpen(false);
    } finally {
      setIsGenerating(false);
    }
  }

  const isCompact = variant === 'compact';

  if (!isClient) {
    return (
      <Button
        variant="outline"
        size={isCompact ? 'sm' : 'lg'}
        disabled
        className={isCompact ? 'text-xs h-8 pl-2 pr-3' : 'w-full rounded-none'}
      >
        <Loader2 className={isCompact ? 'mr-1.5 h-3 w-3 animate-spin' : 'mr-2 h-4 w-4 animate-spin'} />
        {isCompact ? 'Wait...' : 'Loading Options...'}
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size={isCompact ? 'sm' : 'lg'}
            disabled={isGenerating}
            className={isCompact ? 'text-xs h-8 pl-2 pr-3' : 'w-full rounded-none'}
          >
            {isGenerating ? (
              <Loader2 className={isCompact ? 'mr-1.5 h-3 w-3 animate-spin' : 'mr-2 h-4 w-4 animate-spin'} />
            ) : isCompact ? (
              <FileText className="mr-1.5 h-3 w-3" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {isGenerating ? 'Generating...' : isCompact ? 'PDF' : 'Download Invoice PDF'}
            <ChevronDown className={isCompact ? 'ml-1 h-3 w-3' : 'ml-2 h-4 w-4'} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {showPricedOption && (
            <DropdownMenuItem onClick={handleDefault}>
              <FileText className="mr-2 h-4 w-4" />
              Default PDF
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleNoPrices}>
            <Ban className="mr-2 h-4 w-4" />
            PDF Without Prices
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setCustomizeOpen(true)}>
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Customize PDF…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CustomizePDFModal
        open={customizeOpen}
        onOpenChange={setCustomizeOpen}
        items={items}
        showPricedOption={showPricedOption}
        isGenerating={isGenerating}
        onConfirm={handleCustomConfirm}
      />
    </>
  );
}

'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Image from "next/image";
import { useSettings } from '@/components/providers/SettingsProvider';
import ShippingMap from './ShippingMap';

interface ShippingContentProps {
  groupedZones: Record<string, any[]>;
  allZones: any[]; // Flat list of zones for the map
}

export default function ShippingContent({ groupedZones, allZones }: ShippingContentProps) {
  const { hidePrices } = useSettings();

  return (
    <div className="space-y-12">
      <ShippingMap validZones={allZones} />

      <section className="space-y-8">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-heading font-medium">Regional Shipping Rates</h2>
            <span className="text-xs uppercase tracking-widest text-gray-400">Updated Live</span>
        </div>
        
        <div className="space-y-6">
            {groupedZones && Object.keys(groupedZones).length > 0 ? (
                Object.entries(groupedZones).map(([continent, continentZones]: [string, any]) => (
                    <div key={continent} className="border rounded-sm overflow-hidden bg-white">
                        <div className="bg-gray-100/50 px-4 py-3 border-b border-gray-200">
                            <h3 className="font-heading font-semibold text-lg">{continent}</h3>
                        </div>
                        <Table>
                            <TableHeader className="bg-white">
                                <TableRow className="border-b border-gray-100 hover:bg-transparent">
                                    <TableHead className="font-heading text-gray-500 py-3 text-xs uppercase tracking-wider">Country / Region</TableHead>
                                    {!hidePrices && (
                                        <TableHead className="font-heading text-gray-500 text-right py-3 text-xs uppercase tracking-wider">Rate Per Piece</TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {continentZones.map((zone: any) => (
                                    <TableRow key={zone.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <TableCell className="py-4">
                                            <div className="flex flex-col space-y-1">
                                                <div className="flex items-center gap-3">
                                                    {zone.country_code && (
                                                        <div className="flex-shrink-0">
                                                            <Image 
                                                                src={`https://flagcdn.com/w20/${zone.country_code.toLowerCase()}.png`}
                                                                width={22}
                                                                height={16}
                                                                alt={`${zone.country} flag`}
                                                                className="rounded-[2px] object-cover shadow-sm block"
                                                                unoptimized
                                                            />
                                                        </div>
                                                    )}
                                                    <span className="font-medium text-gray-800">{zone.country}</span>
                                                </div>
                                                {zone.shipping_details && (
                                                    <Accordion type="single" collapsible className="w-full mt-1">
                                                        <AccordionItem value="details" className="border-none">
                                                        <AccordionTrigger className="py-1 text-xs text-gray-500 hover:text-black hover:no-underline font-light flex justify-start gap-1">
                                                            View Shipment Details
                                                        </AccordionTrigger>
                                                        <AccordionContent className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md mt-2 border border-gray-100 whitespace-pre-wrap break-words">
                                                            {zone.shipping_details}
                                                        </AccordionContent>
                                                        </AccordionItem>
                                                    </Accordion>
                                                )}
                                            </div>
                                        </TableCell>
                                        {!hidePrices && (
                                            <TableCell className="text-right text-black font-semibold py-4 align-top pt-5">
                                                ${zone.price.toFixed(2)}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ))
            ) : (
                <div className="border rounded-sm overflow-hidden text-center py-12 text-muted-foreground bg-gray-50">
                    Loading latest rates...
                </div>
            )}
        </div>
        <p className="text-sm text-gray-400 italic">
            * If your country is not listed, please calculate your order at checkout or contact us for a quote.
        </p>
      </section>
    </div>
  );
}

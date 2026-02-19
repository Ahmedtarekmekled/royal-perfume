import { createClient } from '@/utils/supabase/server';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';

export const revalidate = 60; // Revalidate every minute

export default async function ShippingPage() {
  const supabase = await createClient();
  const { data: zones } = await supabase
    .from('shipping_zones')
    .select('*')
    .order('country');

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-24 space-y-16">
        
        {/* Hero Header */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-heading font-medium text-black">
            Shipping & Delivery
          </h1>
          <p className="text-lg text-gray-500 font-light max-w-2xl mx-auto leading-relaxed">
            We provide secure, express shipping for all our luxury fragrances. 
            Rates are calculated based on the size of your order to ensure the best possible value.
          </p>
        </div>

        <Separator className="opacity-50" />

        {/* General Policy */}
        <section className="space-y-6">
          <h2 className="text-2xl font-heading font-medium">Shipping Policy</h2>
          <div className="prose prose-gray max-w-none text-gray-600 font-light leading-loose">
            <p>
              The shipping cost is added directly to your invoice during checkout. 
              Our default shipping method is via express carriers (such as DHL or FedEx) to ensure 
              your items arrive safely and quickly.
            </p>
            <p className="mt-4">
              <strong>Per-Piece Calculation:</strong> The shipping cost is calculated per piece. 
              For example, if the shipping rate for your region is $10 per piece, an order of 3 perfumes 
              will have a total shipping cost of $30. This ensures fair pricing for packages of all sizes.
            </p>
          </div>
        </section>

        {/* Dynamic Rate Table */}
        <section className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-heading font-medium">Regional Shipping Rates</h2>
                <span className="text-xs uppercase tracking-widest text-gray-400">Updated Live</span>
            </div>
            
            <div className="border rounded-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="font-heading text-black py-4">Country / Region</TableHead>
                            <TableHead className="font-heading text-black text-right py-4">Rate Per Piece</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {zones && zones.length > 0 ? (
                            zones.map((zone) => (
                                <TableRow key={zone.id} className="hover:bg-gray-50/50 transition-colors">
                                    <TableCell className="font-medium text-gray-700 py-4">{zone.country}</TableCell>
                                    <TableCell className="text-right text-black font-medium py-4">
                                        ${zone.price.toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                                    Loading latest rates...
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <p className="text-sm text-gray-400 italic">
                * If your country is not listed, please calculate your order at checkout or contact us for a quote.
            </p>
        </section>

        {/* Hardcoded Region Rules */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
            <div className="bg-gray-50 p-8 rounded-sm space-y-4">
                <h3 className="font-heading text-xl font-medium">Orders Under $500</h3>
                <ul className="space-y-3 text-sm text-gray-600 font-light">
                    <li className="flex justify-between border-b border-gray-200 pb-2">
                        <span>Europe / USA</span>
                        <span className="font-medium text-black">$10 per piece</span>
                    </li>
                    <li className="flex justify-between border-b border-gray-200 pb-2">
                        <span>Australia / Gulf / S. Africa</span>
                        <span className="font-medium text-black">$15 per piece</span>
                    </li>
                    <li className="pt-2 italic text-muted-foreground">
                        Other regions calculated at checkout.
                    </li>
                </ul>
            </div>

            <div className="bg-black text-white p-8 rounded-sm space-y-4 relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="font-heading text-xl font-medium text-white">Wholesale Orders ($500+)</h3>
                    <p className="text-gray-300 font-light text-sm leading-relaxed">
                        For large orders exceeding $500, we provide a <strong>custom discounted shipping quote</strong>. 
                    </p>
                    <p className="text-gray-300 font-light text-sm leading-relaxed mt-4">
                        Please proceed with your order at checkout. We will calculate the most efficient shipping method 
                        and contact you via WhatsApp with the final cost before payment.
                    </p>
                </div>
                {/* Visual decoration */}
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            </div>
        </section>

      </div>
    </div>
  );
}

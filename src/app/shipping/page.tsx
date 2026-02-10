
export default function ShippingPage() {
  return (
    <div className="container py-12 md:py-24 space-y-8 max-w-3xl mx-auto">
      <h1 className="text-4xl font-heading font-bold text-center">Shipping & Returns</h1>
      
      <div className="space-y-6">
        <section>
            <h2 className="text-2xl font-heading font-semibold mb-4">Shipping Policy</h2>
            <p className="text-gray-600 leading-relaxed">
                We offer worldwide shipping on all orders. Standard shipping typically takes 5-7 business days, 
                while express shipping ensures delivery within 2-3 business days. All orders are carefully packaged 
                to ensure your luxury fragrances arrive in perfect condition.
            </p>
        </section>

        <section>
            <h2 className="text-2xl font-heading font-semibold mb-4">Returns & Exchanges</h2>
            <p className="text-gray-600 leading-relaxed">
                We want you to be completely satisfied with your purchase. If for any reason you are not, 
                we accept returns within 30 days of delivery for unopened and unused products. Please contact 
                our customer support team to initiate a return.
            </p>
        </section>
      </div>
    </div>
  );
}

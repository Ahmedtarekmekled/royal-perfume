
export default function ContactPage() {
  return (
    <div className="container py-12 md:py-24 space-y-8 max-w-2xl mx-auto text-center">
      <h1 className="text-4xl font-heading font-bold">Contact Us</h1>
      <p className="text-lg text-muted-foreground">
        We'd love to hear from you. Please reach out to us for any inquiries.
      </p>
      <div className="p-6 bg-gray-50 rounded-lg space-y-4">
        <p><strong>Email:</strong> support@royalperfume.com</p>
        <p><strong>Phone:</strong> +1 (555) 123-4567</p>
        <p><strong>Address:</strong> 123 Luxury Lane, Beverly Hills, CA 90210</p>
      </div>
    </div>
  );
}

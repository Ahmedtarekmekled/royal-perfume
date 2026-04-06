# Royal Perfumes | Luxury Fragrance Experience

![Royal Perfume Banner](./artifacts/royal_perfume_banner.png)

Royal Perfumes is a premium e-commerce platform dedicated to offering handcrafted, high-end fragrances. Designed with a luxury-first approach, the platform provides a seamless shopping experience for scent enthusiasts, featuring an exclusive collection of designer and niche perfumes.

## ✨ Key Features

- **🛡️ Admin Dashboard**: Full control over the catalog with advanced bulk import capabilities from Excel/XLSX files.
- **📄 Dynamic PDF Catalog**: Generate professionally formatted, print-ready product catalogs on-the-fly.
- **🗺️ Intelligent Shipping**: Multi-zone shipping management with customizable rates per country and city.
- **🛍️ Refined Shopping Experience**:
  - Interactive brand ticker and category filtering.
  - Multi-language support (English & Arabic) for product details.
  - Custom variants (Size, Concentration, etc.) with individual pricing.
- **📱 WhatsApp Direct Ordering**: Seamless integration with WhatsApp and Phone for direct customer communication.
- **⚡ Performance-First Architecture**: Built on Next.js 16 with server-side rendering for optimal speed and SEO.
- **🔒 Secure Data Management**: Robust backend powered by Supabase with Row Level Security (RLS) for data integrity.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) (Radix UI)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Forms**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **PDF Generation**: [@react-pdf/renderer](https://react-pdf.org/)
- **Excel Processing**: [XLSX](https://github.com/SheetJS/sheetjs)
- **Email Service**: [Resend](https://resend.com/)

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- A Supabase project

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ahmedtarekmekled/royal-perfume.git
   cd royal-perfume
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory and add:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   RESEND_API_KEY=your_resend_key
   ```

4. **Database Setup:**
   Apply the migrations found in the `supabase/migrations` directory to your Supabase project to set up the necessary tables and RLS policies.

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```

6. **View the Application:**
   Open [http://localhost:3000](http://localhost:3000) to explore the site.

## 📂 Project Structure

```bash
src/
├── app/          # Next.js App Router (Layouts, Pages, API)
├── components/   # UI Components (Admin, Shop, Home, Shared)
├── hooks/        # Custom React Hooks
├── lib/          # Utilities and Shared Logic
├── providers/    # Context Providers (Settings, Theme)
├── services/     # API and Supabase Service Layer
├── types/        # TypeScript Definitions
└── utils/        # Helper Functions & Constants
```

## 📜 License

This project is proprietary and confidential.

---

*Handcrafted with ❤️ by the Royal Perfume Team.*

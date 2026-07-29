# medusa-plugin-variant-promotions

A Medusa v2 plugin that enables **Variant-Level Promotions** with full Medusa Core option parity, debounced server-side variant search, automated cart promotion application, and custom Medusa Admin UI extensions.

---

## ✨ Features

- **Variant-Level Targeting**: Discount specific product variants across any products — instead of entire products or categories.
- **Core Option Parity**: Full support for `Method` (Code / Automatic), `Status` (Active / Draft), `Tax Inclusive`, `Allocation` (`each`, `across`, `once`), `Max Quantity`, `Global Usage Limit`, `Target Regions`, `Customer Groups`, and `Start/End Date Schedules`.
- **Native Debounced Search**: Fast server-side full-text search across titles, SKUs, and option values via Medusa's `/admin/product-variants?q=...` API.
- **Automatic Promotion Subscriber**: Listens on `cart.created` and `cart.updated` to automatically apply matching automatic variant promotions to customer carts.
- **Admin UI Extensions**:
  - Overview list table at `/app/variant-promotions` with clickable product and variant links.
  - 4-step creation wizard at `/app/variant-promotions/create`.
  - Detail page widget inserted into core Medusa promotion pages showing targeted variants, SKUs, and product links.

---

## 📦 Installation

In your Medusa v2 backend project, install the package:

```bash
npm install github:HectaSquareUK/medusa-plugin-variant-promotions
# or
pnpm add github:HectaSquareUK/medusa-plugin-variant-promotions
```

Medusa v2 automatically discovers and loads the plugin's Admin UI extensions, API routes, workflows, and subscribers upon server startup (`npx medusa dev`).

---

## 🚀 Usage

Once installed, start your Medusa server:

```bash
npx medusa dev
```

1. Open your Medusa Admin dashboard at `http://localhost:9000/app`.
2. Navigate to **Variant Promotions** in the sidebar.
3. Click **+ Create variant promotion** to launch the wizard.
4. Pick specific product variants, configure discount options and target regions, and publish!

---

## 📄 License

[MIT](LICENSE)

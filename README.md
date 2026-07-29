# @hectasquare/medusa-plugin-variant-promotions

A Medusa v2 plugin that enables **Variant-Level Promotions** with full Medusa Core option parity, debounced server-side variant search, automated cart promotion application, and custom Medusa Admin UI extensions.

---

## ✨ Features

- **Variant-Level Targeting**: Discount specific product variants across any products — instead of entire products or categories.
- **Core Option Parity**: Full support for `Method` (Code / Automatic), `Status` (Active / Draft), `Tax Inclusive`, `Allocation` (`each`, `across`, `once`), `Max Quantity`, `Global Usage Limit`, `Target Regions`, `Customer Groups`, and `Start/End Date Schedules`.
- **Native Debounced Search**: Fast server-side full-text search across titles, SKUs, and option values via Medusa's `/admin/product-variants?q=...` API.
- **Automatic Promotion Subscriber**: Listens on `cart.created` and `cart.updated` to automatically apply matching automatic variant promotions to customer carts.
- **Admin UI Extensions (Auto-Loaded)**:
  - Overview list table at `/app/variant-promotions` with clickable product and variant links.
  - 4-step creation wizard at `/app/variant-promotions/create`.
  - Detail page widget inserted into core Medusa promotion pages showing targeted variants, SKUs, and product links.

---

## 📦 Installation

In your Medusa v2 backend project, install the package:

```bash
npm install @hectasquare/medusa-plugin-variant-promotions
# or
pnpm add @hectasquare/medusa-plugin-variant-promotions
```

---

## ⚙️ Configuration

Register the plugin in your `medusa-config.js` (or `medusa-config.ts`) under the `plugins` array:

```javascript
module.exports = defineConfig({
  projectConfig: {
    // ... your project config
  },
  plugins: [
    {
      resolve: "@hectasquare/medusa-plugin-variant-promotions",
    },
  ],
})
```

Medusa v2 automatically discovers and builds the plugin's Admin UI pages, creation wizard, widgets, API endpoints, workflows, and subscribers upon server startup (`npx medusa dev` or `npx medusa build`).

---

## 🚀 Usage

Once installed and configured, start your Medusa server:

```bash
npx medusa dev
```

1. Open your Medusa Admin dashboard at `http://localhost:9000/app`.
2. Click **Variant Promotions** in the sidebar.
3. Click **+ Create variant promotion** to launch the wizard!

---

## 📄 License

[MIT](LICENSE)

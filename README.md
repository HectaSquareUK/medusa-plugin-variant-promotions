# @hectasquare/medusa-plugin-variant-promotions

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
npm install @hectasquare/medusa-plugin-variant-promotions
# or
pnpm add @hectasquare/medusa-plugin-variant-promotions
```

---

## ⚙️ Configuration

### 1. Register Plugin in `medusa-config.js`

Add the plugin to `medusa-config.js` (or `medusa-config.ts`) under the `plugins` array:

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

---

### 🎨 2. Admin UI Routes Setup

To add the **Variant Promotions** sidebar navigation and **4-Step Creation Wizard** to your Medusa Admin dashboard, create 2 small entry files in your store's `src/admin/routes/`:

#### File 1: `src/admin/routes/variant-promotions/page.tsx`
```tsx
import { VariantPromotionsListPage } from "@hectasquare/medusa-plugin-variant-promotions/dist/components/list-page"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Tag } from "@medusajs/icons"

export const config = defineRouteConfig({
  label: "Variant Promotions",
  icon: Tag,
})

export default VariantPromotionsListPage
```

#### File 2: `src/admin/routes/variant-promotions/create/page.tsx`
```tsx
import { CreateVariantPromotionPage } from "@hectasquare/medusa-plugin-variant-promotions/dist/components/create-page"
import { defineRouteConfig } from "@medusajs/admin-sdk"

export const config = defineRouteConfig({
  label: "Create Variant Promotion",
})

export default CreateVariantPromotionPage
```

---

## 🚀 Usage

Once configured, start your Medusa server:

```bash
npx medusa dev
```

1. Open your Medusa Admin dashboard at `http://localhost:9000/app`.
2. Click **Variant Promotions** in the sidebar.
3. Click **+ Create variant promotion** to launch the wizard!

---

## 📄 License

[MIT](LICENSE)

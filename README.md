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

## 🔌 Technical Note: API Integration & Authentication

If you are integrating variant promotions with a custom storefront, mobile application, or external management dashboard, you can interact with the plugin's endpoints directly via HTTP.

### 🔑 Authentication with Medusa Admin API Key

All `/admin/variant-promotions` endpoints require Medusa Admin Authentication.

1. **How to Generate an Admin Secret API Key**:
   - Log in to your Medusa Admin Dashboard (`/app`).
   - Navigate to **Settings** $\rightarrow$ **API Keys**.
   - Under **Secret API Keys**, click **Create Secret Key** (e.g., named `Storefront Integration Key`).
   - Copy the generated secret key (starts with `sk_...`).

2. **Required Headers**:
   Pass your Secret API Key in the HTTP headers of every request using **either**:
   - `x-medusa-access-token: <YOUR_SECRET_API_KEY>`
   - `Authorization: Bearer <YOUR_ADMIN_SESSION_TOKEN>`

---

### 📡 API Endpoints

#### 1. Fetch All Variant Promotions
`GET /admin/variant-promotions`

Fetches all active variant-level promotions with resolved target variant details (variant title, SKU, parent product ID, and title).

**cURL Example**:
```bash
curl -X GET "https://your-medusa-domain.com/admin/variant-promotions" \
  -H "x-medusa-access-token: sk_1234567890abcdef" \
  -H "Content-Type: application/json"
```

**JavaScript / TypeScript Fetch Example**:
```typescript
const response = await fetch("https://your-medusa-domain.com/admin/variant-promotions", {
  headers: {
    "x-medusa-access-token": process.env.MEDUSA_ADMIN_API_KEY!,
    "Content-Type": "application/json",
  },
})
const { promotions } = await response.json()
console.log("Variant Promotions:", promotions)
```

---

#### 2. Create a Variant Promotion
`POST /admin/variant-promotions`

Programmatically creates a new variant promotion.

**Request Payload Schema**:
```json
{
  "code": "SUMMERVARIANT20",
  "type": "percentage_off_product",
  "discount_kind": "percentage",
  "value": 20,
  "currency_code": "usd",
  "allocation": "once",
  "max_quantity": 1,
  "variant_ids": ["variant_01K92XNSQZH6GWP2KRKNMP1HN6"],
  "is_automatic": false,
  "status": "active"
}
```

**cURL Example**:
```bash
curl -X POST "https://your-medusa-domain.com/admin/variant-promotions" \
  -H "x-medusa-access-token: sk_1234567890abcdef" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "AUTOVARIANT50",
    "type": "percentage_off_product",
    "discount_kind": "percentage",
    "value": 50,
    "currency_code": "usd",
    "allocation": "once",
    "max_quantity": 1,
    "variant_ids": ["variant_01K92XNSQZH6GWP2KRKNMP1HN6"],
    "is_automatic": true,
    "status": "active"
  }'
```

---

## 📬 Contact Us & Technical Support

Need help integrating this plugin into your custom storefront or enterprise architecture? Have feature requests or bug reports?

- **GitHub Repository & Issues**: [HectaSquareUK/medusa-plugin-variant-promotions](https://github.com/HectaSquareUK/medusa-plugin-variant-promotions)
- **NPM Package**: [@hectasquare/medusa-plugin-variant-promotions](https://www.npmjs.com/package/@hectasquare/medusa-plugin-variant-promotions)
- **Technical Support Email**: [support@videonprompt.com](mailto:support@videonprompt.com)

---

## 📄 License

[MIT](LICENSE)

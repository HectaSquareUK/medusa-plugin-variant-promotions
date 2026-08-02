"use strict";
const jsxRuntime = require("react/jsx-runtime");
const adminSdk = require("@medusajs/admin-sdk");
const ui = require("@medusajs/ui");
const icons = require("@medusajs/icons");
const reactQuery = require("@tanstack/react-query");
const zod = require("zod");
const react = require("react");
require("@medusajs/admin-shared");
const navigate$1 = (path) => {
  if (typeof window !== "undefined") {
    const target = path.startsWith("/app") ? path : `/app${path.startsWith("/") ? path : "/" + path}`;
    window.location.href = target;
  }
};
const PromotionListCtaWidget = () => {
  return /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "flex items-center justify-between px-6 py-4 mt-4", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-x-3", children: [
      /* @__PURE__ */ jsxRuntime.jsx(icons.Tag, { className: "text-ui-fg-muted" }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { weight: "plus", size: "small", children: "Need to discount specific variants instead of whole products?" }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle", children: "Use Variant Promotions to target hand-picked variants across any products." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx(
      ui.Button,
      {
        variant: "secondary",
        size: "small",
        onClick: () => navigate$1("/variant-promotions/create"),
        children: "Create variant promotion"
      }
    )
  ] });
};
adminSdk.defineWidgetConfig({
  zone: "promotion.list.after"
});
const RESOLVED_VARIANT_ATTRIBUTE = "items.variant.id";
const promotionTypeEnum = zod.z.enum(["amount_off_products", "percentage_off_product", "buy_x_get_y"]);
zod.z.object({
  code: zod.z.string().trim().min(3, "Code must be at least 3 characters").max(64, "Code must be at most 64 characters").regex(/^[A-Za-z0-9_-]+$/, "Code may only contain letters, numbers, - and _"),
  description: zod.z.string().max(500).optional(),
  type: promotionTypeEnum,
  currency_code: zod.z.string().length(3, "currency_code must be a 3-letter ISO code"),
  discount_kind: zod.z.enum(["percentage", "fixed"]),
  value: zod.z.number().positive("value must be greater than 0"),
  allocation: zod.z.enum(["each", "across", "once"]).optional().default("each"),
  max_quantity: zod.z.number().int().positive().optional(),
  variant_ids: zod.z.array(zod.z.string().min(1)).min(1, "At least one variant_id is required").max(500, "A single promotion supports at most 500 variants — split into multiple promotions beyond that").transform((ids) => Array.from(new Set(ids))),
  buy_variant_ids: zod.z.array(zod.z.string().min(1)).optional(),
  buy_min_quantity: zod.z.number().int().positive().optional(),
  apply_to_quantity: zod.z.number().int().positive().optional(),
  status: zod.z.enum(["active", "draft"]).optional().default("active"),
  is_tax_inclusive: zod.z.boolean().optional().default(false),
  usage_limit: zod.z.number().int().positive().optional(),
  customer_group_ids: zod.z.array(zod.z.string()).optional(),
  region_ids: zod.z.array(zod.z.string()).optional(),
  starts_at: zod.z.coerce.date().optional(),
  ends_at: zod.z.coerce.date().optional(),
  campaign_id: zod.z.string().optional(),
  is_automatic: zod.z.boolean().default(false)
}).superRefine((data, ctx) => {
  var _a;
  if (data.discount_kind === "percentage" && data.value > 100) {
    ctx.addIssue({
      code: zod.z.ZodIssueCode.custom,
      path: ["value"],
      message: "Percentage value cannot exceed 100"
    });
  }
  if (data.type === "buy_x_get_y") {
    if (!data.buy_variant_ids || data.buy_variant_ids.length === 0) {
      ctx.addIssue({
        code: zod.z.ZodIssueCode.custom,
        path: ["buy_variant_ids"],
        message: "buy_variant_ids is required when type is buy_x_get_y"
      });
    }
    if (!data.buy_min_quantity) {
      ctx.addIssue({
        code: zod.z.ZodIssueCode.custom,
        path: ["buy_min_quantity"],
        message: "buy_min_quantity is required when type is buy_x_get_y"
      });
    }
    const overlap = (_a = data.buy_variant_ids) == null ? void 0 : _a.filter(
      (id) => data.variant_ids.includes(id)
    );
    if (overlap && overlap.length > 0 && data.variant_ids.length === 1 && data.buy_variant_ids.length === 1 && data.discount_kind === "percentage" && data.value === 100) {
      ctx.addIssue({
        code: zod.z.ZodIssueCode.custom,
        path: ["variant_ids"],
        message: "buy_variant_ids and variant_ids cannot be the sole, identical single variant with 100% off — this creates an unbounded free-item loop. Add a distinct 'get' variant."
      });
    }
  }
  if (data.starts_at && data.ends_at && data.ends_at <= data.starts_at) {
    ctx.addIssue({
      code: zod.z.ZodIssueCode.custom,
      path: ["ends_at"],
      message: "ends_at must be after starts_at"
    });
  }
});
zod.z.object({
  add: zod.z.array(zod.z.string().min(1)).optional().default([]),
  remove: zod.z.array(zod.z.string().min(1)).optional().default([])
}).refine(
  (d) => d.add.length > 0 || d.remove.length > 0,
  { message: "Provide at least one variant id in `add` or `remove`" }
);
function PromotionVariantDetailWidget({
  data: promotion
}) {
  var _a, _b;
  const targetRule = (((_a = promotion == null ? void 0 : promotion.application_method) == null ? void 0 : _a.target_rules) ?? []).find(
    (r) => r.attribute === RESOLVED_VARIANT_ATTRIBUTE
  );
  const buyRule = (((_b = promotion == null ? void 0 : promotion.application_method) == null ? void 0 : _b.buy_rules) ?? []).find(
    (r) => r.attribute === RESOLVED_VARIANT_ATTRIBUTE
  );
  const activeRule = targetRule ?? buyRule;
  const ids = ((activeRule == null ? void 0 : activeRule.values) ?? []).map((v) => v.value);
  const { data: variants, isLoading } = reactQuery.useQuery({
    queryKey: ["promotion-variant-detail", ids.join(",")],
    queryFn: async () => {
      if (ids.length === 0) return [];
      const params = new URLSearchParams();
      ids.forEach((id) => params.append("id[]", id));
      params.set(
        "fields",
        "id,title,sku,product_id,product.id,product.title,product.thumbnail"
      );
      const res = await fetch(`/admin/product-variants?${params.toString()}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json.variants ?? [];
    },
    enabled: ids.length > 0
  });
  if (!activeRule || ids.length === 0) {
    return null;
  }
  const variantById = new Map((variants ?? []).map((v) => [v.id, v]));
  return /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "p-0 divide-y", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "px-6 py-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime.jsxs(ui.Heading, { level: "h2", className: "text-base font-semibold", children: [
          "Targeted Variants (",
          ids.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle", children: "This promotion is scoped to specific product variants." })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx(ui.Badge, { color: "blue", size: "small", children: targetRule ? "Targeted Items" : "Trigger Items" })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntime.jsxs(ui.Table, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.Table.Header, { children: /* @__PURE__ */ jsxRuntime.jsxs(ui.Table.Row, { children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Table.HeaderCell, { children: "Product" }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Table.HeaderCell, { children: "Variant Title" }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Table.HeaderCell, { children: "SKU" })
      ] }) }),
      /* @__PURE__ */ jsxRuntime.jsxs(ui.Table.Body, { children: [
        isLoading && /* @__PURE__ */ jsxRuntime.jsx(ui.Table.Row, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Table.Cell, { ...{ colSpan: 3 }, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle py-2 block text-center", children: "Loading variants…" }) }) }),
        !isLoading && ids.map((id) => {
          var _a2, _b2, _c;
          const v = variantById.get(id);
          const productId = ((_a2 = v == null ? void 0 : v.product) == null ? void 0 : _a2.id) ?? (v == null ? void 0 : v.product_id);
          const productTitle = ((_b2 = v == null ? void 0 : v.product) == null ? void 0 : _b2.title) ?? "Product";
          const thumbnail = (_c = v == null ? void 0 : v.product) == null ? void 0 : _c.thumbnail;
          return /* @__PURE__ */ jsxRuntime.jsxs(ui.Table.Row, { children: [
            /* @__PURE__ */ jsxRuntime.jsx(ui.Table.Cell, { children: productId ? /* @__PURE__ */ jsxRuntime.jsxs(
              "a",
              {
                href: `/app/products/${productId}`,
                className: "flex items-center gap-x-2 text-ui-fg-interactive hover:underline font-medium text-sm",
                children: [
                  thumbnail && /* @__PURE__ */ jsxRuntime.jsx(
                    "img",
                    {
                      src: thumbnail,
                      alt: "",
                      className: "w-6 h-6 rounded object-cover border"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntime.jsx("span", { children: productTitle })
                ]
              }
            ) : /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle", children: id }) }),
            /* @__PURE__ */ jsxRuntime.jsx(ui.Table.Cell, { children: productId ? /* @__PURE__ */ jsxRuntime.jsx(
              "a",
              {
                href: `/app/products/${productId}/variants/${id}`,
                className: "text-ui-fg-interactive hover:underline font-medium text-sm",
                children: (v == null ? void 0 : v.title) ?? "—"
              }
            ) : /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", children: (v == null ? void 0 : v.title) ?? "—" }) }),
            /* @__PURE__ */ jsxRuntime.jsx(ui.Table.Cell, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "font-mono text-ui-fg-subtle", children: (v == null ? void 0 : v.sku) ?? "—" }) })
          ] }, id);
        })
      ] })
    ] }) })
  ] });
}
adminSdk.defineWidgetConfig({
  zone: "promotion.details.after"
});
const nav = (path) => {
  if (typeof window !== "undefined") {
    window.location.href = path.startsWith("/app") ? path : `/app${path}`;
  }
};
function VariantPromotionsListPage() {
  const { data, isLoading, isError } = reactQuery.useQuery({
    queryKey: ["variant-promotions-list-page"],
    queryFn: async () => {
      const res = await fetch("/admin/variant-promotions", {
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fetch variant promotions");
      return res.json();
    }
  });
  const promotions = (data == null ? void 0 : data.promotions) ?? [];
  return /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "p-0 divide-y", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "px-6 py-5 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-x-3", children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-10 h-10 rounded-lg bg-ui-bg-component border flex items-center justify-center text-ui-fg-subtle", children: /* @__PURE__ */ jsxRuntime.jsx(icons.Tag, {}) }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { level: "h1", className: "text-xl font-semibold", children: "Variant Promotions" }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle", children: "Manage promotions targeting specific variants across your product catalog." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs(
        ui.Button,
        {
          variant: "primary",
          size: "small",
          onClick: () => nav("/variant-promotions/create"),
          className: "flex items-center gap-x-2",
          children: [
            /* @__PURE__ */ jsxRuntime.jsx(icons.Plus, {}),
            "Create variant promotion"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "px-6 py-6", children: [
      isError && /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-error py-4", children: "Failed to load variant promotions. Please refresh the page." }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "border rounded-xl overflow-hidden", children: /* @__PURE__ */ jsxRuntime.jsxs(ui.Table, { children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Table.Header, { children: /* @__PURE__ */ jsxRuntime.jsxs(ui.Table.Row, { children: [
          /* @__PURE__ */ jsxRuntime.jsx(ui.Table.HeaderCell, { children: "Promotion Code" }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Table.HeaderCell, { children: "Method & Value" }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Table.HeaderCell, { children: "Product" }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Table.HeaderCell, { children: "Targeted Variant(s)" }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Table.HeaderCell, { children: "Status" }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Table.HeaderCell, { className: "text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntime.jsxs(ui.Table.Body, { children: [
          isLoading && /* @__PURE__ */ jsxRuntime.jsx(ui.Table.Row, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Table.Cell, { ...{ colSpan: 6 }, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle py-8 text-center block", children: "Loading variant promotions…" }) }) }),
          !isLoading && promotions.length === 0 && /* @__PURE__ */ jsxRuntime.jsx(ui.Table.Row, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Table.Cell, { ...{ colSpan: 6 }, children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "py-12 flex flex-col items-center justify-center text-center gap-y-3", children: [
            /* @__PURE__ */ jsxRuntime.jsx(icons.Tag, { className: "w-8 h-8 text-ui-fg-muted" }),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", weight: "plus", children: "No variant promotions created yet" }),
              /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle max-w-sm", children: "Create promotions that discount hand-picked variants instead of whole products or categories." })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsx(
              ui.Button,
              {
                variant: "secondary",
                size: "small",
                onClick: () => nav("/variant-promotions/create"),
                children: "Create your first variant promotion"
              }
            )
          ] }) }) }),
          !isLoading && promotions.map((p) => {
            var _a, _b, _c;
            const methodType = (_a = p.application_method) == null ? void 0 : _a.type;
            const methodValue = (_b = p.application_method) == null ? void 0 : _b.value;
            const currency = (((_c = p.application_method) == null ? void 0 : _c.currency_code) ?? "").toUpperCase();
            const isAutomatic = p.is_automatic;
            const variants = p.variants ?? [];
            const uniqueProducts = Array.from(
              new Map(
                variants.filter((v) => v.product_id).map((v) => [v.product_id, { id: v.product_id, title: v.product_title }])
              ).values()
            );
            return /* @__PURE__ */ jsxRuntime.jsxs(ui.Table.Row, { className: "hover:bg-ui-bg-subtle-hover", children: [
              /* @__PURE__ */ jsxRuntime.jsx(ui.Table.Cell, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", weight: "plus", className: "font-mono", children: p.code }) }),
              /* @__PURE__ */ jsxRuntime.jsx(ui.Table.Cell, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-x-2 flex-wrap", children: [
                /* @__PURE__ */ jsxRuntime.jsx(ui.Badge, { size: "xsmall", color: isAutomatic ? "purple" : "blue", children: isAutomatic ? "Automatic" : "Code" }),
                /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", weight: "plus", children: methodType === "percentage" ? `${methodValue}% off` : `${methodValue} ${currency} off` })
              ] }) }),
              /* @__PURE__ */ jsxRuntime.jsx(ui.Table.Cell, { children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-col gap-y-1", children: uniqueProducts.length > 0 ? uniqueProducts.map((prod) => /* @__PURE__ */ jsxRuntime.jsx(
                "button",
                {
                  onClick: () => nav(`/products/${prod.id}`),
                  className: "text-ui-fg-interactive text-xs font-medium hover:underline text-left truncate max-w-[160px]",
                  title: prod.title ?? prod.id,
                  children: prod.title ?? prod.id
                },
                prod.id
              )) : /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle", children: "—" }) }) }),
              /* @__PURE__ */ jsxRuntime.jsx(ui.Table.Cell, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-wrap gap-1 max-w-[220px]", children: [
                variants.length > 0 ? variants.slice(0, 4).map((v) => /* @__PURE__ */ jsxRuntime.jsxs(
                  "button",
                  {
                    onClick: () => v.product_id ? nav(`/products/${v.product_id}/variants/${v.id}`) : void 0,
                    className: "inline-flex items-center gap-x-1 text-xs font-medium rounded px-1.5 py-0.5 bg-ui-bg-component border border-ui-border-base text-ui-fg-base hover:bg-ui-bg-component-hover hover:text-ui-fg-interactive cursor-pointer transition-colors",
                    title: v.sku ? `SKU: ${v.sku}` : v.id,
                    children: [
                      v.title ?? v.sku ?? v.id,
                      v.product_id && /* @__PURE__ */ jsxRuntime.jsx(icons.ArrowUpRightOnBox, { className: "w-3 h-3 text-ui-fg-muted" })
                    ]
                  },
                  v.id
                )) : /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle", children: "No variants attached" }),
                variants.length > 4 && /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-xs text-ui-fg-subtle px-1.5 py-0.5", children: [
                  "+",
                  variants.length - 4,
                  " more"
                ] })
              ] }) }),
              /* @__PURE__ */ jsxRuntime.jsx(ui.Table.Cell, { children: /* @__PURE__ */ jsxRuntime.jsx(
                ui.Badge,
                {
                  size: "xsmall",
                  color: p.status === "active" ? "green" : "orange",
                  children: p.status === "active" ? "Active" : "Draft"
                }
              ) }),
              /* @__PURE__ */ jsxRuntime.jsx(ui.Table.Cell, { className: "text-right", children: /* @__PURE__ */ jsxRuntime.jsxs(
                ui.Button,
                {
                  variant: "transparent",
                  size: "small",
                  onClick: () => nav(`/promotions/${p.id}`),
                  className: "inline-flex items-center gap-x-1 text-ui-fg-interactive hover:underline",
                  children: [
                    /* @__PURE__ */ jsxRuntime.jsx("span", { children: "View Detail" }),
                    /* @__PURE__ */ jsxRuntime.jsx(icons.ArrowUpRightOnBox, { className: "w-3.5 h-3.5" })
                  ]
                }
              ) })
            ] }, p.id);
          })
        ] })
      ] }) })
    ] })
  ] });
}
const config$1 = adminSdk.defineRouteConfig({
  label: "Variant Promotions",
  icon: icons.Tag
});
function VariantPicker({
  selected,
  onChange,
  disabledIds = [],
  currencyCode = "usd"
}) {
  const [search, setSearch] = react.useState("");
  const [debouncedSearch, setDebouncedSearch] = react.useState("");
  react.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);
  const { data, isLoading, isError } = reactQuery.useQuery({
    queryKey: ["variant-picker-search", debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) {
        params.append("q", debouncedSearch);
      }
      params.append("limit", "50");
      const res = await fetch(`/admin/product-variants?${params.toString()}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      if (!res.ok) {
        throw new Error("Failed to fetch product variants");
      }
      const json = await res.json();
      const variants = json.variants ?? [];
      return variants.map((v) => {
        var _a, _b, _c;
        return {
          id: v.id,
          title: v.title,
          sku: v.sku,
          product_id: ((_a = v.product) == null ? void 0 : _a.id) ?? v.product_id,
          product_title: ((_b = v.product) == null ? void 0 : _b.title) ?? "Product",
          thumbnail: (_c = v.product) == null ? void 0 : _c.thumbnail,
          calculated_price: v.calculated_price ?? null
        };
      });
    }
  });
  const selectedSet = react.useMemo(() => new Set(selected), [selected]);
  const toggle = (variantId) => {
    if (selectedSet.has(variantId)) {
      onChange(selected.filter((id) => id !== variantId));
    } else {
      onChange([...selected, variantId]);
    }
  };
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-4", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntime.jsx(icons.MagnifyingGlass, { className: "absolute left-3 top-1/2 -translate-y-1/2 text-ui-fg-muted" }),
      /* @__PURE__ */ jsxRuntime.jsx(
        ui.Input,
        {
          className: "pl-9",
          placeholder: "Search by product title or SKU across all products…",
          value: search,
          onChange: (e) => setSearch(e.target.value)
        }
      )
    ] }),
    selected.length > 0 && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex items-center gap-x-2", children: /* @__PURE__ */ jsxRuntime.jsxs(ui.Text, { size: "small", weight: "plus", children: [
      selected.length,
      " variant",
      selected.length !== 1 ? "s" : "",
      " selected"
    ] }) }),
    isError && /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-error", children: "Couldn't load variants. Check your network connection and try again." }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "border rounded-lg overflow-hidden max-h-96 overflow-y-auto", children: /* @__PURE__ */ jsxRuntime.jsxs(ui.Table, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.Table.Header, { children: /* @__PURE__ */ jsxRuntime.jsxs(ui.Table.Row, { children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Table.HeaderCell, { className: "w-12" }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Table.HeaderCell, { children: "Product" }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Table.HeaderCell, { children: "Variant" }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Table.HeaderCell, { children: "SKU" }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Table.HeaderCell, { className: "text-right", children: "Price" })
      ] }) }),
      /* @__PURE__ */ jsxRuntime.jsxs(ui.Table.Body, { children: [
        isLoading && /* @__PURE__ */ jsxRuntime.jsx(ui.Table.Row, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Table.Cell, { ...{ colSpan: 5 }, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle py-4", children: "Loading variants…" }) }) }),
        !isLoading && (data == null ? void 0 : data.length) === 0 && /* @__PURE__ */ jsxRuntime.jsx(ui.Table.Row, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Table.Cell, { ...{ colSpan: 5 }, children: /* @__PURE__ */ jsxRuntime.jsxs(ui.Text, { size: "small", className: "text-ui-fg-subtle py-4", children: [
          'No variants match "',
          debouncedSearch,
          '"'
        ] }) }) }),
        data == null ? void 0 : data.map((row) => {
          const isDisabledFlag = disabledIds.includes(row.id);
          return /* @__PURE__ */ jsxRuntime.jsxs(
            ui.Table.Row,
            {
              className: "cursor-pointer hover:bg-ui-bg-subtle-hover",
              onClick: () => toggle(row.id),
              children: [
                /* @__PURE__ */ jsxRuntime.jsx(ui.Table.Cell, { onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntime.jsx(
                  ui.Checkbox,
                  {
                    checked: selectedSet.has(row.id),
                    onCheckedChange: () => toggle(row.id)
                  }
                ) }),
                /* @__PURE__ */ jsxRuntime.jsx(ui.Table.Cell, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-x-2", children: [
                  row.thumbnail && /* @__PURE__ */ jsxRuntime.jsx(
                    "img",
                    {
                      src: row.thumbnail,
                      alt: "",
                      className: "w-6 h-6 rounded object-cover"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", children: row.product_title })
                ] }) }),
                /* @__PURE__ */ jsxRuntime.jsx(ui.Table.Cell, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", children: row.title }) }),
                /* @__PURE__ */ jsxRuntime.jsx(ui.Table.Cell, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle font-mono", children: row.sku ?? "—" }) }),
                /* @__PURE__ */ jsxRuntime.jsx(ui.Table.Cell, { className: "text-right", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-end gap-x-2", children: [
                  row.calculated_price && /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", children: (row.calculated_price.calculated_amount / 100).toLocaleString(void 0, {
                    style: "currency",
                    currency: row.calculated_price.currency_code
                  }) }),
                  isDisabledFlag && /* @__PURE__ */ jsxRuntime.jsx(ui.Badge, { size: "xsmall", color: "orange", children: "on another promo" })
                ] }) })
              ]
            },
            row.id
          );
        })
      ] })
    ] }) })
  ] });
}
const navigate = (path) => {
  if (typeof window !== "undefined") {
    const target = path.startsWith("/app") ? path : `/app${path.startsWith("/") ? path : "/" + path}`;
    window.location.href = target;
  }
};
function CreateVariantPromotionPage() {
  const [step, setStep] = react.useState("type");
  const [isAutomatic, setIsAutomatic] = react.useState(false);
  const [status, setStatus] = react.useState("active");
  const [code, setCode] = react.useState("");
  const [type, setType] = react.useState("percentage_off_product");
  const [variantIds, setVariantIds] = react.useState([]);
  const [buyVariantIds, setBuyVariantIds] = react.useState([]);
  const [buyMinQuantity, setBuyMinQuantity] = react.useState(1);
  const [applyToQuantity, setApplyToQuantity] = react.useState(1);
  const [discountKind, setDiscountKind] = react.useState(
    "percentage"
  );
  const [value, setValue] = react.useState(10);
  const [allocation, setAllocation] = react.useState(
    "each"
  );
  const [maxQuantity, setMaxQuantity] = react.useState(100);
  const [currencyCode, setCurrencyCode] = react.useState("cad");
  const [isTaxInclusive, setIsTaxInclusive] = react.useState(false);
  const [description, setDescription] = react.useState("");
  const [usageLimit, setUsageLimit] = react.useState("");
  const [selectedCustomerGroupIds, setSelectedCustomerGroupIds] = react.useState([]);
  const [selectedRegionIds, setSelectedRegionIds] = react.useState([]);
  const [startsAt, setStartsAt] = react.useState("");
  const [endsAt, setEndsAt] = react.useState("");
  const [submitting, setSubmitting] = react.useState(false);
  const [serverError, setServerError] = react.useState(null);
  const { data: regions } = reactQuery.useQuery({
    queryKey: ["regions-for-promotions"],
    queryFn: async () => {
      const res = await fetch("/admin/regions", {
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json.regions ?? [];
    }
  });
  const { data: customerGroups } = reactQuery.useQuery({
    queryKey: ["customer-groups-for-promotions"],
    queryFn: async () => {
      const res = await fetch("/admin/customer-groups", {
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json.customer_groups ?? [];
    }
  });
  const isBuyGet = type === "buy_x_get_y";
  const canProceedFromType = code.trim().length >= 3;
  const canProceedFromVariants = variantIds.length > 0 && (!isBuyGet || buyVariantIds.length > 0);
  const canProceedFromValue = value > 0 && (discountKind !== "percentage" || value <= 100);
  const goNext = () => {
    if (step === "type" && canProceedFromType) setStep("variants");
    else if (step === "variants" && canProceedFromVariants) setStep("value");
    else if (step === "value" && canProceedFromValue) setStep("review");
  };
  const goBack = () => {
    if (step === "review") setStep("value");
    else if (step === "value") setStep("variants");
    else if (step === "variants") setStep("type");
  };
  const toggleCustomerGroup = (groupId) => {
    if (selectedCustomerGroupIds.includes(groupId)) {
      setSelectedCustomerGroupIds(
        selectedCustomerGroupIds.filter((id) => id !== groupId)
      );
    } else {
      setSelectedCustomerGroupIds([...selectedCustomerGroupIds, groupId]);
    }
  };
  const toggleRegion = (regionId) => {
    if (selectedRegionIds.includes(regionId)) {
      setSelectedRegionIds(selectedRegionIds.filter((id) => id !== regionId));
    } else {
      setSelectedRegionIds([...selectedRegionIds, regionId]);
      const reg = regions == null ? void 0 : regions.find((r) => r.id === regionId);
      if (reg == null ? void 0 : reg.currency_code) {
        setCurrencyCode(reg.currency_code.toLowerCase());
      }
    }
  };
  const handleSubmit = async () => {
    var _a, _b;
    setSubmitting(true);
    setServerError(null);
    try {
      const payload = {
        code: code.trim().toUpperCase(),
        description: description.trim() || void 0,
        type,
        currency_code: currencyCode,
        discount_kind: discountKind,
        value,
        allocation,
        max_quantity: maxQuantity,
        status,
        is_automatic: isAutomatic,
        is_tax_inclusive: isTaxInclusive,
        variant_ids: variantIds
      };
      if (usageLimit) {
        payload.usage_limit = Number(usageLimit);
      }
      if (selectedCustomerGroupIds.length > 0) {
        payload.customer_group_ids = selectedCustomerGroupIds;
      }
      if (selectedRegionIds.length > 0) {
        payload.region_ids = selectedRegionIds;
      }
      if (startsAt) {
        payload.starts_at = new Date(startsAt).toISOString();
      }
      if (endsAt) {
        payload.ends_at = new Date(endsAt).toISOString();
      }
      if (isBuyGet) {
        payload.buy_variant_ids = buyVariantIds;
        payload.buy_min_quantity = buyMinQuantity;
        payload.apply_to_quantity = applyToQuantity;
      }
      const res = await fetch("/admin/variant-promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(
          json.message ?? "Something went wrong creating the promotion."
        );
        setSubmitting(false);
        return;
      }
      const createdCode = ((_a = json == null ? void 0 : json.promotion) == null ? void 0 : _a.code) ?? (Array.isArray(json == null ? void 0 : json.promotion) ? (_b = json.promotion[0]) == null ? void 0 : _b.code : void 0) ?? code.trim().toUpperCase();
      ui.toast.success(`Promotion "${createdCode}" created`, {
        description: `Applies to ${(json == null ? void 0 : json.variant_count) ?? variantIds.length} variant(s).`
      });
      navigate("/variant-promotions");
    } catch (err) {
      setServerError((err == null ? void 0 : err.message) ?? "Network error — please try again.");
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "p-0", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "px-6 py-4 border-b flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { level: "h1", className: "text-xl font-semibold", children: "Create Variant Promotion" }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle", children: "Target hand-picked product variants across any products in your store." })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx(StepIndicator, { current: step })
    ] }),
    step === "type" && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "px-6 py-6 flex flex-col gap-y-6 max-w-lg", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-2", children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { children: "Method" }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-x-4", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "flex items-center gap-x-2 cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              "input",
              {
                type: "radio",
                name: "isAutomatic",
                checked: !isAutomatic,
                onChange: () => setIsAutomatic(false)
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", children: "Promotion Code" })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "flex items-center gap-x-2 cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              "input",
              {
                type: "radio",
                name: "isAutomatic",
                checked: isAutomatic,
                onChange: () => setIsAutomatic(true)
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", children: "Automatic (Applied at checkout)" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-2", children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { htmlFor: "promo_code", children: "Promotion Code" }),
        /* @__PURE__ */ jsxRuntime.jsx(
          ui.Input,
          {
            id: "promo_code",
            placeholder: "e.g. CONE100",
            value: code,
            onChange: (e) => setCode(e.target.value.toUpperCase())
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between border rounded-md p-3", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { weight: "plus", size: "small", children: "Status" }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle", children: "Active promotions apply immediately. Drafts require manual activation." })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx(
          ui.Switch,
          {
            checked: status === "active",
            onCheckedChange: (c) => setStatus(c ? "active" : "draft")
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-2", children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { children: "Promotion Type" }),
        /* @__PURE__ */ jsxRuntime.jsxs(
          ui.RadioGroup,
          {
            value: type,
            onValueChange: (val) => setType(val),
            children: [
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-start gap-x-3 border rounded-md p-3 cursor-pointer", children: [
                /* @__PURE__ */ jsxRuntime.jsx(ui.RadioGroup.Item, { value: "percentage_off_product", id: "opt_perc" }),
                /* @__PURE__ */ jsxRuntime.jsxs("label", { htmlFor: "opt_perc", className: "cursor-pointer", children: [
                  /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { weight: "plus", size: "small", children: "Discount on specific variants" }),
                  /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle", children: "Apply percentage or fixed amount off selected variants." })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-start gap-x-3 border rounded-md p-3 cursor-pointer mt-2", children: [
                /* @__PURE__ */ jsxRuntime.jsx(ui.RadioGroup.Item, { value: "buy_x_get_y", id: "opt_bgy" }),
                /* @__PURE__ */ jsxRuntime.jsxs("label", { htmlFor: "opt_bgy", className: "cursor-pointer", children: [
                  /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { weight: "plus", size: "small", children: "Buy X, Get Y (Free gift / conditional)" }),
                  /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle", children: "Customer buys X variant(s) and gets discount on Y variant(s)." })
                ] })
              ] })
            ]
          }
        )
      ] })
    ] }),
    step === "variants" && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "px-6 py-6 flex flex-col gap-y-6 max-w-2xl", children: [
      isBuyGet && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-2 border-b pb-6", children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { className: "text-base font-semibold", children: "Step A: Buy Condition (Trigger Variants)" }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle", children: "Select the variants customer must have in cart to unlock the promo." }),
        /* @__PURE__ */ jsxRuntime.jsx(
          VariantPicker,
          {
            selected: buyVariantIds,
            onChange: setBuyVariantIds
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-2", children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { className: "text-base font-semibold", children: isBuyGet ? "Step B: Discounted Items (Get Variants)" : "Target Product Variants" }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle", children: "Select the specific variants that receive the discount." }),
        /* @__PURE__ */ jsxRuntime.jsx(
          VariantPicker,
          {
            selected: variantIds,
            onChange: setVariantIds
          }
        )
      ] })
    ] }),
    step === "value" && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "px-6 py-6 flex flex-col gap-y-6 max-w-lg", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-x-4", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-2 flex-1", children: [
          /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { children: "Discount Type" }),
          /* @__PURE__ */ jsxRuntime.jsxs(
            ui.Select,
            {
              value: discountKind,
              onValueChange: (v) => setDiscountKind(v),
              children: [
                /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Trigger, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Value, {}) }),
                /* @__PURE__ */ jsxRuntime.jsxs(ui.Select.Content, { children: [
                  /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Item, { value: "percentage", children: "Percentage (%)" }),
                  /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Item, { value: "fixed", children: "Fixed Amount" })
                ] })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-2 flex-1", children: [
          /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { htmlFor: "val", children: "Value" }),
          /* @__PURE__ */ jsxRuntime.jsx(
            ui.Input,
            {
              id: "val",
              type: "number",
              min: 1,
              max: discountKind === "percentage" ? 100 : void 0,
              value,
              onChange: (e) => setValue(Number(e.target.value))
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-x-4", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-2 flex-1", children: [
          /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { children: "Allocation" }),
          /* @__PURE__ */ jsxRuntime.jsxs(
            ui.Select,
            {
              value: allocation,
              onValueChange: (v) => {
                const alloc = v;
                setAllocation(alloc);
                if (alloc === "once") {
                  setMaxQuantity(1);
                }
              },
              children: [
                /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Trigger, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Value, {}) }),
                /* @__PURE__ */ jsxRuntime.jsxs(ui.Select.Content, { children: [
                  /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Item, { value: "each", children: "Each item" }),
                  /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Item, { value: "across", children: "Across items" }),
                  /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Item, { value: "once", children: "Once per cart" })
                ] })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-2 flex-1", children: [
          /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { htmlFor: "max_qty", children: "Max quantity per cart" }),
          /* @__PURE__ */ jsxRuntime.jsx(
            ui.Input,
            {
              id: "max_qty",
              type: "number",
              min: 1,
              value: maxQuantity,
              onChange: (e) => setMaxQuantity(Number(e.target.value))
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle text-xs", children: allocation === "once" ? "Defaults to 1 unit per cart (editable)." : "Maximum units per cart that can receive the discount." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-2 border-t pt-4", children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { htmlFor: "usage_limit", children: "Global Usage Limit (Storewide Order Limit)" }),
        /* @__PURE__ */ jsxRuntime.jsx(
          ui.Input,
          {
            id: "usage_limit",
            type: "number",
            min: 1,
            placeholder: "e.g. 100 (Leave empty for unlimited storewide uses)",
            value: usageLimit,
            onChange: (e) => setUsageLimit(e.target.value)
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle text-xs", children: "Total number of times this promo can be redeemed storewide across all customers (optional)." })
      ] }),
      isBuyGet && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-x-4 border-t pt-4", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-2 flex-1", children: [
          /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { htmlFor: "buy_min_qty", children: "Min. quantity to buy" }),
          /* @__PURE__ */ jsxRuntime.jsx(
            ui.Input,
            {
              id: "buy_min_qty",
              type: "number",
              min: 1,
              value: buyMinQuantity,
              onChange: (e) => setBuyMinQuantity(Number(e.target.value))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-2 flex-1", children: [
          /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { htmlFor: "apply_qty", children: "Quantity discounted" }),
          /* @__PURE__ */ jsxRuntime.jsx(
            ui.Input,
            {
              id: "apply_qty",
              type: "number",
              min: 1,
              value: applyToQuantity,
              onChange: (e) => setApplyToQuantity(Number(e.target.value))
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-2 border-t pt-4", children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { children: "Target Regions" }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle mb-2", children: "Leave unselected to apply across all regions, or select specific regions." }),
        regions && regions.length > 0 ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-col gap-y-2 max-h-36 overflow-y-auto border rounded-md p-3", children: regions.map((reg) => /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "flex items-center gap-x-2 cursor-pointer text-sm", children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            ui.Checkbox,
            {
              checked: selectedRegionIds.includes(reg.id),
              onCheckedChange: () => toggleRegion(reg.id)
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
            reg.name,
            " (",
            reg.currency_code.toUpperCase(),
            ")"
          ] })
        ] }, reg.id)) }) : /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle italic", children: "No regions configured — applies across all regions." })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-2 border-t pt-4", children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { children: "Who can use this code? (Customer Groups)" }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle mb-2", children: "Leave unselected to allow all customers, or check specific groups." }),
        customerGroups && customerGroups.length > 0 ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-col gap-y-2 max-h-36 overflow-y-auto border rounded-md p-3", children: customerGroups.map((group) => /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "flex items-center gap-x-2 cursor-pointer text-sm", children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            ui.Checkbox,
            {
              checked: selectedCustomerGroupIds.includes(group.id),
              onCheckedChange: () => toggleCustomerGroup(group.id)
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx("span", { children: group.name })
        ] }, group.id)) }) : /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle italic", children: "No customer groups configured — applies to all customers." })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-2 border-t pt-4", children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { children: "Schedule (Optional)" }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-x-4", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-2 flex-1", children: [
            /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { htmlFor: "starts_at", className: "text-xs text-ui-fg-subtle", children: "Start Date & Time" }),
            /* @__PURE__ */ jsxRuntime.jsx(
              ui.Input,
              {
                id: "starts_at",
                type: "datetime-local",
                value: startsAt,
                onChange: (e) => setStartsAt(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-2 flex-1", children: [
            /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { htmlFor: "ends_at", className: "text-xs text-ui-fg-subtle", children: "End Date & Time" }),
            /* @__PURE__ */ jsxRuntime.jsx(
              ui.Input,
              {
                id: "ends_at",
                type: "datetime-local",
                value: endsAt,
                onChange: (e) => setEndsAt(e.target.value)
              }
            )
          ] })
        ] })
      ] })
    ] }),
    step === "review" && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "px-6 py-6 flex flex-col gap-y-4 max-w-lg", children: [
      /* @__PURE__ */ jsxRuntime.jsx(ReviewRow, { label: "Method", value: isAutomatic ? "Automatic" : "Promotion Code" }),
      /* @__PURE__ */ jsxRuntime.jsx(ReviewRow, { label: "Status", value: status.charAt(0).toUpperCase() + status.slice(1) }),
      /* @__PURE__ */ jsxRuntime.jsx(ReviewRow, { label: "Code", value: code.toUpperCase() }),
      /* @__PURE__ */ jsxRuntime.jsx(
        ReviewRow,
        {
          label: "Discount",
          value: discountKind === "percentage" ? `${value}% off` : `${value} ${currencyCode.toUpperCase()} off`
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        ReviewRow,
        {
          label: "Allocation",
          value: allocation.charAt(0).toUpperCase() + allocation.slice(1)
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(ReviewRow, { label: "Max quantity", value: String(maxQuantity) }),
      /* @__PURE__ */ jsxRuntime.jsx(ReviewRow, { label: "Includes taxes", value: isTaxInclusive ? "Yes" : "No" }),
      usageLimit && /* @__PURE__ */ jsxRuntime.jsx(ReviewRow, { label: "Global usage limit", value: `${usageLimit} orders` }),
      isBuyGet && /* @__PURE__ */ jsxRuntime.jsx(
        ReviewRow,
        {
          label: "Buy condition",
          value: `Buy ${buyMinQuantity}+ of ${buyVariantIds.length} variant(s)`
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        ReviewRow,
        {
          label: isBuyGet ? "Get discount on" : "Applies to",
          value: `${variantIds.length} variant(s)`
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        ReviewRow,
        {
          label: "Target regions",
          value: selectedRegionIds.length > 0 ? `${selectedRegionIds.length} region(s)` : "All regions"
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        ReviewRow,
        {
          label: "Who can use",
          value: selectedCustomerGroupIds.length > 0 ? `${selectedCustomerGroupIds.length} customer group(s)` : "All customers"
        }
      ),
      (startsAt || endsAt) && /* @__PURE__ */ jsxRuntime.jsx(
        ReviewRow,
        {
          label: "Schedule",
          value: `${startsAt ? `Starts ${startsAt}` : "Starts immediately"}${endsAt ? ` · Ends ${endsAt}` : ""}`
        }
      ),
      serverError && /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-error", children: serverError })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "px-6 py-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        ui.Button,
        {
          variant: "secondary",
          onClick: step === "type" ? () => navigate("/variant-promotions") : goBack,
          disabled: submitting,
          children: step === "type" ? "Cancel" : "Back"
        }
      ),
      step !== "review" ? /* @__PURE__ */ jsxRuntime.jsx(
        ui.Button,
        {
          onClick: goNext,
          disabled: step === "type" && !canProceedFromType || step === "variants" && !canProceedFromVariants || step === "value" && !canProceedFromValue,
          children: "Continue"
        }
      ) : /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { onClick: handleSubmit, isLoading: submitting, children: "Create promotion" })
    ] })
  ] });
}
function StepIndicator({ current }) {
  const steps = ["type", "variants", "value", "review"];
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex items-center gap-x-2", children: steps.map((s, i) => /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      className: [
        "w-2 h-2 rounded-full",
        steps.indexOf(current) >= i ? "bg-ui-bg-interactive" : "bg-ui-bg-base border"
      ].join(" ")
    },
    s
  )) });
}
function ReviewRow({ label, value }) {
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between border-b pb-2", children: [
    /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle", children: label }),
    /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", weight: "plus", children: value })
  ] });
}
const config = adminSdk.defineRouteConfig({
  label: "Create Variant Promotion"
});
const widgetModule = { widgets: [
  {
    Component: PromotionListCtaWidget,
    zone: ["promotion.list.after"]
  },
  {
    Component: PromotionVariantDetailWidget,
    zone: ["promotion.details.after"]
  }
] };
const routeModule = {
  routes: [
    {
      Component: VariantPromotionsListPage,
      path: "/variant-promotions"
    },
    {
      Component: CreateVariantPromotionPage,
      path: "/variant-promotions/create"
    }
  ]
};
const menuItemModule = {
  menuItems: [
    {
      label: config$1.label,
      icon: config$1.icon,
      path: "/variant-promotions",
      nested: void 0,
      rank: void 0,
      translationNs: void 0
    },
    {
      label: config.label,
      icon: void 0,
      path: "/variant-promotions/create",
      nested: void 0,
      rank: void 0,
      translationNs: void 0
    }
  ]
};
const formModule = { customFields: {} };
const displayModule = {
  displays: {}
};
const i18nModule = { resources: {} };
const plugin = {
  widgetModule,
  routeModule,
  menuItemModule,
  formModule,
  displayModule,
  i18nModule
};
module.exports = plugin;

import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { defineWidgetConfig, defineRouteConfig } from "@medusajs/admin-sdk";
import { useQuery } from "@tanstack/react-query";
import { Container, Heading, Text, Badge, Table, Button, Input, Label, Select, Checkbox, toast } from "@medusajs/ui";
import { z } from "zod";
import { Tag, Plus, ArrowUpRightOnBox, XCircle } from "@medusajs/icons";
import { useState, useEffect } from "react";
import "@medusajs/admin-shared";
const RESOLVED_VARIANT_ATTRIBUTE = "items.variant.id";
z.object({
  code: z.string().min(3, "Code must be at least 3 characters").transform((val) => val.trim().toUpperCase()),
  description: z.string().optional(),
  type: z.enum(["percentage_off_product", "buy_x_get_y"]).default("percentage_off_product"),
  currency_code: z.string().min(3).default("usd"),
  discount_kind: z.enum(["percentage", "fixed"]).default("percentage"),
  value: z.number().positive("Discount value must be greater than 0"),
  allocation: z.enum(["each", "across", "once"]).default("each"),
  max_quantity: z.number().int().positive().optional(),
  status: z.enum(["active", "draft"]).default("active"),
  is_automatic: z.boolean().default(false),
  is_tax_inclusive: z.boolean().default(false),
  usage_limit: z.number().int().positive().optional(),
  customer_group_ids: z.array(z.string()).optional(),
  region_ids: z.array(z.string()).optional(),
  starts_at: z.string().datetime({ offset: true }).optional(),
  ends_at: z.string().datetime({ offset: true }).optional(),
  variant_ids: z.array(z.string()).min(1, "Select at least one variant for this promotion"),
  buy_variant_ids: z.array(z.string()).optional(),
  buy_min_quantity: z.number().int().positive().optional(),
  campaign_id: z.string().optional()
}).refine(
  (data) => {
    if (data.discount_kind === "percentage" && data.value > 100) {
      return false;
    }
    return true;
  },
  {
    message: "Percentage discount cannot exceed 100%",
    path: ["value"]
  }
).refine(
  (data) => {
    if (data.type === "buy_x_get_y") {
      return !!data.buy_variant_ids && data.buy_variant_ids.length > 0 && typeof data.buy_min_quantity === "number" && data.buy_min_quantity > 0;
    }
    return true;
  },
  {
    message: "Buy X Get Y promotions require at least one 'buy' variant and a minimum buy quantity",
    path: ["buy_variant_ids"]
  }
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
  const { data: variants, isLoading } = useQuery({
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
  return /* @__PURE__ */ jsxs(Container, { className: "p-0 divide-y", children: [
    /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(Heading, { level: "h2", className: "text-base font-semibold", children: [
          "Targeted Variants (",
          ids.length,
          ")"
        ] }),
        /* @__PURE__ */ jsx(Text, { size: "small", className: "text-ui-fg-subtle", children: "This promotion is scoped to specific product variants." })
      ] }),
      /* @__PURE__ */ jsx(Badge, { color: "blue", size: "small", children: targetRule ? "Targeted Items" : "Trigger Items" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "px-6 py-4", children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(Table.Header, { children: /* @__PURE__ */ jsxs(Table.Row, { children: [
        /* @__PURE__ */ jsx(Table.HeaderCell, { children: "Product" }),
        /* @__PURE__ */ jsx(Table.HeaderCell, { children: "Variant Title" }),
        /* @__PURE__ */ jsx(Table.HeaderCell, { children: "SKU" })
      ] }) }),
      /* @__PURE__ */ jsxs(Table.Body, { children: [
        isLoading && /* @__PURE__ */ jsx(Table.Row, { children: /* @__PURE__ */ jsx(Table.Cell, { ...{ colSpan: 3 }, children: /* @__PURE__ */ jsx(Text, { size: "small", className: "text-ui-fg-subtle py-2 block text-center", children: "Loading variants…" }) }) }),
        !isLoading && ids.map((id) => {
          var _a2, _b2, _c;
          const v = variantById.get(id);
          const productId = ((_a2 = v == null ? void 0 : v.product) == null ? void 0 : _a2.id) ?? (v == null ? void 0 : v.product_id);
          const productTitle = ((_b2 = v == null ? void 0 : v.product) == null ? void 0 : _b2.title) ?? "Product";
          const thumbnail = (_c = v == null ? void 0 : v.product) == null ? void 0 : _c.thumbnail;
          return /* @__PURE__ */ jsxs(Table.Row, { children: [
            /* @__PURE__ */ jsx(Table.Cell, { children: productId ? /* @__PURE__ */ jsxs(
              "a",
              {
                href: `/app/products/${productId}`,
                className: "flex items-center gap-x-2 text-ui-fg-interactive hover:underline font-medium text-sm",
                children: [
                  thumbnail && /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: thumbnail,
                      alt: "",
                      className: "w-6 h-6 rounded object-cover border"
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { children: productTitle })
                ]
              }
            ) : /* @__PURE__ */ jsx(Text, { size: "small", className: "text-ui-fg-subtle", children: id }) }),
            /* @__PURE__ */ jsx(Table.Cell, { children: productId ? /* @__PURE__ */ jsx(
              "a",
              {
                href: `/app/products/${productId}/variants/${id}`,
                className: "text-ui-fg-interactive hover:underline font-medium text-sm",
                children: (v == null ? void 0 : v.title) ?? "—"
              }
            ) : /* @__PURE__ */ jsx(Text, { size: "small", children: (v == null ? void 0 : v.title) ?? "—" }) }),
            /* @__PURE__ */ jsx(Table.Cell, { children: /* @__PURE__ */ jsx(Text, { size: "small", className: "font-mono text-ui-fg-subtle", children: (v == null ? void 0 : v.sku) ?? "—" }) })
          ] }, id);
        })
      ] })
    ] }) })
  ] });
}
defineWidgetConfig({
  zone: "promotion.details.after"
});
const nav$1 = (path) => {
  if (typeof window !== "undefined") {
    window.location.href = path.startsWith("/app") ? path : `/app${path}`;
  }
};
function VariantPromotionsListPage() {
  const { data, isLoading, isError } = useQuery({
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
  return /* @__PURE__ */ jsxs(Container, { className: "p-0 divide-y", children: [
    /* @__PURE__ */ jsxs("div", { className: "px-6 py-5 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-x-3", children: [
        /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-ui-bg-component border flex items-center justify-center text-ui-fg-subtle", children: /* @__PURE__ */ jsx(Tag, {}) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Heading, { level: "h1", className: "text-xl font-semibold", children: "Variant Promotions" }),
          /* @__PURE__ */ jsx(Text, { size: "small", className: "text-ui-fg-subtle", children: "Manage promotions targeting specific variants across your product catalog." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(
        Button,
        {
          variant: "primary",
          size: "small",
          onClick: () => nav$1("/variant-promotions/create"),
          className: "flex items-center gap-x-2",
          children: [
            /* @__PURE__ */ jsx(Plus, {}),
            "Create variant promotion"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "px-6 py-6", children: [
      isError && /* @__PURE__ */ jsx(Text, { size: "small", className: "text-ui-fg-error py-4", children: "Failed to load variant promotions. Please refresh the page." }),
      /* @__PURE__ */ jsx("div", { className: "border rounded-xl overflow-hidden", children: /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(Table.Header, { children: /* @__PURE__ */ jsxs(Table.Row, { children: [
          /* @__PURE__ */ jsx(Table.HeaderCell, { children: "Promotion Code" }),
          /* @__PURE__ */ jsx(Table.HeaderCell, { children: "Method & Value" }),
          /* @__PURE__ */ jsx(Table.HeaderCell, { children: "Product" }),
          /* @__PURE__ */ jsx(Table.HeaderCell, { children: "Targeted Variant(s)" }),
          /* @__PURE__ */ jsx(Table.HeaderCell, { children: "Status" }),
          /* @__PURE__ */ jsx(Table.HeaderCell, { className: "text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxs(Table.Body, { children: [
          isLoading && /* @__PURE__ */ jsx(Table.Row, { children: /* @__PURE__ */ jsx(Table.Cell, { ...{ colSpan: 6 }, children: /* @__PURE__ */ jsx(Text, { size: "small", className: "text-ui-fg-subtle py-8 text-center block", children: "Loading variant promotions…" }) }) }),
          !isLoading && promotions.length === 0 && /* @__PURE__ */ jsx(Table.Row, { children: /* @__PURE__ */ jsx(Table.Cell, { ...{ colSpan: 6 }, children: /* @__PURE__ */ jsxs("div", { className: "py-12 flex flex-col items-center justify-center text-center gap-y-3", children: [
            /* @__PURE__ */ jsx(Tag, { className: "w-8 h-8 text-ui-fg-muted" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Text, { size: "small", weight: "plus", children: "No variant promotions created yet" }),
              /* @__PURE__ */ jsx(Text, { size: "small", className: "text-ui-fg-subtle max-w-sm", children: "Create promotions that discount hand-picked variants instead of whole products or categories." })
            ] }),
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "secondary",
                size: "small",
                onClick: () => nav$1("/variant-promotions/create"),
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
            return /* @__PURE__ */ jsxs(Table.Row, { className: "hover:bg-ui-bg-subtle-hover", children: [
              /* @__PURE__ */ jsx(Table.Cell, { children: /* @__PURE__ */ jsx(Text, { size: "small", weight: "plus", className: "font-mono", children: p.code }) }),
              /* @__PURE__ */ jsx(Table.Cell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-x-2 flex-wrap", children: [
                /* @__PURE__ */ jsx(Badge, { size: "xsmall", color: isAutomatic ? "purple" : "blue", children: isAutomatic ? "Automatic" : "Code" }),
                /* @__PURE__ */ jsx(Text, { size: "small", weight: "plus", children: methodType === "percentage" ? `${methodValue}% off` : `${methodValue} ${currency} off` })
              ] }) }),
              /* @__PURE__ */ jsx(Table.Cell, { children: /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-y-1", children: uniqueProducts.length > 0 ? uniqueProducts.map((prod) => /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => nav$1(`/products/${prod.id}`),
                  className: "text-ui-fg-interactive text-xs font-medium hover:underline text-left truncate max-w-[160px]",
                  title: prod.title ?? prod.id,
                  children: prod.title ?? prod.id
                },
                prod.id
              )) : /* @__PURE__ */ jsx(Text, { size: "small", className: "text-ui-fg-subtle", children: "—" }) }) }),
              /* @__PURE__ */ jsx(Table.Cell, { children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-1 max-w-[220px]", children: [
                variants.length > 0 ? variants.slice(0, 4).map((v) => /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => v.product_id ? nav$1(`/products/${v.product_id}/variants/${v.id}`) : void 0,
                    className: "inline-flex items-center gap-x-1 text-xs font-medium rounded px-1.5 py-0.5 bg-ui-bg-component border border-ui-border-base text-ui-fg-base hover:bg-ui-bg-component-hover hover:text-ui-fg-interactive cursor-pointer transition-colors",
                    title: v.sku ? `SKU: ${v.sku}` : v.id,
                    children: [
                      v.title ?? v.sku ?? v.id,
                      v.product_id && /* @__PURE__ */ jsx(ArrowUpRightOnBox, { className: "w-3 h-3 text-ui-fg-muted" })
                    ]
                  },
                  v.id
                )) : /* @__PURE__ */ jsx(Text, { size: "small", className: "text-ui-fg-subtle", children: "No variants attached" }),
                variants.length > 4 && /* @__PURE__ */ jsxs("span", { className: "text-xs text-ui-fg-subtle px-1.5 py-0.5", children: [
                  "+",
                  variants.length - 4,
                  " more"
                ] })
              ] }) }),
              /* @__PURE__ */ jsx(Table.Cell, { children: /* @__PURE__ */ jsx(
                Badge,
                {
                  size: "xsmall",
                  color: p.status === "active" ? "green" : "orange",
                  children: p.status === "active" ? "Active" : "Draft"
                }
              ) }),
              /* @__PURE__ */ jsx(Table.Cell, { className: "text-right", children: /* @__PURE__ */ jsxs(
                Button,
                {
                  variant: "transparent",
                  size: "small",
                  onClick: () => nav$1(`/promotions/${p.id}`),
                  className: "inline-flex items-center gap-x-1 text-ui-fg-interactive hover:underline",
                  children: [
                    /* @__PURE__ */ jsx("span", { children: "View Detail" }),
                    /* @__PURE__ */ jsx(ArrowUpRightOnBox, { className: "w-3.5 h-3.5" })
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
const config$1 = defineRouteConfig({
  label: "Variant Promotions",
  icon: Tag
});
function VariantPicker({
  selected,
  onChange,
  label = "Select variants to discount"
}) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState({});
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);
  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedQuery.trim()) {
      params.set("q", debouncedQuery.trim());
    }
    params.set("limit", "50");
    fetch(`/admin/product-variants?${params.toString()}`, {
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    }).then((res) => {
      if (!res.ok) return { variants: [] };
      return res.json();
    }).then((data) => {
      if (!active) return;
      const list = data.variants ?? [];
      setResults(list);
      setLoading(false);
      setSelectedDetails((prev) => {
        const next = { ...prev };
        for (const v of list) {
          if (selected.includes(v.id)) {
            next[v.id] = v;
          }
        }
        return next;
      });
    }).catch(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [debouncedQuery]);
  const toggleSelect = (variant) => {
    if (selected.includes(variant.id)) {
      onChange(selected.filter((id) => id !== variant.id));
    } else {
      onChange([...selected, variant.id]);
      setSelectedDetails((prev) => ({ ...prev, [variant.id]: variant }));
    }
  };
  const removeId = (id) => {
    onChange(selected.filter((i) => i !== id));
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-y-3", children: [
    label && /* @__PURE__ */ jsx(Text, { className: "font-medium text-sm", children: label }),
    /* @__PURE__ */ jsx(
      Input,
      {
        placeholder: "Search variants by title, SKU, or option...",
        value: query,
        onChange: (e) => setQuery(e.target.value)
      }
    ),
    selected.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2 p-3 bg-ui-bg-subtle rounded-md border", children: selected.map((id) => {
      const v = selectedDetails[id];
      const title = (v == null ? void 0 : v.title) ? `${v.title}` : id;
      const sku = (v == null ? void 0 : v.sku) ? ` (${v.sku})` : "";
      return /* @__PURE__ */ jsxs(
        Badge,
        {
          color: "blue",
          className: "flex items-center gap-x-1 font-mono text-xs",
          children: [
            /* @__PURE__ */ jsxs("span", { children: [
              title,
              sku
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => removeId(id),
                className: "hover:text-ui-fg-error",
                children: /* @__PURE__ */ jsx(XCircle, { className: "w-3.5 h-3.5" })
              }
            )
          ]
        },
        id
      );
    }) }),
    /* @__PURE__ */ jsxs("div", { className: "border rounded-md max-h-60 overflow-y-auto divide-y", children: [
      loading && /* @__PURE__ */ jsx("div", { className: "p-3 text-xs text-ui-fg-subtle text-center", children: "Searching variants..." }),
      !loading && results.length === 0 && /* @__PURE__ */ jsxs("div", { className: "p-3 text-xs text-ui-fg-subtle text-center", children: [
        'No variants found matching "',
        query,
        '"'
      ] }),
      !loading && results.map((v) => {
        const isSelected = selected.includes(v.id);
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex items-center justify-between p-2.5 hover:bg-ui-bg-subtle text-xs",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: v.title }),
                v.sku && /* @__PURE__ */ jsxs("span", { className: "text-ui-fg-subtle font-mono text-[10px]", children: [
                  "SKU: ",
                  v.sku
                ] })
              ] }),
              /* @__PURE__ */ jsx(
                Button,
                {
                  size: "small",
                  variant: isSelected ? "secondary" : "transparent",
                  onClick: () => toggleSelect(v),
                  className: "flex items-center gap-x-1",
                  children: isSelected ? "Selected" : /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(Plus, { className: "w-3 h-3" }),
                    " Select"
                  ] })
                }
              )
            ]
          },
          v.id
        );
      })
    ] })
  ] });
}
const nav = (path) => {
  if (typeof window !== "undefined") {
    window.location.href = path.startsWith("/app") ? path : `/app${path}`;
  }
};
function CreateVariantPromotionPage() {
  const [step, setStep] = useState("type");
  const [promoType, setPromoType] = useState(
    "percentage_off_product"
  );
  const isBuyGet = promoType === "buy_x_get_y";
  const [method, setMethod] = useState("code");
  const isAutomatic = method === "automatic";
  const [status, setStatus] = useState("active");
  const [code, setCode] = useState("");
  const [discountKind, setDiscountKind] = useState("percentage");
  const [value, setValue] = useState(10);
  const [currencyCode, setCurrencyCode] = useState("usd");
  const [allocation, setAllocation] = useState("each");
  const [maxQuantity, setMaxQuantity] = useState(100);
  const [isTaxInclusive, setIsTaxInclusive] = useState(false);
  const [usageLimit, setUsageLimit] = useState(void 0);
  const [variantIds, setVariantIds] = useState([]);
  const [buyVariantIds, setBuyVariantIds] = useState([]);
  const [buyMinQuantity, setBuyMinQuantity] = useState(1);
  const [applyToQuantity, setApplyToQuantity] = useState(1);
  const [selectedCustomerGroupIds, setSelectedCustomerGroupIds] = useState([]);
  const [selectedRegionIds, setSelectedRegionIds] = useState([]);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const { data: customerGroups } = useQuery({
    queryKey: ["customer-groups-variant-promotions"],
    queryFn: async () => {
      const res = await fetch("/admin/customer-groups?limit=50", {
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json.customer_groups ?? [];
    }
  });
  const { data: regions } = useQuery({
    queryKey: ["regions-variant-promotions"],
    queryFn: async () => {
      const res = await fetch("/admin/regions?limit=50", {
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json.regions ?? [];
    }
  });
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const toggleCustomerGroup = (id) => {
    setSelectedCustomerGroupIds(
      (prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };
  const toggleRegion = (id) => {
    setSelectedRegionIds((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      if (next.length > 0 && regions) {
        const firstSelectedRegion = regions.find((r) => r.id === next[0]);
        if (firstSelectedRegion) {
          setCurrencyCode(firstSelectedRegion.currency_code.toLowerCase());
        }
      }
      return next;
    });
  };
  const canProceedFromVariants = variantIds.length > 0 && (!isBuyGet || buyVariantIds.length > 0);
  const canProceedFromValue = code.trim().length >= 3 && value > 0 && (!isBuyGet || buyMinQuantity > 0);
  const goNext = () => {
    setServerError(null);
    if (step === "type") setStep("variants");
    else if (step === "variants") setStep("value");
    else if (step === "value") setStep("review");
  };
  const goBack = () => {
    setServerError(null);
    if (step === "review") setStep("value");
    else if (step === "value") setStep("variants");
    else if (step === "variants") setStep("type");
  };
  const handleSubmit = async () => {
    setSubmitting(true);
    setServerError(null);
    const payload = {
      code: code.trim(),
      type: promoType,
      method,
      is_automatic: isAutomatic,
      status,
      discount_kind: discountKind,
      value: Number(value),
      currency_code: currencyCode.toLowerCase(),
      allocation,
      max_quantity: maxQuantity ? Number(maxQuantity) : void 0,
      is_tax_inclusive: isTaxInclusive,
      usage_limit: usageLimit ? Number(usageLimit) : void 0,
      variant_ids: variantIds,
      customer_group_ids: selectedCustomerGroupIds.length > 0 ? selectedCustomerGroupIds : void 0,
      region_ids: selectedRegionIds.length > 0 ? selectedRegionIds : void 0,
      starts_at: startsAt ? new Date(startsAt).toISOString() : void 0,
      ends_at: endsAt ? new Date(endsAt).toISOString() : void 0
    };
    if (isBuyGet) {
      payload.buy_variant_ids = buyVariantIds;
      payload.buy_min_quantity = Number(buyMinQuantity);
    }
    try {
      const res = await fetch("/admin/variant-promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message ?? "Failed to create promotion");
      }
      toast.success("Variant Promotion Created", {
        description: `Code ${code.toUpperCase()} successfully created!`
      });
      nav("/variant-promotions");
    } catch (err) {
      setServerError(err.message ?? "Error creating promotion");
      toast.error("Error", { description: err.message });
    } finally {
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxs(Container, { className: "p-0 divide-y", children: [
    /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Heading, { level: "h1", className: "text-xl font-semibold", children: "Create Variant Promotion" }),
        /* @__PURE__ */ jsxs(Text, { size: "small", className: "text-ui-fg-subtle", children: [
          "Step ",
          step === "type" ? "1" : step === "variants" ? "2" : step === "value" ? "3" : "4",
          " of 4"
        ] })
      ] }),
      /* @__PURE__ */ jsx(StepIndicator, { current: step })
    ] }),
    step === "type" && /* @__PURE__ */ jsxs("div", { className: "px-6 py-6 flex flex-col gap-y-4 max-w-lg", children: [
      /* @__PURE__ */ jsx(Text, { className: "font-medium text-sm", children: "Select Promotion Type" }),
      /* @__PURE__ */ jsxs(
        "div",
        {
          onClick: () => setPromoType("percentage_off_product"),
          className: [
            "p-4 border rounded-lg cursor-pointer flex flex-col gap-y-1 transition-colors",
            promoType === "percentage_off_product" ? "border-ui-border-interactive bg-ui-bg-subtle" : "hover:bg-ui-bg-subtle-hover"
          ].join(" "),
          children: [
            /* @__PURE__ */ jsx(Text, { weight: "plus", size: "small", children: "Discount Specific Variants" }),
            /* @__PURE__ */ jsx(Text, { size: "small", className: "text-ui-fg-subtle", children: "Apply a percentage or fixed amount discount to hand-picked product variants." })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "div",
        {
          onClick: () => setPromoType("buy_x_get_y"),
          className: [
            "p-4 border rounded-lg cursor-pointer flex flex-col gap-y-1 transition-colors",
            promoType === "buy_x_get_y" ? "border-ui-border-interactive bg-ui-bg-subtle" : "hover:bg-ui-bg-subtle-hover"
          ].join(" "),
          children: [
            /* @__PURE__ */ jsx(Text, { weight: "plus", size: "small", children: "Buy X Get Y (Variant Level)" }),
            /* @__PURE__ */ jsx(Text, { size: "small", className: "text-ui-fg-subtle", children: "Customer buys specific trigger variants to get selected target variants at a discount." })
          ]
        }
      )
    ] }),
    step === "variants" && /* @__PURE__ */ jsxs("div", { className: "px-6 py-6 flex flex-col gap-y-6 max-w-xl", children: [
      isBuyGet && /* @__PURE__ */ jsx(
        VariantPicker,
        {
          label: "1. Select 'Buy' Trigger Variants (What customer buys)",
          selected: buyVariantIds,
          onChange: setBuyVariantIds
        }
      ),
      /* @__PURE__ */ jsx(
        VariantPicker,
        {
          label: isBuyGet ? "2. Select 'Get' Target Variants (What customer receives at discount)" : "Select Target Variants to Discount",
          selected: variantIds,
          onChange: setVariantIds
        }
      )
    ] }),
    step === "value" && /* @__PURE__ */ jsxs("div", { className: "px-6 py-6 flex flex-col gap-y-6 max-w-xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex gap-x-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-y-2 flex-1", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "method", children: "Method" }),
          /* @__PURE__ */ jsxs(Select, { value: method, onValueChange: (v) => setMethod(v), children: [
            /* @__PURE__ */ jsx(Select.Trigger, { id: "method", children: /* @__PURE__ */ jsx(Select.Value, {}) }),
            /* @__PURE__ */ jsxs(Select.Content, { children: [
              /* @__PURE__ */ jsx(Select.Item, { value: "code", children: "Promotion Code" }),
              /* @__PURE__ */ jsx(Select.Item, { value: "automatic", children: "Automatic" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-y-2 flex-1", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "status", children: "Status" }),
          /* @__PURE__ */ jsxs(Select, { value: status, onValueChange: (v) => setStatus(v), children: [
            /* @__PURE__ */ jsx(Select.Trigger, { id: "status", children: /* @__PURE__ */ jsx(Select.Value, {}) }),
            /* @__PURE__ */ jsxs(Select.Content, { children: [
              /* @__PURE__ */ jsx(Select.Item, { value: "active", children: "Active" }),
              /* @__PURE__ */ jsx(Select.Item, { value: "draft", children: "Draft" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "code", children: "Promotion Code *" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "code",
            placeholder: "e.g. VARIANT20",
            value: code,
            onChange: (e) => setCode(e.target.value.toUpperCase())
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-x-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-y-2 flex-1", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "kind", children: "Discount Type" }),
          /* @__PURE__ */ jsxs(Select, { value: discountKind, onValueChange: (v) => setDiscountKind(v), children: [
            /* @__PURE__ */ jsx(Select.Trigger, { id: "kind", children: /* @__PURE__ */ jsx(Select.Value, {}) }),
            /* @__PURE__ */ jsxs(Select.Content, { children: [
              /* @__PURE__ */ jsx(Select.Item, { value: "percentage", children: "Percentage (%)" }),
              /* @__PURE__ */ jsx(Select.Item, { value: "fixed", children: "Fixed Amount" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-y-2 flex-1", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "value", children: discountKind === "percentage" ? "Percentage Off (%)" : `Amount Off (${currencyCode.toUpperCase()})` }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "value",
              type: "number",
              min: 1,
              max: discountKind === "percentage" ? 100 : void 0,
              value,
              onChange: (e) => setValue(Number(e.target.value))
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-x-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-y-2 flex-1", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "allocation", children: "Allocation" }),
          /* @__PURE__ */ jsxs(Select, { value: allocation, onValueChange: (v) => setAllocation(v), children: [
            /* @__PURE__ */ jsx(Select.Trigger, { id: "allocation", children: /* @__PURE__ */ jsx(Select.Value, {}) }),
            /* @__PURE__ */ jsxs(Select.Content, { children: [
              /* @__PURE__ */ jsx(Select.Item, { value: "each", children: "Apply to each item" }),
              /* @__PURE__ */ jsx(Select.Item, { value: "across", children: "Split across items" }),
              /* @__PURE__ */ jsx(Select.Item, { value: "once", children: "Apply once per cart" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-y-2 flex-1", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "max_quantity", children: "Max Quantity per Cart" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "max_quantity",
              type: "number",
              min: 1,
              value: maxQuantity,
              onChange: (e) => setMaxQuantity(Number(e.target.value))
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-y-2 border-t pt-4", children: /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-x-2 cursor-pointer text-sm font-medium", children: [
        /* @__PURE__ */ jsx(
          Checkbox,
          {
            checked: isTaxInclusive,
            onCheckedChange: (checked) => setIsTaxInclusive(Boolean(checked))
          }
        ),
        /* @__PURE__ */ jsx("span", { children: "Tax Inclusive (Price includes tax)" })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-y-2 border-t pt-4", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "usage_limit", children: "Global Usage Limit (Optional)" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "usage_limit",
            type: "number",
            min: 1,
            placeholder: "e.g. 50 (Leave blank for unlimited)",
            value: usageLimit ?? "",
            onChange: (e) => setUsageLimit(e.target.value ? Number(e.target.value) : void 0)
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-y-2 border-t pt-4", children: [
        /* @__PURE__ */ jsx(Label, { children: "Target Regions" }),
        /* @__PURE__ */ jsx(Text, { size: "small", className: "text-ui-fg-subtle mb-2", children: "Leave unselected to apply across all regions, or select specific regions." }),
        regions && regions.length > 0 ? /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-y-2 max-h-36 overflow-y-auto border rounded-md p-3", children: regions.map((reg) => /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-x-2 cursor-pointer text-sm", children: [
          /* @__PURE__ */ jsx(
            Checkbox,
            {
              checked: selectedRegionIds.includes(reg.id),
              onCheckedChange: () => toggleRegion(reg.id)
            }
          ),
          /* @__PURE__ */ jsxs("span", { children: [
            reg.name,
            " (",
            reg.currency_code.toUpperCase(),
            ")"
          ] })
        ] }, reg.id)) }) : /* @__PURE__ */ jsx(Text, { size: "small", className: "text-ui-fg-subtle italic", children: "No regions configured — applies across all regions." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-y-2 border-t pt-4", children: [
        /* @__PURE__ */ jsx(Label, { children: "Who can use this code? (Customer Groups)" }),
        customerGroups && customerGroups.length > 0 ? /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-y-2 max-h-36 overflow-y-auto border rounded-md p-3", children: customerGroups.map((group) => /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-x-2 cursor-pointer text-sm", children: [
          /* @__PURE__ */ jsx(
            Checkbox,
            {
              checked: selectedCustomerGroupIds.includes(group.id),
              onCheckedChange: () => toggleCustomerGroup(group.id)
            }
          ),
          /* @__PURE__ */ jsx("span", { children: group.name })
        ] }, group.id)) }) : /* @__PURE__ */ jsx(Text, { size: "small", className: "text-ui-fg-subtle italic", children: "No customer groups configured — applies to all customers." })
      ] })
    ] }),
    step === "review" && /* @__PURE__ */ jsxs("div", { className: "px-6 py-6 flex flex-col gap-y-4 max-w-lg", children: [
      /* @__PURE__ */ jsx(ReviewRow, { label: "Method", value: isAutomatic ? "Automatic" : "Promotion Code" }),
      /* @__PURE__ */ jsx(ReviewRow, { label: "Status", value: status.charAt(0).toUpperCase() + status.slice(1) }),
      /* @__PURE__ */ jsx(ReviewRow, { label: "Code", value: code.toUpperCase() }),
      /* @__PURE__ */ jsx(
        ReviewRow,
        {
          label: "Discount",
          value: discountKind === "percentage" ? `${value}% off` : `${value} ${currencyCode.toUpperCase()} off`
        }
      ),
      /* @__PURE__ */ jsx(
        ReviewRow,
        {
          label: "Allocation",
          value: allocation.charAt(0).toUpperCase() + allocation.slice(1)
        }
      ),
      /* @__PURE__ */ jsx(ReviewRow, { label: "Max quantity", value: String(maxQuantity) }),
      /* @__PURE__ */ jsx(ReviewRow, { label: "Includes taxes", value: isTaxInclusive ? "Yes" : "No" }),
      usageLimit && /* @__PURE__ */ jsx(ReviewRow, { label: "Global usage limit", value: `${usageLimit} orders` }),
      /* @__PURE__ */ jsx(
        ReviewRow,
        {
          label: isBuyGet ? "Get discount on" : "Applies to",
          value: `${variantIds.length} variant(s)`
        }
      ),
      /* @__PURE__ */ jsx(
        ReviewRow,
        {
          label: "Target regions",
          value: selectedRegionIds.length > 0 ? `${selectedRegionIds.length} region(s)` : "All regions"
        }
      ),
      serverError && /* @__PURE__ */ jsx(Text, { size: "small", className: "text-ui-fg-error", children: serverError })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "secondary",
          onClick: step === "type" ? () => nav("/variant-promotions") : goBack,
          disabled: submitting,
          children: step === "type" ? "Cancel" : "Back"
        }
      ),
      step !== "review" ? /* @__PURE__ */ jsx(
        Button,
        {
          onClick: goNext,
          disabled: step === "variants" && !canProceedFromVariants || step === "value" && !canProceedFromValue,
          children: "Continue"
        }
      ) : /* @__PURE__ */ jsx(Button, { onClick: handleSubmit, isLoading: submitting, children: "Create promotion" })
    ] })
  ] });
}
function StepIndicator({ current }) {
  const steps = ["type", "variants", "value", "review"];
  return /* @__PURE__ */ jsx("div", { className: "flex items-center gap-x-2", children: steps.map((s, i) => /* @__PURE__ */ jsx(
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
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b pb-2", children: [
    /* @__PURE__ */ jsx(Text, { size: "small", className: "text-ui-fg-subtle", children: label }),
    /* @__PURE__ */ jsx(Text, { size: "small", weight: "plus", children: value })
  ] });
}
const config = defineRouteConfig({
  label: "Create Variant Promotion"
});
const widgetModule = { widgets: [
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
export {
  plugin as default
};

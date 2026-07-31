import { z } from "zod"

export const RESOLVED_VARIANT_ATTRIBUTE = "items.variant.id"

const promotionTypeEnum = z.enum(["amount_off_products", "percentage_off_product", "buy_x_get_y"])

export const CreateVariantPromotionSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, "Code must be at least 3 characters")
      .max(64, "Code must be at most 64 characters")
      .regex(/^[A-Za-z0-9_-]+$/, "Code may only contain letters, numbers, - and _"),
    description: z.string().max(500).optional(),
    type: promotionTypeEnum,
    currency_code: z.string().length(3, "currency_code must be a 3-letter ISO code"),

    discount_kind: z.enum(["percentage", "fixed"]),
    value: z.number().positive("value must be greater than 0"),
    allocation: z.enum(["each", "across", "once"]).optional().default("each"),
    max_quantity: z.number().int().positive().optional(),

    variant_ids: z
      .array(z.string().min(1))
      .min(1, "At least one variant_id is required")
      .max(500, "A single promotion supports at most 500 variants — split into multiple promotions beyond that")
      .transform((ids) => Array.from(new Set(ids))),

    buy_variant_ids: z.array(z.string().min(1)).optional(),
    buy_min_quantity: z.number().int().positive().optional(),
    apply_to_quantity: z.number().int().positive().optional(),

    status: z.enum(["active", "draft"]).optional().default("active"),
    is_tax_inclusive: z.boolean().optional().default(false),
    usage_limit: z.number().int().positive().optional(),
    customer_group_ids: z.array(z.string()).optional(),
    region_ids: z.array(z.string()).optional(),
    starts_at: z.coerce.date().optional(),
    ends_at: z.coerce.date().optional(),
    campaign_id: z.string().optional(),
    is_automatic: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.discount_kind === "percentage" && data.value > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["value"],
        message: "Percentage value cannot exceed 100",
      })
    }
    if (data.type === "buy_x_get_y") {
      if (!data.buy_variant_ids || data.buy_variant_ids.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["buy_variant_ids"],
          message: "buy_variant_ids is required when type is buy_x_get_y",
        })
      }
      if (!data.buy_min_quantity) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["buy_min_quantity"],
          message: "buy_min_quantity is required when type is buy_x_get_y",
        })
      }
      const overlap = data.buy_variant_ids?.filter((id) =>
        data.variant_ids.includes(id)
      )
      if (
        overlap &&
        overlap.length > 0 &&
        data.variant_ids.length === 1 &&
        data.buy_variant_ids!.length === 1 &&
        data.discount_kind === "percentage" &&
        data.value === 100
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["variant_ids"],
          message:
            "buy_variant_ids and variant_ids cannot be the sole, identical single variant with 100% off — this creates an unbounded free-item loop. Add a distinct 'get' variant.",
        })
      }
    }
    if (data.starts_at && data.ends_at && data.ends_at <= data.starts_at) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ends_at"],
        message: "ends_at must be after starts_at",
      })
    }
  })

export type CreateVariantPromotionInput = z.infer<
  typeof CreateVariantPromotionSchema
>

export const TargetRulesBatchSchema = z.object({
  add: z.array(z.string().min(1)).optional().default([]),
  remove: z.array(z.string().min(1)).optional().default([]),
}).refine(
  (d) => d.add.length > 0 || d.remove.length > 0,
  { message: "Provide at least one variant id in `add` or `remove`" }
)

export type TargetRulesBatchInput = z.infer<typeof TargetRulesBatchSchema>

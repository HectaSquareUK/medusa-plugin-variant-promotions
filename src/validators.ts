import { z } from "zod"

export const RESOLVED_VARIANT_ATTRIBUTE = "items.variant.id"

export const CreateVariantPromotionSchema = z
  .object({
    code: z
      .string()
      .min(3, "Code must be at least 3 characters")
      .transform((val) => val.trim().toUpperCase()),
    description: z.string().optional(),
    type: z
      .enum(["percentage_off_product", "buy_x_get_y"])
      .default("percentage_off_product"),

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

    variant_ids: z
      .array(z.string())
      .min(1, "Select at least one variant for this promotion"),

    buy_variant_ids: z.array(z.string()).optional(),
    buy_min_quantity: z.number().int().positive().optional(),

    campaign_id: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.discount_kind === "percentage" && data.value > 100) {
        return false
      }
      return true
    },
    {
      message: "Percentage discount cannot exceed 100%",
      path: ["value"],
    }
  )
  .refine(
    (data) => {
      if (data.type === "buy_x_get_y") {
        return (
          !!data.buy_variant_ids &&
          data.buy_variant_ids.length > 0 &&
          typeof data.buy_min_quantity === "number" &&
          data.buy_min_quantity > 0
        )
      }
      return true
    },
    {
      message:
        "Buy X Get Y promotions require at least one 'buy' variant and a minimum buy quantity",
      path: ["buy_variant_ids"],
    }
  )

export type CreateVariantPromotionInput = z.infer<
  typeof CreateVariantPromotionSchema
>

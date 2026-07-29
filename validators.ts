import { z } from "zod"

export const createVariantPromotionSchema = z.object({
  code: z.string().min(1, "Code is required"),
  type: z.enum(["standard", "buy_get"]).default("standard"),
  is_automatic: z.boolean().default(false),
  status: z.enum(["draft", "active"]).default("draft"),
  campaign_id: z.string().optional(),
  target_variant_ids: z.array(z.string()).min(1, "At least one target variant is required"),
  buy_variant_ids: z.array(z.string()).optional(),
  customer_group_ids: z.array(z.string()).optional(),
  region_ids: z.array(z.string()).optional(),
  application_method: z.object({
    type: z.enum(["percentage", "fixed"]),
    target_type: z.enum(["items", "shipping", "order_total"]).default("items"),
    allocation: z.enum(["each", "across", "once"]).default("each"),
    value: z.number().positive("Discount value must be greater than 0"),
    currency_code: z.string().optional(),
    max_quantity: z.number().int().positive().optional(),
    apply_to_quantity: z.number().int().positive().optional(),
    buy_rules_min_quantity: z.number().int().positive().optional(),
  }),
})

export type CreateVariantPromotionInput = z.infer<typeof createVariantPromotionSchema>

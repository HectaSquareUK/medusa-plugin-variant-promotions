"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TargetRulesBatchSchema = exports.CreateVariantPromotionSchema = exports.RESOLVED_VARIANT_ATTRIBUTE = void 0;
const zod_1 = require("zod");
exports.RESOLVED_VARIANT_ATTRIBUTE = "items.variant.id";
const promotionTypeEnum = zod_1.z.enum(["amount_off_products", "percentage_off_product", "buy_x_get_y"]);
exports.CreateVariantPromotionSchema = zod_1.z
    .object({
    code: zod_1.z
        .string()
        .trim()
        .min(3, "Code must be at least 3 characters")
        .max(64, "Code must be at most 64 characters")
        .regex(/^[A-Za-z0-9_-]+$/, "Code may only contain letters, numbers, - and _"),
    description: zod_1.z.string().max(500).optional(),
    type: promotionTypeEnum,
    currency_code: zod_1.z.string().length(3, "currency_code must be a 3-letter ISO code"),
    discount_kind: zod_1.z.enum(["percentage", "fixed"]),
    value: zod_1.z.number().positive("value must be greater than 0"),
    allocation: zod_1.z.enum(["each", "across", "once"]).optional().default("each"),
    max_quantity: zod_1.z.number().int().positive().optional(),
    variant_ids: zod_1.z
        .array(zod_1.z.string().min(1))
        .min(1, "At least one variant_id is required")
        .max(500, "A single promotion supports at most 500 variants — split into multiple promotions beyond that")
        .transform((ids) => Array.from(new Set(ids))),
    buy_variant_ids: zod_1.z.array(zod_1.z.string().min(1)).optional(),
    buy_min_quantity: zod_1.z.number().int().positive().optional(),
    apply_to_quantity: zod_1.z.number().int().positive().optional(),
    status: zod_1.z.enum(["active", "draft"]).optional().default("active"),
    is_tax_inclusive: zod_1.z.boolean().optional().default(false),
    usage_limit: zod_1.z.number().int().positive().optional(),
    customer_group_ids: zod_1.z.array(zod_1.z.string()).optional(),
    region_ids: zod_1.z.array(zod_1.z.string()).optional(),
    starts_at: zod_1.z.coerce.date().optional(),
    ends_at: zod_1.z.coerce.date().optional(),
    campaign_id: zod_1.z.string().optional(),
    is_automatic: zod_1.z.boolean().default(false),
})
    .superRefine((data, ctx) => {
    if (data.discount_kind === "percentage" && data.value > 100) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["value"],
            message: "Percentage value cannot exceed 100",
        });
    }
    if (data.type === "buy_x_get_y") {
        if (!data.buy_variant_ids || data.buy_variant_ids.length === 0) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                path: ["buy_variant_ids"],
                message: "buy_variant_ids is required when type is buy_x_get_y",
            });
        }
        if (!data.buy_min_quantity) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                path: ["buy_min_quantity"],
                message: "buy_min_quantity is required when type is buy_x_get_y",
            });
        }
        const overlap = data.buy_variant_ids?.filter((id) => data.variant_ids.includes(id));
        if (overlap &&
            overlap.length > 0 &&
            data.variant_ids.length === 1 &&
            data.buy_variant_ids.length === 1 &&
            data.discount_kind === "percentage" &&
            data.value === 100) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                path: ["variant_ids"],
                message: "buy_variant_ids and variant_ids cannot be the sole, identical single variant with 100% off — this creates an unbounded free-item loop. Add a distinct 'get' variant.",
            });
        }
    }
    if (data.starts_at && data.ends_at && data.ends_at <= data.starts_at) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["ends_at"],
            message: "ends_at must be after starts_at",
        });
    }
});
exports.TargetRulesBatchSchema = zod_1.z.object({
    add: zod_1.z.array(zod_1.z.string().min(1)).optional().default([]),
    remove: zod_1.z.array(zod_1.z.string().min(1)).optional().default([]),
}).refine((d) => d.add.length > 0 || d.remove.length > 0, { message: "Provide at least one variant id in `add` or `remove`" });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy92YWxpZGF0b3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZCQUF1QjtBQUVWLFFBQUEsMEJBQTBCLEdBQUcsa0JBQWtCLENBQUE7QUFFNUQsTUFBTSxpQkFBaUIsR0FBRyxPQUFDLENBQUMsSUFBSSxDQUFDLENBQUMscUJBQXFCLEVBQUUsd0JBQXdCLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQTtBQUVyRixRQUFBLDRCQUE0QixHQUFHLE9BQUM7S0FDMUMsTUFBTSxDQUFDO0lBQ04sSUFBSSxFQUFFLE9BQUM7U0FDSixNQUFNLEVBQUU7U0FDUixJQUFJLEVBQUU7U0FDTixHQUFHLENBQUMsQ0FBQyxFQUFFLG9DQUFvQyxDQUFDO1NBQzVDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsb0NBQW9DLENBQUM7U0FDN0MsS0FBSyxDQUFDLGtCQUFrQixFQUFFLGlEQUFpRCxDQUFDO0lBQy9FLFdBQVcsRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRTtJQUMzQyxJQUFJLEVBQUUsaUJBQWlCO0lBQ3ZCLGFBQWEsRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSwyQ0FBMkMsQ0FBQztJQUVoRixhQUFhLEVBQUUsT0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM5QyxLQUFLLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyw4QkFBOEIsQ0FBQztJQUMxRCxVQUFVLEVBQUUsT0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO0lBQ3pFLFlBQVksRUFBRSxP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LENBQUE7SUFDSixDQUFDO0FBQ0gsQ0FBQyxDQUFDLENBQUE7QUFNUyxRQUFBLHNCQUFzQixHQUFHLE9BQUMsQ0FBQyxNQUFNLENBQUM7SUFDN0MsR0FBRyxFQUFFLE9BQUMsQ0FBQyxLQUFLLENBQUMsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7SUFDdEQsTUFBTSxFQUFFLE9BQUMsQ0FBQyxLQUFLLENBQUMsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7Q0FDMUQsQ0FBQyxDQUFDLE1BQU0sQ0FDUCxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFDOUMsRUFBRSxPQUFPLEVBQUUsc0RBQXNELEVBQUUsQ0FDcEUsQ0FBQSJ9
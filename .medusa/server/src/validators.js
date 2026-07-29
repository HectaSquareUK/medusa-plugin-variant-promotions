"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateVariantPromotionSchema = exports.RESOLVED_VARIANT_ATTRIBUTE = void 0;
const zod_1 = require("zod");
exports.RESOLVED_VARIANT_ATTRIBUTE = "items.variant.id";
exports.CreateVariantPromotionSchema = zod_1.z
    .object({
    code: zod_1.z
        .string()
        .min(3, "Code must be at least 3 characters")
        .transform((val) => val.trim().toUpperCase()),
    description: zod_1.z.string().optional(),
    type: zod_1.z
        .enum(["percentage_off_product", "buy_x_get_y"])
        .default("percentage_off_product"),
    currency_code: zod_1.z.string().min(3).default("usd"),
    discount_kind: zod_1.z.enum(["percentage", "fixed"]).default("percentage"),
    value: zod_1.z.number().positive("Discount value must be greater than 0"),
    allocation: zod_1.z.enum(["each", "across", "once"]).default("each"),
    max_quantity: zod_1.z.number().int().positive().optional(),
    status: zod_1.z.enum(["active", "draft"]).default("active"),
    is_automatic: zod_1.z.boolean().default(false),
    is_tax_inclusive: zod_1.z.boolean().default(false),
    usage_limit: zod_1.z.number().int().positive().optional(),
    customer_group_ids: zod_1.z.array(zod_1.z.string()).optional(),
    region_ids: zod_1.z.array(zod_1.z.string()).optional(),
    starts_at: zod_1.z.string().datetime({ offset: true }).optional(),
    ends_at: zod_1.z.string().datetime({ offset: true }).optional(),
    variant_ids: zod_1.z
        .array(zod_1.z.string())
        .min(1, "Select at least one variant for this promotion"),
    buy_variant_ids: zod_1.z.array(zod_1.z.string()).optional(),
    buy_min_quantity: zod_1.z.number().int().positive().optional(),
    campaign_id: zod_1.z.string().optional(),
})
    .refine((data) => {
    if (data.discount_kind === "percentage" && data.value > 100) {
        return false;
    }
    return true;
}, {
    message: "Percentage discount cannot exceed 100%",
    path: ["value"],
})
    .refine((data) => {
    if (data.type === "buy_x_get_y") {
        return (!!data.buy_variant_ids &&
            data.buy_variant_ids.length > 0 &&
            typeof data.buy_min_quantity === "number" &&
            data.buy_min_quantity > 0);
    }
    return true;
}, {
    message: "Buy X Get Y promotions require at least one 'buy' variant and a minimum buy quantity",
    path: ["buy_variant_ids"],
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy92YWxpZGF0b3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZCQUF1QjtBQUVWLFFBQUEsMEJBQTBCLEdBQUcsa0JBQWtCLENBQUE7QUFFL0MsUUFBQSw0QkFBNEIsR0FBRyxPQUFDO0tBQzFDLE1BQU0sQ0FBQztJQUNOLElBQUksRUFBRSxPQUFDO1NBQ0osTUFBTSxFQUFFO1NBQ1IsR0FBRyxDQUFDLENBQUMsRUFBRSxvQ0FBb0MsQ0FBQztTQUM1QyxTQUFTLENBQUMsQ0FBQyxHQUFXLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN2RCxXQUFXLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUNsQyxJQUFJLEVBQUUsT0FBQztTQUNKLElBQUksQ0FBQyxDQUFDLHdCQUF3QixFQUFFLGFBQWEsQ0FBQyxDQUFDO1NBQy9DLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQztJQUVwQyxhQUFhLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO0lBQy9DLGFBQWEsRUFBRSxPQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQztJQUNwRSxLQUFLLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyx1Q0FBdUMsQ0FBQztJQUVuRSxVQUFVLEVBQUUsT0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO0lBQzlELFlBQVksRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFF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
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVariantPromotionSchema = void 0;
const zod_1 = require("zod");
exports.createVariantPromotionSchema = zod_1.z.object({
    code: zod_1.z.string().min(1, "Code is required"),
    type: zod_1.z.enum(["standard", "buy_get"]).default("standard"),
    is_automatic: zod_1.z.boolean().default(false),
    status: zod_1.z.enum(["draft", "active"]).default("draft"),
    campaign_id: zod_1.z.string().optional(),
    target_variant_ids: zod_1.z.array(zod_1.z.string()).min(1, "At least one target variant is required"),
    buy_variant_ids: zod_1.z.array(zod_1.z.string()).optional(),
    customer_group_ids: zod_1.z.array(zod_1.z.string()).optional(),
    region_ids: zod_1.z.array(zod_1.z.string()).optional(),
    application_method: zod_1.z.object({
        type: zod_1.z.enum(["percentage", "fixed"]),
        target_type: zod_1.z.enum(["items", "shipping", "order_total"]).default("items"),
        allocation: zod_1.z.enum(["each", "across", "once"]).default("each"),
        value: zod_1.z.number().positive("Discount value must be greater than 0"),
        currency_code: zod_1.z.string().optional(),
        max_quantity: zod_1.z.number().int().positive().optional(),
        apply_to_quantity: zod_1.z.number().int().positive().optional(),
        buy_rules_min_quantity: zod_1.z.number().int().positive().optional(),
    }),
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3ZhbGlkYXRvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkJBQXVCO0FBRVYsUUFBQSw0QkFBNEIsR0FBRyxPQUFDLENBQUMsTUFBTSxDQUFDO0lBQ25ELElBQUksRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxrQkFBa0IsQ0FBQztJQUMzQyxJQUFJLEVBQUUsT0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUM7SUFDekQsWUFBWSxFQUFFLE9BQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO0lBQ3hDLE1BQU0sRUFBRSxPQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQztJQUNwRCxXQUFXLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUNsQyxrQkFBa0IsRUFBRSxPQUFDLENBQUMsS0FBSyxDQUFDLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUseUNBQXlDLENBQUM7SUFDekYsZUFBZSxFQUFFLE9BQUMsQ0FBQyxLQUFLLENBQUMsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFO0lBQy9DLGtCQUFrQixFQUFFLE9BQUMsQ0FBQyxLQUFLLENBQUMsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFO0lBQ2xELFVBQVUsRUFBRSxPQUFDLENBQUMsS0FBSyxDQUFDLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRTtJQUMxQyxrQkFBa0IsRUFBRSxPQUFDLENBQUMsTUFBTSxDQUFDO1FBQzNCLElBQUksRUFBRSxPQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3JDLFdBQVcsRUFBRSxPQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7UUFDMUUsVUFBVSxFQUFFLE9BQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUM5RCxLQUFLLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyx1Q0FBdUMsQ0FBQztRQUNuRSxhQUFhLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRTtRQUNwQyxZQUFZLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsRUFBRTtRQUNwRCxpQkFBaUIsRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxFQUFFO1FBQ3pELHNCQUFzQixFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLEVBQUU7S0FDL0QsQ0FBQztDQUNILENBQUMsQ0FBQSJ9
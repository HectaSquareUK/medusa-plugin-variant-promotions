"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.default = autoVariantPromotionsHandler;
const utils_1 = require("@medusajs/framework/utils");
const core_flows_1 = require("@medusajs/medusa/core-flows");
const validators_1 = require("../validators");
/**
 * Subscriber: Automatically applies active variant promotions flagged as `is_automatic: true`
 * whenever a cart is updated or created.
 */
async function autoVariantPromotionsHandler({ event: { data }, container, }) {
    const cartId = data?.id;
    if (!cartId)
        return;
    const query = container.resolve("query");
    const logger = container.resolve("logger");
    try {
        // 1. Fetch active automatic promotions that target variants
        const { data: promotions } = await query.graph({
            entity: "promotion",
            fields: [
                "id",
                "code",
                "is_automatic",
                "status",
                "application_method.target_rules.attribute",
                "application_method.target_rules.values.value",
            ],
            filters: {
                is_automatic: true,
                status: "active",
            },
        });
        const autoVariantPromos = promotions.filter((p) => {
            const targetAttrs = (p.application_method?.target_rules ?? []).map((r) => r.attribute);
            return targetAttrs.includes(validators_1.RESOLVED_VARIANT_ATTRIBUTE);
        });
        if (autoVariantPromos.length === 0)
            return;
        // 2. Fetch cart line items and existing promotions
        const { data: carts } = await query.graph({
            entity: "cart",
            fields: ["id", "items.variant_id", "promotions.code"],
            filters: { id: cartId },
        });
        const cart = carts[0];
        if (!cart || !cart.items || cart.items.length === 0)
            return;
        const cartVariantIds = new Set(cart.items.map((item) => item.variant_id).filter(Boolean));
        // 3. Match cart variants against automatic promo target rules
        const matchingCodes = [];
        for (const promo of autoVariantPromos) {
            const targetRule = (promo.application_method?.target_rules ?? []).find((r) => r.attribute === validators_1.RESOLVED_VARIANT_ATTRIBUTE);
            const targetedVariantIds = (targetRule?.values ?? []).map((v) => v.value);
            const matches = targetedVariantIds.some((id) => cartVariantIds.has(id));
            if (matches && promo.code) {
                matchingCodes.push(promo.code);
            }
        }
        if (matchingCodes.length === 0)
            return;
        // 4. Determine if new promo codes need to be applied
        const existingCodes = (cart.promotions ?? []).map((p) => p.code);
        const missingCodes = matchingCodes.filter((code) => !existingCodes.includes(code));
        if (missingCodes.length === 0)
            return;
        // 5. Apply the matching automatic codes via direct synchronous workflow execution
        await (0, core_flows_1.updateCartPromotionsWorkflow)(container).run({
            input: {
                cart_id: cartId,
                promo_codes: missingCodes,
                action: utils_1.PromotionActions.ADD,
            },
        });
        logger.info(`Auto-applied variant promotion(s) [${missingCodes.join(", ")}] to cart ${cartId}`);
    }
    catch (err) {
        logger.warn(`autoVariantPromotionsHandler non-critical warning for cart ${cartId}: ${err?.message}`);
    }
}
exports.config = {
    event: ["cart.updated", "cart.created"],
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0by12YXJpYW50LXByb21vdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc3Vic2NyaWJlcnMvYXV0by12YXJpYW50LXByb21vdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBU0EsK0NBbUdDO0FBM0dELHFEQUE0RDtBQUM1RCw0REFBMEU7QUFDMUUsOENBQTBEO0FBRTFEOzs7R0FHRztBQUNZLEtBQUssVUFBVSw0QkFBNEIsQ0FBQyxFQUN6RCxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFDZixTQUFTLEdBQ3NCO0lBQy9CLE1BQU0sTUFBTSxHQUFHLElBQUksRUFBRSxFQUFFLENBQUE7SUFDdkIsSUFBSSxDQUFDLE1BQU07UUFBRSxPQUFNO0lBRW5CLE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUE7SUFDeEMsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUUxQyxJQUFJLENBQUM7UUFDSCw0REFBNEQ7UUFDNUQsTUFBTSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsR0FBRyxNQUFNLEtBQUssQ0FBQyxLQUFLLENBQUM7WUFDN0MsTUFBTSxFQUFFLFdBQVc7WUFDbkIsTUFBTSxFQUFFO2dCQUNOLElBQUk7Z0JBQ0osTUFBTTtnQkFDTixjQUFjO2dCQUNkLFFBQVE7Z0JBQ1IsMkNBQTJDO2dCQUMzQyw4Q0FBOEM7YUFDL0M7WUFDRCxPQUFPLEVBQUU7Z0JBQ1AsWUFBWSxFQUFFLElBQUk7Z0JBQ2xCLE1BQU0sRUFBRSxRQUFRO2FBQ2pCO1NBQ0YsQ0FBQyxDQUFBO1FBRUYsTUFBTSxpQkFBaUIsR0FBSSxVQUFvQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQzNELE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixFQUFFLFlBQVksSUFBSSxFQUFFLENBQUMs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
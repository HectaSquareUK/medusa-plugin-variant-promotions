"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.default = autoVariantPromotionsHandler;
const core_flows_1 = require("@medusajs/medusa/core-flows");
const RESOLVED_VARIANT_ATTRIBUTE = "items.variant.id";
async function autoVariantPromotionsHandler({ event: { data }, container, }) {
    const cartId = data?.id;
    if (!cartId)
        return;
    try {
        const query = container.resolve("query");
        const { data: carts } = await query.graph({
            entity: "cart",
            fields: ["id", "currency_code", "items.variant_id"],
            filters: { id: cartId },
        });
        const cart = carts?.[0];
        if (!cart || !cart.items || cart.items.length === 0)
            return;
        const cartVariantIds = new Set(cart.items.map((item) => item.variant_id).filter(Boolean));
        if (cartVariantIds.size === 0)
            return;
        const { data: promotions } = await query.graph({
            entity: "promotion",
            fields: [
                "id",
                "code",
                "is_automatic",
                "status",
                "application_method.currency_code",
                "application_method.target_rules.attribute",
                "application_method.target_rules.values.value",
                "application_method.buy_rules.attribute",
                "application_method.buy_rules.values.value",
            ],
            filters: {
                is_automatic: true,
                status: "active",
            },
        });
        if (!promotions || promotions.length === 0)
            return;
        const cartCurrency = cart.currency_code?.toLowerCase();
        const matchingPromoCodes = promotions
            .filter((promo) => {
            const promoCurrency = promo.application_method?.currency_code?.toLowerCase();
            if (promoCurrency && cartCurrency && promoCurrency !== cartCurrency) {
                return false;
            }
            const targetRules = promo.application_method?.target_rules ?? [];
            const buyRules = promo.application_method?.buy_rules ?? [];
            const targetVariantIds = targetRules
                .filter((r) => r.attribute === RESOLVED_VARIANT_ATTRIBUTE)
                .flatMap((r) => (r.values ?? []).map((v) => v.value));
            const buyVariantIds = buyRules
                .filter((r) => r.attribute === RESOLVED_VARIANT_ATTRIBUTE)
                .flatMap((r) => (r.values ?? []).map((v) => v.value));
            const allVariantIds = [...targetVariantIds, ...buyVariantIds];
            if (allVariantIds.length === 0)
                return false;
            return allVariantIds.some((id) => cartVariantIds.has(id));
        })
            .map((promo) => promo.code)
            .filter(Boolean);
        if (matchingPromoCodes.length === 0)
            return;
        await (0, core_flows_1.updateCartPromotionsWorkflow)(container).run({
            input: {
                cart_id: cartId,
                promo_codes: matchingPromoCodes,
                action: "ADD",
            },
        });
    }
    catch (error) {
        console.error(`[AutoVariantPromotions] Failed for cart ${cartId}:`, error);
    }
}
exports.config = {
    event: ["cart.created", "cart.updated"],
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0by12YXJpYW50LXByb21vdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zdWJzY3JpYmVycy9hdXRvLXZhcmlhbnQtcHJvbW90aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFLQSwrQ0FxRkM7QUF6RkQsNERBQTBFO0FBRTFFLE1BQU0sMEJBQTBCLEdBQUcsa0JBQWtCLENBQUE7QUFFdEMsS0FBSyxVQUFVLDRCQUE0QixDQUFDLEVBQ3pELEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxFQUNmLFNBQVMsR0FDc0I7SUFDL0IsTUFBTSxNQUFNLEdBQUcsSUFBSSxFQUFFLEVBQUUsQ0FBQTtJQUN2QixJQUFJLENBQUMsTUFBTTtRQUFFLE9BQU07SUFFbkIsSUFBSSxDQUFDO1FBQ0gsTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUV4QyxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxHQUFHLE1BQU0sS0FBSyxDQUFDLEtBQUssQ0FBQztZQUN4QyxNQUFNLEVBQUUsTUFBTTtZQUNkLE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUUsa0JBQWtCLENBQUM7WUFDbkQsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRTtTQUN4QixDQUFDLENBQUE7UUFFRixNQUFNLElBQUksR0FBRyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN2QixJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDO1lBQUUsT0FBTTtRQUUzRCxNQUFNLGNBQWMsR0FBRyxJQUFJLEdBQUcsQ0FDNUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFTLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxNQUFNLENBQUMs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
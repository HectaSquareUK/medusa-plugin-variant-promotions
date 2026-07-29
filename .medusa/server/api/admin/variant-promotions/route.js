"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
exports.GET = GET;
const create_variant_promotion_1 = require("../../../workflows/create-variant-promotion");
const validators_1 = require("../../../validators");
async function POST(req, res) {
    try {
        const validated = validators_1.createVariantPromotionSchema.parse(req.body);
        const { result } = await (0, create_variant_promotion_1.createVariantPromotionWorkflow)(req.scope).run({
            input: validated,
        });
        return res.status(200).json({ promotion: result });
    }
    catch (error) {
        return res.status(400).json({
            message: error?.message || "Failed to create variant promotion",
            errors: error?.errors || undefined,
        });
    }
}
async function GET(req, res) {
    try {
        const query = req.scope.resolve("query");
        const { data: promotions } = await query.graph({
            entity: "promotion",
            fields: [
                "id",
                "code",
                "type",
                "is_automatic",
                "status",
                "created_at",
                "updated_at",
                "application_method.type",
                "application_method.target_type",
                "application_method.allocation",
                "application_method.value",
                "application_method.currency_code",
                "application_method.max_quantity",
                "application_method.apply_to_quantity",
                "application_method.buy_rules.attribute",
                "application_method.buy_rules.values.value",
                "application_method.target_rules.attribute",
                "application_method.target_rules.values.value",
            ],
        });
        const RESOLVED_VARIANT_ATTRIBUTE = "items.variant.id";
        const variantPromotions = (promotions ?? []).filter((p) => {
            const targetRules = p?.application_method?.target_rules ?? [];
            const buyRules = p?.application_method?.buy_rules ?? [];
            const hasTargetVariant = targetRules.some((r) => r.attribute === RESOLVED_VARIANT_ATTRIBUTE);
            const hasBuyVariant = buyRules.some((r) => r.attribute === RESOLVED_VARIANT_ATTRIBUTE);
            return hasTargetVariant || hasBuyVariant;
        });
        const allVariantIds = new Set();
        variantPromotions.forEach((p) => {
            const targetRules = p?.application_method?.target_rules ?? [];
            const buyRules = p?.application_method?.buy_rules ?? [];
            targetRules
                .filter((r) => r.attribute === RESOLVED_VARIANT_ATTRIBUTE)
                .forEach((r) => (r.values ?? []).forEach((v) => allVariantIds.add(v.value)));
            buyRules
                .filter((r) => r.attribute === RESOLVED_VARIANT_ATTRIBUTE)
                .forEach((r) => (r.values ?? []).forEach((v) => allVariantIds.add(v.value)));
        });
        const variantIdList = Array.from(allVariantIds);
        const variantById = new Map();
        if (variantIdList.length > 0) {
            try {
                const { data: variants } = await query.graph({
                    entity: "product_variant",
                    fields: ["id", "title", "sku", "product_id", "product.id", "product.title"],
                    filters: { id: variantIdList },
                });
                (variants ?? []).forEach((v) => variantById.set(v.id, v));
            }
            catch {
                // Fail gracefully
            }
        }
        const enrichedPromotions = variantPromotions.map((p) => {
            const targetRules = p?.application_method?.target_rules ?? [];
            const buyRules = p?.application_method?.buy_rules ?? [];
            const targetVariantIds = [];
            targetRules
                .filter((r) => r.attribute === RESOLVED_VARIANT_ATTRIBUTE)
                .forEach((r) => (r.values ?? []).forEach((v) => targetVariantIds.push(v.value)));
            const buyVariantIds = [];
            buyRules
                .filter((r) => r.attribute === RESOLVED_VARIANT_ATTRIBUTE)
                .forEach((r) => (r.values ?? []).forEach((v) => buyVariantIds.push(v.value)));
            const targetVariants = targetVariantIds.map((id) => {
                const v = variantById.get(id);
                return {
                    id,
                    title: v?.title ?? null,
                    sku: v?.sku ?? null,
                    product_id: v?.product_id ?? v?.product?.id ?? null,
                    product_title: v?.product?.title ?? null,
                };
            });
            const buyVariants = buyVariantIds.map((id) => {
                const v = variantById.get(id);
                return {
                    id,
                    title: v?.title ?? null,
                    sku: v?.sku ?? null,
                    product_id: v?.product_id ?? v?.product?.id ?? null,
                    product_title: v?.product?.title ?? null,
                };
            });
            return {
                ...p,
                target_variants: targetVariants,
                buy_variants: buyVariants,
            };
        });
        return res.status(200).json({ promotions: enrichedPromotions });
    }
    catch (error) {
        return res.status(500).json({
            message: error?.message || "Failed to list variant promotions",
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcGkvYWRtaW4vdmFyaWFudC1wcm9tb3Rpb25zL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBSUEsb0JBYUM7QUFFRCxrQkE4SEM7QUFoSkQsMEZBQTRGO0FBQzVGLG9EQUFrRTtBQUUzRCxLQUFLLFVBQVUsSUFBSSxDQUFDLEdBQWtCLEVBQUUsR0FBbUI7SUFDaEUsSUFBSSxDQUFDO1FBQ0gsTUFBTSxTQUFTLEdBQUcseUNBQTRCLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUM5RCxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsTUFBTSxJQUFBLHlEQUE4QixFQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUM7WUFDckUsS0FBSyxFQUFFLFNBQVM7U0FDakIsQ0FBQyxDQUFBO1FBQ0YsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFBO0lBQ3BELENBQUM7SUFBQyxPQUFPLEtBQVUsRUFBRSxDQUFDO1FBQ3BCLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDMUIsT0FBTyxFQUFFLEtBQUssRUFBRSxPQUFPLElBQUksb0NBQW9DO1lBQy9ELE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxJQUFJLFNBQVM7U0FDbkMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztBQUNILENBQUM7QUFFTSxLQUFLLFVBQVUsR0FBRyxDQUFDLEdBQWtCLEVBQUUsR0FBbUI7SUFDL0QsSUFBSSxDQUFDO1FBQ0gsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUE7UUFDeEMsTUFBTSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUs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
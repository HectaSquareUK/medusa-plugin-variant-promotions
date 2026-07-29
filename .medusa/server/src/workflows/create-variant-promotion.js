"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVariantPromotionWorkflow = exports.buildPromotionPayloadStep = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const core_flows_1 = require("@medusajs/medusa/core-flows");
const validators_1 = require("../validators");
exports.buildPromotionPayloadStep = (0, workflows_sdk_1.createStep)("build-variant-promotion-payload", async (input) => {
    const isBuyGet = input.type === "buy_x_get_y";
    const discountKind = input.discount_kind ?? "percentage";
    const allocation = input.allocation ?? "each";
    const currencyCode = (input.currency_code ?? "usd").toLowerCase();
    const targetRules = [
        {
            attribute: validators_1.RESOLVED_VARIANT_ATTRIBUTE,
            operator: "in",
            values: input.variant_ids,
        },
    ];
    const applicationMethod = {
        type: discountKind,
        target_type: "items",
        allocation,
        value: input.value,
        target_rules: targetRules,
    };
    if (discountKind === "fixed") {
        applicationMethod.currency_code = currencyCode;
    }
    if (typeof input.max_quantity === "number") {
        applicationMethod.max_quantity = input.max_quantity;
    }
    if (isBuyGet) {
        applicationMethod.buy_rules_min_quantity = input.buy_min_quantity ?? 1;
        applicationMethod.buy_rules = [
            {
                attribute: validators_1.RESOLVED_VARIANT_ATTRIBUTE,
                operator: "in",
                values: input.buy_variant_ids ?? [],
            },
        ];
        applicationMethod.apply_to_quantity = 1;
    }
    const rules = [];
    if (input.customer_group_ids && input.customer_group_ids.length > 0) {
        rules.push({
            attribute: "customer.groups.id",
            operator: "in",
            values: input.customer_group_ids,
        });
    }
    if (input.region_ids && input.region_ids.length > 0) {
        rules.push({
            attribute: "region.id",
            operator: "in",
            values: input.region_ids,
        });
    }
    const payload = {
        code: input.code,
        type: isBuyGet ? "buyget" : "standard",
        status: input.status ?? "active",
        is_automatic: input.is_automatic ?? false,
        is_tax_inclusive: input.is_tax_inclusive ?? false,
        usage_limit: input.usage_limit,
        description: input.description,
        campaign_id: input.campaign_id,
        starts_at: input.starts_at,
        ends_at: input.ends_at,
        rules,
        application_method: applicationMethod,
    };
    return new workflows_sdk_1.StepResponse(payload);
});
exports.createVariantPromotionWorkflow = (0, workflows_sdk_1.createWorkflow)("create-variant-promotion", (input) => {
    const payload = (0, exports.buildPromotionPayloadStep)(input);
    const promotions = core_flows_1.createPromotionsWorkflow.runAsStep({
        input: {
            promotionsData: [payload],
        },
    });
    return new workflows_sdk_1.WorkflowResponse(promotions);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXZhcmlhbnQtcHJvbW90aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3dvcmtmbG93cy9jcmVhdGUtdmFyaWFudC1wcm9tb3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscUVBSzBDO0FBQzFDLDREQUFzRTtBQUN0RSw4Q0FBMEQ7QUF5QjdDLFFBQUEseUJBQXlCLEdBQUcsSUFBQSwwQkFBVSxFQUNqRCxpQ0FBaUMsRUFDakMsS0FBSyxFQUFFLEtBQTBDLEVBQUUsRUFBRTtJQUNuRCxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsSUFBSSxLQUFLLGFBQWEsQ0FBQTtJQUM3QyxNQUFNLFlBQVksR0FBRyxLQUFLLENBQUMsYUFBYSxJQUFJLFlBQVksQ0FBQTtJQUN4RCxNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsVUFBVSxJQUFJLE1BQU0sQ0FBQTtJQUM3QyxNQUFNLFlBQVksR0FBRyxDQUFDLEtBQUssQ0FBQyxhQUFhLElBQUksS0FBSyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUE7SUFFakUsTUFBTSxXQUFXLEdBQUc7UUFDbEI7WUFDRSxTQUFTLEVBQUUsdUNBQTBCO1lBQ3JDLFFBQVEsRUFBRSxJQUFJO1lBQ2QsTUFBTSxFQUFFLEtBQUssQ0FBQyxXQUFXO1NBQzFCO0tBQ0YsQ0FBQTtJQUVELE1BQU0saUJBQWlCLEdBQTRCO1FBQ2pELElBQUksRUFBRSxZQUFZO1FBQ2xCLFdBQVcsRUFBRSxPQUFPO1FBQ3BCLFVBQVU7UUFDVixLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUs7UUFDbEIsWUFBWSxFQUFFLFdBQVc7S0FDMUIsQ0FBQTtJQUVELElBQUksWUFBWSxLQUFLLE9BQU8sRUFBRSxDQUFDO1FBQzdCLGlCQUFpQixDQUFDLGFBQWEsR0FBRyxZQUFZLENBQUE7SUFDaEQsQ0FBQztJQUVELElBQUksT0FBTyxLQUFLLENBQUMsWUFBWSxLQUFLLFFBQVEsRUFBRSxDQUFDO1FBQzND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
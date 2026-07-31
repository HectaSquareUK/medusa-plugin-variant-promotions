"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVariantPromotionWorkflow = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const core_flows_1 = require("@medusajs/medusa/core-flows");
const validators_1 = require("../validators");
const buildPromotionPayloadStep = (0, workflows_sdk_1.createStep)("build-variant-promotion-payload", async (input) => {
    const isBuyGet = input.type === "buy_x_get_y";
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
    const alloc = input.allocation ?? "each";
    // When allocation is "once", enforce max_quantity: 1 so only 1 unit is discounted per cart
    const effectiveMaxQty = alloc === "once" ? 1 : (input.max_quantity ?? 100);
    const applicationMethod = {
        type: input.discount_kind,
        target_type: "items",
        allocation: alloc,
        max_quantity: effectiveMaxQty,
        value: input.value,
        currency_code: input.currency_code,
        target_rules: [
            {
                attribute: validators_1.RESOLVED_VARIANT_ATTRIBUTE,
                operator: "in",
                values: input.variant_ids,
            },
        ],
    };
    if (isBuyGet) {
        applicationMethod.buy_rules_min_quantity = input.buy_min_quantity;
        applicationMethod.apply_to_quantity = input.apply_to_quantity ?? 1;
        applicationMethod.buy_rules = [
            {
                attribute: validators_1.RESOLVED_VARIANT_ATTRIBUTE,
                operator: "in",
                values: input.buy_variant_ids,
            },
        ];
    }
    const payload = {
        code: input.code.toUpperCase(),
        type: (isBuyGet ? "buyget" : "standard"),
        status: (input.status ?? "active"),
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
    const payload = buildPromotionPayloadStep(input);
    const promotions = core_flows_1.createPromotionsWorkflow.runAsStep({
        input: {
            promotionsData: [payload],
        },
    });
    return new workflows_sdk_1.WorkflowResponse(promotions);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXZhcmlhbnQtcHJvbW90aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3dvcmtmbG93cy9jcmVhdGUtdmFyaWFudC1wcm9tb3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscUVBSzBDO0FBQzFDLDREQUFzRTtBQUN0RSw4Q0FBMEQ7QUEwQjFELE1BQU0seUJBQXlCLEdBQUcsSUFBQSwwQkFBVSxFQUMxQyxpQ0FBaUMsRUFDakMsS0FBSyxFQUFFLEtBQTBDLEVBQUUsRUFBRTtJQUNuRCxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsSUFBSSxLQUFLLGFBQWEsQ0FBQTtJQUU3QyxNQUFNLEtBQUssR0FBVSxFQUFFLENBQUE7SUFDdkIsSUFBSSxLQUFLLENBQUMsa0JBQWtCLElBQUksS0FBSyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUNwRSxLQUFLLENBQUMsSUFBSSxDQUFDO1lBQ1QsU0FBUyxFQUFFLG9CQUFvQjtZQUMvQixRQUFRLEVBQUUsSUFBYTtZQUN2QixNQUFNLEVBQUUsS0FBSyxDQUFDLGtCQUFrQjtTQUNqQyxDQUFDLENBQUE7SUFDSixDQUFDO0lBQ0QsSUFBSSxLQUFLLENBQUMsVUFBVSxJQUFJLEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ3BELEtBQUssQ0FBQyxJQUFJLENBQUM7WUFDVCxTQUFTLEVBQUUsV0FBVztZQUN0QixRQUFRLEVBQUUsSUFBYTtZQUN2QixNQUFNLEVBQUUsS0FBSyxDQUFDLFVBQVU7U0FDekIsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVELE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxVQUFVLElBQUksTUFBTSxDQUFBO0lBQ3hDLDJGQUEyRjtJQUMzRixNQUFNLGVBQWUsR0FBRyxLQUFLLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFlBQVksSUFBSSxHQUFHLENBQUMsQ0FBQTtJQUUxRSxNQUFNLGlCQUFpQixHQUE0QjtRQUNqRCxJQUFJLEVBQUUsS0FBSyxDQUFDLGFBQWE7UUFDekIsV0FBVyxFQUFFLE9BQU87UUFDcEIsVUFBVSxFQUFFLEtBQUs7UUFDakIsWUFBWSxFQUFFLGVBQWU7UUFDN0IsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLO1FBQ2xCLGFBQWEsRUFBRSxLQUFLLENBQUMsYUFBYTtRQUNsQyxZQUFZLEVBQUU7WUFDWjtnQkFDRSxTQUFTLEVBQUUsdUNBQTBCO2dCQUNyQyxRQUFRLEVBQUUsSUFBSTtnQkFDZCxNQUFNLEVBQUUsS0FBSyxDQUFDLFdBQVc7YUFDMUI7U0FDRjtLQUNGLENBQUE7SUFFRCxJQUFJLFFBQVEsRUFBRSxDQUFDO1FBQ2IsaUJBQWlCLENBQUMsc0JBQXNCLEdBQUcsS0FBSyxDQUFDLGdCQUFnQixDQUFBO1FBQ2pFLGlCQUFpQixDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQyxpQkFBaUIsSUFBSSxDQUFDLENBQ2pFO1FBQUMsaUJBQXlCLENBQUMsU0FBUyxHQUFHO1lBQ3RDO2dCQUNFLFNBQVMsRUFBRSx1Q0FBMEI7Z0JBQ3JDLFFBQVEsRUFBRSxJQUFJO2dCQUNkLE1BQU0sRUFBRSxLQUFLLENBQUMsZUFBZTthQUM5QjtTQUNGLENBQUE7SUFDSCxDQUFDO0lBRUQsTUFBTSxPQUFPLEdBQUc7UUFDZCxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7UUFDOUIsSUFBSSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBMEI7UUFDakUsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxRQUFRLENBQXVCO1FBQ3hELFlBQVksRUFBRSxLQUFLLENBQUMsWUFBWSxJQUFJLEtBQUs7UUFDekMsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLGdCQUFnQixJQUFJLEtBQUs7UUFDakQsV0FBVyxFQUFFLEtBQUssQ0FBQyxXQUFXO1FBQzlCLFdBQVcsRUFBRSxLQUFLLENBQUMsV0FBVztRQUM5QixXQUFXLEVBQUUsS0FBSyxDQUFDLFdBQVc7UUFDOUIsU0FBUyxFQUFFLEtBQUssQ0FBQyxTQUFTO1FBQzFCLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTztRQUN0QixLQUFLO1FBQ0wsa0JBQWtCLEVBQUUsaUJBQWlCO0tBQ3RDLENBQUE7SUFFRCxPQUFPLElBQUksNEJBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUNsQyxDQUFDLENBQ0YsQ0FBQTtBQUVZLFFBQUEsOEJBQThCLEdBQUcsSUFBQSw4QkFBYyxFQUMxRCwwQkFBMEIsRUFDMUIsQ0FBQyxLQUEwQyxFQUFFLEVBQUU7SUFDN0MsTUFBTSxPQUFPLEdBQUcseUJBQXlCLENBQUMsS0FBSyxDQUFDLENBQUE7SUFFaEQsTUFBTSxVQUFVLEdBQUcscUNBQXdCLENBQUMsU0FBUyxDQUFDO1FBQ3BELEtBQUssRUFBRTtZQUNMLGNBQWMsRUFBRSxDQUFDLE9BQWMsQ0FBQztTQUNqQztLQUNGLENBQUMsQ0FBQTtJQUVGLE9BQU8sSUFBSSxnQ0FBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQTtBQUN6QyxDQUFDLENBQ0YsQ0FBQSJ9
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVariantPromotionWorkflow = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const core_flows_1 = require("@medusajs/medusa/core-flows");
const RESOLVED_VARIANT_ATTRIBUTE = "items.variant.id";
exports.createVariantPromotionWorkflow = (0, workflows_sdk_1.createWorkflow)("create-variant-promotion-workflow", (input) => {
    const isBuyGet = input.type === "buy_get";
    const targetRules = input.target_variant_ids && input.target_variant_ids.length > 0
        ? [
            {
                attribute: RESOLVED_VARIANT_ATTRIBUTE,
                operator: "in",
                values: input.target_variant_ids,
            },
        ]
        : [];
    const buyRules = isBuyGet && input.buy_variant_ids && input.buy_variant_ids.length > 0
        ? [
            {
                attribute: RESOLVED_VARIANT_ATTRIBUTE,
                operator: "in",
                values: input.buy_variant_ids,
            },
        ]
        : [];
    const rules = [
        ...(input.customer_group_ids && input.customer_group_ids.length > 0
            ? [
                {
                    attribute: "customer_group_id",
                    operator: "in",
                    values: input.customer_group_ids,
                },
            ]
            : []),
    ];
    const promotionData = {
        code: input.code,
        type: input.type,
        is_automatic: input.is_automatic ?? false,
        status: input.status ?? "draft",
        campaign_id: input.campaign_id,
        rules,
        application_method: {
            type: input.application_method.type,
            target_type: input.application_method.target_type ?? "items",
            allocation: input.application_method.allocation ?? "each",
            value: input.application_method.value,
            currency_code: input.application_method.currency_code,
            max_quantity: input.application_method.max_quantity,
            apply_to_quantity: input.application_method.apply_to_quantity,
            buy_rules_min_quantity: input.application_method.buy_rules_min_quantity,
            target_rules: targetRules,
            buy_rules: buyRules,
        },
    };
    const createdPromotions = core_flows_1.createPromotionsWorkflow.runAsStep({
        input: [promotionData],
    });
    return new workflows_sdk_1.WorkflowResponse(createdPromotions[0]);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXZhcmlhbnQtcHJvbW90aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vd29ya2Zsb3dzL2NyZWF0ZS12YXJpYW50LXByb21vdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxRUFBb0Y7QUFDcEYsNERBQXNFO0FBR3RFLE1BQU0sMEJBQTBCLEdBQUcsa0JBQWtCLENBQUE7QUFFeEMsUUFBQSw4QkFBOEIsR0FBRyxJQUFBLDhCQUFjLEVBQzFELG1DQUFtQyxFQUNuQyxDQUFDLEtBQWtDLEVBQUUsRUFBRTtJQUNyQyxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsSUFBSSxLQUFLLFNBQVMsQ0FBQTtJQUV6QyxNQUFNLFdBQVcsR0FDZixLQUFLLENBQUMsa0JBQWtCLElBQUksS0FBSyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sR0FBRyxDQUFDO1FBQzdELENBQUMsQ0FBQztZQUNFO2dCQUNFLFNBQVMsRUFBRSwwQkFBMEI7Z0JBQ3JDLFFBQVEsRUFBRSxJQUFhO2dCQUN2QixNQUFNLEVBQUUsS0FBSyxDQUFDLGtCQUFrQjthQUNqQztTQUNGO1FBQ0gsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtJQUVSLE1BQU0sUUFBUSxHQUNaLFFBQVEsSUFBSSxLQUFLLENBQUMsZUFBZSxJQUFJLEtBQUssQ0FBQyxlQUFlLENBQUMsTUFBTSxHQUFHLENBQUM7UUFDbkUsQ0FBQyxDQUFDO1lBQ0U7Z0JBQ0UsU0FBUyxFQUFFLDBCQUEwQjtnQkFDckMsUUFBUSxFQUFFLElBQWE7Z0JBQ3ZCLE1BQU0sRUFBRSxLQUFLLENBQUMsZUFBZTthQUM5QjtTQUNGO1FBQ0gsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtJQUVSLE1BQU0sS0FBSyxHQUFHO1FBQ1osR0FBRyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsSUFBSSxLQUFLLENBQUMsa0JBQWtCLENBQUMsTUFBTSxHQUFHLENBQUM7WUFDakUsQ0FBQyxDQUFDO2dCQUNFO29CQUNFLFNBQVMsRUFBRSxtQkFBbUI7b0JBQzlCLFFBQVEsRUFBRSxJQUFhO29CQUN2QixNQUFNLEVBQUUsS0FBSyxDQUFDLGtCQUFrQjtpQkFDakM7YUFDRjtZQUNILENBQUMsQ0FBQyxFQUFFLENBQUM7S0FDUixDQUFBO0lBRUQsTUFBTSxhQUFhLEdBQVE7UUFDekIsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJO1FBQ2hCLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSTtRQUNoQixZQUFZLEVBQUUsS0FBSyxDQUFDLFlBQVksSUFBSSxLQUFLO1FBQ3pDLE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTSxJQUFJLE9BQU87UUFDL0IsV0FBVyxFQUFFLEtBQUssQ0FBQyxXQUFXO1FBQzlCLEtBQUs7UUFDTCxrQkFBa0IsRUFBRTtZQUNsQixJQUFJLEVBQUUsS0FBSyxDQUFDLGtCQUFrQixDQUFDLElBQUk7WUFDbkMsV0FBVyxFQUFFLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLElBQUksT0FBTztZQUM1RCxVQUFVLEVBQUUsS0FBSyxDQUFDLGtCQUFrQixDQUFDLFVBQVUsSUFBSSxNQUFNO1lBQ3pELEtBQUssRUFBRSxLQUFLLENBQUMsa0JBQWtCLENBQUMsS0FBSztZQUNyQyxhQUFhLEVBQUUsS0FBSyxDQUFDLGtCQUFrQixDQUFDLGFBQWE7WUFDckQsWUFBWSxFQUFFLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZO1lBQ25ELGlCQUFpQixFQUFFLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxpQkFBaUI7WUFDN0Qsc0JBQXNCLEVBQUUsS0FBSyxDQUFDLGtCQUFrQixDQUFDLHNCQUFzQjtZQUN2RSxZQUFZLEVBQUUsV0FBVztZQUN6QixTQUFTLEVBQUUsUUFBUTtTQUNwQjtLQUNGLENBQUE7SUFFRCxNQUFNLGlCQUFpQixHQUFHLHFDQUF3QixDQUFDLFNBQVMsQ0FBQztRQUMzRCxLQUFLLEVBQUUsQ0FBQyxhQUFhLENBQVE7S0FDOUIsQ0FBQyxDQUFBO0lBRUYsT0FBTyxJQUFJLGdDQUFnQixDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDbkQsQ0FBQyxDQUNGLENBQUEifQ==
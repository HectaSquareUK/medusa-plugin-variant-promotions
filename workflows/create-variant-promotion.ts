import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createPromotionsWorkflow } from "@medusajs/medusa/core-flows"
import { CreateVariantPromotionInput } from "../validators"

const RESOLVED_VARIANT_ATTRIBUTE = "items.variant.id"

export const createVariantPromotionWorkflow = createWorkflow(
  "create-variant-promotion-workflow",
  (input: CreateVariantPromotionInput) => {
    const isBuyGet = input.type === "buy_get"

    const targetRules =
      input.target_variant_ids && input.target_variant_ids.length > 0
        ? [
            {
              attribute: RESOLVED_VARIANT_ATTRIBUTE,
              operator: "in" as const,
              values: input.target_variant_ids,
            },
          ]
        : []

    const buyRules =
      isBuyGet && input.buy_variant_ids && input.buy_variant_ids.length > 0
        ? [
            {
              attribute: RESOLVED_VARIANT_ATTRIBUTE,
              operator: "in" as const,
              values: input.buy_variant_ids,
            },
          ]
        : []

    const rules = [
      ...(input.customer_group_ids && input.customer_group_ids.length > 0
        ? [
            {
              attribute: "customer_group_id",
              operator: "in" as const,
              values: input.customer_group_ids,
            },
          ]
        : []),
    ]

    const promotionData: any = {
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
    }

    const createdPromotions = createPromotionsWorkflow.runAsStep({
      input: [promotionData] as any,
    })

    return new WorkflowResponse(createdPromotions[0])
  }
)

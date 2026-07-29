import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { createPromotionsWorkflow } from "@medusajs/medusa/core-flows"
import { RESOLVED_VARIANT_ATTRIBUTE } from "../validators"

export type CreateVariantPromotionWorkflowInput = {
  code: string
  description?: string
  type?: "percentage_off_product" | "buy_x_get_y"
  currency_code?: string
  discount_kind?: "percentage" | "fixed"
  value: number
  allocation?: "each" | "across" | "once"
  max_quantity?: number
  status?: "active" | "draft"
  is_automatic?: boolean
  is_tax_inclusive?: boolean
  usage_limit?: number
  variant_ids: string[]
  customer_group_ids?: string[]
  region_ids?: string[]
  starts_at?: Date | string
  ends_at?: Date | string
  buy_variant_ids?: string[]
  buy_min_quantity?: number
  campaign_id?: string
}

export const buildPromotionPayloadStep = createStep(
  "build-variant-promotion-payload",
  async (input: CreateVariantPromotionWorkflowInput) => {
    const isBuyGet = input.type === "buy_x_get_y"
    const discountKind = input.discount_kind ?? "percentage"
    const allocation = input.allocation ?? "each"
    const currencyCode = (input.currency_code ?? "usd").toLowerCase()

    const targetRules = [
      {
        attribute: RESOLVED_VARIANT_ATTRIBUTE,
        operator: "in",
        values: input.variant_ids,
      },
    ]

    const applicationMethod: Record<string, unknown> = {
      type: discountKind,
      target_type: "items",
      allocation,
      value: input.value,
      target_rules: targetRules,
    }

    if (discountKind === "fixed") {
      applicationMethod.currency_code = currencyCode
    }

    if (typeof input.max_quantity === "number") {
      applicationMethod.max_quantity = input.max_quantity
    }

    if (isBuyGet) {
      applicationMethod.buy_rules_min_quantity = input.buy_min_quantity ?? 1
      applicationMethod.buy_rules = [
        {
          attribute: RESOLVED_VARIANT_ATTRIBUTE,
          operator: "in",
          values: input.buy_variant_ids ?? [],
        },
      ]
      applicationMethod.apply_to_quantity = 1
    }

    const rules: Array<{ attribute: string; operator: string; values: string[] }> = []

    if (input.customer_group_ids && input.customer_group_ids.length > 0) {
      rules.push({
        attribute: "customer.groups.id",
        operator: "in",
        values: input.customer_group_ids,
      })
    }

    if (input.region_ids && input.region_ids.length > 0) {
      rules.push({
        attribute: "region.id",
        operator: "in",
        values: input.region_ids,
      })
    }

    const payload: Record<string, unknown> = {
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
    }

    return new StepResponse(payload)
  }
)

export const createVariantPromotionWorkflow = createWorkflow(
  "create-variant-promotion",
  (input: CreateVariantPromotionWorkflowInput) => {
    const payload = buildPromotionPayloadStep(input)

    const promotions = createPromotionsWorkflow.runAsStep({
      input: {
        promotionsData: [payload as any],
      },
    })

    return new WorkflowResponse(promotions)
  }
)

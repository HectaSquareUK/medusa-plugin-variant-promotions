import {
  createWorkflow,
  createStep,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { createPromotionsWorkflow } from "@medusajs/medusa/core-flows"
import { RESOLVED_VARIANT_ATTRIBUTE } from "../validators"

export type CreateVariantPromotionWorkflowInput = {
  code: string
  description?: string
  type: "amount_off_products" | "percentage_off_product" | "buy_x_get_y"
  currency_code: string
  discount_kind: "percentage" | "fixed"
  value: number
  allocation?: "each" | "across" | "once"
  max_quantity?: number
  variant_ids: string[]
  buy_variant_ids?: string[]
  buy_min_quantity?: number
  apply_to_quantity?: number
  customer_group_ids?: string[]
  region_ids?: string[]
  starts_at?: Date
  ends_at?: Date
  campaign_id?: string
  is_automatic?: boolean
  status?: "active" | "draft"
  is_tax_inclusive?: boolean
  usage_limit?: number
}

const buildPromotionPayloadStep = createStep(
  "build-variant-promotion-payload",
  async (input: CreateVariantPromotionWorkflowInput) => {
    const isBuyGet = input.type === "buy_x_get_y"

    const rules: any[] = []
    if (input.customer_group_ids && input.customer_group_ids.length > 0) {
      rules.push({
        attribute: "customer.groups.id",
        operator: "in" as const,
        values: input.customer_group_ids,
      })
    }
    if (input.region_ids && input.region_ids.length > 0) {
      rules.push({
        attribute: "region.id",
        operator: "in" as const,
        values: input.region_ids,
      })
    }

    const alloc = input.allocation ?? "each"
    // When allocation is "once", enforce max_quantity: 1 so only 1 unit is discounted per cart
    const effectiveMaxQty = alloc === "once" ? 1 : (input.max_quantity ?? 100)

    const applicationMethod: Record<string, unknown> = {
      type: input.discount_kind,
      target_type: "items",
      allocation: alloc,
      max_quantity: effectiveMaxQty,
      value: input.value,
      currency_code: input.currency_code,
      target_rules: [
        {
          attribute: RESOLVED_VARIANT_ATTRIBUTE,
          operator: "in",
          values: input.variant_ids,
        },
      ],
    }

    if (isBuyGet) {
      applicationMethod.buy_rules_min_quantity = input.buy_min_quantity
      applicationMethod.apply_to_quantity = input.apply_to_quantity ?? 1
      ;(applicationMethod as any).buy_rules = [
        {
          attribute: RESOLVED_VARIANT_ATTRIBUTE,
          operator: "in",
          values: input.buy_variant_ids,
        },
      ]
    }

    const payload = {
      code: input.code.toUpperCase(),
      type: (isBuyGet ? "buyget" : "standard") as "buyget" | "standard",
      status: (input.status ?? "active") as "active" | "draft",
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

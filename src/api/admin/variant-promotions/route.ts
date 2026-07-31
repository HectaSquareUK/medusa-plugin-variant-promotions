import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/utils"
import {
  CreateVariantPromotionSchema,
  RESOLVED_VARIANT_ATTRIBUTE,
} from "../../../validators"
import {
  createVariantPromotionWorkflow,
  CreateVariantPromotionWorkflowInput,
} from "../../../workflows/create-variant-promotion"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = CreateVariantPromotionSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({
      error: "validation_error",
      message: "Request body failed validation",
      details: parsed.error.flatten(),
    })
  }

  const input = parsed.data as CreateVariantPromotionWorkflowInput

  const productModuleService = req.scope.resolve(Modules.PRODUCT)
  const allRequestedIds = Array.from(
    new Set([...input.variant_ids, ...(input.buy_variant_ids ?? [])])
  )
  const foundVariants = await productModuleService.listProductVariants({
    id: allRequestedIds,
  })
  const foundIds = new Set(foundVariants.map((v: any) => v.id))
  const missing = allRequestedIds.filter((id) => !foundIds.has(id))

  if (missing.length > 0) {
    return res.status(400).json({
      error: "invalid_variant_ids",
      message: "One or more variant_ids do not exist",
      missing_ids: missing,
    })
  }

  const promotionModuleService = req.scope.resolve(Modules.PROMOTION)
  const existing = await promotionModuleService.listPromotions({
    code: input.code.toUpperCase(),
  })
  if (existing.length > 0) {
    return res.status(409).json({
      error: "duplicate_code",
      message: `A promotion with code "${input.code.toUpperCase()}" already exists`,
    })
  }

  try {
    const { result } = await createVariantPromotionWorkflow(req.scope).run({
      input,
    })
    const promo = Array.isArray(result)
      ? result[0]
      : (result as any)?.promotions?.[0] ?? (result as any)?.promotion ?? result

    return res.status(201).json({
      promotion: promo,
      variant_count: input.variant_ids.length,
      resolved_attribute_used: RESOLVED_VARIANT_ATTRIBUTE,
    })
  } catch (error: any) {
    req.scope.resolve("logger").error(
      `Failed to create variant promotion: ${error?.message}`
    )
    return res.status(500).json({
      error: "workflow_error",
      message: error?.message ?? "Failed to create promotion",
    })
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve("query")

  const limit = Math.min(Number(req.query.limit ?? 20), 100)
  const offset = Math.max(Number(req.query.offset ?? 0), 0)

  const { data: promotions } = await query.graph({
    entity: "promotion",
    fields: [
      "id",
      "code",
      "status",
      "type",
      "is_automatic",
      "created_at",
      "application_method.type",
      "application_method.value",
      "application_method.currency_code",
      "application_method.target_rules.attribute",
      "application_method.target_rules.values.value",
      "application_method.buy_rules.attribute",
      "application_method.buy_rules.values.value",
    ],
    pagination: { skip: offset, take: limit },
  })

  const variantPromotions = (promotions as any[]).filter((p) => {
    const targetAttrs = (p.application_method?.target_rules ?? []).map(
      (r: any) => r.attribute
    )
    const buyAttrs = (p.application_method?.buy_rules ?? []).map(
      (r: any) => r.attribute
    )
    return (
      targetAttrs.includes(RESOLVED_VARIANT_ATTRIBUTE) ||
      buyAttrs.includes(RESOLVED_VARIANT_ATTRIBUTE)
    )
  })

  const productModuleService = req.scope.resolve(Modules.PRODUCT)
  const allVariantIds = Array.from(
    new Set(
      variantPromotions.flatMap((p) => {
        const targetRule = (p.application_method?.target_rules ?? []).find(
          (r: any) => r.attribute === RESOLVED_VARIANT_ATTRIBUTE
        )
        return (targetRule?.values ?? []).map((v: any) => v.value)
      })
    )
  )
  const variants =
    allVariantIds.length > 0
      ? await productModuleService.listProductVariants(
          { id: allVariantIds },
          { select: ["id", "title", "sku", "product_id"] }
        )
      : []
  const variantById = new Map(variants.map((v: any) => [v.id, v]))

  const allProductIds = Array.from(new Set(variants.map((v: any) => v.product_id).filter(Boolean)))
  const products =
    allProductIds.length > 0
      ? await productModuleService.listProducts(
          { id: allProductIds },
          { select: ["id", "title"] }
        )
      : []
  const productById = new Map(products.map((p: any) => [p.id, p]))

  const enriched = variantPromotions.map((p) => {
    const targetRule = (p.application_method?.target_rules ?? []).find(
      (r: any) => r.attribute === RESOLVED_VARIANT_ATTRIBUTE
    )
    const variantIds = (targetRule?.values ?? []).map((v: any) => v.value)
    const enrichedVariants = variantIds.map((id: string) => {
      const v = (variantById.get(id) ?? { id, product_id: undefined }) as any
      const product = (v.product_id ? productById.get(v.product_id) : undefined) as any
      return {
        ...v,
        product_title: product?.title ?? null,
      }
    })
    return {
      ...p,
      variants: enrichedVariants,
    }
  })

  return res.status(200).json({
    count: enriched.length,
    limit,
    offset,
    promotions: enriched,
  })
}

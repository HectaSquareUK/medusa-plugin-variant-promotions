import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createVariantPromotionWorkflow } from "../../../workflows/create-variant-promotion"
import { createVariantPromotionSchema } from "../../../validators"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const validated = createVariantPromotionSchema.parse(req.body)
    const { result } = await createVariantPromotionWorkflow(req.scope).run({
      input: validated,
    })
    return res.status(200).json({ promotion: result })
  } catch (error: any) {
    return res.status(400).json({
      message: error?.message || "Failed to create variant promotion",
      errors: error?.errors || undefined,
    })
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const query = req.scope.resolve("query")
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
    })

    const RESOLVED_VARIANT_ATTRIBUTE = "items.variant.id"

    const variantPromotions = (promotions ?? []).filter((p: any) => {
      const targetRules = p?.application_method?.target_rules ?? []
      const buyRules = p?.application_method?.buy_rules ?? []
      const hasTargetVariant = targetRules.some(
        (r: any) => r.attribute === RESOLVED_VARIANT_ATTRIBUTE
      )
      const hasBuyVariant = buyRules.some(
        (r: any) => r.attribute === RESOLVED_VARIANT_ATTRIBUTE
      )
      return hasTargetVariant || hasBuyVariant
    })

    const allVariantIds = new Set<string>()
    variantPromotions.forEach((p: any) => {
      const targetRules = p?.application_method?.target_rules ?? []
      const buyRules = p?.application_method?.buy_rules ?? []
      targetRules
        .filter((r: any) => r.attribute === RESOLVED_VARIANT_ATTRIBUTE)
        .forEach((r: any) =>
          (r.values ?? []).forEach((v: any) => allVariantIds.add(v.value))
        )
      buyRules
        .filter((r: any) => r.attribute === RESOLVED_VARIANT_ATTRIBUTE)
        .forEach((r: any) =>
          (r.values ?? []).forEach((v: any) => allVariantIds.add(v.value))
        )
    })

    const variantIdList = Array.from(allVariantIds)
    const variantById = new Map<string, any>()

    if (variantIdList.length > 0) {
      try {
        const { data: variants } = await query.graph({
          entity: "product_variant",
          fields: ["id", "title", "sku", "product_id", "product.id", "product.title"],
          filters: { id: variantIdList },
        })
        ;(variants ?? []).forEach((v: any) => variantById.set(v.id, v))
      } catch {
        // Fail gracefully
      }
    }

    const enrichedPromotions = variantPromotions.map((p: any) => {
      const targetRules = p?.application_method?.target_rules ?? []
      const buyRules = p?.application_method?.buy_rules ?? []

      const targetVariantIds: string[] = []
      targetRules
        .filter((r: any) => r.attribute === RESOLVED_VARIANT_ATTRIBUTE)
        .forEach((r: any) =>
          (r.values ?? []).forEach((v: any) => targetVariantIds.push(v.value))
        )

      const buyVariantIds: string[] = []
      buyRules
        .filter((r: any) => r.attribute === RESOLVED_VARIANT_ATTRIBUTE)
        .forEach((r: any) =>
          (r.values ?? []).forEach((v: any) => buyVariantIds.push(v.value))
        )

      const targetVariants = targetVariantIds.map((id) => {
        const v = variantById.get(id)
        return {
          id,
          title: v?.title ?? null,
          sku: v?.sku ?? null,
          product_id: v?.product_id ?? v?.product?.id ?? null,
          product_title: v?.product?.title ?? null,
        }
      })

      const buyVariants = buyVariantIds.map((id) => {
        const v = variantById.get(id)
        return {
          id,
          title: v?.title ?? null,
          sku: v?.sku ?? null,
          product_id: v?.product_id ?? v?.product?.id ?? null,
          product_title: v?.product?.title ?? null,
        }
      })

      return {
        ...p,
        target_variants: targetVariants,
        buy_variants: buyVariants,
      }
    })

    return res.status(200).json({ promotions: enrichedPromotions })
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message || "Failed to list variant promotions",
    })
  }
}

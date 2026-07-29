import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { PromotionActions } from "@medusajs/framework/utils"
import { updateCartPromotionsWorkflow } from "@medusajs/medusa/core-flows"
import { RESOLVED_VARIANT_ATTRIBUTE } from "../validators"

/**
 * Subscriber: Automatically applies active variant promotions flagged as `is_automatic: true`
 * whenever a cart is updated or created.
 */
export default async function autoVariantPromotionsHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const cartId = data?.id
  if (!cartId) return

  const query = container.resolve("query")
  const logger = container.resolve("logger")

  try {
    // 1. Fetch active automatic promotions that target variants
    const { data: promotions } = await query.graph({
      entity: "promotion",
      fields: [
        "id",
        "code",
        "is_automatic",
        "status",
        "application_method.target_rules.attribute",
        "application_method.target_rules.values.value",
      ],
      filters: {
        is_automatic: true,
        status: "active",
      },
    })

    const autoVariantPromos = (promotions as any[]).filter((p) => {
      const targetAttrs = (p.application_method?.target_rules ?? []).map(
        (r: any) => r.attribute
      )
      return targetAttrs.includes(RESOLVED_VARIANT_ATTRIBUTE)
    })

    if (autoVariantPromos.length === 0) return

    // 2. Fetch cart line items and existing promotions
    const { data: carts } = await query.graph({
      entity: "cart",
      fields: ["id", "items.variant_id", "promotions.code"],
      filters: { id: cartId },
    })

    const cart = carts[0] as any
    if (!cart || !cart.items || cart.items.length === 0) return

    const cartVariantIds = new Set<string>(
      cart.items.map((item: any) => item.variant_id).filter(Boolean)
    )

    // 3. Match cart variants against automatic promo target rules
    const matchingCodes: string[] = []
    for (const promo of autoVariantPromos) {
      const targetRule = (promo.application_method?.target_rules ?? []).find(
        (r: any) => r.attribute === RESOLVED_VARIANT_ATTRIBUTE
      )
      const targetedVariantIds = (targetRule?.values ?? []).map(
        (v: any) => v.value
      )

      const matches = targetedVariantIds.some((id: string) =>
        cartVariantIds.has(id)
      )

      if (matches && promo.code) {
        matchingCodes.push(promo.code)
      }
    }

    if (matchingCodes.length === 0) return

    // 4. Determine if new promo codes need to be applied
    const existingCodes: string[] = (cart.promotions ?? []).map(
      (p: any) => p.code
    )
    const missingCodes = matchingCodes.filter(
      (code) => !existingCodes.includes(code)
    )

    if (missingCodes.length === 0) return

    // 5. Apply the matching automatic codes via direct synchronous workflow execution
    await updateCartPromotionsWorkflow(container).run({
      input: {
        cart_id: cartId,
        promo_codes: missingCodes,
        action: PromotionActions.ADD,
      } as any,
    })

    logger.info(
      `Auto-applied variant promotion(s) [${missingCodes.join(", ")}] to cart ${cartId}`
    )
  } catch (err: any) {
    logger.warn(
      `autoVariantPromotionsHandler non-critical warning for cart ${cartId}: ${err?.message}`
    )
  }
}

export const config: SubscriberConfig = {
  event: ["cart.updated", "cart.created"],
}

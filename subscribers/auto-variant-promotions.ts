import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { updateCartPromotionsWorkflow } from "@medusajs/medusa/core-flows"

const RESOLVED_VARIANT_ATTRIBUTE = "items.variant.id"

export default async function autoVariantPromotionsHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const cartId = data?.id
  if (!cartId) return

  try {
    const query = container.resolve("query")

    const { data: carts } = await query.graph({
      entity: "cart",
      fields: ["id", "currency_code", "items.variant_id"],
      filters: { id: cartId },
    })

    const cart = carts?.[0]
    if (!cart || !cart.items || cart.items.length === 0) return

    const cartVariantIds = new Set(
      cart.items.map((item: any) => item.variant_id).filter(Boolean)
    )
    if (cartVariantIds.size === 0) return

    const { data: promotions } = await query.graph({
      entity: "promotion",
      fields: [
        "id",
        "code",
        "is_automatic",
        "status",
        "application_method.currency_code",
        "application_method.target_rules.attribute",
        "application_method.target_rules.values.value",
        "application_method.buy_rules.attribute",
        "application_method.buy_rules.values.value",
      ],
      filters: {
        is_automatic: true,
        status: "active",
      },
    })

    if (!promotions || promotions.length === 0) return

    const cartCurrency = cart.currency_code?.toLowerCase()

    const matchingPromoCodes = promotions
      .filter((promo: any) => {
        const promoCurrency = promo.application_method?.currency_code?.toLowerCase()
        if (promoCurrency && cartCurrency && promoCurrency !== cartCurrency) {
          return false
        }

        const targetRules = promo.application_method?.target_rules ?? []
        const buyRules = promo.application_method?.buy_rules ?? []

        const targetVariantIds = targetRules
          .filter((r: any) => r.attribute === RESOLVED_VARIANT_ATTRIBUTE)
          .flatMap((r: any) => (r.values ?? []).map((v: any) => v.value))

        const buyVariantIds = buyRules
          .filter((r: any) => r.attribute === RESOLVED_VARIANT_ATTRIBUTE)
          .flatMap((r: any) => (r.values ?? []).map((v: any) => v.value))

        const allVariantIds = [...targetVariantIds, ...buyVariantIds]
        if (allVariantIds.length === 0) return false

        return allVariantIds.some((id) => cartVariantIds.has(id))
      })
      .map((promo: any) => promo.code)
      .filter(Boolean)

    if (matchingPromoCodes.length === 0) return

    await updateCartPromotionsWorkflow(container).run({
      input: {
        cart_id: cartId,
        promo_codes: matchingPromoCodes,
        action: "add",
      },
    })
  } catch (error) {
    console.error(`[AutoVariantPromotions] Failed for cart ${cartId}:`, error)
  }
}

export const config: SubscriberConfig = {
  event: ["cart.created", "cart.updated"],
}

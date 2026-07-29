import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Text, Button } from "@medusajs/ui"
import { Tag } from "@medusajs/icons"

const navigate = (path: string) => {
  if (typeof window !== "undefined") {
    const target = path.startsWith("/app")
      ? path
      : `/app${path.startsWith("/") ? path : "/" + path}`
    window.location.href = target
  }
}

/**
 * Injected at `promotion.list.after`. Discoverability CTA nudge —
 * points directly to the dedicated variant promotion creation wizard.
 */
export const PromotionListCtaWidget = () => {
  return (
    <Container className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-x-3">
        <Tag className="text-ui-fg-muted" />
        <div>
          <Text weight="plus" size="small">
            Need to discount specific variants instead of whole products?
          </Text>
          <Text size="small" className="text-ui-fg-subtle">
            Use Variant Promotions to target hand-picked variants across
            any products.
          </Text>
        </div>
      </div>
      <Button
        variant="secondary"
        size="small"
        onClick={() => navigate("/variant-promotions/create")}
      >
        Create variant promotion
      </Button>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "promotion.list.after",
})

export default PromotionListCtaWidget

import { VariantPromotionsListPage } from "../../src/components/list-page"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Tag } from "@medusajs/icons"

export const config = defineRouteConfig({
  label: "Variant Promotions",
  icon: Tag,
})

export default VariantPromotionsListPage

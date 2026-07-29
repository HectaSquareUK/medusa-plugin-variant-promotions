import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, AdminPromotion } from "@medusajs/framework/types"
import { useQuery } from "@tanstack/react-query"
import { Container, Heading, Text, Badge, Table } from "@medusajs/ui"

const RESOLVED_VARIANT_ATTRIBUTE = "items.variant.id"

type ProductVariantWithParent = {
  id: string
  title?: string
  sku?: string
  product_id?: string
  product?: {
    id: string
    title: string
    thumbnail?: string
  }
}

export function PromotionVariantDetailWidget({
  data: promotion,
}: DetailWidgetProps<AdminPromotion>) {
  const targetRule = (promotion?.application_method?.target_rules ?? []).find(
    (r: any) => r.attribute === RESOLVED_VARIANT_ATTRIBUTE
  )
  const buyRule = (promotion?.application_method?.buy_rules ?? []).find(
    (r: any) => r.attribute === RESOLVED_VARIANT_ATTRIBUTE
  )

  const activeRule = targetRule ?? buyRule
  const ids: string[] = (activeRule?.values ?? []).map((v: any) => v.value)

  const { data: variants, isLoading } = useQuery({
    queryKey: ["promotion-variant-detail", ids.join(",")],
    queryFn: async () => {
      if (ids.length === 0) return []
      const params = new URLSearchParams()
      ids.forEach((id) => params.append("id[]", id))
      params.set(
        "fields",
        "id,title,sku,product_id,product.id,product.title,product.thumbnail"
      )

      const res = await fetch(`/admin/product-variants?${params.toString()}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })
      if (!res.ok) return []
      const json = await res.json()
      return (json.variants ?? []) as ProductVariantWithParent[]
    },
    enabled: ids.length > 0,
  })

  if (!activeRule || ids.length === 0) {
    return null
  }

  const variantById = new Map((variants ?? []).map((v: any) => [v.id, v]))

  return (
    <Container className="p-0 divide-y">
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <Heading level="h2" className="text-base font-semibold">
            Targeted Variants ({ids.length})
          </Heading>
          <Text size="small" className="text-ui-fg-subtle">
            This promotion is scoped to specific product variants.
          </Text>
        </div>
        <Badge color="blue" size="small">
          {targetRule ? "Targeted Items" : "Trigger Items"}
        </Badge>
      </div>

      <div className="px-6 py-4">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Product</Table.HeaderCell>
              <Table.HeaderCell>Variant Title</Table.HeaderCell>
              <Table.HeaderCell>SKU</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {isLoading && (
              <Table.Row>
                <Table.Cell {...({ colSpan: 3 } as any)}>
                  <Text size="small" className="text-ui-fg-subtle py-2 block text-center">
                    Loading variants…
                  </Text>
                </Table.Cell>
              </Table.Row>
            )}
            {!isLoading &&
              ids.map((id) => {
                const v = (variantById.get(id) ?? {}) as any
                const productId = v?.product?.id ?? v?.product_id
                const productTitle = v?.product?.title ?? "Product"
                const thumbnail = v?.product?.thumbnail

                return (
                  <Table.Row key={id}>
                    <Table.Cell>
                      {productId ? (
                        <a
                          href={`/app/products/${productId}`}
                          className="flex items-center gap-x-2 text-ui-fg-interactive hover:underline font-medium text-sm"
                        >
                          {thumbnail && (
                            <img
                              src={thumbnail}
                              alt=""
                              className="w-6 h-6 rounded object-cover border"
                            />
                          )}
                          <span>{productTitle}</span>
                        </a>
                      ) : (
                        <Text size="small" className="text-ui-fg-subtle">
                          {id}
                        </Text>
                      )}
                    </Table.Cell>

                    <Table.Cell>
                      {productId ? (
                        <a
                          href={`/app/products/${productId}/variants/${id}`}
                          className="text-ui-fg-interactive hover:underline font-medium text-sm"
                        >
                          {v?.title ?? "—"}
                        </a>
                      ) : (
                        <Text size="small">{v?.title ?? "—"}</Text>
                      )}
                    </Table.Cell>

                    <Table.Cell>
                      <Text size="small" className="font-mono text-ui-fg-subtle">
                        {v?.sku ?? "—"}
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                )
              })}
          </Table.Body>
        </Table>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "promotion.details.after",
})

export default PromotionVariantDetailWidget

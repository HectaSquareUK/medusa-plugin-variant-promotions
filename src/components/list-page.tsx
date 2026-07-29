import { useQuery } from "@tanstack/react-query"
import {
  Container,
  Heading,
  Text,
  Button,
  Badge,
  Table,
} from "@medusajs/ui"
import { Tag, Plus, ArrowUpRightOnBox } from "@medusajs/icons"

const nav = (path: string) => {
  if (typeof window !== "undefined") {
    window.location.href = path.startsWith("/app") ? path : `/app${path}`
  }
}

export function VariantPromotionsListPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["variant-promotions-list-page"],
    queryFn: async () => {
      const res = await fetch("/admin/variant-promotions", {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })
      if (!res.ok) throw new Error("Failed to fetch variant promotions")
      return res.json()
    },
  })

  const promotions = data?.promotions ?? []

  return (
    <Container className="p-0 divide-y">
      {/* Header Bar */}
      <div className="px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-x-3">
          <div className="w-10 h-10 rounded-lg bg-ui-bg-component border flex items-center justify-center text-ui-fg-subtle">
            <Tag />
          </div>
          <div>
            <Heading level="h1" className="text-xl font-semibold">
              Variant Promotions
            </Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Manage promotions targeting specific variants across your product catalog.
            </Text>
          </div>
        </div>

        <Button
          variant="primary"
          size="small"
          onClick={() => nav("/variant-promotions/create")}
          className="flex items-center gap-x-2"
        >
          <Plus />
          Create variant promotion
        </Button>
      </div>

      {/* Main Content Table */}
      <div className="px-6 py-6">
        {isError && (
          <Text size="small" className="text-ui-fg-error py-4">
            Failed to load variant promotions. Please refresh the page.
          </Text>
        )}

        <div className="border rounded-xl overflow-hidden">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Promotion Code</Table.HeaderCell>
                <Table.HeaderCell>Method & Value</Table.HeaderCell>
                <Table.HeaderCell>Product</Table.HeaderCell>
                <Table.HeaderCell>Targeted Variant(s)</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell className="text-right">Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {isLoading && (
                <Table.Row>
                  <Table.Cell {...({ colSpan: 6 } as any)}>
                    <Text size="small" className="text-ui-fg-subtle py-8 text-center block">
                      Loading variant promotions…
                    </Text>
                  </Table.Cell>
                </Table.Row>
              )}

              {!isLoading && promotions.length === 0 && (
                <Table.Row>
                  <Table.Cell {...({ colSpan: 6 } as any)}>
                    <div className="py-12 flex flex-col items-center justify-center text-center gap-y-3">
                      <Tag className="w-8 h-8 text-ui-fg-muted" />
                      <div>
                        <Text size="small" weight="plus">
                          No variant promotions created yet
                        </Text>
                        <Text size="small" className="text-ui-fg-subtle max-w-sm">
                          Create promotions that discount hand-picked variants instead of whole products or categories.
                        </Text>
                      </div>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => nav("/variant-promotions/create")}
                      >
                        Create your first variant promotion
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              )}

              {!isLoading &&
                promotions.map((p: any) => {
                  const methodType = p.application_method?.type
                  const methodValue = p.application_method?.value
                  const currency = (p.application_method?.currency_code ?? "").toUpperCase()
                  const isAutomatic = p.is_automatic
                  const variants: any[] = p.variants ?? []

                  const uniqueProducts = Array.from(
                    new Map(
                      variants
                        .filter((v) => v.product_id)
                        .map((v) => [v.product_id, { id: v.product_id, title: v.product_title }])
                    ).values()
                  )

                  return (
                    <Table.Row key={p.id} className="hover:bg-ui-bg-subtle-hover">
                      <Table.Cell>
                        <Text size="small" weight="plus" className="font-mono">
                          {p.code}
                        </Text>
                      </Table.Cell>

                      <Table.Cell>
                        <div className="flex items-center gap-x-2 flex-wrap">
                          <Badge size="xsmall" color={isAutomatic ? "purple" : "blue"}>
                            {isAutomatic ? "Automatic" : "Code"}
                          </Badge>
                          <Text size="small" weight="plus">
                            {methodType === "percentage"
                              ? `${methodValue}% off`
                              : `${methodValue} ${currency} off`}
                          </Text>
                        </div>
                      </Table.Cell>

                      <Table.Cell>
                        <div className="flex flex-col gap-y-1">
                          {uniqueProducts.length > 0 ? (
                            uniqueProducts.map((prod) => (
                              <button
                                key={prod.id}
                                onClick={() => nav(`/products/${prod.id}`)}
                                className="text-ui-fg-interactive text-xs font-medium hover:underline text-left truncate max-w-[160px]"
                                title={prod.title ?? prod.id}
                              >
                                {prod.title ?? prod.id}
                              </button>
                            ))
                          ) : (
                            <Text size="small" className="text-ui-fg-subtle">—</Text>
                          )}
                        </div>
                      </Table.Cell>

                      <Table.Cell>
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {variants.length > 0 ? (
                            variants.slice(0, 4).map((v: any) => (
                              <button
                                key={v.id}
                                onClick={() =>
                                  v.product_id
                                    ? nav(`/products/${v.product_id}/variants/${v.id}`)
                                    : undefined
                                }
                                className="inline-flex items-center gap-x-1 text-xs font-medium rounded px-1.5 py-0.5 bg-ui-bg-component border border-ui-border-base text-ui-fg-base hover:bg-ui-bg-component-hover hover:text-ui-fg-interactive cursor-pointer transition-colors"
                                title={v.sku ? `SKU: ${v.sku}` : v.id}
                              >
                                {v.title ?? v.sku ?? v.id}
                                {v.product_id && (
                                  <ArrowUpRightOnBox className="w-3 h-3 text-ui-fg-muted" />
                                )}
                              </button>
                            ))
                          ) : (
                            <Text size="small" className="text-ui-fg-subtle">
                              No variants attached
                            </Text>
                          )}
                          {variants.length > 4 && (
                            <span className="text-xs text-ui-fg-subtle px-1.5 py-0.5">
                              +{variants.length - 4} more
                            </span>
                          )}
                        </div>
                      </Table.Cell>

                      <Table.Cell>
                        <Badge
                          size="xsmall"
                          color={p.status === "active" ? "green" : "orange"}
                        >
                          {p.status === "active" ? "Active" : "Draft"}
                        </Badge>
                      </Table.Cell>

                      <Table.Cell className="text-right">
                        <Button
                          variant="transparent"
                          size="small"
                          onClick={() => nav(`/promotions/${p.id}`)}
                          className="inline-flex items-center gap-x-1 text-ui-fg-interactive hover:underline"
                        >
                          <span>View Detail</span>
                          <ArrowUpRightOnBox className="w-3.5 h-3.5" />
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  )
                })}
            </Table.Body>
          </Table>
        </div>
      </div>
    </Container>
  )
}

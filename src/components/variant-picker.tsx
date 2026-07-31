import { useState, useMemo, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Badge, Input, Text, Checkbox, Table } from "@medusajs/ui"
import { MagnifyingGlass } from "@medusajs/icons"

type VariantRow = {
  id: string
  title: string
  sku: string | null
  product_id: string
  product_title: string
  thumbnail?: string | null
  calculated_price?: { calculated_amount: number; currency_code: string } | null
}

type VariantPickerProps = {
  selected: string[]
  onChange: (variantIds: string[]) => void
  disabledIds?: string[]
  currencyCode?: string
}

export function VariantPicker({
  selected,
  onChange,
  disabledIds = [],
  currencyCode = "usd",
}: VariantPickerProps) {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading, isError } = useQuery({
    queryKey: ["variant-picker-search", debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (debouncedSearch) {
        params.append("q", debouncedSearch)
      }
      params.append("limit", "50")

      const res = await fetch(`/admin/product-variants?${params.toString()}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })

      if (!res.ok) {
        throw new Error("Failed to fetch product variants")
      }

      const json = await res.json()
      const variants = json.variants ?? []

      return variants.map((v: any) => ({
        id: v.id,
        title: v.title,
        sku: v.sku,
        product_id: v.product?.id ?? v.product_id,
        product_title: v.product?.title ?? "Product",
        thumbnail: v.product?.thumbnail,
        calculated_price: v.calculated_price ?? null,
      })) as VariantRow[]
    },
  })

  const selectedSet = useMemo(() => new Set(selected), [selected])

  const toggle = (variantId: string) => {
    if (selectedSet.has(variantId)) {
      onChange(selected.filter((id) => id !== variantId))
    } else {
      onChange([...selected, variantId])
    }
  }

  return (
    <div className="flex flex-col gap-y-4">
      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-ui-fg-muted" />
        <Input
          className="pl-9"
          placeholder="Search by product title or SKU across all products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {selected.length > 0 && (
        <div className="flex items-center gap-x-2">
          <Text size="small" weight="plus">
            {selected.length} variant{selected.length !== 1 ? "s" : ""} selected
          </Text>
        </div>
      )}

      {isError && (
        <Text size="small" className="text-ui-fg-error">
          Couldn't load variants. Check your network connection and try again.
        </Text>
      )}

      <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell className="w-12" />
              <Table.HeaderCell>Product</Table.HeaderCell>
              <Table.HeaderCell>Variant</Table.HeaderCell>
              <Table.HeaderCell>SKU</Table.HeaderCell>
              <Table.HeaderCell className="text-right">Price</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {isLoading && (
              <Table.Row>
                <Table.Cell {...({ colSpan: 5 } as any)}>
                  <Text size="small" className="text-ui-fg-subtle py-4">
                    Loading variants…
                  </Text>
                </Table.Cell>
              </Table.Row>
            )}
            {!isLoading && data?.length === 0 && (
              <Table.Row>
                <Table.Cell {...({ colSpan: 5 } as any)}>
                  <Text size="small" className="text-ui-fg-subtle py-4">
                    No variants match "{debouncedSearch}"
                  </Text>
                </Table.Cell>
              </Table.Row>
            )}
            {data?.map((row) => {
              const isDisabledFlag = disabledIds.includes(row.id)
              return (
                <Table.Row
                  key={row.id}
                  className="cursor-pointer hover:bg-ui-bg-subtle-hover"
                  onClick={() => toggle(row.id)}
                >
                  <Table.Cell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedSet.has(row.id)}
                      onCheckedChange={() => toggle(row.id)}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-x-2">
                      {row.thumbnail && (
                        <img
                          src={row.thumbnail}
                          alt=""
                          className="w-6 h-6 rounded object-cover"
                        />
                      )}
                      <Text size="small">{row.product_title}</Text>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="small">{row.title}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="small" className="text-ui-fg-subtle font-mono">
                      {row.sku ?? "—"}
                    </Text>
                  </Table.Cell>
                  <Table.Cell className="text-right">
                    <div className="flex items-center justify-end gap-x-2">
                      {row.calculated_price && (
                        <Text size="small">
                          {(
                            row.calculated_price.calculated_amount / 100
                          ).toLocaleString(undefined, {
                            style: "currency",
                            currency: row.calculated_price.currency_code,
                          })}
                        </Text>
                      )}
                      {isDisabledFlag && (
                        <Badge size="xsmall" color="orange">
                          on another promo
                        </Badge>
                      )}
                    </div>
                  </Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table>
      </div>
    </div>
  )
}

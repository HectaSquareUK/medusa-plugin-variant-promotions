import { useState, useEffect } from "react"
import { Input, Badge, Button, Text } from "@medusajs/ui"
import { Plus, XCircle } from "@medusajs/icons"

type VariantSummary = {
  id: string
  title: string
  sku?: string
  product_id?: string
}

type VariantPickerProps = {
  selected: string[]
  onChange: (ids: string[]) => void
  label?: string
}

export function VariantPicker({
  selected,
  onChange,
  label = "Select variants to discount",
}: VariantPickerProps) {
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [results, setResults] = useState<VariantSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDetails, setSelectedDetails] = useState<
    Record<string, VariantSummary>
  >({})

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => clearTimeout(handler)
  }, [query])

  useEffect(() => {
    let active = true
    setLoading(true)

    const params = new URLSearchParams()
    if (debouncedQuery.trim()) {
      params.set("q", debouncedQuery.trim())
    }
    params.set("limit", "50")

    fetch(`/admin/product-variants?${params.toString()}`, {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) return { variants: [] }
        return res.json()
      })
      .then((data) => {
        if (!active) return
        const list = (data.variants ?? []) as VariantSummary[]
        setResults(list)
        setLoading(false)

        setSelectedDetails((prev) => {
          const next = { ...prev }
          for (const v of list) {
            if (selected.includes(v.id)) {
              next[v.id] = v
            }
          }
          return next
        })
      })
      .catch(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [debouncedQuery])

  const toggleSelect = (variant: VariantSummary) => {
    if (selected.includes(variant.id)) {
      onChange(selected.filter((id) => id !== variant.id))
    } else {
      onChange([...selected, variant.id])
      setSelectedDetails((prev) => ({ ...prev, [variant.id]: variant }))
    }
  }

  const removeId = (id: string) => {
    onChange(selected.filter((i) => i !== id))
  }

  return (
    <div className="flex flex-col gap-y-3">
      {label && <Text className="font-medium text-sm">{label}</Text>}

      <Input
        placeholder="Search variants by title, SKU, or option..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* Selected variants badges */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-ui-bg-subtle rounded-md border">
          {selected.map((id) => {
            const v = selectedDetails[id]
            const title = v?.title ? `${v.title}` : id
            const sku = v?.sku ? ` (${v.sku})` : ""
            return (
              <Badge
                key={id}
                color="blue"
                className="flex items-center gap-x-1 font-mono text-xs"
              >
                <span>
                  {title}
                  {sku}
                </span>
                <button
                  type="button"
                  onClick={() => removeId(id)}
                  className="hover:text-ui-fg-error"
                >
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              </Badge>
            )
          })}
        </div>
      )}

      {/* Results list */}
      <div className="border rounded-md max-h-60 overflow-y-auto divide-y">
        {loading && (
          <div className="p-3 text-xs text-ui-fg-subtle text-center">
            Searching variants...
          </div>
        )}

        {!loading && results.length === 0 && (
          <div className="p-3 text-xs text-ui-fg-subtle text-center">
            No variants found matching "{query}"
          </div>
        )}

        {!loading &&
          results.map((v) => {
            const isSelected = selected.includes(v.id)
            return (
              <div
                key={v.id}
                className="flex items-center justify-between p-2.5 hover:bg-ui-bg-subtle text-xs"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{v.title}</span>
                  {v.sku && (
                    <span className="text-ui-fg-subtle font-mono text-[10px]">
                      SKU: {v.sku}
                    </span>
                  )}
                </div>
                <Button
                  size="small"
                  variant={isSelected ? "secondary" : "transparent"}
                  onClick={() => toggleSelect(v)}
                  className="flex items-center gap-x-1"
                >
                  {isSelected ? (
                    "Selected"
                  ) : (
                    <>
                      <Plus className="w-3 h-3" /> Select
                    </>
                  )}
                </Button>
              </div>
            )
          })}
      </div>
    </div>
  )
}

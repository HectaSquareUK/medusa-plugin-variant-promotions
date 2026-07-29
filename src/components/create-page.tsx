import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Container,
  Heading,
  Text,
  Input,
  Label,
  Button,
  Select,
  Checkbox,
  toast,
} from "@medusajs/ui"
import { VariantPicker } from "./variant-picker"

const nav = (path: string) => {
  if (typeof window !== "undefined") {
    window.location.href = path.startsWith("/app") ? path : `/app${path}`
  }
}

type Step = "type" | "variants" | "value" | "review"

export function CreateVariantPromotionPage() {
  const [step, setStep] = useState<Step>("type")
  const [promoType, setPromoType] = useState<"percentage_off_product" | "buy_x_get_y">(
    "percentage_off_product"
  )
  const isBuyGet = promoType === "buy_x_get_y"

  const [method, setMethod] = useState<"code" | "automatic">("code")
  const isAutomatic = method === "automatic"

  const [status, setStatus] = useState<"active" | "draft">("active")
  const [code, setCode] = useState<string>("")

  const [discountKind, setDiscountKind] = useState<"percentage" | "fixed">("percentage")
  const [value, setValue] = useState<number>(10)
  const [currencyCode, setCurrencyCode] = useState<string>("usd")
  const [allocation, setAllocation] = useState<"each" | "across" | "once">("each")
  const [maxQuantity, setMaxQuantity] = useState<number>(100)

  const [isTaxInclusive, setIsTaxInclusive] = useState<boolean>(false)
  const [usageLimit, setUsageLimit] = useState<number | undefined>(undefined)

  const [variantIds, setVariantIds] = useState<string[]>([])
  const [buyVariantIds, setBuyVariantIds] = useState<string[]>([])
  const [buyMinQuantity, setBuyMinQuantity] = useState<number>(1)
  const [applyToQuantity, setApplyToQuantity] = useState<number>(1)

  const [selectedCustomerGroupIds, setSelectedCustomerGroupIds] = useState<string[]>([])
  const [selectedRegionIds, setSelectedRegionIds] = useState<string[]>([])
  const [startsAt, setStartsAt] = useState<string>("")
  const [endsAt, setEndsAt] = useState<string>("")

  const { data: customerGroups } = useQuery({
    queryKey: ["customer-groups-variant-promotions"],
    queryFn: async () => {
      const res = await fetch("/admin/customer-groups?limit=50", {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })
      if (!res.ok) return []
      const json = await res.json()
      return (json.customer_groups ?? []) as Array<{ id: string; name: string }>
    },
  })

  const { data: regions } = useQuery({
    queryKey: ["regions-variant-promotions"],
    queryFn: async () => {
      const res = await fetch("/admin/regions?limit=50", {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })
      if (!res.ok) return []
      const json = await res.json()
      return (json.regions ?? []) as Array<{ id: string; name: string; currency_code: string }>
    },
  })

  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const toggleCustomerGroup = (id: string) => {
    setSelectedCustomerGroupIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleRegion = (id: string) => {
    setSelectedRegionIds((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      if (next.length > 0 && regions) {
        const firstSelectedRegion = regions.find((r) => r.id === next[0])
        if (firstSelectedRegion) {
          setCurrencyCode(firstSelectedRegion.currency_code.toLowerCase())
        }
      }
      return next
    })
  }

  const canProceedFromType = true
  const canProceedFromVariants =
    variantIds.length > 0 && (!isBuyGet || buyVariantIds.length > 0)
  const canProceedFromValue =
    code.trim().length >= 3 && value > 0 && (!isBuyGet || buyMinQuantity > 0)

  const goNext = () => {
    setServerError(null)
    if (step === "type") setStep("variants")
    else if (step === "variants") setStep("value")
    else if (step === "value") setStep("review")
  }

  const goBack = () => {
    setServerError(null)
    if (step === "review") setStep("value")
    else if (step === "value") setStep("variants")
    else if (step === "variants") setStep("type")
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setServerError(null)

    const payload: Record<string, unknown> = {
      code: code.trim(),
      type: promoType,
      method,
      is_automatic: isAutomatic,
      status,
      discount_kind: discountKind,
      value: Number(value),
      currency_code: currencyCode.toLowerCase(),
      allocation,
      max_quantity: maxQuantity ? Number(maxQuantity) : undefined,
      is_tax_inclusive: isTaxInclusive,
      usage_limit: usageLimit ? Number(usageLimit) : undefined,
      variant_ids: variantIds,
      customer_group_ids: selectedCustomerGroupIds.length > 0 ? selectedCustomerGroupIds : undefined,
      region_ids: selectedRegionIds.length > 0 ? selectedRegionIds : undefined,
      starts_at: startsAt ? new Date(startsAt).toISOString() : undefined,
      ends_at: endsAt ? new Date(endsAt).toISOString() : undefined,
    }

    if (isBuyGet) {
      payload.buy_variant_ids = buyVariantIds
      payload.buy_min_quantity = Number(buyMinQuantity)
    }

    try {
      const res = await fetch("/admin/variant-promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.message ?? "Failed to create promotion")
      }

      toast.success("Variant Promotion Created", {
        description: `Code ${code.toUpperCase()} successfully created!`,
      })
      nav("/variant-promotions")
    } catch (err: any) {
      setServerError(err.message ?? "Error creating promotion")
      toast.error("Error", { description: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Container className="p-0 divide-y">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <Heading level="h1" className="text-xl font-semibold">
            Create Variant Promotion
          </Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Step {step === "type" ? "1" : step === "variants" ? "2" : step === "value" ? "3" : "4"} of 4
          </Text>
        </div>
        <StepIndicator current={step} />
      </div>

      {step === "type" && (
        <div className="px-6 py-6 flex flex-col gap-y-4 max-w-lg">
          <Text className="font-medium text-sm">Select Promotion Type</Text>
          <div
            onClick={() => setPromoType("percentage_off_product")}
            className={[
              "p-4 border rounded-lg cursor-pointer flex flex-col gap-y-1 transition-colors",
              promoType === "percentage_off_product"
                ? "border-ui-border-interactive bg-ui-bg-subtle"
                : "hover:bg-ui-bg-subtle-hover",
            ].join(" ")}
          >
            <Text weight="plus" size="small">
              Discount Specific Variants
            </Text>
            <Text size="small" className="text-ui-fg-subtle">
              Apply a percentage or fixed amount discount to hand-picked product variants.
            </Text>
          </div>

          <div
            onClick={() => setPromoType("buy_x_get_y")}
            className={[
              "p-4 border rounded-lg cursor-pointer flex flex-col gap-y-1 transition-colors",
              promoType === "buy_x_get_y"
                ? "border-ui-border-interactive bg-ui-bg-subtle"
                : "hover:bg-ui-bg-subtle-hover",
            ].join(" ")}
          >
            <Text weight="plus" size="small">
              Buy X Get Y (Variant Level)
            </Text>
            <Text size="small" className="text-ui-fg-subtle">
              Customer buys specific trigger variants to get selected target variants at a discount.
            </Text>
          </div>
        </div>
      )}

      {step === "variants" && (
        <div className="px-6 py-6 flex flex-col gap-y-6 max-w-xl">
          {isBuyGet && (
            <VariantPicker
              label="1. Select 'Buy' Trigger Variants (What customer buys)"
              selected={buyVariantIds}
              onChange={setBuyVariantIds}
            />
          )}

          <VariantPicker
            label={
              isBuyGet
                ? "2. Select 'Get' Target Variants (What customer receives at discount)"
                : "Select Target Variants to Discount"
            }
            selected={variantIds}
            onChange={setVariantIds}
          />
        </div>
      )}

      {step === "value" && (
        <div className="px-6 py-6 flex flex-col gap-y-6 max-w-xl">
          {/* Method & Status */}
          <div className="flex gap-x-4">
            <div className="flex flex-col gap-y-2 flex-1">
              <Label htmlFor="method">Method</Label>
              <Select value={method} onValueChange={(v: any) => setMethod(v)}>
                <Select.Trigger id="method">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="code">Promotion Code</Select.Item>
                  <Select.Item value="automatic">Automatic</Select.Item>
                </Select.Content>
              </Select>
            </div>

            <div className="flex flex-col gap-y-2 flex-1">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                <Select.Trigger id="status">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="active">Active</Select.Item>
                  <Select.Item value="draft">Draft</Select.Item>
                </Select.Content>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-y-2">
            <Label htmlFor="code">Promotion Code *</Label>
            <Input
              id="code"
              placeholder="e.g. VARIANT20"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
          </div>

          {/* Discount Value */}
          <div className="flex gap-x-4">
            <div className="flex flex-col gap-y-2 flex-1">
              <Label htmlFor="kind">Discount Type</Label>
              <Select value={discountKind} onValueChange={(v: any) => setDiscountKind(v)}>
                <Select.Trigger id="kind">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="percentage">Percentage (%)</Select.Item>
                  <Select.Item value="fixed">Fixed Amount</Select.Item>
                </Select.Content>
              </Select>
            </div>

            <div className="flex flex-col gap-y-2 flex-1">
              <Label htmlFor="value">
                {discountKind === "percentage" ? "Percentage Off (%)" : `Amount Off (${currencyCode.toUpperCase()})`}
              </Label>
              <Input
                id="value"
                type="number"
                min={1}
                max={discountKind === "percentage" ? 100 : undefined}
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex gap-x-4">
            <div className="flex flex-col gap-y-2 flex-1">
              <Label htmlFor="allocation">Allocation</Label>
              <Select value={allocation} onValueChange={(v: any) => setAllocation(v)}>
                <Select.Trigger id="allocation">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="each">Apply to each item</Select.Item>
                  <Select.Item value="across">Split across items</Select.Item>
                  <Select.Item value="once">Apply once per cart</Select.Item>
                </Select.Content>
              </Select>
            </div>

            <div className="flex flex-col gap-y-2 flex-1">
              <Label htmlFor="max_quantity">Max Quantity per Cart</Label>
              <Input
                id="max_quantity"
                type="number"
                min={1}
                value={maxQuantity}
                onChange={(e) => setMaxQuantity(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex flex-col gap-y-2 border-t pt-4">
            <label className="flex items-center gap-x-2 cursor-pointer text-sm font-medium">
              <Checkbox
                checked={isTaxInclusive}
                onCheckedChange={(checked) => setIsTaxInclusive(Boolean(checked))}
              />
              <span>Tax Inclusive (Price includes tax)</span>
            </label>
          </div>

          <div className="flex flex-col gap-y-2 border-t pt-4">
            <Label htmlFor="usage_limit">Global Usage Limit (Optional)</Label>
            <Input
              id="usage_limit"
              type="number"
              min={1}
              placeholder="e.g. 50 (Leave blank for unlimited)"
              value={usageLimit ?? ""}
              onChange={(e) => setUsageLimit(e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>

          {/* Regions */}
          <div className="flex flex-col gap-y-2 border-t pt-4">
            <Label>Target Regions</Label>
            <Text size="small" className="text-ui-fg-subtle mb-2">
              Leave unselected to apply across all regions, or select specific regions.
            </Text>
            {regions && regions.length > 0 ? (
              <div className="flex flex-col gap-y-2 max-h-36 overflow-y-auto border rounded-md p-3">
                {regions.map((reg) => (
                  <label key={reg.id} className="flex items-center gap-x-2 cursor-pointer text-sm">
                    <Checkbox
                      checked={selectedRegionIds.includes(reg.id)}
                      onCheckedChange={() => toggleRegion(reg.id)}
                    />
                    <span>
                      {reg.name} ({reg.currency_code.toUpperCase()})
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <Text size="small" className="text-ui-fg-subtle italic">
                No regions configured — applies across all regions.
              </Text>
            )}
          </div>

          {/* Who can use this code */}
          <div className="flex flex-col gap-y-2 border-t pt-4">
            <Label>Who can use this code? (Customer Groups)</Label>
            {customerGroups && customerGroups.length > 0 ? (
              <div className="flex flex-col gap-y-2 max-h-36 overflow-y-auto border rounded-md p-3">
                {customerGroups.map((group) => (
                  <label key={group.id} className="flex items-center gap-x-2 cursor-pointer text-sm">
                    <Checkbox
                      checked={selectedCustomerGroupIds.includes(group.id)}
                      onCheckedChange={() => toggleCustomerGroup(group.id)}
                    />
                    <span>{group.name}</span>
                  </label>
                ))}
              </div>
            ) : (
              <Text size="small" className="text-ui-fg-subtle italic">
                No customer groups configured — applies to all customers.
              </Text>
            )}
          </div>
        </div>
      )}

      {step === "review" && (
        <div className="px-6 py-6 flex flex-col gap-y-4 max-w-lg">
          <ReviewRow label="Method" value={isAutomatic ? "Automatic" : "Promotion Code"} />
          <ReviewRow label="Status" value={status.charAt(0).toUpperCase() + status.slice(1)} />
          <ReviewRow label="Code" value={code.toUpperCase()} />
          <ReviewRow
            label="Discount"
            value={
              discountKind === "percentage"
                ? `${value}% off`
                : `${value} ${currencyCode.toUpperCase()} off`
            }
          />
          <ReviewRow
            label="Allocation"
            value={allocation.charAt(0).toUpperCase() + allocation.slice(1)}
          />
          <ReviewRow label="Max quantity" value={String(maxQuantity)} />
          <ReviewRow label="Includes taxes" value={isTaxInclusive ? "Yes" : "No"} />
          {usageLimit && <ReviewRow label="Global usage limit" value={`${usageLimit} orders`} />}
          <ReviewRow
            label={isBuyGet ? "Get discount on" : "Applies to"}
            value={`${variantIds.length} variant(s)`}
          />
          <ReviewRow
            label="Target regions"
            value={
              selectedRegionIds.length > 0
                ? `${selectedRegionIds.length} region(s)`
                : "All regions"
            }
          />
          {serverError && (
            <Text size="small" className="text-ui-fg-error">
              {serverError}
            </Text>
          )}
        </div>
      )}

      <div className="px-6 py-4 flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={step === "type" ? () => nav("/variant-promotions") : goBack}
          disabled={submitting}
        >
          {step === "type" ? "Cancel" : "Back"}
        </Button>
        {step !== "review" ? (
          <Button
            onClick={goNext}
            disabled={
              (step === "type" && !canProceedFromType) ||
              (step === "variants" && !canProceedFromVariants) ||
              (step === "value" && !canProceedFromValue)
            }
          >
            Continue
          </Button>
        ) : (
          <Button onClick={handleSubmit} isLoading={submitting}>
            Create promotion
          </Button>
        )}
      </div>
    </Container>
  )
}

function StepIndicator({ current }: { current: Step }) {
  const steps: Step[] = ["type", "variants", "value", "review"]
  return (
    <div className="flex items-center gap-x-2">
      {steps.map((s, i) => (
        <div
          key={s}
          className={[
            "w-2 h-2 rounded-full",
            steps.indexOf(current) >= i ? "bg-ui-bg-interactive" : "bg-ui-bg-base border",
          ].join(" ")}
        />
      ))}
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b pb-2">
      <Text size="small" className="text-ui-fg-subtle">
        {label}
      </Text>
      <Text size="small" weight="plus">
        {value}
      </Text>
    </div>
  )
}

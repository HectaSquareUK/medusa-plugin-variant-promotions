import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Container,
  Heading,
  Text,
  Button,
  Input,
  Label,
  RadioGroup,
  Switch,
  Select,
  Checkbox,
  toast,
} from "@medusajs/ui"
import { VariantPicker } from "./variant-picker"

type Step = "type" | "variants" | "value" | "review"

type PromotionType =
  | "amount_off_products"
  | "percentage_off_product"
  | "buy_x_get_y"

const navigate = (path: string) => {
  if (typeof window !== "undefined") {
    const target = path.startsWith("/app")
      ? path
      : `/app${path.startsWith("/") ? path : "/" + path}`
    window.location.href = target
  }
}

export function CreateVariantPromotionPage() {
  const [step, setStep] = useState<Step>("type")
  const [isAutomatic, setIsAutomatic] = useState<boolean>(false)
  const [status, setStatus] = useState<"active" | "draft">("active")
  const [code, setCode] = useState("")

  const [type, setType] = useState<PromotionType>("percentage_off_product")
  const [variantIds, setVariantIds] = useState<string[]>([])

  const [buyVariantIds, setBuyVariantIds] = useState<string[]>([])
  const [buyMinQuantity, setBuyMinQuantity] = useState<number>(1)
  const [applyToQuantity, setApplyToQuantity] = useState<number>(1)

  const [discountKind, setDiscountKind] = useState<"percentage" | "fixed">(
    "percentage"
  )
  const [value, setValue] = useState<number>(10)
  const [allocation, setAllocation] = useState<"each" | "across" | "once">(
    "each"
  )
  const [maxQuantity, setMaxQuantity] = useState<number>(100)
  const [currencyCode, setCurrencyCode] = useState("cad")
  const [isTaxInclusive, setIsTaxInclusive] = useState(false)

  const [description, setDescription] = useState("")
  const [usageLimit, setUsageLimit] = useState<string>("")
  const [selectedCustomerGroupIds, setSelectedCustomerGroupIds] = useState<
    string[]
  >([])
  const [selectedRegionIds, setSelectedRegionIds] = useState<string[]>([])
  const [startsAt, setStartsAt] = useState<string>("")
  const [endsAt, setEndsAt] = useState<string>("")

  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const { data: regions } = useQuery({
    queryKey: ["regions-for-promotions"],
    queryFn: async () => {
      const res = await fetch("/admin/regions", {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })
      if (!res.ok) return []
      const json = await res.json()
      return (json.regions ?? []) as Array<{
        id: string
        name: string
        currency_code: string
      }>
    },
  })

  const { data: customerGroups } = useQuery({
    queryKey: ["customer-groups-for-promotions"],
    queryFn: async () => {
      const res = await fetch("/admin/customer-groups", {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })
      if (!res.ok) return []
      const json = await res.json()
      return (json.customer_groups ?? []) as Array<{
        id: string
        name: string
      }>
    },
  })

  const isBuyGet = type === "buy_x_get_y"

  const canProceedFromType = code.trim().length >= 3
  const canProceedFromVariants =
    variantIds.length > 0 && (!isBuyGet || buyVariantIds.length > 0)
  const canProceedFromValue = value > 0 && (discountKind !== "percentage" || value <= 100)

  const goNext = () => {
    if (step === "type" && canProceedFromType) setStep("variants")
    else if (step === "variants" && canProceedFromVariants) setStep("value")
    else if (step === "value" && canProceedFromValue) setStep("review")
  }

  const goBack = () => {
    if (step === "review") setStep("value")
    else if (step === "value") setStep("variants")
    else if (step === "variants") setStep("type")
  }

  const toggleCustomerGroup = (groupId: string) => {
    if (selectedCustomerGroupIds.includes(groupId)) {
      setSelectedCustomerGroupIds(
        selectedCustomerGroupIds.filter((id) => id !== groupId)
      )
    } else {
      setSelectedCustomerGroupIds([...selectedCustomerGroupIds, groupId])
    }
  }

  const toggleRegion = (regionId: string) => {
    if (selectedRegionIds.includes(regionId)) {
      setSelectedRegionIds(selectedRegionIds.filter((id) => id !== regionId))
    } else {
      setSelectedRegionIds([...selectedRegionIds, regionId])
      const reg = regions?.find((r) => r.id === regionId)
      if (reg?.currency_code) {
        setCurrencyCode(reg.currency_code.toLowerCase())
      }
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setServerError(null)
    try {
      const payload: Record<string, unknown> = {
        code: code.trim().toUpperCase(),
        description: description.trim() || undefined,
        type,
        currency_code: currencyCode,
        discount_kind: discountKind,
        value,
        allocation,
        max_quantity: maxQuantity,
        status,
        is_automatic: isAutomatic,
        is_tax_inclusive: isTaxInclusive,
        variant_ids: variantIds,
      }
      if (usageLimit) {
        payload.usage_limit = Number(usageLimit)
      }
      if (selectedCustomerGroupIds.length > 0) {
        payload.customer_group_ids = selectedCustomerGroupIds
      }
      if (selectedRegionIds.length > 0) {
        payload.region_ids = selectedRegionIds
      }
      if (startsAt) {
        payload.starts_at = new Date(startsAt).toISOString()
      }
      if (endsAt) {
        payload.ends_at = new Date(endsAt).toISOString()
      }
      if (isBuyGet) {
        payload.buy_variant_ids = buyVariantIds
        payload.buy_min_quantity = buyMinQuantity
        payload.apply_to_quantity = applyToQuantity
      }

      const res = await fetch("/admin/variant-promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })

      const json = await res.json()

      if (!res.ok) {
        setServerError(
          json.message ?? "Something went wrong creating the promotion."
        )
        setSubmitting(false)
        return
      }

      const createdCode =
        json?.promotion?.code ??
        (Array.isArray(json?.promotion) ? json.promotion[0]?.code : undefined) ??
        code.trim().toUpperCase()

      toast.success(`Promotion "${createdCode}" created`, {
        description: `Applies to ${json?.variant_count ?? variantIds.length} variant(s).`,
      })
      navigate("/variant-promotions")
    } catch (err: any) {
      setServerError(err?.message ?? "Network error — please try again.")
      setSubmitting(false)
    }
  }

  return (
    <Container className="p-0">
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <div>
          <Heading level="h1" className="text-xl font-semibold">
            Create Variant Promotion
          </Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Target hand-picked product variants across any products in your store.
          </Text>
        </div>
        <StepIndicator current={step} />
      </div>

      {step === "type" && (
        <div className="px-6 py-6 flex flex-col gap-y-6 max-w-lg">
          <div className="flex flex-col gap-y-2">
            <Label>Method</Label>
            <div className="flex gap-x-4">
              <label className="flex items-center gap-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="isAutomatic"
                  checked={!isAutomatic}
                  onChange={() => setIsAutomatic(false)}
                />
                <Text size="small">Promotion Code</Text>
              </label>
              <label className="flex items-center gap-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="isAutomatic"
                  checked={isAutomatic}
                  onChange={() => setIsAutomatic(true)}
                />
                <Text size="small">Automatic (Applied at checkout)</Text>
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-y-2">
            <Label htmlFor="promo_code">Promotion Code</Label>
            <Input
              id="promo_code"
              placeholder="e.g. CONE100"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
          </div>

          <div className="flex items-center justify-between border rounded-md p-3">
            <div>
              <Text weight="plus" size="small">
                Status
              </Text>
              <Text size="small" className="text-ui-fg-subtle">
                Active promotions apply immediately. Drafts require manual activation.
              </Text>
            </div>
            <Switch
              checked={status === "active"}
              onCheckedChange={(c) => setStatus(c ? "active" : "draft")}
            />
          </div>

          <div className="flex flex-col gap-y-2">
            <Label>Promotion Type</Label>
            <RadioGroup
              value={type}
              onValueChange={(val) => setType(val as PromotionType)}
            >
              <div className="flex items-start gap-x-3 border rounded-md p-3 cursor-pointer">
                <RadioGroup.Item value="percentage_off_product" id="opt_perc" />
                <label htmlFor="opt_perc" className="cursor-pointer">
                  <Text weight="plus" size="small">
                    Discount on specific variants
                  </Text>
                  <Text size="small" className="text-ui-fg-subtle">
                    Apply percentage or fixed amount off selected variants.
                  </Text>
                </label>
              </div>
              <div className="flex items-start gap-x-3 border rounded-md p-3 cursor-pointer mt-2">
                <RadioGroup.Item value="buy_x_get_y" id="opt_bgy" />
                <label htmlFor="opt_bgy" className="cursor-pointer">
                  <Text weight="plus" size="small">
                    Buy X, Get Y (Free gift / conditional)
                  </Text>
                  <Text size="small" className="text-ui-fg-subtle">
                    Customer buys X variant(s) and gets discount on Y variant(s).
                  </Text>
                </label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )}

      {step === "variants" && (
        <div className="px-6 py-6 flex flex-col gap-y-6 max-w-2xl">
          {isBuyGet && (
            <div className="flex flex-col gap-y-2 border-b pb-6">
              <Label className="text-base font-semibold">
                Step A: Buy Condition (Trigger Variants)
              </Label>
              <Text size="small" className="text-ui-fg-subtle">
                Select the variants customer must have in cart to unlock the promo.
              </Text>
              <VariantPicker
                selected={buyVariantIds}
                onChange={setBuyVariantIds}
              />
            </div>
          )}

          <div className="flex flex-col gap-y-2">
            <Label className="text-base font-semibold">
              {isBuyGet
                ? "Step B: Discounted Items (Get Variants)"
                : "Target Product Variants"}
            </Label>
            <Text size="small" className="text-ui-fg-subtle">
              Select the specific variants that receive the discount.
            </Text>
            <VariantPicker
              selected={variantIds}
              onChange={setVariantIds}
            />
          </div>
        </div>
      )}

      {step === "value" && (
        <div className="px-6 py-6 flex flex-col gap-y-6 max-w-lg">
          <div className="flex gap-x-4">
            <div className="flex flex-col gap-y-2 flex-1">
              <Label>Discount Type</Label>
              <Select
                value={discountKind}
                onValueChange={(v) =>
                  setDiscountKind(v as "percentage" | "fixed")
                }
              >
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="percentage">Percentage (%)</Select.Item>
                  <Select.Item value="fixed">Fixed Amount</Select.Item>
                </Select.Content>
              </Select>
            </div>
            <div className="flex flex-col gap-y-2 flex-1">
              <Label htmlFor="val">Value</Label>
              <Input
                id="val"
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
              <Label>Allocation</Label>
              <Select
                value={allocation}
                onValueChange={(v) => {
                  const alloc = v as "each" | "across" | "once"
                  setAllocation(alloc)
                  if (alloc === "once") {
                    setMaxQuantity(1)
                  }
                }}
              >
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="each">Each item</Select.Item>
                  <Select.Item value="across">Across items</Select.Item>
                  <Select.Item value="once">Once per cart</Select.Item>
                </Select.Content>
              </Select>
            </div>
            <div className="flex flex-col gap-y-2 flex-1">
              <Label htmlFor="max_qty">Max quantity per cart</Label>
              <Input
                id="max_qty"
                type="number"
                min={1}
                disabled={allocation === "once"}
                value={allocation === "once" ? 1 : maxQuantity}
                onChange={(e) => setMaxQuantity(Number(e.target.value))}
              />
              {allocation === "once" && (
                <Text size="small" className="text-ui-fg-subtle text-xs">
                  Locked to 1 unit per cart when allocated once.
                </Text>
              )}
            </div>
          </div>

          {isBuyGet && (
            <div className="flex gap-x-4 border-t pt-4">
              <div className="flex flex-col gap-y-2 flex-1">
                <Label htmlFor="buy_min_qty">Min. quantity to buy</Label>
                <Input
                  id="buy_min_qty"
                  type="number"
                  min={1}
                  value={buyMinQuantity}
                  onChange={(e) => setBuyMinQuantity(Number(e.target.value))}
                />
              </div>
              <div className="flex flex-col gap-y-2 flex-1">
                <Label htmlFor="apply_qty">Quantity discounted</Label>
                <Input
                  id="apply_qty"
                  type="number"
                  min={1}
                  value={applyToQuantity}
                  onChange={(e) => setApplyToQuantity(Number(e.target.value))}
                />
              </div>
            </div>
          )}

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

          <div className="flex flex-col gap-y-2 border-t pt-4">
            <Label>Who can use this code? (Customer Groups)</Label>
            <Text size="small" className="text-ui-fg-subtle mb-2">
              Leave unselected to allow all customers, or check specific groups.
            </Text>
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

          <div className="flex flex-col gap-y-2 border-t pt-4">
            <Label>Schedule (Optional)</Label>
            <div className="flex gap-x-4">
              <div className="flex flex-col gap-y-2 flex-1">
                <Label htmlFor="starts_at" className="text-xs text-ui-fg-subtle">Start Date & Time</Label>
                <Input
                  id="starts_at"
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-y-2 flex-1">
                <Label htmlFor="ends_at" className="text-xs text-ui-fg-subtle">End Date & Time</Label>
                <Input
                  id="ends_at"
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                />
              </div>
            </div>
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
          {isBuyGet && (
            <ReviewRow
              label="Buy condition"
              value={`Buy ${buyMinQuantity}+ of ${buyVariantIds.length} variant(s)`}
            />
          )}
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
          <ReviewRow
            label="Who can use"
            value={
              selectedCustomerGroupIds.length > 0
                ? `${selectedCustomerGroupIds.length} customer group(s)`
                : "All customers"
            }
          />
          {(startsAt || endsAt) && (
            <ReviewRow
              label="Schedule"
              value={`${startsAt ? `Starts ${startsAt}` : "Starts immediately"}${endsAt ? ` · Ends ${endsAt}` : ""}`}
            />
          )}
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
          onClick={step === "type" ? () => navigate("/variant-promotions") : goBack}
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



import { z } from "zod";
export declare const createVariantPromotionSchema: z.ZodObject<{
    code: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["standard", "buy_get"]>>;
    is_automatic: z.ZodDefault<z.ZodBoolean>;
    status: z.ZodDefault<z.ZodEnum<["draft", "active"]>>;
    campaign_id: z.ZodOptional<z.ZodString>;
    target_variant_ids: z.ZodArray<z.ZodString, "many">;
    buy_variant_ids: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    customer_group_ids: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    region_ids: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    application_method: z.ZodObject<{
        type: z.ZodEnum<["percentage", "fixed"]>;
        target_type: z.ZodDefault<z.ZodEnum<["items", "shipping", "order_total"]>>;
        allocation: z.ZodDefault<z.ZodEnum<["each", "across", "once"]>>;
        value: z.ZodNumber;
        currency_code: z.ZodOptional<z.ZodString>;
        max_quantity: z.ZodOptional<z.ZodNumber>;
        apply_to_quantity: z.ZodOptional<z.ZodNumber>;
        buy_rules_min_quantity: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        value?: number;
        type?: "percentage" | "fixed";
        currency_code?: string;
        allocation?: "each" | "across" | "once";
        max_quantity?: number;
        target_type?: "items" | "shipping" | "order_total";
        buy_rules_min_quantity?: number;
        apply_to_quantity?: number;
    }, {
        value?: number;
        type?: "percentage" | "fixed";
        currency_code?: string;
        allocation?: "each" | "across" | "once";
        max_quantity?: number;
        target_type?: "items" | "shipping" | "order_total";
        buy_rules_min_quantity?: number;
        apply_to_quantity?: number;
    }>;
}, "strip", z.ZodTypeAny, {
    code?: string;
    status?: "active" | "draft";
    type?: "standard" | "buy_get";
    is_automatic?: boolean;
    customer_group_ids?: string[];
    region_ids?: string[];
    buy_variant_ids?: string[];
    campaign_id?: string;
    application_method?: {
        value?: number;
        type?: "percentage" | "fixed";
        currency_code?: string;
        allocation?: "each" | "across" | "once";
        max_quantity?: number;
        target_type?: "items" | "shipping" | "order_total";
        buy_rules_min_quantity?: number;
        apply_to_quantity?: number;
    };
    target_variant_ids?: string[];
}, {
    code?: string;
    status?: "active" | "draft";
    type?: "standard" | "buy_get";
    is_automatic?: boolean;
    customer_group_ids?: string[];
    region_ids?: string[];
    buy_variant_ids?: string[];
    campaign_id?: string;
    application_method?: {
        value?: number;
        type?: "percentage" | "fixed";
        currency_code?: string;
        allocation?: "each" | "across" | "once";
        max_quantity?: number;
        target_type?: "items" | "shipping" | "order_total";
        buy_rules_min_quantity?: number;
        apply_to_quantity?: number;
    };
    target_variant_ids?: string[];
}>;
export type CreateVariantPromotionInput = z.infer<typeof createVariantPromotionSchema>;

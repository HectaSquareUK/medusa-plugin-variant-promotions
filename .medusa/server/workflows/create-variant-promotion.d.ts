export declare const createVariantPromotionWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<{
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
}, import("@medusajs/types").PromotionDTO, []>;

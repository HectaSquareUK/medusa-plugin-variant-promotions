import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
/**
 * Subscriber: Automatically applies active variant promotions flagged as `is_automatic: true`
 * whenever a cart is updated or created.
 */
export default function autoVariantPromotionsHandler({ event: { data }, container, }: SubscriberArgs<{
    id: string;
}>): Promise<void>;
export declare const config: SubscriberConfig;

import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
export default function autoVariantPromotionsHandler({ event: { data }, container, }: SubscriberArgs<{
    id: string;
}>): Promise<void>;
export declare const config: SubscriberConfig;

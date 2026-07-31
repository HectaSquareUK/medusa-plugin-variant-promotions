type VariantPickerProps = {
    selected: string[];
    onChange: (variantIds: string[]) => void;
    disabledIds?: string[];
    currencyCode?: string;
};
export declare function VariantPicker({ selected, onChange, disabledIds, currencyCode, }: VariantPickerProps): import("react/jsx-runtime").JSX.Element;
export {};

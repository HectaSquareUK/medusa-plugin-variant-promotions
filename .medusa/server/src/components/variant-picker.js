"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VariantPicker = VariantPicker;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const ui_1 = require("@medusajs/ui");
const icons_1 = require("@medusajs/icons");
function VariantPicker({ selected, onChange, label = "Select variants to discount", }) {
    const [query, setQuery] = (0, react_1.useState)("");
    const [debouncedQuery, setDebouncedQuery] = (0, react_1.useState)("");
    const [results, setResults] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [selectedDetails, setSelectedDetails] = (0, react_1.useState)({});
    (0, react_1.useEffect)(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
        }, 300);
        return () => clearTimeout(handler);
    }, [query]);
    (0, react_1.useEffect)(() => {
        let active = true;
        setLoading(true);
        const params = new URLSearchParams();
        if (debouncedQuery.trim()) {
            params.set("q", debouncedQuery.trim());
        }
        params.set("limit", "50");
        fetch(`/admin/product-variants?${params.toString()}`, {
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        })
            .then((res) => {
            if (!res.ok)
                return { variants: [] };
            return res.json();
        })
            .then((data) => {
            if (!active)
                return;
            const list = (data.variants ?? []);
            setResults(list);
            setLoading(false);
            setSelectedDetails((prev) => {
                const next = { ...prev };
                for (const v of list) {
                    if (selected.includes(v.id)) {
                        next[v.id] = v;
                    }
                }
                return next;
            });
        })
            .catch(() => {
            if (active)
                setLoading(false);
        });
        return () => {
            active = false;
        };
    }, [debouncedQuery]);
    const toggleSelect = (variant) => {
        if (selected.includes(variant.id)) {
            onChange(selected.filter((id) => id !== variant.id));
        }
        else {
            onChange([...selected, variant.id]);
            setSelectedDetails((prev) => ({ ...prev, [variant.id]: variant }));
        }
    };
    const removeId = (id) => {
        onChange(selected.filter((i) => i !== id));
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-y-3", children: [label && (0, jsx_runtime_1.jsx)(ui_1.Text, { className: "font-medium text-sm", children: label }), (0, jsx_runtime_1.jsx)(ui_1.Input, { placeholder: "Search variants by title, SKU, or option...", value: query, onChange: (e) => setQuery(e.target.value) }), selected.length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2 p-3 bg-ui-bg-subtle rounded-md border", children: selected.map((id) => {
                    const v = selectedDetails[id];
                    const title = v?.title ? `${v.title}` : id;
                    const sku = v?.sku ? ` (${v.sku})` : "";
                    return ((0, jsx_runtime_1.jsxs)(ui_1.Badge, { color: "blue", className: "flex items-center gap-x-1 font-mono text-xs", children: [(0, jsx_runtime_1.jsxs)("span", { children: [title, sku] }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => removeId(id), className: "hover:text-ui-fg-error", children: (0, jsx_runtime_1.jsx)(icons_1.XCircle, { className: "w-3.5 h-3.5" }) })] }, id));
                }) })), (0, jsx_runtime_1.jsxs)("div", { className: "border rounded-md max-h-60 overflow-y-auto divide-y", children: [loading && ((0, jsx_runtime_1.jsx)("div", { className: "p-3 text-xs text-ui-fg-subtle text-center", children: "Searching variants..." })), !loading && results.length === 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "p-3 text-xs text-ui-fg-subtle text-center", children: ["No variants found matching \"", query, "\""] })), !loading &&
                        results.map((v) => {
                            const isSelected = selected.includes(v.id);
                            return ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-2.5 hover:bg-ui-bg-subtle text-xs", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: v.title }), v.sku && ((0, jsx_runtime_1.jsxs)("span", { className: "text-ui-fg-subtle font-mono text-[10px]", children: ["SKU: ", v.sku] }))] }), (0, jsx_runtime_1.jsx)(ui_1.Button, { size: "small", variant: isSelected ? "secondary" : "transparent", onClick: () => toggleSelect(v), className: "flex items-center gap-x-1", children: isSelected ? ("Selected") : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(icons_1.Plus, { className: "w-3 h-3" }), " Select"] })) })] }, v.id));
                        })] })] }));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFyaWFudC1waWNrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92YXJpYW50LXBpY2tlci50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFpQkEsc0NBc0tDOztBQXZMRCxpQ0FBMkM7QUFDM0MscUNBQXlEO0FBQ3pELDJDQUErQztBQWUvQyxTQUFnQixhQUFhLENBQUMsRUFDNUIsUUFBUSxFQUNSLFFBQVEsRUFDUixLQUFLLEdBQUcsNkJBQTZCLEdBQ2xCO0lBQ25CLE1BQU0sQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLEdBQUcsSUFBQSxnQkFBUSxFQUFDLEVBQUUsQ0FBQyxDQUFBO0lBQ3RDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsaUJBQWlCLENBQUMsR0FBRyxJQUFBLGdCQUFRLEVBQUMsRUFBRSxDQUFDLENBQUE7SUFDeEQsTUFBTSxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsR0FBRyxJQUFBLGdCQUFRLEVBQW1CLEVBQUUsQ0FBQyxDQUFBO0lBQzVELE1BQU0sQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLEdBQUcsSUFBQSxnQkFBUSxFQUFDLEtBQUssQ0FBQyxDQUFBO0lBQzdDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsa0JBQWtCLENBQUMsR0FBRyxJQUFBLGdCQUFRLEVBRXBELEVBQUUsQ0FBQyxDQUFBO0lBRUwsSUFBQSxpQkFBUyxFQUFDLEdBQUcsRUFBRTtRQUNiLE1BQU0sT0FBTyxHQUFHLFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDOUIsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDMUIsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO1FBQ1AsT0FBTyxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUE7SUFDcEMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtJQUVYLElBQUEsaUJBQVMsRUFBQyxHQUFHLEVBQUU7UUFDYixJQUFJLE1B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
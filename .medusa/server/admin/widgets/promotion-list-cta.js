"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.PromotionListCtaWidget = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const admin_sdk_1 = require("@medusajs/admin-sdk");
const ui_1 = require("@medusajs/ui");
const icons_1 = require("@medusajs/icons");
const navigate = (path) => {
    if (typeof window !== "undefined") {
        const target = path.startsWith("/app")
            ? path
            : `/app${path.startsWith("/") ? path : "/" + path}`;
        window.location.href = target;
    }
};
/**
 * Injected at `promotion.list.after`. Discoverability CTA nudge —
 * points directly to the dedicated variant promotion creation wizard.
 */
const PromotionListCtaWidget = () => {
    return ((0, jsx_runtime_1.jsxs)(ui_1.Container, { className: "flex items-center justify-between px-6 py-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-x-3", children: [(0, jsx_runtime_1.jsx)(icons_1.Tag, { className: "text-ui-fg-muted" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(ui_1.Text, { weight: "plus", size: "small", children: "Need to discount specific variants instead of whole products?" }), (0, jsx_runtime_1.jsx)(ui_1.Text, { size: "small", className: "text-ui-fg-subtle", children: "Use Variant Promotions to target hand-picked variants across any products." })] })] }), (0, jsx_runtime_1.jsx)(ui_1.Button, { variant: "secondary", size: "small", onClick: () => navigate("/variant-promotions/create"), children: "Create variant promotion" })] }));
};
exports.PromotionListCtaWidget = PromotionListCtaWidget;
exports.config = (0, admin_sdk_1.defineWidgetConfig)({
    zone: "promotion.list.after",
});
exports.default = exports.PromotionListCtaWidget;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvbW90aW9uLWxpc3QtY3RhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYWRtaW4vd2lkZ2V0cy9wcm9tb3Rpb24tbGlzdC1jdGEudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxtREFBd0Q7QUFDeEQscUNBQXNEO0FBQ3RELDJDQUFxQztBQUVyQyxNQUFNLFFBQVEsR0FBRyxDQUFDLElBQVksRUFBRSxFQUFFO0lBQ2hDLElBQUksT0FBTyxNQUFNLEtBQUssV0FBVyxFQUFFLENBQUM7UUFDbEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUM7WUFDcEMsQ0FBQyxDQUFDLElBQUk7WUFDTixDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJLEVBQUUsQ0FBQTtRQUNyRCxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUE7SUFDL0IsQ0FBQztBQUNILENBQUMsQ0FBQTtBQUVEOzs7R0FHRztBQUNJLE1BQU0sc0JBQXNCLEdBQUcsR0FBRyxFQUFFO0lBQ3pDLE9BQU8sQ0FDTCx3QkFBQyxjQUFTLElBQUMsU0FBUyxFQUFDLDZDQUE2QyxhQUNoRSxpQ0FBSyxTQUFTLEVBQUMsMkJBQTJCLGFBQ3hDLHVCQUFDLFdBQUcsSUFBQyxTQUFTLEVBQUMsa0JBQWtCLEdBQUcsRUFDcEMsNENBQ0UsdUJBQUMsU0FBSSxJQUFDLE1BQU0sRUFBQyxNQUFNLEVBQUMsSUFBSSxFQUFDLE9BQU8sOEVBRXpCLEVBQ1AsdUJBQUMsU0FBSSxJQUFDLElBQUksRUFBQyxPQUFPLEVBQUMsU0FBUyxFQUFDLG1CQUFtQiwyRkFHekMsSUFDSCxJQUNGLEVBQ04sdUJBQUMsV0FBTSxJQUNMLE9BQU8sRUFBQyxXQUFXLEVBQ25CLElBQUksRUFBQyxPQUFPLEVBQ1osT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyw0QkFBNEIsQ0FBQyx5Q0FHOUMsSUFDQyxDQUNiLENBQUE7QUFDSCxDQUFDLENBQUE7QUF4QlksUUFBQSxzQkFBc0IsMEJBd0JsQztBQUVZLFFBQUEsTUFBTSxHQUFHLElBQUEsOEJBQWtCLEVBQUM7SUFDdkMsSUFBSSxFQUFFLHNCQUFzQjtDQUM3QixDQUFDLENBQUE7QUFFRixrQkFBZSw4QkFBc0IsQ0FBQSJ9
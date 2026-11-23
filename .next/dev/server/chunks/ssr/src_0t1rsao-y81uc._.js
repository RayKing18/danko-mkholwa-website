(()=>{"use strict";module.exports = [
"[project]/src/components/BrandImage.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BrandImage",
    ()=>BrandImage,
    "Logo",
    ()=>Logo
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
function BrandImage({ src, alt, className = "", imgClassName = "object-cover", label }) {
    const [failed, setFailed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    if (!src || failed) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `bg-tiles flex items-center justify-center bg-coal ${className}`,
            role: "img",
            "aria-label": alt,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-4 text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "font-display text-2xl leading-none text-gold",
                        children: label ?? alt
                    }, void 0, false, {
                        fileName: "[project]/src/components/BrandImage.tsx",
                        lineNumber: 34,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1 text-[11px] uppercase tracking-widest text-white/40",
                        children: "Photo coming soon"
                    }, void 0, false, {
                        fileName: "[project]/src/components/BrandImage.tsx",
                        lineNumber: 37,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/BrandImage.tsx",
                lineNumber: 33,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/BrandImage.tsx",
            lineNumber: 28,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `overflow-hidden ${className}`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
            src: src,
            alt: alt,
            loading: "lazy",
            onError: ()=>setFailed(true),
            className: `h-full w-full ${imgClassName}`
        }, void 0, false, {
            fileName: "[project]/src/components/BrandImage.tsx",
            lineNumber: 48,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/BrandImage.tsx",
        lineNumber: 46,
        columnNumber: 5
    }, this);
}
function Logo({ src, className = "h-14", priority = false }) {
    const [failed, setFailed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const url = src || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ASSETS"].logo;
    if (failed) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: `flex items-center gap-2 ${className}`,
            "aria-label": "Danko Mkholwa",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "font-script text-3xl leading-none text-white",
                    children: "Danko"
                }, void 0, false, {
                    fileName: "[project]/src/components/BrandImage.tsx",
                    lineNumber: 83,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "font-display text-lg leading-none tracking-widest text-gold",
                    children: "MKHOLWA"
                }, void 0, false, {
                    fileName: "[project]/src/components/BrandImage.tsx",
                    lineNumber: 84,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/BrandImage.tsx",
            lineNumber: 79,
            columnNumber: 7
        }, this);
    }
    return(// eslint-disable-next-line @next/next/no-img-element
    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
        src: url,
        alt: "Danko Mkholwa — Flavour that feels like home",
        className: `w-auto object-contain ${className}`,
        loading: priority ? "eager" : "lazy",
        fetchPriority: priority ? "high" : "auto",
        onError: ()=>setFailed(true)
    }, void 0, false, {
        fileName: "[project]/src/components/BrandImage.tsx",
        lineNumber: 93,
        columnNumber: 5
    }, this));
}
}),
"[project]/src/components/admin/AdminNav.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AdminNav",
    ()=>AdminNav
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
"use client";
;
;
;
const LINKS = [
    {
        href: "/admin",
        label: "Orders",
        badge: "orders"
    },
    {
        href: "/admin/products",
        label: "Products"
    },
    {
        href: "/admin/categories",
        label: "Categories"
    },
    {
        href: "/admin/media",
        label: "Upload Centre"
    },
    {
        href: "/admin/community",
        label: "Gallery & Reviews",
        badge: "moderation"
    },
    {
        href: "/admin/settings",
        label: "Settings"
    }
];
function AdminNav({ pendingOrders, pendingModeration }) {
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
        className: "no-scrollbar mx-auto flex w-full max-w-7xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6",
        "aria-label": "Dashboard",
        children: LINKS.map((link)=>{
            const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
            const badge = link.badge === "orders" ? pendingOrders : link.badge === "moderation" ? pendingModeration : 0;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                href: link.href,
                className: `flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${active ? "bg-gold text-ink" : "text-white/70 hover:bg-white/10 hover:text-white"}`,
                children: [
                    link.label,
                    badge > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: `rounded-full px-2 py-0.5 text-[11px] font-bold ${active ? "bg-ink text-gold" : "bg-brand-red text-white"}`,
                        children: badge
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin/AdminNav.tsx",
                        lineNumber: 39,
                        columnNumber: 15
                    }, this)
                ]
            }, link.href, true, {
                fileName: "[project]/src/components/admin/AdminNav.tsx",
                lineNumber: 30,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/src/components/admin/AdminNav.tsx",
        lineNumber: 24,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/lib/utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ALLOWED_IMAGE_TYPES",
    ()=>ALLOWED_IMAGE_TYPES,
    "ASSETS",
    ()=>ASSETS,
    "MAX_UPLOAD_BYTES",
    ()=>MAX_UPLOAD_BYTES,
    "NAV_LINKS",
    ()=>NAV_LINKS,
    "formatDateTimeZA",
    ()=>formatDateTimeZA,
    "formatZAR",
    ()=>formatZAR,
    "isValidSouthAfricanPhone",
    ()=>isValidSouthAfricanPhone,
    "normalisePhone",
    ()=>normalisePhone,
    "parseExtrasText",
    ()=>parseExtrasText,
    "parseRandsToCents",
    ()=>parseRandsToCents,
    "parseVariationsText",
    ()=>parseVariationsText,
    "serialiseExtras",
    ()=>serialiseExtras,
    "serialiseVariations",
    ()=>serialiseVariations,
    "slugify",
    ()=>slugify,
    "sniffImageType",
    ()=>sniffImageType
]);
const ASSETS = {
    logo: "/assets/logo/danko-mkholwa-logo.png",
    promoPoster: "/assets/promotions/double-cheeseburger-poster.jpg",
    menuPoster: "/assets/promotions/menu-poster.jpg"
};
const NAV_LINKS = [
    {
        href: "/",
        label: "Home"
    },
    {
        href: "/menu",
        label: "Menu"
    },
    {
        href: "/about",
        label: "About"
    },
    {
        href: "/gallery",
        label: "Gallery"
    },
    {
        href: "/reviews",
        label: "Reviews"
    },
    {
        href: "/contact",
        label: "Contact"
    }
];
function formatZAR(cents) {
    const rands = cents / 100;
    const whole = Number.isInteger(rands);
    return `R${whole ? rands.toString() : rands.toFixed(2)}`;
}
function parseRandsToCents(input) {
    if (input == null) return null;
    const cleaned = input.replace(/[Rr\s+]/g, "").replace(",", ".");
    if (cleaned === "") return null;
    const value = Number(cleaned);
    if (!Number.isFinite(value)) return null;
    return Math.round(value * 100);
}
function slugify(text) {
    return text.toLowerCase().trim().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}
function normalisePhone(raw) {
    return raw.replace(/[^\d+]/g, "");
}
function isValidSouthAfricanPhone(raw) {
    const digits = raw.replace(/\D/g, "");
    if (digits.length === 10 && digits.startsWith("0")) return true;
    if (digits.length === 11 && digits.startsWith("27")) return true;
    return false;
}
function formatDateTimeZA(date) {
    return new Intl.DateTimeFormat("en-ZA", {
        timeZone: "Africa/Johannesburg",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    }).format(date);
}
function parseVariationsText(text) {
    const groups = [];
    for (const rawLine of text.split("\n")){
        const line = rawLine.trim();
        if (!line) continue;
        const colon = line.indexOf(":");
        if (colon === -1) continue;
        const name = line.slice(0, colon).trim();
        const options = line.slice(colon + 1).split(",").map((part)=>{
            const [label, price] = part.split("=").map((s)=>s.trim());
            if (!label) return null;
            return {
                label,
                priceDeltaCents: parseRandsToCents(price) ?? 0
            };
        }).filter((o)=>o !== null);
        if (name && options.length > 0) groups.push({
            name,
            options
        });
    }
    return groups;
}
function serialiseVariations(groups) {
    return groups.map((g)=>`${g.name}: ${g.options.map((o)=>`${o.label} = ${o.priceDeltaCents / 100}`).join(", ")}`).join("\n");
}
function parseExtrasText(text) {
    const extras = [];
    for (const rawLine of text.split("\n")){
        const line = rawLine.trim();
        if (!line) continue;
        const [label, price] = line.split("=").map((s)=>s.trim());
        if (!label) continue;
        extras.push({
            label,
            priceCents: parseRandsToCents(price) ?? 0
        });
    }
    return extras;
}
function serialiseExtras(extras) {
    return extras.map((e)=>`${e.label} = ${e.priceCents / 100}`).join("\n");
}
const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp"
];
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
function sniffImageType(bytes) {
    if (bytes.length < 12) return null;
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
    const riff = String.fromCharCode(...bytes.slice(0, 4));
    const webp = String.fromCharCode(...bytes.slice(8, 12));
    if (riff === "RIFF" && webp === "WEBP") return "image/webp";
    return null;
}
}),
];})()

//# sourceMappingURL=src_0t1rsao-y81uc._.js.map
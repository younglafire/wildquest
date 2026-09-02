(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/lib/hooks/use-balance.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useBalance",
    ()=>useBalance
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$swr$2f$dist$2f$use$2d$swr$2d$emll9s78$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__u__as__default$3e$__ = __turbopack_context__.i("[project]/node_modules/swr/dist/use-swr-emll9s78.mjs [app-client] (ecmascript) <export u as default>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$cluster$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/app/components/cluster-context.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$solana$2d$client$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/solana-client-context.tsx [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function useBalance(address) {
    _s();
    const { cluster } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$cluster$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useCluster"])();
    const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$solana$2d$client$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSolanaClient"])();
    const { data, isLoading, error, mutate } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$swr$2f$dist$2f$use$2d$swr$2d$emll9s78$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__u__as__default$3e$__["default"])(address ? [
        "balance",
        cluster,
        address
    ] : null, {
        "useBalance.useSWR": async ([, , addr])=>{
            const { value } = await client.rpc.getBalance(addr).send();
            return value;
        }
    }["useBalance.useSWR"], {
        refreshInterval: 60_000,
        revalidateOnFocus: true
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useBalance.useEffect": ()=>{
            if (!address) return;
            const abortController = new AbortController();
            const subscribe = {
                "useBalance.useEffect.subscribe": async ()=>{
                    try {
                        const notifications = await client.rpcSubscriptions.accountNotifications(address, {
                            commitment: "confirmed"
                        }).subscribe({
                            abortSignal: abortController.signal
                        });
                        for await (const notification of notifications){
                            const lamports = notification.value.lamports;
                            mutate(lamports, {
                                revalidate: false
                            });
                        }
                    } catch  {
                    // SWR polling and focus revalidation remain as fallback
                    }
                }
            }["useBalance.useEffect.subscribe"];
            void subscribe();
            return ({
                "useBalance.useEffect": ()=>{
                    abortController.abort();
                }
            })["useBalance.useEffect"];
        }
    }["useBalance.useEffect"], [
        address,
        client,
        mutate
    ]);
    return {
        lamports: data ?? null,
        isLoading,
        error,
        mutate
    };
}
_s(useBalance, "yDjJDWZD3FFthVYrz1EuTKHdmKY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$cluster$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useCluster"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$solana$2d$client$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSolanaClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$swr$2f$dist$2f$use$2d$swr$2d$emll9s78$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__u__as__default$3e$__["default"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/lib/hooks/use-send-transaction.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useSendTransaction",
    ()=>useSendTransaction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$swr$2f$dist$2f$_internal$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/swr/dist/_internal/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2d$client$2d$rpc$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/kit-client-rpc/dist/index.browser.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$wallet$2f$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/wallet/context.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$cluster$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/app/components/cluster-context.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$solana$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/solana-client.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function useSendTransaction() {
    _s();
    const { signer } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$wallet$2f$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWallet"])();
    const { cluster } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$cluster$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useCluster"])();
    const { mutate } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$swr$2f$dist$2f$_internal$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useSWRConfig"])();
    const [isSending, setIsSending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const txClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useSendTransaction.useMemo[txClient]": ()=>signer ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2d$client$2d$rpc$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])({
                url: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$solana$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getClusterUrl"])(cluster),
                rpcSubscriptionsConfig: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$solana$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getClusterWsConfig"])(cluster),
                payer: signer
            }) : null
    }["useSendTransaction.useMemo[txClient]"], [
        cluster,
        signer
    ]);
    const send = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useSendTransaction.useCallback[send]": async ({ instructions })=>{
            if (!txClient) throw new Error("Wallet not connected");
            setIsSending(true);
            try {
                const result = await txClient.sendTransaction([
                    ...instructions
                ]);
                mutate({
                    "useSendTransaction.useCallback[send]": (key)=>Array.isArray(key) && key[0] === "balance"
                }["useSendTransaction.useCallback[send]"]);
                return result.context.signature;
            } finally{
                setIsSending(false);
            }
        }
    }["useSendTransaction.useCallback[send]"], [
        txClient,
        mutate
    ]);
    return {
        send,
        isSending
    };
}
_s(useSendTransaction, "FTEsal+RDjW1l4HLu32O0zZro5w=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$wallet$2f$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWallet"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$cluster$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useCluster"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$swr$2f$dist$2f$_internal$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useSWRConfig"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/lib/lamports.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "lamportsFromSol",
    ()=>lamportsFromSol,
    "lamportsToSolString",
    ()=>lamportsToSolString
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$rpc$2d$types$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/rpc-types/dist/index.browser.mjs [app-client] (ecmascript)");
;
const LAMPORTS_PER_SOL = 1_000_000_000n;
function lamportsFromSol(sol) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$rpc$2d$types$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lamports"])(BigInt(Math.round(sol * Number(LAMPORTS_PER_SOL))));
}
function lamportsToSolString(amount, maxDecimals = 2) {
    const whole = amount / LAMPORTS_PER_SOL;
    const fractional = amount % LAMPORTS_PER_SOL;
    if (fractional === 0n) return whole.toString();
    const decimals = fractional.toString().padStart(9, "0").slice(0, maxDecimals);
    if (decimals.replace(/0+$/, "") === "") return whole.toString();
    return `${whole}.${decimals.replace(/0+$/, "")}`;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/grid-background.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GridBackground",
    ()=>GridBackground
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
"use client";
;
function GridBackground() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "pointer-events-none fixed inset-0 z-0",
        "aria-hidden": "true",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 transition-opacity duration-500",
                style: {
                    background: [
                        "radial-gradient(ellipse 30% 28% at 30% 50%, rgba(153,69,255,0.08) 0%, transparent 70%)",
                        "radial-gradient(ellipse 30% 28% at 70% 50%, rgba(20,241,149,0.08) 0%, transparent 70%)"
                    ].join(", ")
                }
            }, void 0, false, {
                fileName: "[project]/app/components/grid-background.tsx",
                lineNumber: 7,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 opacity-80 dark:opacity-60",
                style: {
                    backgroundImage: `
            linear-gradient(to right, rgba(153,69,255,0.18) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(153,69,255,0.18) 1px, transparent 1px)
          `,
                    backgroundSize: "80px 80px",
                    mask: "radial-gradient(ellipse 30% 35% at 30% 50%, black, transparent)",
                    WebkitMask: "radial-gradient(ellipse 30% 35% at 30% 50%, black, transparent)"
                }
            }, void 0, false, {
                fileName: "[project]/app/components/grid-background.tsx",
                lineNumber: 18,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 opacity-80 dark:opacity-60",
                style: {
                    backgroundImage: `
            linear-gradient(to right, rgba(20,241,149,0.18) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(20,241,149,0.18) 1px, transparent 1px)
          `,
                    backgroundSize: "80px 80px",
                    mask: "radial-gradient(ellipse 30% 35% at 70% 50%, black, transparent)",
                    WebkitMask: "radial-gradient(ellipse 30% 35% at 70% 50%, black, transparent)"
                }
            }, void 0, false, {
                fileName: "[project]/app/components/grid-background.tsx",
                lineNumber: 33,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 opacity-80 dark:opacity-60",
                style: {
                    backgroundImage: `
            linear-gradient(to right, rgba(153,69,255,0.10) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(153,69,255,0.10) 1px, transparent 1px)
          `,
                    backgroundSize: "16px 16px",
                    mask: "radial-gradient(ellipse 30% 35% at 30% 50%, black, transparent)",
                    WebkitMask: "radial-gradient(ellipse 30% 35% at 30% 50%, black, transparent)"
                }
            }, void 0, false, {
                fileName: "[project]/app/components/grid-background.tsx",
                lineNumber: 48,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 opacity-80 dark:opacity-60",
                style: {
                    backgroundImage: `
            linear-gradient(to right, rgba(20,241,149,0.10) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(20,241,149,0.10) 1px, transparent 1px)
          `,
                    backgroundSize: "16px 16px",
                    mask: "radial-gradient(ellipse 30% 35% at 70% 50%, black, transparent)",
                    WebkitMask: "radial-gradient(ellipse 30% 35% at 70% 50%, black, transparent)"
                }
            }, void 0, false, {
                fileName: "[project]/app/components/grid-background.tsx",
                lineNumber: 63,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/grid-background.tsx",
        lineNumber: 5,
        columnNumber: 5
    }, this);
}
_c = GridBackground;
var _c;
__turbopack_context__.k.register(_c, "GridBackground");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/theme-toggle.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThemeToggle",
    ()=>ThemeToggle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-themes/dist/index.mjs [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const subscribe = ()=>()=>{};
function ThemeToggle() {
    _s();
    const { resolvedTheme, setTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    const mounted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSyncExternalStore"])(subscribe, {
        "ThemeToggle.useSyncExternalStore[mounted]": ()=>true
    }["ThemeToggle.useSyncExternalStore[mounted]"], {
        "ThemeToggle.useSyncExternalStore[mounted]": ()=>false
    }["ThemeToggle.useSyncExternalStore[mounted]"]);
    const isDark = resolvedTheme === "dark";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        onClick: ()=>setTheme(isDark ? "light" : "dark"),
        className: "inline-flex size-9 cursor-pointer items-center justify-center rounded-lg border border-border-low bg-card text-sm transition hover:bg-cream",
        "aria-label": "Toggle theme",
        children: mounted ? isDark ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            xmlns: "http://www.w3.org/2000/svg",
            width: "16",
            height: "16",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                    cx: "12",
                    cy: "12",
                    r: "4"
                }, void 0, false, {
                    fileName: "[project]/app/components/theme-toggle.tsx",
                    lineNumber: 37,
                    columnNumber: 13
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    d: "M12 2v2"
                }, void 0, false, {
                    fileName: "[project]/app/components/theme-toggle.tsx",
                    lineNumber: 38,
                    columnNumber: 13
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    d: "M12 20v2"
                }, void 0, false, {
                    fileName: "[project]/app/components/theme-toggle.tsx",
                    lineNumber: 39,
                    columnNumber: 13
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    d: "m4.93 4.93 1.41 1.41"
                }, void 0, false, {
                    fileName: "[project]/app/components/theme-toggle.tsx",
                    lineNumber: 40,
                    columnNumber: 13
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    d: "m17.66 17.66 1.41 1.41"
                }, void 0, false, {
                    fileName: "[project]/app/components/theme-toggle.tsx",
                    lineNumber: 41,
                    columnNumber: 13
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    d: "M2 12h2"
                }, void 0, false, {
                    fileName: "[project]/app/components/theme-toggle.tsx",
                    lineNumber: 42,
                    columnNumber: 13
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    d: "M20 12h2"
                }, void 0, false, {
                    fileName: "[project]/app/components/theme-toggle.tsx",
                    lineNumber: 43,
                    columnNumber: 13
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    d: "m6.34 17.66-1.41 1.41"
                }, void 0, false, {
                    fileName: "[project]/app/components/theme-toggle.tsx",
                    lineNumber: 44,
                    columnNumber: 13
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    d: "m19.07 4.93-1.41 1.41"
                }, void 0, false, {
                    fileName: "[project]/app/components/theme-toggle.tsx",
                    lineNumber: 45,
                    columnNumber: 13
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/components/theme-toggle.tsx",
            lineNumber: 26,
            columnNumber: 11
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            xmlns: "http://www.w3.org/2000/svg",
            width: "16",
            height: "16",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"
            }, void 0, false, {
                fileName: "[project]/app/components/theme-toggle.tsx",
                lineNumber: 59,
                columnNumber: 13
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/components/theme-toggle.tsx",
            lineNumber: 48,
            columnNumber: 11
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "size-4"
        }, void 0, false, {
            fileName: "[project]/app/components/theme-toggle.tsx",
            lineNumber: 63,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/components/theme-toggle.tsx",
        lineNumber: 19,
        columnNumber: 5
    }, this);
}
_s(ThemeToggle, "H66xroYQNKmjw9EZgMJAFvcbGVw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSyncExternalStore"]
    ];
});
_c = ThemeToggle;
var _c;
__turbopack_context__.k.register(_c, "ThemeToggle");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/cluster-select.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ClusterSelect",
    ()=>ClusterSelect
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$cluster$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/app/components/cluster-context.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$solana$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/solana-client.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function ClusterSelect() {
    _s();
    const { cluster, setCluster } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$cluster$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useCluster"])();
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ClusterSelect.useEffect": ()=>{
            function handleClickOutside(e) {
                if (ref.current && !ref.current.contains(e.target)) {
                    setIsOpen(false);
                }
            }
            document.addEventListener("mousedown", handleClickOutside);
            return ({
                "ClusterSelect.useEffect": ()=>document.removeEventListener("mousedown", handleClickOutside)
            })["ClusterSelect.useEffect"];
        }
    }["ClusterSelect.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative",
        ref: ref,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>setIsOpen(!isOpen),
                className: "flex cursor-pointer items-center gap-2 rounded-lg border border-border-low bg-card px-3 py-2 text-xs font-medium transition hover:bg-cream",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "h-2 w-2 rounded-full",
                        style: {
                            backgroundColor: cluster === "mainnet" ? "#22c55e" : cluster === "devnet" ? "#3b82f6" : cluster === "testnet" ? "#eab308" : "#a3a3a3"
                        }
                    }, void 0, false, {
                        fileName: "[project]/app/components/cluster-select.tsx",
                        lineNumber: 27,
                        columnNumber: 9
                    }, this),
                    cluster
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/cluster-select.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, this),
            isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute right-0 top-full z-50 mt-2 w-40 rounded-xl border border-border-low bg-card p-2 shadow-lg",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-1",
                    children: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$solana$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CLUSTERS"].map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>{
                                setCluster(c);
                                setIsOpen(false);
                            },
                            className: `flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium transition hover:bg-cream ${c === cluster ? "bg-cream" : ""}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "h-2 w-2 rounded-full",
                                    style: {
                                        backgroundColor: c === "mainnet" ? "#22c55e" : c === "devnet" ? "#3b82f6" : c === "testnet" ? "#eab308" : "#a3a3a3"
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/components/cluster-select.tsx",
                                    lineNumber: 57,
                                    columnNumber: 17
                                }, this),
                                c
                            ]
                        }, c, true, {
                            fileName: "[project]/app/components/cluster-select.tsx",
                            lineNumber: 47,
                            columnNumber: 15
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/app/components/cluster-select.tsx",
                    lineNumber: 45,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/cluster-select.tsx",
                lineNumber: 44,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/cluster-select.tsx",
        lineNumber: 22,
        columnNumber: 5
    }, this);
}
_s(ClusterSelect, "mZr0sIBQhYxaiJyKcYSPkUehalk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$cluster$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useCluster"]
    ];
});
_c = ClusterSelect;
var _c;
__turbopack_context__.k.register(_c, "ClusterSelect");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/wallet-button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WalletButton",
    ()=>WalletButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$wallet$2f$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/wallet/context.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$hooks$2f$use$2d$balance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/hooks/use-balance.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$lamports$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/lamports.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$explorer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/explorer.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$cluster$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/app/components/cluster-context.tsx [app-client] (ecmascript) <locals>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function WalletButton() {
    _s();
    const { connectors, connect, disconnect, wallet, status, error } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$wallet$2f$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWallet"])();
    const { getExplorerUrl } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$cluster$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useCluster"])();
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [copied, setCopied] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const address = wallet?.account.address;
    const balance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$hooks$2f$use$2d$balance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBalance"])(address);
    const open = ()=>setIsOpen(true);
    const close = ()=>setIsOpen(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WalletButton.useEffect": ()=>{
            function handleClickOutside(e) {
                if (ref.current && !ref.current.contains(e.target)) {
                    close();
                }
            }
            document.addEventListener("mousedown", handleClickOutside);
            return ({
                "WalletButton.useEffect": ()=>document.removeEventListener("mousedown", handleClickOutside)
            })["WalletButton.useEffect"];
        }
    }["WalletButton.useEffect"], []);
    const handleCopy = async ()=>{
        if (!address) return;
        await navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(()=>setCopied(false), 2000);
    };
    if (status !== "connected") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "relative",
            ref: ref,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>isOpen ? close() : open(),
                    className: "cursor-pointer rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-xs transition hover:bg-primary/90",
                    children: "Connect Wallet"
                }, void 0, false, {
                    fileName: "[project]/app/components/wallet-button.tsx",
                    lineNumber: 45,
                    columnNumber: 9
                }, this),
                isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-border-low bg-card p-3 shadow-lg",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mb-2 text-xs font-medium text-muted",
                            children: "Choose a wallet"
                        }, void 0, false, {
                            fileName: "[project]/app/components/wallet-button.tsx",
                            lineNumber: 54,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-1",
                            children: connectors.map((connector)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: async ()=>{
                                        try {
                                            await connect(connector.id);
                                            close();
                                        } catch  {
                                        // connection errors are surfaced through context state
                                        }
                                    },
                                    disabled: status === "connecting",
                                    className: "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition hover:bg-cream disabled:opacity-50 disabled:pointer-events-none",
                                    children: [
                                        connector.icon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                            src: connector.icon,
                                            alt: "",
                                            className: "h-5 w-5 rounded"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/wallet-button.tsx",
                                            lineNumber: 73,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: connector.name
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/wallet-button.tsx",
                                            lineNumber: 79,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, connector.id, true, {
                                    fileName: "[project]/app/components/wallet-button.tsx",
                                    lineNumber: 59,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/app/components/wallet-button.tsx",
                            lineNumber: 57,
                            columnNumber: 13
                        }, this),
                        status === "connecting" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mt-2 text-xs text-muted",
                            children: "Connecting..."
                        }, void 0, false, {
                            fileName: "[project]/app/components/wallet-button.tsx",
                            lineNumber: 84,
                            columnNumber: 15
                        }, this),
                        error != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mt-2 text-xs text-destructive",
                            children: error instanceof Error ? error.message : String(error)
                        }, void 0, false, {
                            fileName: "[project]/app/components/wallet-button.tsx",
                            lineNumber: 87,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/wallet-button.tsx",
                    lineNumber: 53,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/components/wallet-button.tsx",
            lineNumber: 44,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative",
        ref: ref,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>isOpen ? close() : open(),
                className: "flex cursor-pointer items-center gap-2 rounded-lg border border-border-low bg-card px-3 py-2 text-xs font-medium transition hover:bg-cream",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "h-2 w-2 rounded-full bg-green-500"
                    }, void 0, false, {
                        fileName: "[project]/app/components/wallet-button.tsx",
                        lineNumber: 103,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "font-mono",
                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$explorer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ellipsify"])(address, 4)
                    }, void 0, false, {
                        fileName: "[project]/app/components/wallet-button.tsx",
                        lineNumber: 104,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/wallet-button.tsx",
                lineNumber: 99,
                columnNumber: 7
            }, this),
            isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-border-low bg-card p-4 shadow-lg",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-muted",
                                children: "Balance"
                            }, void 0, false, {
                                fileName: "[project]/app/components/wallet-button.tsx",
                                lineNumber: 110,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-lg font-bold tabular-nums",
                                children: [
                                    balance.lamports != null ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$lamports$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lamportsToSolString"])(balance.lamports) : "\u2014",
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm font-normal text-muted",
                                        children: "SOL"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/wallet-button.tsx",
                                        lineNumber: 115,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/wallet-button.tsx",
                                lineNumber: 111,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/wallet-button.tsx",
                        lineNumber: 109,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-3 rounded-lg border border-border-low bg-cream/50 px-3 py-2",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "break-all font-mono text-xs",
                            children: address
                        }, void 0, false, {
                            fileName: "[project]/app/components/wallet-button.tsx",
                            lineNumber: 120,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/wallet-button.tsx",
                        lineNumber: 119,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleCopy,
                                className: "flex-1 cursor-pointer rounded-lg border border-border-low bg-card px-3 py-2 text-xs font-medium transition hover:bg-cream",
                                children: copied ? "Copied!" : "Copy address"
                            }, void 0, false, {
                                fileName: "[project]/app/components/wallet-button.tsx",
                                lineNumber: 124,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: getExplorerUrl(`/address/${address}`),
                                target: "_blank",
                                rel: "noopener noreferrer",
                                className: "flex-1 rounded-lg border border-border-low bg-card px-3 py-2 text-center text-xs font-medium transition hover:bg-cream",
                                children: "Explorer"
                            }, void 0, false, {
                                fileName: "[project]/app/components/wallet-button.tsx",
                                lineNumber: 130,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/wallet-button.tsx",
                        lineNumber: 123,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>{
                            disconnect();
                            close();
                        },
                        className: "mt-2 w-full cursor-pointer rounded-lg border border-border-low bg-card px-3 py-2 text-xs font-medium text-destructive transition hover:bg-destructive/10",
                        children: "Disconnect"
                    }, void 0, false, {
                        fileName: "[project]/app/components/wallet-button.tsx",
                        lineNumber: 140,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/wallet-button.tsx",
                lineNumber: 108,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/wallet-button.tsx",
        lineNumber: 98,
        columnNumber: 5
    }, this);
}
_s(WalletButton, "YjsIF010S2rMCrJUODnf8+uHqCc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$wallet$2f$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWallet"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$cluster$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useCluster"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$hooks$2f$use$2d$balance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBalance"]
    ];
});
_c = WalletButton;
var _c;
__turbopack_context__.k.register(_c, "WalletButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/generated/wildquest/accounts/counter.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "COUNTER_DISCRIMINATOR",
    ()=>COUNTER_DISCRIMINATOR,
    "decodeCounter",
    ()=>decodeCounter,
    "fetchAllCounter",
    ()=>fetchAllCounter,
    "fetchAllMaybeCounter",
    ()=>fetchAllMaybeCounter,
    "fetchCounter",
    ()=>fetchCounter,
    "fetchMaybeCounter",
    ()=>fetchMaybeCounter,
    "getCounterCodec",
    ()=>getCounterCodec,
    "getCounterDecoder",
    ()=>getCounterDecoder,
    "getCounterDiscriminatorBytes",
    ()=>getCounterDiscriminatorBytes,
    "getCounterEncoder",
    ()=>getCounterEncoder,
    "getCounterSize",
    ()=>getCounterSize
]);
/**
 * This code was AUTOGENERATED using the Codama library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun Codama to update it.
 *
 * @see https://github.com/codama-idl/codama
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$accounts$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/accounts/dist/index.browser.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/kit/node_modules/@solana/codecs-core/dist/index.browser.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/addresses/dist/index.browser.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/kit/node_modules/@solana/codecs-data-structures/dist/index.browser.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/kit/node_modules/@solana/codecs-numbers/dist/index.browser.mjs [app-client] (ecmascript)");
;
const COUNTER_DISCRIMINATOR = new Uint8Array([
    255,
    176,
    4,
    245,
    188,
    253,
    124,
    25
]);
function getCounterDiscriminatorBytes() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fixEncoderSize"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getBytesEncoder"])(), 8).encode(COUNTER_DISCRIMINATOR);
}
function getCounterEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["transformEncoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getStructEncoder"])([
        [
            "discriminator",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fixEncoderSize"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getBytesEncoder"])(), 8)
        ],
        [
            "count",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getU64Encoder"])()
        ],
        [
            "authority",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAddressEncoder"])()
        ]
    ]), (value)=>({
            ...value,
            discriminator: COUNTER_DISCRIMINATOR
        }));
}
function getCounterDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getStructDecoder"])([
        [
            "discriminator",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fixDecoderSize"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getBytesDecoder"])(), 8)
        ],
        [
            "count",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getU64Decoder"])()
        ],
        [
            "authority",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAddressDecoder"])()
        ]
    ]);
}
function getCounterCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["combineCodec"])(getCounterEncoder(), getCounterDecoder());
}
function decodeCounter(encodedAccount) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$accounts$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decodeAccount"])(encodedAccount, getCounterDecoder());
}
async function fetchCounter(rpc, address, config) {
    const maybeAccount = await fetchMaybeCounter(rpc, address, config);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$accounts$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertAccountExists"])(maybeAccount);
    return maybeAccount;
}
async function fetchMaybeCounter(rpc, address, config) {
    const maybeAccount = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$accounts$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchEncodedAccount"])(rpc, address, config);
    return decodeCounter(maybeAccount);
}
async function fetchAllCounter(rpc, addresses, config) {
    const maybeAccounts = await fetchAllMaybeCounter(rpc, addresses, config);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$accounts$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertAccountsExist"])(maybeAccounts);
    return maybeAccounts;
}
async function fetchAllMaybeCounter(rpc, addresses, config) {
    const maybeAccounts = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$accounts$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchEncodedAccounts"])(rpc, addresses, config);
    return maybeAccounts.map((maybeAccount)=>decodeCounter(maybeAccount));
}
function getCounterSize() {
    return 48;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/generated/wildquest/accounts/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
/**
 * This code was AUTOGENERATED using the Codama library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun Codama to update it.
 *
 * @see https://github.com/codama-idl/codama
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$accounts$2f$counter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/generated/wildquest/accounts/counter.ts [app-client] (ecmascript)");
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/generated/wildquest/pdas/counter.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "findCounterPda",
    ()=>findCounterPda
]);
/**
 * This code was AUTOGENERATED using the Codama library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun Codama to update it.
 *
 * @see https://github.com/codama-idl/codama
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/kit/node_modules/@solana/codecs-data-structures/dist/index.browser.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/addresses/dist/index.browser.mjs [app-client] (ecmascript)");
;
async function findCounterPda(config = {}) {
    const { programAddress = "DzUrGjvWMzp8m3Vs6jb8F7xfoh96W5Jmad9GBLgCAgvo" } = config;
    return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getProgramDerivedAddress"])({
        programAddress,
        seeds: [
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getBytesEncoder"])().encode(new Uint8Array([
                99,
                111,
                117,
                110,
                116,
                101,
                114
            ]))
        ]
    });
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/generated/wildquest/pdas/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
/**
 * This code was AUTOGENERATED using the Codama library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun Codama to update it.
 *
 * @see https://github.com/codama-idl/codama
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$pdas$2f$counter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/generated/wildquest/pdas/counter.ts [app-client] (ecmascript)");
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/generated/wildquest/shared/index.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "expectAddress",
    ()=>expectAddress,
    "expectProgramDerivedAddress",
    ()=>expectProgramDerivedAddress,
    "expectSome",
    ()=>expectSome,
    "expectTransactionSigner",
    ()=>expectTransactionSigner,
    "getAccountMetaFactory",
    ()=>getAccountMetaFactory,
    "isTransactionSigner",
    ()=>isTransactionSigner
]);
/**
 * This code was AUTOGENERATED using the Codama library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun Codama to update it.
 *
 * @see https://github.com/codama-idl/codama
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/instructions/dist/index.browser.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/addresses/dist/index.browser.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$signers$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/signers/dist/index.browser.mjs [app-client] (ecmascript)");
;
function expectSome(value) {
    if (value === null || value === undefined) {
        throw new Error("Expected a value but received null or undefined.");
    }
    return value;
}
function expectAddress(value) {
    if (!value) {
        throw new Error("Expected a Address.");
    }
    if (typeof value === "object" && "address" in value) {
        return value.address;
    }
    if (Array.isArray(value)) {
        return value[0];
    }
    return value;
}
function expectProgramDerivedAddress(value) {
    if (!value || !Array.isArray(value) || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isProgramDerivedAddress"])(value)) {
        throw new Error("Expected a ProgramDerivedAddress.");
    }
    return value;
}
function expectTransactionSigner(value) {
    if (!value || !isTransactionSigner(value)) {
        throw new Error("Expected a TransactionSigner.");
    }
    return value;
}
function getAccountMetaFactory(programAddress, optionalAccountStrategy) {
    return (account)=>{
        if (!account.value) {
            if (optionalAccountStrategy === "omitted") return;
            return Object.freeze({
                address: programAddress,
                role: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AccountRole"].READONLY
            });
        }
        const writableRole = account.isWritable ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AccountRole"].WRITABLE : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AccountRole"].READONLY;
        return Object.freeze({
            address: expectAddress(account.value),
            role: isTransactionSigner(account.value) ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["upgradeRoleToSigner"])(writableRole) : writableRole,
            ...isTransactionSigner(account.value) ? {
                signer: account.value
            } : {}
        });
    };
}
function isTransactionSigner(value) {
    return !!value && typeof value === "object" && "address" in value && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$signers$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isTransactionSigner"])(value);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/generated/wildquest/instructions/increment.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "INCREMENT_DISCRIMINATOR",
    ()=>INCREMENT_DISCRIMINATOR,
    "getIncrementDiscriminatorBytes",
    ()=>getIncrementDiscriminatorBytes,
    "getIncrementInstruction",
    ()=>getIncrementInstruction,
    "getIncrementInstructionAsync",
    ()=>getIncrementInstructionAsync,
    "getIncrementInstructionDataCodec",
    ()=>getIncrementInstructionDataCodec,
    "getIncrementInstructionDataDecoder",
    ()=>getIncrementInstructionDataDecoder,
    "getIncrementInstructionDataEncoder",
    ()=>getIncrementInstructionDataEncoder,
    "parseIncrementInstruction",
    ()=>parseIncrementInstruction
]);
/**
 * This code was AUTOGENERATED using the Codama library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun Codama to update it.
 *
 * @see https://github.com/codama-idl/codama
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/kit/node_modules/@solana/codecs-core/dist/index.browser.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/kit/node_modules/@solana/codecs-data-structures/dist/index.browser.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$pdas$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/app/generated/wildquest/pdas/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$pdas$2f$counter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/generated/wildquest/pdas/counter.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$programs$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/app/generated/wildquest/programs/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$programs$2f$wildquest$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/generated/wildquest/programs/wildquest.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$shared$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/generated/wildquest/shared/index.ts [app-client] (ecmascript)");
;
;
;
;
const INCREMENT_DISCRIMINATOR = new Uint8Array([
    11,
    18,
    104,
    9,
    104,
    174,
    59,
    33
]);
function getIncrementDiscriminatorBytes() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fixEncoderSize"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getBytesEncoder"])(), 8).encode(INCREMENT_DISCRIMINATOR);
}
function getIncrementInstructionDataEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["transformEncoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getStructEncoder"])([
        [
            "discriminator",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fixEncoderSize"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getBytesEncoder"])(), 8)
        ]
    ]), (value)=>({
            ...value,
            discriminator: INCREMENT_DISCRIMINATOR
        }));
}
function getIncrementInstructionDataDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getStructDecoder"])([
        [
            "discriminator",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fixDecoderSize"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getBytesDecoder"])(), 8)
        ]
    ]);
}
function getIncrementInstructionDataCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["combineCodec"])(getIncrementInstructionDataEncoder(), getIncrementInstructionDataDecoder());
}
async function getIncrementInstructionAsync(input, config) {
    // Program address.
    const programAddress = config?.programAddress ?? __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$programs$2f$wildquest$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WILDQUEST_PROGRAM_ADDRESS"];
    // Original accounts.
    const originalAccounts = {
        counter: {
            value: input.counter ?? null,
            isWritable: true
        },
        authority: {
            value: input.authority ?? null,
            isWritable: false
        }
    };
    const accounts = originalAccounts;
    // Resolve default values.
    if (!accounts.counter.value) {
        accounts.counter.value = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$pdas$2f$counter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findCounterPda"])();
    }
    const getAccountMeta = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$shared$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAccountMetaFactory"])(programAddress, "programId");
    return Object.freeze({
        accounts: [
            getAccountMeta(accounts.counter),
            getAccountMeta(accounts.authority)
        ],
        data: getIncrementInstructionDataEncoder().encode({}),
        programAddress
    });
}
function getIncrementInstruction(input, config) {
    // Program address.
    const programAddress = config?.programAddress ?? __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$programs$2f$wildquest$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WILDQUEST_PROGRAM_ADDRESS"];
    // Original accounts.
    const originalAccounts = {
        counter: {
            value: input.counter ?? null,
            isWritable: true
        },
        authority: {
            value: input.authority ?? null,
            isWritable: false
        }
    };
    const accounts = originalAccounts;
    const getAccountMeta = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$shared$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAccountMetaFactory"])(programAddress, "programId");
    return Object.freeze({
        accounts: [
            getAccountMeta(accounts.counter),
            getAccountMeta(accounts.authority)
        ],
        data: getIncrementInstructionDataEncoder().encode({}),
        programAddress
    });
}
function parseIncrementInstruction(instruction) {
    if (instruction.accounts.length < 2) {
        // TODO: Coded error.
        throw new Error("Not enough accounts");
    }
    let accountIndex = 0;
    const getNextAccount = ()=>{
        const accountMeta = instruction.accounts[accountIndex];
        accountIndex += 1;
        return accountMeta;
    };
    return {
        programAddress: instruction.programAddress,
        accounts: {
            counter: getNextAccount(),
            authority: getNextAccount()
        },
        data: getIncrementInstructionDataDecoder().decode(instruction.data)
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/generated/wildquest/instructions/initialize.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "INITIALIZE_DISCRIMINATOR",
    ()=>INITIALIZE_DISCRIMINATOR,
    "getInitializeDiscriminatorBytes",
    ()=>getInitializeDiscriminatorBytes,
    "getInitializeInstruction",
    ()=>getInitializeInstruction,
    "getInitializeInstructionAsync",
    ()=>getInitializeInstructionAsync,
    "getInitializeInstructionDataCodec",
    ()=>getInitializeInstructionDataCodec,
    "getInitializeInstructionDataDecoder",
    ()=>getInitializeInstructionDataDecoder,
    "getInitializeInstructionDataEncoder",
    ()=>getInitializeInstructionDataEncoder,
    "parseInitializeInstruction",
    ()=>parseInitializeInstruction
]);
/**
 * This code was AUTOGENERATED using the Codama library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun Codama to update it.
 *
 * @see https://github.com/codama-idl/codama
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/kit/node_modules/@solana/codecs-core/dist/index.browser.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/kit/node_modules/@solana/codecs-data-structures/dist/index.browser.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$pdas$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/app/generated/wildquest/pdas/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$pdas$2f$counter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/generated/wildquest/pdas/counter.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$programs$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/app/generated/wildquest/programs/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$programs$2f$wildquest$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/generated/wildquest/programs/wildquest.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$shared$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/generated/wildquest/shared/index.ts [app-client] (ecmascript)");
;
;
;
;
const INITIALIZE_DISCRIMINATOR = new Uint8Array([
    175,
    175,
    109,
    31,
    13,
    152,
    155,
    237
]);
function getInitializeDiscriminatorBytes() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fixEncoderSize"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getBytesEncoder"])(), 8).encode(INITIALIZE_DISCRIMINATOR);
}
function getInitializeInstructionDataEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["transformEncoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getStructEncoder"])([
        [
            "discriminator",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fixEncoderSize"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getBytesEncoder"])(), 8)
        ]
    ]), (value)=>({
            ...value,
            discriminator: INITIALIZE_DISCRIMINATOR
        }));
}
function getInitializeInstructionDataDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getStructDecoder"])([
        [
            "discriminator",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fixDecoderSize"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getBytesDecoder"])(), 8)
        ]
    ]);
}
function getInitializeInstructionDataCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["combineCodec"])(getInitializeInstructionDataEncoder(), getInitializeInstructionDataDecoder());
}
async function getInitializeInstructionAsync(input, config) {
    // Program address.
    const programAddress = config?.programAddress ?? __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$programs$2f$wildquest$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WILDQUEST_PROGRAM_ADDRESS"];
    // Original accounts.
    const originalAccounts = {
        payer: {
            value: input.payer ?? null,
            isWritable: true
        },
        counter: {
            value: input.counter ?? null,
            isWritable: true
        },
        systemProgram: {
            value: input.systemProgram ?? null,
            isWritable: false
        }
    };
    const accounts = originalAccounts;
    // Resolve default values.
    if (!accounts.counter.value) {
        accounts.counter.value = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$pdas$2f$counter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findCounterPda"])();
    }
    if (!accounts.systemProgram.value) {
        accounts.systemProgram.value = "11111111111111111111111111111111";
    }
    const getAccountMeta = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$shared$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAccountMetaFactory"])(programAddress, "programId");
    return Object.freeze({
        accounts: [
            getAccountMeta(accounts.payer),
            getAccountMeta(accounts.counter),
            getAccountMeta(accounts.systemProgram)
        ],
        data: getInitializeInstructionDataEncoder().encode({}),
        programAddress
    });
}
function getInitializeInstruction(input, config) {
    // Program address.
    const programAddress = config?.programAddress ?? __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$programs$2f$wildquest$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WILDQUEST_PROGRAM_ADDRESS"];
    // Original accounts.
    const originalAccounts = {
        payer: {
            value: input.payer ?? null,
            isWritable: true
        },
        counter: {
            value: input.counter ?? null,
            isWritable: true
        },
        systemProgram: {
            value: input.systemProgram ?? null,
            isWritable: false
        }
    };
    const accounts = originalAccounts;
    // Resolve default values.
    if (!accounts.systemProgram.value) {
        accounts.systemProgram.value = "11111111111111111111111111111111";
    }
    const getAccountMeta = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$shared$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAccountMetaFactory"])(programAddress, "programId");
    return Object.freeze({
        accounts: [
            getAccountMeta(accounts.payer),
            getAccountMeta(accounts.counter),
            getAccountMeta(accounts.systemProgram)
        ],
        data: getInitializeInstructionDataEncoder().encode({}),
        programAddress
    });
}
function parseInitializeInstruction(instruction) {
    if (instruction.accounts.length < 3) {
        // TODO: Coded error.
        throw new Error("Not enough accounts");
    }
    let accountIndex = 0;
    const getNextAccount = ()=>{
        const accountMeta = instruction.accounts[accountIndex];
        accountIndex += 1;
        return accountMeta;
    };
    return {
        programAddress: instruction.programAddress,
        accounts: {
            payer: getNextAccount(),
            counter: getNextAccount(),
            systemProgram: getNextAccount()
        },
        data: getInitializeInstructionDataDecoder().decode(instruction.data)
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/generated/wildquest/instructions/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
/**
 * This code was AUTOGENERATED using the Codama library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun Codama to update it.
 *
 * @see https://github.com/codama-idl/codama
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$instructions$2f$increment$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/generated/wildquest/instructions/increment.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$instructions$2f$initialize$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/generated/wildquest/instructions/initialize.ts [app-client] (ecmascript)");
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/generated/wildquest/programs/wildquest.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WILDQUEST_PROGRAM_ADDRESS",
    ()=>WILDQUEST_PROGRAM_ADDRESS,
    "WildquestAccount",
    ()=>WildquestAccount,
    "WildquestInstruction",
    ()=>WildquestInstruction,
    "identifyWildquestAccount",
    ()=>identifyWildquestAccount,
    "identifyWildquestInstruction",
    ()=>identifyWildquestInstruction,
    "parseWildquestInstruction",
    ()=>parseWildquestInstruction
]);
/**
 * This code was AUTOGENERATED using the Codama library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun Codama to update it.
 *
 * @see https://github.com/codama-idl/codama
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/instructions/dist/index.browser.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/kit/node_modules/@solana/codecs-core/dist/index.browser.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/kit/node_modules/@solana/codecs-data-structures/dist/index.browser.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$instructions$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/app/generated/wildquest/instructions/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$instructions$2f$increment$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/generated/wildquest/instructions/increment.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$instructions$2f$initialize$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/generated/wildquest/instructions/initialize.ts [app-client] (ecmascript)");
;
;
const WILDQUEST_PROGRAM_ADDRESS = "DzUrGjvWMzp8m3Vs6jb8F7xfoh96W5Jmad9GBLgCAgvo";
var WildquestAccount = /*#__PURE__*/ function(WildquestAccount) {
    WildquestAccount[WildquestAccount["Counter"] = 0] = "Counter";
    return WildquestAccount;
}({});
function identifyWildquestAccount(account) {
    const data = "data" in account ? account.data : account;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["containsBytes"])(data, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fixEncoderSize"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getBytesEncoder"])(), 8).encode(new Uint8Array([
        255,
        176,
        4,
        245,
        188,
        253,
        124,
        25
    ])), 0)) {
        return 0;
    }
    throw new Error("The provided account could not be identified as a wildquest account.");
}
var WildquestInstruction = /*#__PURE__*/ function(WildquestInstruction) {
    WildquestInstruction[WildquestInstruction["Increment"] = 0] = "Increment";
    WildquestInstruction[WildquestInstruction["Initialize"] = 1] = "Initialize";
    return WildquestInstruction;
}({});
function identifyWildquestInstruction(instruction) {
    const data = "data" in instruction ? instruction.data : instruction;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["containsBytes"])(data, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fixEncoderSize"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getBytesEncoder"])(), 8).encode(new Uint8Array([
        11,
        18,
        104,
        9,
        104,
        174,
        59,
        33
    ])), 0)) {
        return 0;
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["containsBytes"])(data, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fixEncoderSize"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getBytesEncoder"])(), 8).encode(new Uint8Array([
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
    ])), 0)) {
        return 1;
    }
    throw new Error("The provided instruction could not be identified as a wildquest instruction.");
}
function parseWildquestInstruction(instruction) {
    const instructionType = identifyWildquestInstruction(instruction);
    switch(instructionType){
        case 0:
            {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertIsInstructionWithAccounts"])(instruction);
                return {
                    instructionType: 0,
                    ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$instructions$2f$increment$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseIncrementInstruction"])(instruction)
                };
            }
        case 1:
            {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertIsInstructionWithAccounts"])(instruction);
                return {
                    instructionType: 1,
                    ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$instructions$2f$initialize$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseInitializeInstruction"])(instruction)
                };
            }
        default:
            throw new Error(`Unrecognized instruction type: ${instructionType}`);
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/generated/wildquest/programs/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
/**
 * This code was AUTOGENERATED using the Codama library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun Codama to update it.
 *
 * @see https://github.com/codama-idl/codama
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$programs$2f$wildquest$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/generated/wildquest/programs/wildquest.ts [app-client] (ecmascript)");
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/generated/wildquest/errors/wildquest.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WILDQUEST_ERROR__COUNTER_OVERFLOW",
    ()=>WILDQUEST_ERROR__COUNTER_OVERFLOW,
    "WILDQUEST_ERROR__UNAUTHORIZED",
    ()=>WILDQUEST_ERROR__UNAUTHORIZED,
    "getWildquestErrorMessage",
    ()=>getWildquestErrorMessage,
    "isWildquestError",
    ()=>isWildquestError
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
/**
 * This code was AUTOGENERATED using the Codama library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun Codama to update it.
 *
 * @see https://github.com/codama-idl/codama
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$programs$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/programs/dist/index.browser.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$programs$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/app/generated/wildquest/programs/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$programs$2f$wildquest$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/generated/wildquest/programs/wildquest.ts [app-client] (ecmascript)");
;
;
const WILDQUEST_ERROR__UNAUTHORIZED = 0x1770; // 6000
const WILDQUEST_ERROR__COUNTER_OVERFLOW = 0x1771; // 6001
let wildquestErrorMessages;
if (("TURBOPACK compile-time value", "development") !== "production") {
    wildquestErrorMessages = {
        [WILDQUEST_ERROR__COUNTER_OVERFLOW]: `Counter has reached the maximum value`,
        [WILDQUEST_ERROR__UNAUTHORIZED]: `Only the counter authority can update this counter`
    };
}
function getWildquestErrorMessage(code) {
    if ("TURBOPACK compile-time truthy", 1) {
        return wildquestErrorMessages[code];
    }
    //TURBOPACK unreachable
    ;
}
function isWildquestError(error, transactionMessage, code) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$programs$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isProgramError"])(error, transactionMessage, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$programs$2f$wildquest$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WILDQUEST_PROGRAM_ADDRESS"], code);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/generated/wildquest/errors/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
/**
 * This code was AUTOGENERATED using the Codama library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun Codama to update it.
 *
 * @see https://github.com/codama-idl/codama
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$errors$2f$wildquest$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/generated/wildquest/errors/wildquest.ts [app-client] (ecmascript)");
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/generated/wildquest/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
/**
 * This code was AUTOGENERATED using the Codama library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun Codama to update it.
 *
 * @see https://github.com/codama-idl/codama
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$accounts$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/app/generated/wildquest/accounts/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$errors$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/app/generated/wildquest/errors/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$instructions$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/app/generated/wildquest/instructions/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$pdas$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/app/generated/wildquest/pdas/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$programs$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/app/generated/wildquest/programs/index.ts [app-client] (ecmascript) <locals>");
;
;
;
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$rpc$2d$types$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/rpc-types/dist/index.browser.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$wallet$2f$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/wallet/context.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$hooks$2f$use$2d$balance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/hooks/use-balance.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$hooks$2f$use$2d$send$2d$transaction$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/hooks/use-send-transaction.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$lamports$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/lamports.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$solana$2d$client$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/solana-client-context.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$explorer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/explorer.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$grid$2d$background$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/grid-background.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$theme$2d$toggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/theme-toggle.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$cluster$2d$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/cluster-select.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$wallet$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/wallet-button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$cluster$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/app/components/cluster-context.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/app/generated/wildquest/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$instructions$2f$initialize$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/generated/wildquest/instructions/initialize.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
function Home() {
    _s();
    const { wallet, status, signer } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$wallet$2f$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWallet"])();
    const { cluster, getExplorerUrl } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$cluster$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useCluster"])();
    const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$solana$2d$client$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSolanaClient"])();
    const { send, isSending } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$hooks$2f$use$2d$send$2d$transaction$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSendTransaction"])();
    const address = wallet?.account.address;
    const balance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$hooks$2f$use$2d$balance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBalance"])(address);
    const [copied, setCopied] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleCopy = async ()=>{
        if (!address) return;
        await navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(()=>setCopied(false), 2000);
    };
    const handleAirdrop = async ()=>{
        if (!address) return;
        try {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].info("Requesting airdrop...");
            const sig = await client.airdrop(address, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$rpc$2d$types$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lamports"])(1_000_000_000n));
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Airdrop received!", {
                description: sig ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                    href: getExplorerUrl(`/tx/${sig}`),
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "underline",
                    children: "View transaction"
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 43,
                    columnNumber: 11
                }, this) : undefined
            });
        } catch (err) {
            console.error("Airdrop failed:", err);
            const msg = err instanceof Error ? err.message : String(err);
            const isRateLimited = msg.includes("429") || msg.includes("Internal JSON-RPC error");
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(isRateLimited ? "Devnet faucet rate-limited. Use the web faucet instead." : "Airdrop failed. Try again later.", isRateLimited ? {
                description: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                    href: "https://faucet.solana.com/",
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "underline",
                    children: "Open faucet.solana.com"
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 65,
                    columnNumber: 17
                }, this)
            } : undefined);
        }
    };
    const handleCallProgram = async ()=>{
        if (!signer) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Connect your wallet first.");
            return;
        }
        try {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].info("Sending initialize transaction...");
            const instruction = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$generated$2f$wildquest$2f$instructions$2f$initialize$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getInitializeInstructionAsync"])({
                payer: signer
            });
            const signature = await send({
                instructions: [
                    instruction
                ]
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("WildQuest program called successfully!", {
                description: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                    href: getExplorerUrl(`/tx/${signature}`),
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "underline",
                    children: "View transaction"
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 92,
                    columnNumber: 11
                }, this)
            });
        } catch (err) {
            console.error("WildQuest call failed:", err);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(err instanceof Error ? err.message : "Failed to call the WildQuest program.");
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative min-h-screen bg-background text-foreground",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$grid$2d$background$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GridBackground"], {}, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 112,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative z-10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        className: "mx-auto flex max-w-6xl items-center justify-between px-6 py-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm font-semibold tracking-tight",
                                children: "Solana Starter Kit"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 117,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$theme$2d$toggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ThemeToggle"], {}, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 121,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$cluster$2d$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ClusterSelect"], {}, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 122,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$wallet$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WalletButton"], {}, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 123,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 120,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 116,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                        className: "mx-auto max-w-6xl px-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: "pt-6 pb-20 md:pt-8 md:pb-32",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col gap-6 md:flex-row md:items-center md:justify-between",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                className: "font-black tracking-tight text-foreground",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "block text-6xl md:text-7xl",
                                                        children: "Anchor"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 133,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "block text-7xl md:text-8xl",
                                                        children: "Vault"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 134,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 132,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 131,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex max-w-2xl flex-col gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-base leading-relaxed text-foreground/50",
                                                    children: "This program creates a personal vault for each user using a Program Derived Address (PDA). Connect your wallet, deposit SOL into your vault, and withdraw it anytime. Only you can access your funds."
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 139,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm leading-relaxed text-foreground/40",
                                                    children: [
                                                        "The vault is an",
                                                        " ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                            href: "https://www.anchor-lang.com/docs/introduction",
                                                            target: "_blank",
                                                            rel: "noopener noreferrer",
                                                            className: "underline underline-offset-2",
                                                            children: "Anchor"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 147,
                                                            columnNumber: 19
                                                        }, this),
                                                        " ",
                                                        "program you can deploy to localnet or devnet and modify yourself. Check the README for setup instructions."
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 145,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-wrap gap-4",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                            href: "https://solana.com/docs",
                                                            target: "_blank",
                                                            rel: "noopener noreferrer",
                                                            className: "inline-flex items-center gap-1 text-sm font-medium text-foreground/70 underline underline-offset-4 transition-colors hover:text-foreground",
                                                            children: [
                                                                "Solana docs",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    "aria-hidden": "true",
                                                                    children: "→"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/page.tsx",
                                                                    lineNumber: 166,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 159,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                            href: "https://www.anchor-lang.com/docs/introduction",
                                                            target: "_blank",
                                                            rel: "noopener noreferrer",
                                                            className: "inline-flex items-center gap-1 text-sm font-medium text-foreground/70 underline underline-offset-4 transition-colors hover:text-foreground",
                                                            children: [
                                                                "Anchor docs",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    "aria-hidden": "true",
                                                                    children: "→"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/page.tsx",
                                                                    lineNumber: 175,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 168,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                            href: "https://faucet.solana.com/",
                                                            target: "_blank",
                                                            rel: "noopener noreferrer",
                                                            className: "inline-flex items-center gap-1 text-sm font-medium text-foreground/70 underline underline-offset-4 transition-colors hover:text-foreground",
                                                            children: [
                                                                "Faucet",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    "aria-hidden": "true",
                                                                    children: "→"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/page.tsx",
                                                                    lineNumber: 184,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 177,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 158,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 138,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 130,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 129,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-10 pb-20",
                                children: [
                                    status === "connected" && address && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                        className: "relative w-full overflow-hidden rounded-2xl border border-border-low bg-card px-5 py-5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "pointer-events-none absolute inset-0 opacity-100 dark:opacity-0",
                                                "aria-hidden": "true",
                                                style: {
                                                    backgroundImage: `
                      linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)
                    `,
                                                    backgroundSize: "24px 24px",
                                                    mask: "radial-gradient(ellipse 80% 80% at 50% 0%, black, transparent)",
                                                    WebkitMask: "radial-gradient(ellipse 80% 80% at 50% 0%, black, transparent)"
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 196,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "pointer-events-none absolute inset-0 opacity-0 dark:opacity-100",
                                                "aria-hidden": "true",
                                                style: {
                                                    backgroundImage: `
                      linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)
                    `,
                                                    backgroundSize: "24px 24px",
                                                    mask: "radial-gradient(ellipse 80% 80% at 50% 0%, black, transparent)",
                                                    WebkitMask: "radial-gradient(ellipse 80% 80% at 50% 0%, black, transparent)"
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 210,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "relative flex items-center justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-3",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex h-8 w-8 items-center justify-center rounded-lg bg-cream",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                    xmlns: "http://www.w3.org/2000/svg",
                                                                    viewBox: "0 0 24 24",
                                                                    fill: "none",
                                                                    stroke: "currentColor",
                                                                    strokeWidth: "1.5",
                                                                    strokeLinecap: "round",
                                                                    strokeLinejoin: "round",
                                                                    className: "h-4 w-4 text-foreground/70",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                            d: "M21 12V7H5a2 2 0 0 1 0-4h14v4"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/page.tsx",
                                                                            lineNumber: 237,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                            d: "M3 5v14a2 2 0 0 0 2 2h16v-5"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/page.tsx",
                                                                            lineNumber: 238,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                            d: "M18 12a2 2 0 0 0 0 4h4v-4Z"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/page.tsx",
                                                                            lineNumber: 239,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/page.tsx",
                                                                    lineNumber: 227,
                                                                    columnNumber: 23
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 226,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-sm font-medium",
                                                                children: "Wallet Balance"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 242,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: handleCopy,
                                                                className: "flex cursor-pointer items-center gap-1.5 font-mono text-xs text-muted transition hover:text-foreground",
                                                                children: [
                                                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$explorer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ellipsify"])(address, 4),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                        xmlns: "http://www.w3.org/2000/svg",
                                                                        viewBox: "0 0 24 24",
                                                                        fill: "none",
                                                                        stroke: "currentColor",
                                                                        strokeWidth: "2",
                                                                        strokeLinecap: "round",
                                                                        strokeLinejoin: "round",
                                                                        className: "h-3 w-3",
                                                                        children: copied ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                            d: "M20 6 9 17l-5-5"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/page.tsx",
                                                                            lineNumber: 259,
                                                                            columnNumber: 27
                                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                                                                    width: "14",
                                                                                    height: "14",
                                                                                    x: "8",
                                                                                    y: "8",
                                                                                    rx: "2",
                                                                                    ry: "2"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/page.tsx",
                                                                                    lineNumber: 262,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                                    d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/page.tsx",
                                                                                    lineNumber: 270,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/page.tsx",
                                                                        lineNumber: 248,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 243,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 225,
                                                        columnNumber: 19
                                                    }, this),
                                                    cluster !== "mainnet" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: handleAirdrop,
                                                        className: "cursor-pointer rounded-lg border border-border-low px-3 py-1.5 text-xs font-medium transition hover:bg-cream",
                                                        children: "Airdrop"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 277,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 224,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "relative mt-4 font-mono text-4xl font-bold tabular-nums tracking-tight",
                                                children: [
                                                    balance.lamports != null ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$lamports$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lamportsToSolString"])(balance.lamports) : "\u2014",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "ml-1.5 text-lg font-normal text-muted",
                                                        children: "SOL"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 289,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 285,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 195,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                        className: "w-full rounded-2xl border border-border-low bg-card p-6 shadow-[0_20px_80px_-50px_rgba(0,0,0,0.35)]",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "space-y-3",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-lg font-semibold",
                                                            children: "WildQuest"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 299,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-sm text-muted",
                                                            children: "Call the on-chain WildQuest program from the frontend using the generated Anchor client."
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 300,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 298,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: handleCallProgram,
                                                    disabled: !signer || isSending,
                                                    className: "rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-xs transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50",
                                                    children: isSending ? "Calling program..." : "Call program"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 306,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 297,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 296,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 192,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 127,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 114,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 111,
        columnNumber: 5
    }, this);
}
_s(Home, "DsjojQQVIXmM6xYLK8Ji6jsvEyU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$wallet$2f$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWallet"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$cluster$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useCluster"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$solana$2d$client$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSolanaClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$hooks$2f$use$2d$send$2d$transaction$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSendTransaction"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$hooks$2f$use$2d$balance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBalance"]
    ];
});
_c = Home;
var _c;
__turbopack_context__.k.register(_c, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_0htr0h8._.js.map
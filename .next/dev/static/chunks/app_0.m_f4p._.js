(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/lib/solana-client.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CLUSTERS",
    ()=>CLUSTERS,
    "createSolanaClient",
    ()=>createSolanaClient,
    "getClusterUrl",
    ()=>getClusterUrl,
    "getClusterWsConfig",
    ()=>getClusterWsConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$plugin$2d$core$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/plugin-core/dist/index.browser.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2d$plugin$2d$rpc$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/kit-plugin-rpc/dist/index.browser.mjs [app-client] (ecmascript)");
;
;
const CLUSTERS = [
    "devnet",
    "testnet",
    "mainnet",
    "localnet"
];
const DEVNET_RPC_URL = ("TURBOPACK compile-time value", "https://devnet.helius-rpc.com/?api-key=6949a0d2-fea6-4aae-ad94-7a75676c86d0") || "https://api.devnet.solana.com";
const DEVNET_WS_URL = ("TURBOPACK compile-time value", "wss://devnet.helius-rpc.com/?api-key=6949a0d2-fea6-4aae-ad94-7a75676c86d0") || "wss://api.devnet.solana.com";
const CLUSTER_URLS = {
    devnet: DEVNET_RPC_URL,
    testnet: "https://api.testnet.solana.com",
    mainnet: "https://api.mainnet-beta.solana.com",
    localnet: "http://localhost:8899"
};
const WS_URLS = {
    devnet: DEVNET_WS_URL,
    testnet: "wss://api.testnet.solana.com",
    mainnet: "wss://api.mainnet-beta.solana.com",
    localnet: "ws://localhost:8900"
};
function getClusterUrl(cluster) {
    return CLUSTER_URLS[cluster];
}
function getClusterWsConfig(cluster) {
    return cluster === "localnet" ? {
        url: WS_URLS[cluster]
    } : undefined;
}
function createSolanaClient(cluster) {
    const url = CLUSTER_URLS[cluster];
    const wsUrl = WS_URLS[cluster];
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$plugin$2d$core$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createEmptyClient"])().use((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2d$plugin$2d$rpc$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["rpc"])(url, {
        url: wsUrl
    })).use((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2d$plugin$2d$rpc$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["rpcAirdrop"])());
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/lib/explorer.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ellipsify",
    ()=>ellipsify,
    "getExplorerUrl",
    ()=>getExplorerUrl
]);
function getExplorerUrl(path, cluster) {
    const base = "https://explorer.solana.com";
    const url = new URL(path, base);
    if (cluster !== "mainnet") {
        if (cluster === "localnet") {
            url.searchParams.set("cluster", "custom");
            url.searchParams.set("customUrl", "http://localhost:8899");
        } else {
            url.searchParams.set("cluster", cluster);
        }
    }
    return url.toString();
}
function ellipsify(str, chars = 4) {
    if (str.length <= chars * 2 + 3) return str;
    return `${str.slice(0, chars)}...${str.slice(-chars)}`;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/cluster-context.tsx [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ClusterProvider",
    ()=>ClusterProvider,
    "useCluster",
    ()=>useCluster
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$solana$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/solana-client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$explorer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/explorer.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
const ClusterContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
const STORAGE_KEY = "solana-cluster";
function getInitialCluster() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$solana$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CLUSTERS"].includes(stored)) {
        return stored;
    }
    return "devnet";
}
;
function ClusterProvider({ children }) {
    _s();
    const [cluster, setClusterState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(getInitialCluster);
    const setCluster = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ClusterProvider.useCallback[setCluster]": (c)=>{
            setClusterState(c);
            localStorage.setItem(STORAGE_KEY, c);
        }
    }["ClusterProvider.useCallback[setCluster]"], []);
    const explorerUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ClusterProvider.useCallback[explorerUrl]": (path)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$explorer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getExplorerUrl"])(path, cluster)
    }["ClusterProvider.useCallback[explorerUrl]"], [
        cluster
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ClusterContext.Provider, {
        value: {
            cluster,
            setCluster,
            getExplorerUrl: explorerUrl
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/app/components/cluster-context.tsx",
        lineNumber: 49,
        columnNumber: 5
    }, this);
}
_s(ClusterProvider, "OYux68+QaU6NQCMqI2uhj6AWxpM=");
_c = ClusterProvider;
function useCluster() {
    _s1();
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(ClusterContext);
    if (!ctx) throw new Error("useCluster must be used within ClusterProvider");
    return ctx;
}
_s1(useCluster, "/dMy7t63NXD4eYACoT93CePwGrg=");
var _c;
__turbopack_context__.k.register(_c, "ClusterProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/lib/wallet/standard.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "discoverWallets",
    ()=>discoverWallets,
    "watchWallets",
    ()=>watchWallets
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$wallet$2d$standard$2f$app$2f$lib$2f$esm$2f$wallets$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@wallet-standard/app/lib/esm/wallets.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$wallet$2d$standard$2f$features$2f$lib$2f$esm$2f$connect$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@wallet-standard/features/lib/esm/connect.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$wallet$2d$standard$2f$features$2f$lib$2f$esm$2f$disconnect$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@wallet-standard/features/lib/esm/disconnect.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$wallet$2d$standard$2d$features$2f$lib$2f$esm$2f$signTransaction$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/wallet-standard-features/lib/esm/signTransaction.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$wallet$2d$standard$2d$features$2f$lib$2f$esm$2f$signAndSendTransaction$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/wallet-standard-features/lib/esm/signAndSendTransaction.js [app-client] (ecmascript)");
;
;
;
function isSolanaWallet(wallet) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$wallet$2d$standard$2f$features$2f$lib$2f$esm$2f$connect$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StandardConnect"] in wallet.features && wallet.chains.some((chain)=>chain.startsWith("solana:"));
}
function createConnector(wallet) {
    const metadata = {
        id: wallet.name,
        name: wallet.name,
        icon: wallet.icon
    };
    return {
        ...metadata,
        connect: async (options)=>{
            const connectFeature = wallet.features[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$wallet$2d$standard$2f$features$2f$lib$2f$esm$2f$connect$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StandardConnect"]];
            const { accounts } = await connectFeature.connect(options?.silent ? {
                silent: true
            } : undefined);
            const account = accounts[0] ?? wallet.accounts[0];
            if (!account) throw new Error("No accounts available");
            const walletAccount = {
                address: account.address,
                publicKey: new Uint8Array(account.publicKey),
                label: account.label
            };
            const hasSendTx = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$wallet$2d$standard$2d$features$2f$lib$2f$esm$2f$signAndSendTransaction$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SolanaSignAndSendTransaction"] in wallet.features;
            const hasSignTx = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$wallet$2d$standard$2d$features$2f$lib$2f$esm$2f$signTransaction$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SolanaSignTransaction"] in wallet.features;
            const session = {
                account: walletAccount,
                connector: metadata,
                disconnect: async ()=>{
                    if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$wallet$2d$standard$2f$features$2f$lib$2f$esm$2f$disconnect$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StandardDisconnect"] in wallet.features) {
                        const feature = wallet.features[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$wallet$2d$standard$2f$features$2f$lib$2f$esm$2f$disconnect$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StandardDisconnect"]];
                        await feature.disconnect();
                    }
                },
                signTransaction: hasSignTx ? async (transaction, chain)=>{
                    const feature = wallet.features[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$wallet$2d$standard$2d$features$2f$lib$2f$esm$2f$signTransaction$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SolanaSignTransaction"]];
                    const [result] = await feature.signTransaction({
                        account,
                        transaction,
                        chain: chain
                    });
                    return new Uint8Array(result.signedTransaction);
                } : undefined,
                sendTransaction: hasSendTx ? async (transaction, chain)=>{
                    const feature = wallet.features[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$wallet$2d$standard$2d$features$2f$lib$2f$esm$2f$signAndSendTransaction$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SolanaSignAndSendTransaction"]];
                    const [result] = await feature.signAndSendTransaction({
                        account,
                        transaction,
                        chain: chain
                    });
                    return new Uint8Array(result.signature);
                } : undefined
            };
            return session;
        }
    };
}
function discoverWallets() {
    const { get } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$wallet$2d$standard$2f$app$2f$lib$2f$esm$2f$wallets$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getWallets"])();
    return get().filter(isSolanaWallet).map(createConnector);
}
function watchWallets(onChange) {
    const wallets = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$wallet$2d$standard$2f$app$2f$lib$2f$esm$2f$wallets$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getWallets"])();
    function update() {
        onChange(wallets.get().filter(isSolanaWallet).map(createConnector));
    }
    const offRegister = wallets.on("register", update);
    const offUnregister = wallets.on("unregister", update);
    return ()=>{
        offRegister();
        offUnregister();
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/lib/wallet/signer.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createWalletSigner",
    ()=>createWalletSigner
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$transactions$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/transactions/dist/index.browser.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$keys$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/keys/dist/index.browser.mjs [app-client] (ecmascript)");
;
function createSendingSigner(session, chain) {
    return {
        address: session.account.address,
        signAndSendTransactions: async (transactions)=>{
            const encoder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$transactions$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTransactionEncoder"])();
            return Promise.all(transactions.map(async (tx)=>{
                const wireBytes = new Uint8Array(encoder.encode(tx));
                const sigBytes = await session.sendTransaction(wireBytes, chain);
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$keys$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["signatureBytes"])(sigBytes);
            }));
        }
    };
}
/**
 * Uses TransactionModifyingSigner so the full signed transaction returned
 * by the wallet is preserved. This is critical because wallet-standard
 * signTransaction may return a modified transaction (e.g. added memo,
 * changed compute budget). Extracting only signatures and applying them
 * to the original message would cause a signature/message mismatch.
 */ function createModifyingSigner(session, chain) {
    return {
        address: session.account.address,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        modifyAndSignTransactions: async (transactions)=>{
            const encoder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$transactions$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTransactionEncoder"])();
            const decoder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$transactions$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTransactionDecoder"])();
            return Promise.all(transactions.map(async (tx)=>{
                const wireBytes = new Uint8Array(encoder.encode(tx));
                const signedBytes = await session.signTransaction(wireBytes, chain);
                const signedTx = decoder.decode(signedBytes);
                // Return the full decoded transaction — preserving whatever the
                // wallet signed (including any message modifications).
                // Carry over the lifetimeConstraint from the original transaction
                // since it's runtime metadata not present in the wire format.
                return Object.freeze({
                    ...signedTx,
                    ..."lifetimeConstraint" in tx ? {
                        lifetimeConstraint: tx.lifetimeConstraint
                    } : {}
                });
            }));
        }
    };
}
function createWalletSigner(session, chain) {
    if (session.signTransaction) {
        return createModifyingSigner(session, chain);
    }
    if (session.sendTransaction) {
        return createSendingSigner(session, chain);
    }
    throw new Error("Wallet does not support transaction signing");
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/lib/wallet/context.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WalletProvider",
    ()=>WalletProvider,
    "useWallet",
    ()=>useWallet
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$wallet$2f$standard$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/wallet/standard.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$wallet$2f$signer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/wallet/signer.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$cluster$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/app/components/cluster-context.tsx [app-client] (ecmascript) <locals>");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
const WALLET_STATUS = {
    DISCONNECTED: "disconnected",
    CONNECTING: "connecting",
    CONNECTED: "connected",
    ERROR: "error"
};
const WalletContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
const STORAGE_KEY = "solana:last-connector";
function WalletProvider({ children }) {
    _s();
    const { cluster } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$cluster$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useCluster"])();
    const chain = `solana:${cluster}`;
    const [connectors, setConnectors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "WalletProvider.useState": ()=>("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$wallet$2f$standard$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["discoverWallets"])()
    }["WalletProvider.useState"]);
    const [session, setSession] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])();
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(WALLET_STATUS.DISCONNECTED);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])();
    const isReady = ("TURBOPACK compile-time value", "object") !== "undefined";
    const connectorsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(connectors);
    const autoConnectAttempted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const handleWalletsChanged = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WalletProvider.useCallback[handleWalletsChanged]": (updated)=>{
            connectorsRef.current = updated;
            setConnectors(updated);
        }
    }["WalletProvider.useCallback[handleWalletsChanged]"], []);
    const runAutoConnect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WalletProvider.useCallback[runAutoConnect]": async (connector)=>{
            setStatus(WALLET_STATUS.CONNECTING);
            try {
                const s = await connector.connect({
                    silent: true
                });
                setSession(s);
                setStatus(WALLET_STATUS.CONNECTED);
            } catch  {
                setStatus(WALLET_STATUS.DISCONNECTED);
                localStorage.removeItem(STORAGE_KEY);
            }
        }
    }["WalletProvider.useCallback[runAutoConnect]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WalletProvider.useEffect": ()=>{
            const unsubscribe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$wallet$2f$standard$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["watchWallets"])(handleWalletsChanged);
            const lastId = localStorage.getItem(STORAGE_KEY);
            if (lastId && !autoConnectAttempted.current) {
                autoConnectAttempted.current = true;
                const connector = connectorsRef.current.find({
                    "WalletProvider.useEffect.connector": (c)=>c.id === lastId
                }["WalletProvider.useEffect.connector"]);
                if (connector) {
                    void runAutoConnect(connector);
                }
            }
            return unsubscribe;
        }
    }["WalletProvider.useEffect"], [
        handleWalletsChanged,
        runAutoConnect
    ]);
    const connect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WalletProvider.useCallback[connect]": async (connectorId)=>{
            const connector = connectorsRef.current.find({
                "WalletProvider.useCallback[connect].connector": (c)=>c.id === connectorId
            }["WalletProvider.useCallback[connect].connector"]);
            if (!connector) throw new Error(`Unknown connector: ${connectorId}`);
            setStatus(WALLET_STATUS.CONNECTING);
            setError(undefined);
            try {
                const s = await connector.connect();
                setSession(s);
                setStatus(WALLET_STATUS.CONNECTED);
                localStorage.setItem(STORAGE_KEY, connectorId);
            } catch (err) {
                setError(err);
                setStatus(WALLET_STATUS.ERROR);
            }
        }
    }["WalletProvider.useCallback[connect]"], []);
    const disconnect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WalletProvider.useCallback[disconnect]": async ()=>{
            if (session) {
                try {
                    await session.disconnect();
                } catch  {
                /* ignore disconnect errors */ }
            }
            setSession(undefined);
            setStatus(WALLET_STATUS.DISCONNECTED);
            setError(undefined);
            localStorage.removeItem(STORAGE_KEY);
        }
    }["WalletProvider.useCallback[disconnect]"], [
        session
    ]);
    const signer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "WalletProvider.useMemo[signer]": ()=>session ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$wallet$2f$signer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createWalletSigner"])(session, chain) : undefined
    }["WalletProvider.useMemo[signer]"], [
        session,
        chain
    ]);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "WalletProvider.useMemo[value]": ()=>({
                connectors,
                status,
                wallet: session,
                signer,
                error,
                connect,
                disconnect,
                isReady
            })
    }["WalletProvider.useMemo[value]"], [
        connectors,
        status,
        session,
        signer,
        error,
        connect,
        disconnect,
        isReady
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(WalletContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/app/lib/wallet/context.tsx",
        lineNumber: 144,
        columnNumber: 5
    }, this);
}
_s(WalletProvider, "k78nonMKvU7e51k+4CWR2QKuyb8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$cluster$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useCluster"]
    ];
});
_c = WalletProvider;
function useWallet() {
    _s1();
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(WalletContext);
    if (!ctx) throw new Error("useWallet must be used within WalletProvider");
    return ctx;
}
_s1(useWallet, "/dMy7t63NXD4eYACoT93CePwGrg=");
var _c;
__turbopack_context__.k.register(_c, "WalletProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/lib/solana-client-context.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SolanaClientProvider",
    ()=>SolanaClientProvider,
    "useSolanaClient",
    ()=>useSolanaClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$solana$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/solana-client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$cluster$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/app/components/cluster-context.tsx [app-client] (ecmascript) <locals>");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
const SolanaClientContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
function SolanaClientProvider({ children }) {
    _s();
    const { cluster } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$cluster$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useCluster"])();
    const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "SolanaClientProvider.useMemo[client]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$solana$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createSolanaClient"])(cluster)
    }["SolanaClientProvider.useMemo[client]"], [
        cluster
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SolanaClientContext.Provider, {
        value: client,
        children: children
    }, void 0, false, {
        fileName: "[project]/app/lib/solana-client-context.tsx",
        lineNumber: 14,
        columnNumber: 5
    }, this);
}
_s(SolanaClientProvider, "oQ/jIxj/RltaIwvynm3Tr8W9Szg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$cluster$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useCluster"]
    ];
});
_c = SolanaClientProvider;
function useSolanaClient() {
    _s1();
    const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(SolanaClientContext);
    if (!client) throw new Error("useSolanaClient must be used within SolanaClientProvider");
    return client;
}
_s1(useSolanaClient, "6C1IqtdJdCPZ/voWsX/6r3Oc32M=");
var _c;
__turbopack_context__.k.register(_c, "SolanaClientProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/providers.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Providers",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-themes/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$cluster$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/app/components/cluster-context.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$wallet$2f$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/wallet/context.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$solana$2d$client$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/solana-client-context.tsx [app-client] (ecmascript)");
"use client";
;
;
;
;
;
;
function Providers({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ThemeProvider"], {
        attribute: "class",
        defaultTheme: "dark",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$cluster$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ClusterProvider"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$solana$2d$client$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SolanaClientProvider"], {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$wallet$2f$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WalletProvider"], {
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/app/components/providers.tsx",
                        lineNumber: 15,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/components/providers.tsx",
                    lineNumber: 14,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Toaster"], {
                    position: "bottom-right",
                    richColors: true
                }, void 0, false, {
                    fileName: "[project]/app/components/providers.tsx",
                    lineNumber: 17,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/components/providers.tsx",
            lineNumber: 13,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/components/providers.tsx",
        lineNumber: 12,
        columnNumber: 5
    }, this);
}
_c = Providers;
var _c;
__turbopack_context__.k.register(_c, "Providers");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_0.m_f4p._.js.map
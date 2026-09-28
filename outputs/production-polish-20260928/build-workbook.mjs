import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir =
  "/Users/doanbao/code/solana/wildquest/wildquest/outputs/production-polish-20260928";
const outputPath = `${outputDir}/WildQuest-Production-Polish-Backlog.xlsx`;
const previewDir = `${outputDir}/previews`;
const font = "Arial";
const colors = {
  ink: "#17140F",
  forest: "#174B35",
  forest2: "#246B4B",
  gold: "#C9A85D",
  cream: "#F7F2E7",
  sand: "#E9DFC8",
  muted: "#6E6658",
  red: "#A63D40",
  amber: "#C27A19",
  green: "#2E7D53",
  blue: "#315B7D",
  gray: "#ECE9E1",
};

const backlog = [
  [
    "WQ-P01",
    "P0",
    "Demo truth",
    "Frontend",
    "Sửa toàn bộ claim sai trên landing",
    "Landing đang ghi 8 species, 100% on-device, gas-free, XP khi capture; code thực tế hỗ trợ 40 loài, nhận diện chạy server, transaction có phí và XP đến từ quest.",
    "app/components/game-metrics-counter.tsx; app/page.tsx; app/components/game-footer.tsx",
    "Nội dung chỉ mô tả cơ chế đang chạy; 40 species; server-side ResNet-50; Devnet transaction fee; quest XP.",
    "Frontend",
    "S",
    "Chưa làm",
    "",
    "",
  ],
  [
    "WQ-P02",
    "P0",
    "Demo reliability",
    "Frontend",
    "Khoá cluster Devnet trong bản hackathon",
    "UI cho phép testnet/mainnet/localnet trong khi program và dữ liệu demo được cấu hình cho Devnet; đổi cluster có thể tạo trạng thái rỗng hoặc giao dịch sai.",
    "app/components/cluster-context.tsx; app/lib/solana-client.ts",
    "Bản deploy hackathon không cho đổi cluster; badge DEVNET rõ ràng; URL Explorer luôn Devnet.",
    "Frontend",
    "S",
    "Chưa làm",
    "",
    "WQ-P01",
  ],
  [
    "WQ-P03",
    "P0",
    "RPC",
    "Web3",
    "Dùng RPC/WSS chuyên dụng và tách biến server",
    "Browser và battle server đều fallback sang api.devnet.solana.com; đã từng gặp 429 và WebSocket đóng.",
    "app/lib/solana-client.ts; scripts/battle-realtime-server.ts",
    "Vercel và Render dùng RPC/WSS chuyên dụng; không còn fallback public trong production; health check báo latency và cluster.",
    "Web3",
    "M",
    "Chưa làm",
    "",
    "",
  ],
  [
    "WQ-P04",
    "P0",
    "Data loading",
    "Frontend",
    "Tách useGameData theo từng màn hình",
    "Một hook tải player, discoveries, creatures, quests, completions, toàn bộ matches và catalogue cho hầu hết route.",
    "app/lib/hooks/use-game-data.ts và 9 nơi gọi",
    "Collection không tải quest/match; Quest chỉ tải evidence cần thiết; Home dùng summary; key vẫn scope theo wallet và cluster.",
    "Frontend",
    "L",
    "Chưa làm",
    "",
    "WQ-P03",
  ],
  [
    "WQ-P05",
    "P0",
    "RPC",
    "Web3",
    "Thay N+1 quest reads bằng batch account reads",
    "Quest và QuestCompletion được đọc từng account qua Promise.all mỗi 30 giây.",
    "app/lib/hooks/use-game-data.ts: quests, questCompletions",
    "Một batch RPC cho 5 Quest PDA và completion PDA; số request giảm đo được trong Network; trạng thái quest vẫn đúng sau claim.",
    "Web3",
    "M",
    "Chưa làm",
    "",
    "WQ-P04",
  ],
  [
    "WQ-P06",
    "P0",
    "RPC",
    "Web3",
    "Không quét toàn bộ Match accounts cho từng ví",
    "fetchMatches dùng getProgramAccounts rồi mới lọc theo wallet ở client.",
    "app/lib/matches.ts: fetchMatches, getPlayerMatches",
    "Dùng memcmp/indexer phù hợp hoặc endpoint server có cache; Battle chỉ tải open matches và matches của ví; không làm mất match hợp lệ.",
    "Web3",
    "L",
    "Chưa làm",
    "",
    "WQ-P03,WQ-P04",
  ],
  [
    "WQ-P07",
    "P0",
    "Battle authority",
    "Backend",
    "Lưu room state ngoài RAM",
    "rooms và authSessions là Map trong một process; restart hoặc scale ngang làm mất trận và session.",
    "scripts/battle-realtime-server.ts",
    "Restart process phục hồi active room từ durable event/state; hai instance không cùng xử lý một Match; reconnect tiếp tục đúng turn.",
    "Backend",
    "XL",
    "Chưa làm",
    "",
    "WQ-P03",
  ],
  [
    "WQ-P08",
    "P0",
    "Battle truth",
    "Backend",
    "Ghi event log có thể tái tạo replay",
    "Onchain chỉ giữ result hash và turn count; UI replay dùng simulator cũ, không phải hành động thật.",
    "app/battle/battle-playback.tsx; app/lib/battle-engine.ts; scripts/battle-realtime-server.ts",
    "Replay dùng event log đã hash; hash khớp result_hash; cùng một Match luôn phát lại đúng action, damage và winner.",
    "Backend/Web3",
    "XL",
    "Chưa làm",
    "",
    "WQ-P07",
  ],
  [
    "WQ-P09",
    "P0",
    "API security",
    "Backend",
    "Rate limit POST /api/identify theo IP và wallet",
    "Route nạp model và xử lý ảnh tối đa 4 MB nhưng chưa có rate limit ứng dụng.",
    "app/api/identify/route.ts; app/lib/vision/handler.ts",
    "Giới hạn burst và quota; trả 429 JSON đúng schema; request hợp lệ không bị lưu ảnh; có test bypass header giả.",
    "Backend",
    "M",
    "Chưa làm",
    "",
    "",
  ],
  [
    "WQ-P10",
    "P0",
    "Battle security",
    "Backend",
    "Giới hạn WebSocket origin, message rate và kích thước",
    "WebSocketServer nhận connection theo Match nhưng chưa kiểm tra Origin/rate/max payload ở lớp app.",
    "scripts/battle-realtime-server.ts",
    "Chỉ origin cấu hình được phép kết nối; giới hạn message/giây và payload; socket vi phạm đóng bằng code rõ; spectator vẫn hoạt động.",
    "Backend",
    "M",
    "Chưa làm",
    "",
    "",
  ],
  [
    "WQ-P11",
    "P0",
    "Operations",
    "Platform",
    "Thêm health/readiness cho battle server",
    "Server chỉ mở WebSocket và log port; Render không có endpoint kiểm tra RPC, resolver và process readiness.",
    "scripts/battle-realtime-server.ts",
    "/healthz xác nhận process; /readyz xác nhận RPC và authority pubkey khớp GameConfig mà không lộ secret; Render dùng health check.",
    "Platform",
    "M",
    "Chưa làm",
    "",
    "WQ-P03",
  ],
  [
    "WQ-P12",
    "P0",
    "Release",
    "QA",
    "Tạo CI gate cho TypeScript và Anchor",
    "Repository không thấy workflow CI trong .github/workflows; kiểm tra hiện phụ thuộc máy local.",
    "package.json; programs/wildquest; .github",
    "PR chạy test, typecheck, lint, format check, build và Anchor/LiteSVM; không dùng Devnet/fund; artifact lỗi dễ đọc.",
    "QA/Web3",
    "L",
    "Chưa làm",
    "",
    "",
  ],
  [
    "WQ-P13",
    "P0",
    "Capture correctness",
    "Backend",
    "Đảo thứ tự reserve và ký capture an toàn",
    "Handler tạo transaction đã ký trước khi reserve pHash; response chỉ trả sau reserve nhưng công việc nhạy cảm xảy ra sớm và khó quan sát lỗi.",
    "app/lib/vision/handler.ts",
    "Reserve thành công trước khi tạo authorization; mọi lỗi fail closed; duplicate không tạo signed transaction; test thứ tự dependency.",
    "Backend/Web3",
    "M",
    "Chưa làm",
    "",
    "WQ-P09",
  ],
  [
    "WQ-P14",
    "P0",
    "Secrets",
    "Platform",
    "Tách capture authority và match resolver",
    "Cùng CAPTURE_AUTHORITY_SECRET_KEY_BASE64 hiện ký capture và resolve match, làm tăng blast radius.",
    "app/lib/vision/capture-authorization.ts; scripts/battle-realtime-server.ts; GameConfig",
    "Thiết kế migration/program version cho hai authority; xoay từng key độc lập; không log secret; test unauthorized cho cả hai vai trò.",
    "Web3/Security",
    "XL",
    "Chưa làm",
    "",
    "WQ-P07",
  ],
  [
    "WQ-P15",
    "P1",
    "Images",
    "Frontend",
    "Đặt ngân sách ảnh và tạo biến thể WebP/AVIF",
    "public có 94 file, 158,030,869 byte; nhiều PNG artwork 2-3 MB.",
    "public/; app/components/creature-model-card.tsx",
    "Ảnh card mobile <=150 KB mục tiêu, desktop detail <=350 KB; LCP image có preload; ảnh ngoài viewport lazy-load; visual diff đạt.",
    "Frontend",
    "L",
    "Chưa làm",
    "",
    "WQ-P04",
  ],
  [
    "WQ-P16",
    "P1",
    "Images",
    "Architecture",
    "Giữ UI tĩnh trên Vercel; thử Supabase cho artwork catalogue",
    "Chuyển toàn bộ ảnh sang Supabase không tự động nhanh hơn; cần đo CDN/cache/transform và chi phí.",
    "public/ui; public/cards; species.image_url trong Supabase",
    "Logo/frame/nav giữ static; chạy A/B 10 artwork qua Supabase CDN + resize; chọn phương án theo p75 LCP, bytes và cache hit; URL versioned.",
    "Architecture",
    "M",
    "Chưa làm",
    "",
    "WQ-P15",
  ],
  [
    "WQ-P17",
    "P1",
    "Images",
    "Frontend",
    "Loại 5 nhóm file artwork trùng byte",
    "Có 5 cặp PNG có SHA-256 giống nhau: bee, bullmastiff, pig, cat, corgi aliases.",
    "public/creatures/artwork",
    "Catalogue và compatibility rewrite trỏ về một canonical asset; không 404; snapshot 40 species qua.",
    "Frontend",
    "S",
    "Chưa làm",
    "",
    "WQ-P15",
  ],
  [
    "WQ-P18",
    "P1",
    "Rendering",
    "Frontend",
    "Dừng animation khi ngoài viewport hoặc reduced motion",
    "Hologram chạy requestAnimationFrame liên tục; grid cũng render liên tục khi tab hiển thị.",
    "app/components/creature-hologram-stage.tsx; app/components/grid-background.tsx",
    "IntersectionObserver tạm dừng WebGL; reduced-motion hiển thị frame tĩnh; tab hidden không tạo nhiều RAF; GPU resources được dispose.",
    "Frontend",
    "M",
    "Chưa làm",
    "",
    "",
  ],
  [
    "WQ-P19",
    "P1",
    "Rendering",
    "Frontend",
    "Giảm pixel ratio và hiệu ứng theo thiết bị",
    "WebGL dùng DPR tối đa 2 cùng glow/texture lớn trên mobile.",
    "app/components/creature-hologram-stage.tsx",
    "Quality tier dựa trên DPR và device capability; không tụt dưới 45 FPS mục tiêu trên thiết bị demo; card vẫn rõ; không thay battle logic.",
    "Frontend",
    "M",
    "Chưa làm",
    "",
    "WQ-P18",
  ],
  [
    "WQ-P20",
    "P1",
    "Collection",
    "Frontend",
    "Phân trang hoặc window 40 card",
    "Collection map toàn bộ card; mỗi card là SVG lớn có ảnh và nhiều node.",
    "app/collection/collection-content.tsx; app/components/creature-model-card.tsx",
    "Initial DOM chỉ render vùng cần xem; filter/sort đúng; scroll không nhảy; keyboard focus không mất.",
    "Frontend",
    "M",
    "Chưa làm",
    "",
    "WQ-P15",
  ],
  [
    "WQ-P21",
    "P1",
    "Caching",
    "Backend",
    "Cache catalogue API và species detail",
    "GET /api/species force-dynamic và query Supabase mỗi lần dù catalogue ít đổi.",
    "app/api/species/route.ts; app/api/species/[speciesId]",
    "Cache có revalidate/version; admin update invalidates; response có Cache-Control phù hợp; stale window được mô tả.",
    "Backend",
    "M",
    "Chưa làm",
    "",
    "",
  ],
  [
    "WQ-P22",
    "P1",
    "Capture latency",
    "Backend",
    "Warm model và đo từng giai đoạn identify",
    "Classifier cache trong process nhưng cold start ONNX chưa có telemetry; maxDuration 60 giây che khuất bottleneck.",
    "app/lib/vision/classifier.ts; app/api/identify/route.ts",
    "Đo decode, inference, quality, hash, DB reserve, signing; cold/warm p50/p95; log không chứa ảnh/wallet đầy đủ; cảnh báo khi budget vượt.",
    "Backend/Platform",
    "L",
    "Chưa làm",
    "",
    "WQ-P09",
  ],
  [
    "WQ-P23",
    "P1",
    "Transactions",
    "Web3",
    "Chuẩn hoá confirm và expired-blockhash UX",
    "Các flow ký transaction cần trạng thái pending/confirmed/expired thống nhất và refresh đúng key.",
    "app/lib/hooks/use-send-transaction.ts; capture/battle/quest transaction hooks",
    "Mỗi flow chờ confirmed trước khi success; expired blockhash có nút tạo lại; reject không tạo optimistic ownership; lỗi có mã thân thiện.",
    "Web3/Frontend",
    "L",
    "Chưa làm",
    "",
    "WQ-P03",
  ],
  [
    "WQ-P24",
    "P1",
    "Observability",
    "Platform",
    "Thêm trace ID xuyên Vercel, Supabase, Render và signature",
    "Lỗi capture/battle hiện khó ghép từ browser với server logs.",
    "API routes; battle server; client error states",
    "Mỗi operation có request/room ID; log structured; signature và Match PDA rút gọn; dashboard có error rate và latency; không lộ secret/photo.",
    "Platform",
    "L",
    "Chưa làm",
    "",
    "WQ-P11,WQ-P22",
  ],
  [
    "WQ-P25",
    "P1",
    "Recovery",
    "Backend",
    "Dọn room/session có TTL và giới hạn bộ nhớ",
    "Map rooms/authSessions chưa thể hiện eviction định kỳ; server dài hạn có thể tích luỹ.",
    "scripts/battle-realtime-server.ts",
    "Session hết hạn bị xoá; settled/refunded room bị evict; có giới hạn rooms/sockets; metric memory và active rooms.",
    "Backend",
    "M",
    "Chưa làm",
    "",
    "WQ-P07",
  ],
  [
    "WQ-P26",
    "P1",
    "UX",
    "Frontend",
    "Một trạng thái lỗi thống nhất cho RPC/API/WebSocket",
    "Các màn hình có retry riêng và thông báo khác nhau; người chơi khó biết cần chờ, ký lại hay đổi mạng.",
    "useGameData; use-battle-room; capture experience; battle content",
    "Error map theo code; CTA đúng hành động; không retry vô hạn lỗi terminal; offline/reconnect rõ; mobile touch >=48 px.",
    "Frontend",
    "L",
    "Chưa làm",
    "",
    "WQ-P03,WQ-P04",
  ],
  [
    "WQ-P27",
    "P1",
    "Accessibility",
    "Frontend",
    "Hoàn thiện keyboard, focus và reduced motion",
    "UI giàu animation và overlay; cần kiểm tra focus sau modal/capture/result.",
    "app/components; app/capture; app/battle",
    "Luồng wallet, collection, quest, battle dùng keyboard; focus visible; modal trả focus; WCAG AA cho text chính; reduced motion pass.",
    "Frontend/QA",
    "L",
    "Chưa làm",
    "",
    "WQ-P18,WQ-P26",
  ],
  [
    "WQ-P28",
    "P1",
    "Test",
    "QA",
    "Thêm smoke test hai ví cho core loop",
    "Unit test nhiều nhưng release cần kiểm tra capture, own, quest, open/join/play/claim trên môi trường staging.",
    "scripts/wq-devnet-loop.ts; scripts/pk-devnet-battle.ts",
    "Chạy bằng ví test riêng; báo signature và bước lỗi; không chạy tự động trên PR; checklist staging pass trước demo.",
    "QA/Web3",
    "L",
    "Chưa làm",
    "",
    "WQ-P03,WQ-P07,WQ-P23",
  ],
  [
    "WQ-P29",
    "P2",
    "Cleanup",
    "Web3",
    "Xoá Counter scaffold qua program version có kế hoạch",
    "initialize/increment và Counter generated client không thuộc core loop nhưng đang nằm trong program interface.",
    "programs/wildquest/src/instructions/initialize.rs; increment.rs; generated Counter",
    "Quyết định tương thích account/IDL; xoá source rồi build IDL và regenerate Codama; Anchor + TS tests pass; deploy upgrade được review.",
    "Web3",
    "M",
    "Chưa làm",
    "",
    "WQ-P12",
  ],
  [
    "WQ-P30",
    "P2",
    "Cleanup",
    "Frontend",
    "Xoá Creature3DStage nếu vẫn không có caller",
    "File tải dog.glb và tạo renderer nhưng không có import ngoài chính file theo audit hiện tại.",
    "app/components/creature-3d-stage.tsx; public/models/dog.glb",
    "rg xác nhận zero caller ở commit triển khai; xoá component + model; build và visual smoke pass.",
    "Frontend",
    "S",
    "Chưa làm",
    "",
    "WQ-P12",
  ],
  [
    "WQ-P31",
    "P2",
    "Cleanup",
    "Architecture",
    "Tách replay legacy khỏi battle runtime",
    "battle-engine deterministic cũ vẫn phục vụ BattlePlayback nhưng không phản ánh simultaneous actions.",
    "app/lib/battle-engine.ts; app/battle/battle-playback.tsx",
    "Sau WQ-P08, xoá simulator/replay legacy và test chỉ thuộc nó; không còn import; replay thật pass.",
    "Frontend/Backend",
    "M",
    "Chưa làm",
    "",
    "WQ-P08",
  ],
  [
    "WQ-P32",
    "P2",
    "Cleanup",
    "Architecture",
    "Đánh dấu Discovery legacy và kế hoạch đọc lịch sử",
    "Creature là nguồn ownership mới nhưng Discovery vẫn dùng Home/confirmed và devnet loop; xoá ngay sẽ làm mất lịch sử/quest logic cũ.",
    "app/lib/discovery-transaction.ts; collection.ts; README; program discover_species",
    "Lập ADR giữ read-only hoặc migration; không tạo Discovery mới nếu core loop không cần; UI vẫn đọc lịch sử đúng; chỉ xoá sau migration/test.",
    "Architecture/Web3",
    "L",
    "Chưa làm",
    "",
    "WQ-P12",
  ],
  [
    "WQ-P33",
    "P2",
    "Cleanup",
    "Repository",
    "Đưa outputs và tài liệu ngày demo ra khỏi production artifact",
    "outputs chứa workbook/preview/builder; docs có nhiều day notes hữu ích cho lịch sử nhưng không phải runtime.",
    "outputs/; docs/PK-VERTICAL-SLICE-DAY*.md",
    "Không đóng gói vào deploy/container; giữ release runbook hiện hành; archive lịch sử ngoài runtime; link README không gãy.",
    "Platform",
    "S",
    "Chưa làm",
    "",
    "WQ-P12",
  ],
  [
    "WQ-P34",
    "P2",
    "Dependencies",
    "Platform",
    "Audit package và lỗ hổng npm có kiểm soát",
    "npm ci đã từng báo 4 vulnerabilities; không nên chạy audit fix --force mù.",
    "package-lock.json; package.json",
    "npm audit được triage theo runtime reachability; nâng từng package có test/build; không major-upgrade tự động; lưu decision.",
    "Platform/Security",
    "M",
    "Chưa làm",
    "",
    "WQ-P12",
  ],
  [
    "WQ-P35",
    "P2",
    "Documentation",
    "Architecture",
    "Rút README thành runbook hiện hành",
    "README trộn legacy Discovery, vertical slice theo ngày và production guidance; có đoạn nói Counter scaffold và Devnet prototype.",
    "README.md; docs/",
    "README mô tả đúng core loop, setup, env names, deploy, rollback và known limits; lịch sử chuyển archive; không claim production nếu chưa đạt gate.",
    "Architecture",
    "M",
    "Chưa làm",
    "",
    "WQ-P01,WQ-P33",
  ],
  [
    "WQ-P36",
    "P2",
    "Release",
    "QA",
    "Thiết lập performance budget và đo trước/sau",
    "Chưa có số liệu thực tế để kết luận Supabase hoặc 3D là nguyên nhân chính.",
    "Vercel deployment; browser Performance/Network",
    "Mobile p75 LCP <=2.5s mục tiêu, INP <=200ms, CLS <=0.1; JS/ảnh budget theo route; lưu baseline và regression check.",
    "QA/Frontend",
    "L",
    "Chưa làm",
    "",
    "WQ-P15,WQ-P18,WQ-P20,WQ-P21",
  ],
];

const implementationUpdates = {
  "WQ-P01": [
    "Đã xong",
    "Đã sửa landing/footer/counter theo đúng 40 species, server-side vision, Devnet fee và quest XP.",
  ],
  "WQ-P02": [
    "Đã xong",
    "Đã khoá cluster Devnet và cố định link Explorer theo Devnet.",
  ],
  "WQ-P03": [
    "Đang làm",
    "Đã tách RPC browser/server và bỏ public fallback trong production; còn cấu hình endpoint thật trên Vercel/Render.",
  ],
  "WQ-P04": [
    "Đã xong",
    "useGameData đã có scope theo màn hình; các route chỉ tải nhóm dữ liệu cần thiết.",
  ],
  "WQ-P05": [
    "Đã xong",
    "Quest và QuestCompletion dùng batch fetch thay cho N+1 reads.",
  ],
  "WQ-P06": [
    "Đã xong",
    "Battle dùng status memcmp cho open Match; wallet history dùng creator/opponent memcmp và dedupe, không còn full program scan trên màn hình.",
  ],
  "WQ-P07": [
    "Đang làm",
    "Room state đã lưu Supabase và phục hồi sau restart; còn cần chạy migration và kiểm thử nhiều instance trên staging.",
  ],
  "WQ-P08": [
    "Đã xong",
    "Replay dùng action log thật, lưu SHA-256 và chỉ hiển thị khi hash khớp result_hash onchain.",
  ],
  "WQ-P09": [
    "Đang làm",
    "Đã có quota IP/wallet, 429/503 fail-closed và test; còn chạy migration rate-limit trên Supabase.",
  ],
  "WQ-P10": [
    "Đã xong",
    "Battle server đã giới hạn origin, 16 KiB payload và 30 message/10 giây mỗi socket.",
  ],
  "WQ-P11": [
    "Đang làm",
    "Đã có /healthz và /readyz; còn cấu hình Render health check và xác minh live.",
  ],
  "WQ-P12": [
    "Đang làm",
    "Workflow CI đã chạy test/typecheck/lint/format/build và Anchor/LiteSVM; còn xác minh lần chạy GitHub đầu tiên.",
  ],
  "WQ-P13": [
    "Đã xong",
    "Reserve pHash hoàn tất trước khi tạo capture authorization; duplicate không được ký.",
  ],
  "WQ-P14": [
    "Đang làm",
    "Đã thêm MatchResolverConfig PDA và signer riêng; còn deploy program, initialize config và xoay key môi trường.",
  ],
  "WQ-P15": [
    "Đã xong",
    "Đã chuyển artwork/frame sang WebP, lazy artwork ngoài viewport và giảm public từ khoảng 151 MiB còn 44.67 MiB.",
  ],
  "WQ-P16": [
    "Đang làm",
    "Đã giữ UI/frame/artwork tối ưu trên Vercel; A/B Supabase CDN chưa cần trước khi có số đo staging.",
  ],
  "WQ-P17": [
    "Đã xong",
    "Đã loại 5 asset alias trùng byte và giữ compatibility rewrite về asset canonical.",
  ],
  "WQ-P18": [
    "Đã xong",
    "RAF dừng khi tab ẩn/offscreen; reduced-motion render frame tĩnh và không auto-rotate.",
  ],
  "WQ-P19": [
    "Đang làm",
    "Đã hạ DPR xuống 1 trên mobile/thiết bị ít CPU-RAM và tối đa 1.5 trên thiết bị mạnh; còn đo FPS thật trên máy demo.",
  ],
  "WQ-P20": [
    "Đã xong",
    "Collection render 20 card đầu, tải thêm theo lô 20; filter/sort reset cửa sổ và artwork tiếp tục lazy theo viewport.",
  ],
  "WQ-P21": [
    "Đang làm",
    "Catalogue và species detail đã có s-maxage 5 phút + stale-while-revalidate 1 giờ; chưa có admin mutation để chủ động invalidate tag.",
  ],
  "WQ-P22": [
    "Đang làm",
    "Identify đã có request ID và structured total latency; chưa tách đầy đủ decode/inference/hash/DB/signing p50/p95.",
  ],
  "WQ-P23": [
    "Đang làm",
    "Hook giao dịch đã có lifecycle dùng chung; expired-blockhash CTA và mapping cho mọi flow chưa hoàn tất.",
  ],
  "WQ-P24": [
    "Đang làm",
    "Identify đã có X-Request-ID và log có cấu trúc; chưa có dashboard/correlation xuyên toàn bộ Render-Supabase-signature.",
  ],
  "WQ-P25": [
    "Đã xong",
    "Đã dọn TTL, giới hạn room/socket bằng env và xuất activeRooms/sockets/authSessions/heapUsedBytes tại /healthz.",
  ],
  "WQ-P26": [
    "Đang làm",
    "Battle đã dừng reconnect với lỗi terminal và backoff có giới hạn; error map dùng chung toàn app chưa hoàn tất.",
  ],
  "WQ-P27": [
    "Đang làm",
    "Đã hoàn thiện reduced-motion cho WebGL/grid; keyboard/focus/axe audit toàn luồng chưa chạy.",
  ],
  "WQ-P28": [
    "Bị chặn",
    "Cần deploy migration/program/server và hai ví Devnet để chạy smoke end-to-end thật.",
  ],
  "WQ-P29": [
    "Đang làm",
    "Counter đã bị xoá khỏi Rust, IDL và Codama; còn review/deploy program upgrade.",
  ],
  "WQ-P30": [
    "Đã xong",
    "Đã xác nhận zero caller, xoá Creature3DStage và dog.glb; production build pass.",
  ],
  "WQ-P31": [
    "Đã xong",
    "Đã xoá deterministic battle-engine legacy và test; playback chỉ dùng TurnEvent thật.",
  ],
  "WQ-P32": [
    "Đang làm",
    "Discovery compatibility được giữ để đọc lịch sử; ADR/migration dừng ghi chưa hoàn tất.",
  ],
  "WQ-P33": [
    "Đang làm",
    "Đã thêm .vercelignore cho outputs/docs/program/scripts/supabase/keys; tài liệu ngày demo chưa archive.",
  ],
  "WQ-P34": [
    "Đã xong",
    "Đã nâng Next.js 16.3.6, Sharp 0.35.5 và Transformers 4.3.0; npm audit còn 0 vulnerabilities và classifier smoke pass.",
  ],
  "WQ-P35": [
    "Đang làm",
    "README đã cập nhật key riêng, persistence, replay, rate limit và setup; vẫn cần rút gọn/archive lịch sử.",
  ],
  "WQ-P36": [
    "Bị chặn",
    "Cần staging live và thiết bị mobile để đo p75 LCP/INP/CLS trước-sau.",
  ],
};

for (const item of backlog) {
  const update = implementationUpdates[item[0]];
  if (!update) continue;
  item[10] = update[0];
  item[6] = `${item[6]}\n\nCập nhật 2026-09-28: ${update[1]}`;
}

const cleanup = [
  [
    "Xoá sau khi xác minh",
    "app/components/creature-3d-stage.tsx",
    "Không có caller được tìm thấy; tải /public/models/dog.glb",
    "rg zero caller ở commit xoá; build; smoke landing/detail",
    "WQ-P30",
  ],
  [
    "Xoá cùng component",
    "public/models/dog.glb",
    "Khoảng 2.46 MB; chỉ Creature3DStage tham chiếu",
    "Xác nhận không có URL runtime/marketing; build",
    "WQ-P30",
  ],
  [
    "Hợp nhất",
    "5 cặp artwork alias trùng byte",
    "SHA-256 giống nhau, lãng phí deploy/cache",
    "Chuyển catalogue + rewrite tới canonical; kiểm 40 species",
    "WQ-P17",
  ],
  [
    "Xoá sau migration",
    "Counter instruction/account/client",
    "Scaffold ngoài core loop nhưng là program interface hiện hữu",
    "Program upgrade plan; IDL/Codama regenerate; Anchor test",
    "WQ-P29",
  ],
  [
    "Xoá sau thay thế",
    "app/lib/battle-engine.ts và battle-playback.tsx",
    "Replay dựng lại trận cũ, không dùng action log thật",
    "Event log replay đã live; hash và visual replay pass",
    "WQ-P08,WQ-P31",
  ],
  [
    "Giữ hiện tại",
    "Discovery handlers và client",
    "Vẫn được Home/confirmed/devnet loop đọc; có dữ liệu lịch sử",
    "ADR + migration trước khi dừng ghi hoặc xoá",
    "WQ-P32",
  ],
  [
    "Giữ",
    "Supabase pHash reservation/advisory lock",
    "Chống reuse ảnh và serialize concurrent reservation",
    "Security tests và policy vẫn pass",
    "",
  ],
  [
    "Giữ",
    "Generated Codama client",
    "Nguồn sử dụng runtime; phải regenerate từ program/IDL",
    "Không hand-edit; CI kiểm diff",
    "WQ-P12",
  ],
  [
    "Không đóng gói runtime",
    "outputs/ và preview artifacts",
    "Không cần trong Vercel/Render runtime",
    "Deploy ignore xác nhận; file phục vụ team vẫn truy cập repo/archive",
    "WQ-P33",
  ],
  [
    "Archive",
    "docs/PK-VERTICAL-SLICE-DAY*.md",
    "Lịch sử triển khai, không phải runbook hiện hành",
    "README links cập nhật; lịch sử còn truy xuất được",
    "WQ-P33,WQ-P35",
  ],
];

const acceptance = [
  [
    "Demo truth",
    "Landing nói đúng 40 species, server-side vision, Devnet fee và quest XP",
    "Manual content review + source check",
    "P0",
  ],
  [
    "Core capture",
    "Phone capture -> identify -> owner sign -> confirmed Creature -> detail page",
    "Staging mobile, ví test, ghi signature",
    "P0",
  ],
  [
    "Duplicate",
    "Cùng/ảnh gần giống bị chặn kể cả gửi đồng thời",
    "Integration test 2 concurrent requests",
    "P0",
  ],
  [
    "Quest",
    "Capture evidence mở/claim 5 quest đúng thứ tự và XP",
    "LiteSVM + staging smoke",
    "P0",
  ],
  [
    "Battle reconnect",
    "Restart battle instance giữa turn rồi hai ví reconnect đúng state",
    "Chaos smoke test",
    "P0",
  ],
  [
    "Battle replay",
    "Replay trùng event log và result_hash của Match",
    "Automated hash assertion + UI smoke",
    "P0",
  ],
  [
    "Escrow exits",
    "Open cancel, stale refund, winner claim, draw refund đều trả đúng lamports",
    "LiteSVM balance assertions",
    "P0",
  ],
  [
    "RPC pressure",
    "Không gọi public Devnet endpoint trong production; không polling dữ liệu ngoài màn hình",
    "Config test + browser Network",
    "P0",
  ],
  [
    "API abuse",
    "Identify trả 429; WebSocket đóng origin/message vi phạm; request hợp lệ vẫn chạy",
    "API/WS integration tests",
    "P0",
  ],
  [
    "Secret isolation",
    "Frontend bundle và logs không chứa key; capture/match authority độc lập",
    "Bundle scan + unauthorized tests",
    "P0",
  ],
  [
    "Performance",
    "Mobile p75 LCP <=2.5s, INP <=200ms, CLS <=0.1 trên route demo",
    "Vercel Web Analytics/Lighthouse field-like run",
    "P1",
  ],
  [
    "Assets",
    "Không tải artwork full-size ngoài viewport; không 404 cho 40 species",
    "Network trace + catalogue crawler",
    "P1",
  ],
  [
    "Motion",
    "reduced-motion dừng auto rotate; offscreen WebGL không render",
    "Playwright/RAF instrumentation",
    "P1",
  ],
  [
    "Accessibility",
    "Keyboard hoàn tất connect, collection, quest, battle; focus không mất",
    "Manual + axe",
    "P1",
  ],
  [
    "Release gate",
    "Tests, typecheck, lint, format, build, Anchor/LiteSVM pass từ clean checkout",
    "CI required checks",
    "P0",
  ],
  [
    "Rollback",
    "Có version và rollback cho Vercel, Render, Supabase migration, program upgrade",
    "Release rehearsal",
    "P1",
  ],
];

const evidence = [
  [
    "Repo snapshot",
    "Commit audit",
    "57d149a",
    "git log -1",
    "Mã nguồn audit nằm trong thư mục con wildquest/; root cha đang có trạng thái di chuyển/xoá bất thường nên không dọn tự động.",
  ],
  [
    "Validation",
    "Unit tests",
    "249 passed, 2 skipped",
    "npm run ci",
    "35 test files pass, 1 file skipped; TypeScript, ESLint, Prettier và Next.js production build đều pass; không gọi Devnet.",
  ],
  [
    "Validation",
    "TypeScript",
    "Pass",
    "npx tsc --noEmit --incremental false",
    "Không có output lỗi.",
  ],
  ["Validation", "ESLint", "Pass", "npm run lint", "Không có output lỗi."],
  [
    "Validation",
    "Production build",
    "Pass, 14 static pages",
    "npm run build",
    "Next.js 16.3.6; thay đổi next-env tự sinh đã được khôi phục.",
  ],
  [
    "Security",
    "Production dependencies",
    "0 vulnerabilities",
    "npm audit --omit=dev",
    "Đã nâng Next.js 16.3.6, Sharp 0.35.5 và Transformers 4.3.0; không dùng audit fix --force.",
  ],
  [
    "Vision",
    "Classifier smoke",
    "Golden Retriever, 99.2%",
    "Local ResNet-50 inference",
    "Transformers 4.3.0 đọc model local và artwork WebP thành công sau nâng dependency.",
  ],
  [
    "Assets",
    "public/ tổng",
    "44.67 MiB",
    "Filesystem measurement",
    "Đã chuyển 45 artwork và 5 frame sang WebP, xoá 5 alias trùng byte và dog.glb không dùng.",
  ],
  [
    "Assets",
    "Model",
    "Khoảng 25 MiB",
    "models/Xenova/resnet-50",
    "Model local được bundle cho identify; cần đo cold start trước khi đổi kiến trúc.",
  ],
  [
    "Assets",
    "Duplicate exact",
    "5 nhóm",
    "SHA-256 inventory",
    "bee/honey_bee; bull_mastiff/bullmastiff; domestic_pig/pig; domestic_shorthair/egyptian_cat; pembroke_corgi/pembroke_welsh_corgi.",
  ],
  [
    "Data",
    "Polling",
    "Scope theo màn hình",
    "app/lib/hooks/use-game-data.ts",
    "Collection/capture/species/battle/quest/profile chỉ tải resource cần thiết; quest reads được batch.",
  ],
  [
    "Battle",
    "Room storage",
    "Supabase durable state + replay",
    "scripts/battle-realtime-server.ts; scripts/battle-state-store.ts",
    "Active room phục hồi được sau restart; migration và multi-instance staging smoke chưa chạy.",
  ],
  [
    "Rendering",
    "Collection card",
    "SVG",
    "app/components/creature-model-card.tsx",
    "Không phải mỗi card tạo WebGL renderer; bottleneck chính có thể là ảnh/DOM.",
  ],
  [
    "Rendering",
    "Hologram",
    "Visibility-aware RAF",
    "app/components/creature-hologram-stage.tsx",
    "Dừng offscreen/tab hidden; reduced-motion dùng frame tĩnh.",
  ],
  [
    "Program",
    "Authority isolation",
    "MatchResolverConfig PDA",
    "programs/wildquest/src/instructions/initialize_match_resolver_config.rs",
    "Capture authority và match resolver đã tách trong source; còn deploy/initialize trên Devnet.",
  ],
  [
    "Validation",
    "Anchor/LiteSVM",
    "24 passed",
    "cargo test; anchor build; codama run js",
    "Program test pass, SBF build pass và generated TypeScript client đã đồng bộ với IDL.",
  ],
  [
    "Operations",
    "Local migration validation",
    "Bị chặn bởi Docker Desktop",
    "npx supabase status",
    "Hai migration đã viết nhưng chưa chạy local hoặc remote; không đánh dấu database complete.",
  ],
  [
    "Source",
    "Next Image",
    "Native lazy loading và sizes/srcset",
    "https://nextjs.org/docs/pages/api-reference/components/image",
    "Đánh giá Next Image trước khi chuyển mọi ảnh sang storage khác.",
  ],
  [
    "Source",
    "Supabase Storage",
    "CDN và image transformations",
    "https://supabase.com/docs/guides/storage/cdn/fundamentals",
    "Phù hợp artwork catalogue nếu A/B chứng minh lợi ích; không cần cho UI tĩnh.",
  ],
];

const workbook = Workbook.create();
const roadmapSheet = workbook.worksheets.add("Roadmap");
const backlogSheet = workbook.worksheets.add("Backlog");
const cleanupSheet = workbook.worksheets.add("Cleanup");
const acceptanceSheet = workbook.worksheets.add("Release Gates");
const evidenceSheet = workbook.worksheets.add("Evidence");

for (const sheet of [
  roadmapSheet,
  backlogSheet,
  cleanupSheet,
  acceptanceSheet,
  evidenceSheet,
]) {
  sheet.showGridLines = false;
}

function title(sheet, name, subtitle, endCol) {
  sheet.getRange(`A2:${endCol}2`).merge();
  sheet.getRange("A2").values = [[name]];
  sheet.getRange("A2").format = {
    font: { name: font, size: 16, bold: true, color: colors.ink },
    rowHeight: 28,
  };
  sheet.getRange(`A3:${endCol}3`).merge();
  sheet.getRange("A3").values = [[subtitle]];
  sheet.getRange("A3").format = {
    font: { name: font, size: 10, italic: true, color: colors.muted },
    rowHeight: 24,
    wrapText: true,
  };
  sheet.getRange(`A4:${endCol}4`).format = { fill: colors.gold, rowHeight: 3 };
}

function header(range) {
  range.format = {
    fill: colors.forest,
    font: { name: font, size: 10, bold: true, color: "#FFFFFF" },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    wrapText: true,
    rowHeight: 34,
    borders: { preset: "outside", style: "thin", color: colors.forest },
  };
}

function body(range) {
  range.format = {
    font: { name: font, size: 10, color: colors.ink },
    verticalAlignment: "top",
    wrapText: true,
    borders: {
      insideHorizontal: { style: "thin", color: "#DED8CB" },
      bottom: { style: "thin", color: "#DED8CB" },
    },
  };
}

title(
  roadmapSheet,
  "WildQuest Production Polish",
  "Backlog triển khai từ commit 57d149a, cập nhật theo code và kiểm thử ngày 2026-09-28. Trạng thái không bao gồm deploy/migration remote.",
  "J",
);
roadmapSheet.getRange("A6:B11").values = [
  ["Phạm vi", "Quyết định"],
  [
    "Core loop",
    "Wallet -> capture -> own Creature -> quest XP -> 3v3 battle -> claim",
  ],
  [
    "Nền tảng demo",
    "Vercel (Next.js/API) + Render (battle WebSocket) + Supabase + Solana Devnet",
  ],
  [
    "Ảnh",
    "Giữ UI/frame tĩnh trên Vercel. Chỉ thử Supabase Storage cho artwork catalogue bằng A/B.",
  ],
  [
    "Xoá code",
    "Đã xoá Counter scaffold, replay simulator và 3D stage sau zero-reference + test/build.",
  ],
  [
    "Ngoài phạm vi tự động",
    "Chưa chạy migration remote, deploy program/server/web hoặc dùng Devnet SOL.",
  ],
];
header(roadmapSheet.getRange("A6:B6"));
body(roadmapSheet.getRange("A7:B11"));
roadmapSheet.getRange("D6:E11").values = [
  ["Chỉ số", "Giá trị"],
  ["Tổng việc", null],
  ["P0", null],
  ["P1", null],
  ["P2", null],
  ["Đã xong", null],
];
roadmapSheet.getRange("E7:E11").formulas = [
  ["=COUNTA(Backlog!A7:A200)"],
  ['=COUNTIFS(Backlog!B7:B200,"P0")'],
  ['=COUNTIFS(Backlog!B7:B200,"P1")'],
  ['=COUNTIFS(Backlog!B7:B200,"P2")'],
  ['=COUNTIFS(Backlog!K7:K200,"Đã xong")'],
];
header(roadmapSheet.getRange("D6:E6"));
body(roadmapSheet.getRange("D7:E11"));
roadmapSheet.getRange("E7:E11").format.numberFormat = "0";
roadmapSheet.getRange("A14:J18").values = [
  [
    "Giai đoạn",
    "Mục tiêu",
    "Điều kiện bắt đầu",
    "Điều kiện kết thúc",
    "Ước tính nhóm",
    "Ưu tiên",
    "Rủi ro chính",
    "Không làm",
    "Kết quả demo",
    "Owner đề xuất",
  ],
  [
    "0. Chốt bản demo",
    "Sửa claim sai, khoá Devnet, RPC riêng",
    "Ngay",
    "P0 truth/RPC/release gate pass",
    "1-2 ngày",
    "P0",
    "Cấu hình môi trường",
    "Feature mới",
    "Thông điệp đúng và build lặp lại",
    "Founder + Frontend",
  ],
  [
    "1. Ổn định core loop",
    "Battle durable, identify abuse control, transaction states",
    "Giai đoạn 0",
    "Hai ví hoàn tất capture/quest/battle sau restart",
    "4-7 ngày",
    "P0",
    "Battle state và signer",
    "Mainnet",
    "Demo không mất trận",
    "Backend + Web3",
  ],
  [
    "2. Giảm tải UX",
    "Split data, batch RPC, image budget, pause animation",
    "Core loop xanh",
    "Performance budget đạt trên mobile demo",
    "4-6 ngày",
    "P1",
    "Regression UI",
    "Redesign toàn app",
    "Mượt hơn, ít 429",
    "Frontend",
  ],
  [
    "3. Dọn và đóng gói",
    "Xoá scaffold/duplicate sau gate, docs/runbook",
    "CI xanh",
    "Zero caller, migration rõ, clean deploy",
    "2-4 ngày",
    "P2",
    "Xoá nhầm compatibility",
    "Xoá lịch sử chưa migrate",
    "Repo gọn và dễ bàn giao",
    "Architecture + QA",
  ],
];
header(roadmapSheet.getRange("A14:J14"));
body(roadmapSheet.getRange("A15:J18"));
roadmapSheet.freezePanes.freezeRows(4);
roadmapSheet.getRange("A1:J20").format.font.name = font;
roadmapSheet.getRange("A:A").format.columnWidth = 21;
roadmapSheet.getRange("B:B").format.columnWidth = 48;
roadmapSheet.getRange("C:J").format.columnWidth = 21;
roadmapSheet.getRange("G:G").format.columnWidth = 25;
roadmapSheet.getRange("H:H").format.columnWidth = 23;

title(
  backlogSheet,
  "Backlog triển khai",
  "Chỉnh Owner, Status, Sprint và Due date trực tiếp. Ước tính là kích thước tương đối: S, M, L, XL.",
  "M",
);
const backlogHeaders = [
  "ID",
  "Priority",
  "Workstream",
  "Layer",
  "Task",
  "Why now",
  "Evidence",
  "Acceptance criteria",
  "Owner",
  "Size",
  "Status",
  "Sprint",
  "Depends on",
];
backlogSheet.getRange("A6:M6").values = [backlogHeaders];
backlogSheet.getRange(`A7:M${6 + backlog.length}`).values = backlog;
header(backlogSheet.getRange("A6:M6"));
body(backlogSheet.getRange(`A7:M${6 + backlog.length}`));
backlogSheet.tables.add(
  `A6:M${6 + backlog.length}`,
  true,
  "ProductionBacklog",
).style = "TableStyleMedium4";
backlogSheet.getRange(`B7:B${6 + backlog.length}`).dataValidation = {
  rule: { type: "list", values: ["P0", "P1", "P2"] },
};
backlogSheet.getRange(`K7:K${6 + backlog.length}`).dataValidation = {
  rule: {
    type: "list",
    values: ["Chưa làm", "Đang làm", "Bị chặn", "Đã xong"],
  },
};
backlogSheet
  .getRange(`B7:B${6 + backlog.length}`)
  .conditionalFormats.add("containsText", {
    text: "P0",
    format: { fill: "#FCE8E6", font: { bold: true, color: colors.red } },
  });
backlogSheet
  .getRange(`B7:B${6 + backlog.length}`)
  .conditionalFormats.add("containsText", {
    text: "P1",
    format: { fill: "#FFF3D8", font: { bold: true, color: colors.amber } },
  });
backlogSheet
  .getRange(`K7:K${6 + backlog.length}`)
  .conditionalFormats.add("containsText", {
    text: "Đã xong",
    format: { fill: "#E4F3E9", font: { bold: true, color: colors.green } },
  });
backlogSheet.freezePanes.freezeRows(6);
backlogSheet.freezePanes.freezeColumns(2);
const backlogWidths = [12, 9, 17, 16, 34, 46, 38, 50, 18, 8, 13, 11, 18];
backlogWidths.forEach(
  (width, index) =>
    (backlogSheet.getRangeByIndexes(0, index, 1, 1).format.columnWidth = width),
);
backlogSheet.getRange(`A7:M${6 + backlog.length}`).format.rowHeight = 78;

title(
  cleanupSheet,
  "Cleanup register",
  "Không xoá theo cảm tính. Mỗi mục cần gate kỹ thuật và gate tương thích trước khi merge.",
  "E",
);
cleanupSheet.getRange("A6:E6").values = [
  ["Decision", "Target", "Current evidence", "Delete gate", "Backlog"],
];
cleanupSheet.getRange(`A7:E${6 + cleanup.length}`).values = cleanup;
header(cleanupSheet.getRange("A6:E6"));
body(cleanupSheet.getRange(`A7:E${6 + cleanup.length}`));
cleanupSheet.tables.add(
  `A6:E${6 + cleanup.length}`,
  true,
  "CleanupRegister",
).style = "TableStyleMedium4";
cleanupSheet
  .getRange(`A7:A${6 + cleanup.length}`)
  .conditionalFormats.add("containsText", {
    text: "Giữ",
    format: { fill: "#E4F3E9", font: { color: colors.green, bold: true } },
  });
cleanupSheet
  .getRange(`A7:A${6 + cleanup.length}`)
  .conditionalFormats.add("containsText", {
    text: "Xoá",
    format: { fill: "#FFF3D8", font: { color: colors.amber, bold: true } },
  });
cleanupSheet.freezePanes.freezeRows(6);
[20, 40, 55, 55, 20].forEach(
  (width, index) =>
    (cleanupSheet.getRangeByIndexes(0, index, 1, 1).format.columnWidth = width),
);
cleanupSheet.getRange(`A7:E${6 + cleanup.length}`).format.rowHeight = 60;

title(
  acceptanceSheet,
  "Release gates",
  "Chỉ gọi là bản demo ổn định khi tất cả P0 đạt. Gate production cần thêm mainnet security review và vận hành nhiều instance.",
  "D",
);
acceptanceSheet.getRange("A6:D6").values = [
  ["Area", "Acceptance", "Verification", "Priority"],
];
acceptanceSheet.getRange(`A7:D${6 + acceptance.length}`).values = acceptance;
header(acceptanceSheet.getRange("A6:D6"));
body(acceptanceSheet.getRange(`A7:D${6 + acceptance.length}`));
acceptanceSheet.tables.add(
  `A6:D${6 + acceptance.length}`,
  true,
  "ReleaseGates",
).style = "TableStyleMedium4";
acceptanceSheet.freezePanes.freezeRows(6);
[22, 70, 40, 10].forEach(
  (width, index) =>
    (acceptanceSheet.getRangeByIndexes(0, index, 1, 1).format.columnWidth =
      width),
);
acceptanceSheet.getRange(`A7:D${6 + acceptance.length}`).format.rowHeight = 52;

title(
  evidenceSheet,
  "Evidence và baseline",
  "Các số liệu dưới đây được đo từ repository hiện tại; tài liệu ngoài chỉ hỗ trợ quyết định CDN/image optimization.",
  "E",
);
evidenceSheet.getRange("A6:E6").values = [
  ["Category", "Metric", "Observed", "Source", "Interpretation"],
];
evidenceSheet.getRange(`A7:E${6 + evidence.length}`).values = evidence;
header(evidenceSheet.getRange("A6:E6"));
body(evidenceSheet.getRange(`A7:E${6 + evidence.length}`));
evidenceSheet.tables.add(
  `A6:E${6 + evidence.length}`,
  true,
  "EvidenceTable",
).style = "TableStyleMedium4";
evidenceSheet.freezePanes.freezeRows(6);
[18, 24, 32, 52, 58].forEach(
  (width, index) =>
    (evidenceSheet.getRangeByIndexes(0, index, 1, 1).format.columnWidth =
      width),
);
evidenceSheet.getRange(`A7:E${6 + evidence.length}`).format.rowHeight = 55;

roadmapSheet.tabColor = colors.forest;
backlogSheet.tabColor = colors.forest2;
cleanupSheet.tabColor = colors.amber;
acceptanceSheet.tabColor = colors.red;
evidenceSheet.tabColor = colors.blue;

workbook.recalculate();
await fs.mkdir(previewDir, { recursive: true });
for (const sheetName of [
  "Roadmap",
  "Backlog",
  "Cleanup",
  "Release Gates",
  "Evidence",
]) {
  const preview = await workbook.render({
    sheetName,
    autoCrop: "all",
    scale: 1,
    format: "png",
  });
  await fs.writeFile(
    `${previewDir}/${sheetName.replaceAll(" ", "-")}.png`,
    new Uint8Array(await preview.arrayBuffer()),
  );
}
const summary = await workbook.inspect({
  kind: "table",
  range: "Roadmap!A1:J18",
  include: "values,formulas",
  tableMaxRows: 20,
  tableMaxCols: 12,
});
await fs.writeFile(`${outputDir}/inspection.ndjson`, summary.ndjson);
const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
});
await fs.writeFile(`${outputDir}/formula-errors.ndjson`, errors.ndjson);
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(
  JSON.stringify({
    outputPath,
    sheets: 5,
    backlog: backlog.length,
    cleanup: cleanup.length,
    gates: acceptance.length,
  }),
);

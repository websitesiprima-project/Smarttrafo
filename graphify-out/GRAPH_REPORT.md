# Graph Report - smart-trafo  (2026-09-19)

## Corpus Check
- 99 files · ~388,521 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: .csv 2, .log 2, (none) 1)

## Summary
- 493 nodes · 784 edges · 53 communities (24 shown, 29 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.87)
- Token cost: 1,098,149 input · 0 output

## Community Hubs (Navigation)
- Admin Management Pages
- Package Config & Keep-Alive API
- Core Pages & Utility Functions
- Dashboard Visualization
- History & DGA Import UI
- DGA Analysis Engine
- PDF Report Generation
- Backend CRUD API
- VOLTY AI & Standards Docs
- Dev Dependencies
- Runtime Dependencies
- TypeScript Config
- Backend Create Endpoints
- App Layout & Providers
- Backend Update Endpoints
- E2E Test Suite & Reports
- ML Training Pipeline
- Asset Data Layer
- Vercel Deployment Config
- ESLint Config
- PDF Lib Install Guide
- Jest Config
- Super Admin Auth Guard
- File System Utilities
- PostCSS Config
- Leaflet Map Asset
- PLN Brand Logo
- App Favicon Logo
- Lab Illustration Asset
- SmartTrafo Cube Logo
- SmartTrafo Battery Logo
- Vite Logo Asset (PNG)
- Vite Logo Asset (WebP)
- PostgreSQL Logo Asset
- React Logo Asset (PNG)
- React Logo Asset (WebP)
- Recharts Logo Asset
- SmartTrafo Transformer Photo
- Supabase Logo Asset
- Tailwind CSS Logo Asset
- Transformer Inspection Illustration
- Generic File Icon
- Generic Globe Icon
- Critical Status Map Pin
- Normal Status Map Pin
- Warning L1 Map Pin
- Warning L2 Map Pin
- Next.js Logo Asset
- React Icon Asset (SVG)
- Vercel Logo Asset
- Generic Window Icon

## God Nodes (most connected - your core abstractions)
1. `react` - 34 edges
2. `useAppContext()` - 23 edges
3. `lucide-react` - 23 edges
4. `compilerOptions` - 16 edges
5. `generatePDFFromTemplate()` - 15 edges
6. `supabase` - 13 edges
7. `TrafoInput` - 11 edges
8. `authHeaders()` - 11 edges
9. `predict()` - 10 edges
10. `analisis_duval_pentagon()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Bug: isValidDate(null) returns true, expected false` --rationale_for--> `isValidDate()`  [EXTRACTED]
  test-report.txt → utils/utilityFunctions.ts
- `IEEE C57.104-2019 Standard (referenced by VOLTY prompt)` --semantically_similar_to--> `IEEE C57.104-2019 Standard`  [INFERRED] [semantically similar]
  backend/agent.md → README.md
- `SPLN T5.004-4:2016 Standard (referenced by VOLTY prompt)` --semantically_similar_to--> `SPLN T5.004-4:2016 Standard`  [INFERRED] [semantically similar]
  backend/agent.md → README.md
- `Jest Coverage Run (PASSED, 5 suites / 17 tests)` --references--> `isValidDate()`  [EXTRACTED]
  test_coverage_results.txt → utils/utilityFunctions.ts
- `Jest Run - utilityFunctions.test.ts (FAILED, 1 failed / 28 passed)` --references--> `isValidDate()`  [EXTRACTED]
  test-report.txt → utils/utilityFunctions.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Jest Unit/Component Test Suite Executions** — test_report_jest_run, test_coverage_results_jest_run, utils_utilityfunctions_isvaliddate, app_dashboard_page_component, app_page_component, app_login_page_component, components_loadingscreen_component [INFERRED 0.75]
- **Playwright E2E Black Box Test Suite Artifacts (main-flows.spec.ts)** — pw_err_e2e_test_run, pw_out_e2e_test_run, result_e2e_test_run, playwright_report_index_report, e2e_main_flows_spec_landing_page_loads_correctly, e2e_main_flows_spec_user_can_navigate_to_login, e2e_main_flows_spec_invalid_login_attempt [EXTRACTED 1.00]
- **SMARTTRAFO Backend AI Assistant Stack (VOLTY)** — readme_smarttrafo, readme_volty_ai_assistant, backend_agent_volty_persona, backend_requirements_doc, readme_fastapi, readme_supabase [INFERRED 0.75]

## Communities (53 total, 29 thin omitted)

### Community 0 - "Admin Management Pages"
Cohesion: 0.06
Nodes (53): PLNInputProps, SuperAdminPage(), TrafoAsset, GI, UnitManagementPage(), UserManagementPage(), UserProfile, AppContext (+45 more)

### Community 1 - "Package Config & Keep-Alive API"
Cohesion: 0.05
Nodes (37): supabase, name, private, scripts, build, dev, lint, start (+29 more)

### Community 2 - "Core Pages & Utility Functions"
Cohesion: 0.11
Nodes (32): app/dashboard/page.tsx (Dashboard Page, 100% coverage), app/login/page.tsx (Login Page, 96.78% coverage), app/page.tsx (Landing Page, 97.34% coverage), components/LoadingScreen.tsx (100% coverage), components/ThemeToggle.tsx (100% coverage), Jest Coverage Run (PASSED, 5 suites / 17 tests), Jest Run - utilityFunctions.test.ts (FAILED, 1 failed / 28 passed), capitalizeString() (+24 more)

### Community 3 - "Dashboard Visualization"
Cohesion: 0.08
Nodes (21): COLORS_PIE, createCustomIcon(), DashboardPage(), formatDate(), GAS_CONFIG, GI, TrafoRecord, DashboardContent (+13 more)

### Community 4 - "History & DGA Import UI"
Cohesion: 0.09
Nodes (21): DeleteTarget, HistoryRecord, ResizeObserver, DuvalPentagon(), DuvalPentagonProps, ExcelImportModal(), ExcelImportModalProps, DeleteConfirmModal() (+13 more)

### Community 5 - "DGA Analysis Engine"
Cohesion: 0.13
Nodes (23): analisis_duval_pentagon(), analisis_ieee_2019(), analisis_key_gas(), analisis_ratio_co2_co(), analisis_rogers_ratio(), analisis_spln(), hitung_tdcg(), predict() (+15 more)

### Community 6 - "PDF Report Generation"
Cohesion: 0.22
Nodes (20): HistoryPage(), jspdf-autotable, calculateTDCG(), cleanMarkdown(), detectDuvalZone(), generateAutoKesimpulan(), getIEEEKondisi(), getKondisi() (+12 more)

### Community 7 - "Backend CRUD API"
Cohesion: 0.10
Nodes (25): admin_delete_user(), delete_asset(), delete_history_item(), delete_master_gi(), delete_master_ultg(), get_all_assets(), get_history(), get_master_hierarchy() (+17 more)

### Community 8 - "VOLTY AI & Standards Docs"
Cohesion: 0.12
Nodes (21): VOLTY Strict Guardrails - Off-topic Refusal Policy, IEEE C57.104-2019 Standard (referenced by VOLTY prompt), SPLN T5.004-4:2016 Standard (referenced by VOLTY prompt), VOLTY Persona - DGA & Transformer Maintenance Specialist, Backend Python Dependency Manifest (requirements.txt), Multi-Method DGA Analysis, Duval Pentagon 1 Method (Centroid Calculation), FastAPI Backend Framework (+13 more)

### Community 9 - "Dev Dependencies"
Cohesion: 0.10
Nodes (21): devDependencies, autoprefixer, eslint, eslint-config-next, jest, jest-environment-jsdom, @playwright/test, postcss (+13 more)

### Community 10 - "Runtime Dependencies"
Cohesion: 0.10
Nodes (20): dependencies, ai, @ai-sdk/groq, file-saver, framer-motion, jspdf, jspdf-autotable, jszip (+12 more)

### Community 11 - "TypeScript Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 12 - "Backend Create Endpoints"
Cohesion: 0.23
Nodes (12): add_master_gi(), add_master_ultg(), add_trafo(), admin_create_user(), chat_with_volty(), ChatInput, CreateUserRequest, MasterGiInput (+4 more)

### Community 13 - "App Layout & Providers"
Cohesion: 0.18
Nodes (8): AppProvider(), ClientLayout(), app_globals, inter, metadata, nextConfig, next, ref_next_font_google

### Community 14 - "Backend Update Endpoints"
Cohesion: 0.22
Nodes (9): admin_update_user(), Update nama ULTG dengan cascade ke profiles dan tabel terkait, Update data user (email, role, unit_ultg, password) dengan cascade, update_master_gi(), update_master_ultg(), UpdateGiInput, UpdateUltgInput, UpdateUserRequest (+1 more)

### Community 15 - "E2E Test Suite & Reports"
Cohesion: 0.50
Nodes (8): Test: Shows error/fails gracefully on invalid login attempt, Landing page copy/selector mismatch causing test failures ('Transformasi Digital' / 'Mulai Analisis' not found), Test: Landing Page loads correctly and contains key elements, Test: User can navigate to Login page successfully via Start button, Playwright HTML Test Report, Playwright E2E Run (FAILED, stderr capture), Playwright E2E Run (FAILED, stdout capture), Playwright E2E Run (PASSED, 3 tests, 7.4s)

### Community 16 - "ML Training Pipeline"
Cohesion: 0.29
Nodes (6): Melatih model klasifikasi fault DGA transformator. Sumber label: DGA-…, joblib, pandas, sklearn_ensemble, sklearn_metrics, sklearn_model_selection

### Community 17 - "Asset Data Layer"
Cohesion: 0.33
Nodes (4): allGIs, historicalDGA, trafoDatabase, ultgData

### Community 18 - "Vercel Deployment Config"
Cohesion: 0.40
Nodes (4): builds, crons, routes, version

### Community 19 - "ESLint Config"
Cohesion: 0.40
Nodes (4): eslintConfig, ref_eslint_config, ref_eslint_config_next_core_web_vitals, ref_eslint_config_next_typescript

### Community 20 - "PDF Lib Install Guide"
Cohesion: 0.50
Nodes (5): INSTALL_PDF_LIB.md Guide, Fallback to Legacy PDF Method on Install Failure, pdf-lib npm package, PDF Template Printing Feature, public/template_dga.pdf Template File

### Community 21 - "Jest Config"
Cohesion: 0.40
Nodes (3): config, createJestConfig, ref_next_jest_js

### Community 22 - "Super Admin Auth Guard"
Cohesion: 0.50
Nodes (4): Pastikan email yang SUDAH TERVERIFIKASI token memiliki role super_admin., Dependency: token valid DAN role super_admin., require_super_admin(), require_super_admin_dep()

### Community 23 - "File System Utilities"
Cohesion: 0.50
Nodes (3): ref_fs, files, fs

## Ambiguous Edges - Review These
- `Test: Landing Page loads correctly and contains key elements` → `Landing page copy/selector mismatch causing test failures ('Transformasi Digital' / 'Mulai Analisis' not found)`  [AMBIGUOUS]
  pw-err.txt · relation: rationale_for

## Knowledge Gaps
- **183 isolated node(s):** `TrafoAsset`, `PLNInputProps`, `GI`, `UserProfile`, `AppContextType` (+178 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 247 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **29 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Test: Landing Page loads correctly and contains key elements` and `Landing page copy/selector mismatch causing test failures ('Transformasi Digital' / 'Mulai Analisis' not found)`?**
  _Edge tagged AMBIGUOUS (relation: rationale_for) - confidence is low._
- **Why does `react` connect `Admin Management Pages` to `Package Config & Keep-Alive API`, `Dashboard Visualization`, `History & DGA Import UI`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `Admin Management Pages` to `Package Config & Keep-Alive API`, `Dashboard Visualization`, `History & DGA Import UI`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Dev Dependencies` to `Package Config & Keep-Alive API`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **What connects `TrafoAsset`, `PLNInputProps`, `GI` to the rest of the system?**
  _183 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin Management Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.05555555555555555 - nodes in this community are weakly interconnected._
- **Should `Package Config & Keep-Alive API` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._
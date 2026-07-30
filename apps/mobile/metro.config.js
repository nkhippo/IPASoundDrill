// apps/mobile/metro.config.js
//
// pnpm workspace 対応の Metro 設定（Issue #223 Phase 1）。
// `@ipasounddrill/core` は `workspace:*` で symlink 解決されるため、Metro が
// monorepo root（pnpm の symlink 先を含む）を watch できるよう `watchFolders`
// にリポジトリルートを追加する（`packages/core` 単体だけでは pnpm の
// `node_modules/.pnpm` 経由の symlink 解決が壊れるため、公式の Expo monorepo
// パターンに合わせて workspace root を watch する）。
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "..", "..");

const config = getDefaultConfig(projectRoot);

// `packages/core` を含む monorepo root を watch する。
config.watchFolders = [workspaceRoot];

// `packages/core/src/**` は tsc の NodeNext 的 `moduleResolution: "Bundler"` 前提で
// `import ... from "./foo.js"`（実体は `./foo.ts`）という拡張子表記を使う
// （`apps/web` はビルド時に esbuild で core を事前バンドルするため問題にならないが、
// Metro は raw source を直接 resolve するためこの `.js` → `.ts`/`.tsx` フォールバックが必要）。
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const resolve = defaultResolveRequest ?? context.resolveRequest;
  if (moduleName.endsWith(".js")) {
    try {
      return resolve(context, moduleName, platform);
    } catch {
      const withoutExt = moduleName.slice(0, -3);
      for (const ext of [".ts", ".tsx"]) {
        try {
          return resolve(context, `${withoutExt}${ext}`, platform);
        } catch {
          // try next extension
        }
      }
      throw new Error(`metro.config.js: could not resolve "${moduleName}" as .ts/.tsx`);
    }
  }
  return resolve(context, moduleName, platform);
};

module.exports = config;

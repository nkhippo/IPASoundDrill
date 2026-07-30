/**
 * apps/mobile/src/components/WordCard.tsx
 *
 * 単語表示 + IPA（Issue #224 Phase 2）。IPA テキストは `DoulosSIL-Regular`
 * （`apps/mobile/src/fonts/loadFonts.ts`）で表示する（Web の `--font-ipa` トークン相当、
 * `docs/design/phase-1/visual-tokens.md`）。
 *
 * ヘッダー行: アクセントバッジ（`.drill-accent-badge` 相当）+ 出題番号（`n / total`）+
 * CEFR タグ（`docs/features/_common.md` 「進捗表示」）。
 */
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Accent } from "@ipasounddrill/core";

import { DOULOS_SIL_FONT_FAMILY } from "../fonts/loadFonts";

export interface WordCardProps {
  accent: Accent;
  qno: number;
  total: number;
  cefr?: string | null;
  /** 主表示（Decode: IPA / Encode: 英単語 / Connected: carrier 句）。 */
  primaryText: string;
  primaryIsIpa?: boolean;
  /** 補助表示（例: gloss、respell）。 */
  secondaryText?: string;
  children?: ReactNode;
}

export function WordCard({
  accent,
  qno,
  total,
  cefr,
  primaryText,
  primaryIsIpa,
  secondaryText,
  children,
}: WordCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.accentBadge}>
          <Text style={styles.accentBadgeText}>{accent.toUpperCase()}</Text>
        </View>
        <Text style={styles.qno}>
          {qno} / {total}
        </Text>
        {!!cefr && (
          <View style={styles.cefrTag}>
            <Text style={styles.cefrTagText}>{cefr}</Text>
          </View>
        )}
      </View>

      <Text
        style={[styles.primary, primaryIsIpa && styles.primaryIpa]}
        accessibilityRole="text"
      >
        {primaryText}
      </Text>

      {!!secondaryText && <Text style={styles.secondary}>{secondaryText}</Text>}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: "#ffffff",
    padding: 20,
    gap: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  accentBadge: {
    backgroundColor: "#eef2ff",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  accentBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4f46e5",
  },
  qno: {
    fontSize: 13,
    color: "#6b7280",
  },
  cefrTag: {
    backgroundColor: "#f3f4f6",
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  cefrTagText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  primary: {
    fontSize: 28,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
  },
  primaryIpa: {
    fontFamily: DOULOS_SIL_FONT_FAMILY,
    fontSize: 32,
  },
  secondary: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
});

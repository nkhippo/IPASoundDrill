# Claude Design — 意図的乖離・スコープ外記録

Category F で **B. CD 意図的乖離** と判定したとき、または CD 準拠を意図的にスコープ外にしたとき、Claude が本表に 1 行追記する。  
乖離が Issue merge で解消されたら、Claude が該当行を削除する。

| 画面 | 乖離内容 | 理由 | 追跡 Issue |
|---|---|---|---|
| 1a PC トップ | 目的カード 1 カラム（CD: 4×1 グリッド）、右カラム sidebar 不在、ヘッダーテキストリンク不在 | Issue #128 は SP 専用スコープ | TBD（PC UI 改修 Issue） |
| 2 系 PC ドリル | 1 ペイン構成（CD: 2 ペイン）、タスクヘッダー不在 | 同上 | TBD |
| 3a PC プロフィール | Accent pill 表示（CD: カード）、順序逆、h3 文言差、info panel 差 | 同上 | TBD |
| 全画面 PC ヘッダー | /i:/ ロゴの意匠差、テキストリンク不在 | 同上 | TBD |
| About features item_5 | SRS 復習キューへの言及残存（機能は削除済み） | Issue #128 Rv で検出、後続対応 | TBD |
| SP guide `?` btn | CD に残存、実装から一時削除 | Phase 1-F で再導入予定 | Phase 1-F |

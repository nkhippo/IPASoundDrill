# `data/archive/` — local backups & snapshots

Runtime やパイプラインが**読み込まない**退避用ファイル置き場。

| File | Role |
|------|------|
| `wordlist_GA_a1a2_plus_phonics.pre-phase0a.json` | Phase 0-a 実施前の wordlist スナップショット（ローカル復元用） |

- パス正本: `scripts/paths.py` → `WORDLIST_BACKUP_PHASE0A`
- `*.pre-phase0a.json` は `.gitignore` 対象（コミットしない）

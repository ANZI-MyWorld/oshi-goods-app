# 推しグッズ帳 (Oshi Goods PWA)

推し活グッズを管理するスマホ向けWebアプリ。データは端末のlocalStorageに保存（オフライン動作）。

## AI取り込み用JSONスキーマ
配列、または `{"items":[...]}`。各アイテム:

| key | 型 | 必須 | 説明 |
|---|---|---|---|
| name | string | ✔ | グッズ名 |
| genre | string | | ジャンル（アクスタ, 缶バッジ, タペストリー…）。未登録なら自動追加 |
| series | string | | シリーズ（ポップアップA, 〇〇コラボ…）。未登録なら自動追加 |
| w | number | | 横 cm |
| h | number | | 縦 cm |
| d | number | | 奥行き cm |
| qty | integer | | 個数（既定1） |
| url | string | | 参考URL |
| memo | string | | メモ |

例:
```json
[{"name":"推しA アクリルスタンド","genre":"アクスタ","series":"ポップアップA","w":8,"h":15,"qty":1,"url":"https://example.com","memo":"会場限定"}]
```

### 取り込み方法
1. メニュー →「AIから取り込み」にJSONを貼り付け → 確認画面 → 追加
2. リンク: `https://<host>/#import=<base64url(UTF-8 JSON)>`（生JSONをURLエンコードしても可）。開くと確認画面が出る。

base64url生成例 (Python): `base64.urlsafe_b64encode(json.dumps(items,ensure_ascii=False).encode()).decode().rstrip("=")`

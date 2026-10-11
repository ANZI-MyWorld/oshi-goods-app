# 推しグッズ帳 (Oshi Goods PWA)

推し活グッズを管理するスマホ向けWebアプリ。データは端末のlocalStorageに保存（オフライン動作）。

## AI取り込み用JSONスキーマ
配列、または `{"items":[...]}`。各アイテム:

| key | 型 | 必須 | 説明 |
|---|---|---|---|
| name | string | ✔ | グッズ名 |
| work | string | | 作品名（作品タイトル）。`title` / `作品名` キーも可。未登録なら自動追加 |
| genre | string | | ジャンル（アクスタ, 缶バッジ, タペストリー…）。未登録なら自動追加 |
| series | string | | シリーズ（ポップアップA, 〇〇コラボ…）。未登録なら自動追加 |
| w | number | | 横 cm |
| h | number | | 縦 cm |
| d | number | | 奥行き cm |
| qty | integer | | 個数（既定1） |
| price | number | | 価格（円）。`価格` キーも可。"¥1,650" 形式も数値化 |
| notForSale | bool | | 非売品なら true（`非売品` キーも可）。true のとき price は null |
| planned | bool | | 購入予定なら true（`購入予定` キーも可）。qty 0 でも可 |
| url | string | | 参考URL |
| memo | string | | メモ |

例:
```json
[{"name":"推しA アクリルスタンド","work":"〇〇〇","genre":"アクスタ","series":"ポップアップA","w":8,"h":15,"qty":1,"price":1650,"notForSale":false,"planned":false,"url":"https://example.com","memo":"会場限定"}]
```

### 取り込み方法
1. メニュー →「AIから取り込み」にJSONを貼り付け → 確認画面 → 追加
2. リンク: `https://<host>/#import=<base64url(UTF-8 JSON)>`（生JSONをURLエンコードしても可）。開くと確認画面が出る。

base64url生成例 (Python): `base64.urlsafe_b64encode(json.dumps(items,ensure_ascii=False).encode()).decode().rstrip("=")`

## 画面の仕様
- 状態フィルタ（所持=qty≥1 / 未所持=qty 0 / 購入予定=planned）: 選択中のどれか1つに当てはまれば表示（OR）。選択は端末に保存（`oshiGoods.ui`）。
- qty 0 はグレー表示、購入予定はオレンジ枠＋🛒バッジ。
- 「選択」で一括モード: 複数選択・表示中を全選択・一括削除・一括編集（チェックした項目のみ上書き。名前は対象外）。
- 一括編集の画像は1枚だけ `photos`（id→画像）に保存し、各アイテムは `photoRef` で参照（容量節約）。個別の `photo` も従来どおり有効。

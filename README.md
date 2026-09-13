# Campus Med-Timer

地方の大学生向けに、キャンパスから病院へ行って戻るまでの所要時間、AI症状見積もり、事前決済をまとめて試せるExpoアプリです。

## ローカル起動

初回だけ依存関係をインストールします。

```bash
npm install
npm --prefix backend install
```

現在のローカル環境が `Node v20.15.0` の場合、Expo / React Native から `>=20.19.4` が必要という警告が出ます。想定環境の `Node 26.4.0` ならこの警告は解消されます。

Gemini APIを使う場合は、Expo用とバックエンド用の環境変数を分けて設定します。

プロジェクト直下に `.env` を作成します。

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

`backend/.env` を作成します。

```bash
GEMINI_API_KEY=取得したAPIキー
GEMINI_MODEL=gemini-3.5-flash
PORT=3000
```

起動はターミナルを2つ使います。

ターミナル1でバックエンドを起動します。

```bash
npm run backend:dev
```

ターミナル2でExpoを起動します。

```bash
npm start
```

Expo Go、iOS Simulator、Android Emulator、またはWebで確認できます。

スマホのExpo Goから試す場合、`localhost` はスマホ自身を指します。PCのIPアドレスを使って `EXPO_PUBLIC_API_BASE_URL=http://PCのIP:3000` にしてください。

例:

```bash
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.20:3000
```

動作確認用コマンド:

```bash
npm run typecheck
npm run backend:typecheck
npm test
```

## Render Freeでバックエンドをデプロイ

このリポジトリには `render.yaml` を用意しています。RenderのBlueprintから無料Web Serviceを作成できます。

1. GitHubにこのリポジトリをpushします。
2. Renderで `New` → `Blueprint` を選びます。
3. このリポジトリを接続します。
4. Planが `Free` になっていることを確認します。
5. 環境変数を設定します。

```bash
GEMINI_API_KEY=取得したGemini APIキー
GEMINI_MODEL=gemini-3.5-flash
ALLOWED_ORIGINS=https://フロントエンドのデプロイURL
```

Renderのデプロイが完了すると、バックエンドURLが発行されます。

```bash
https://campus-med-timer-backend.onrender.com
```

実際のURLをExpo側の環境変数に設定して、フロントエンドを再ビルド・再デプロイします。

```bash
EXPO_PUBLIC_API_BASE_URL=https://Renderで発行されたURL
npx expo export --platform web
eas deploy
```

Render FreeのWeb Serviceは15分ほどアクセスがないとスリープします。次回アクセス時は起動まで少し時間がかかります。

## 実装内容

- 宮崎大学 木花キャンパス、または端末の現在地を出発地として設定
- OpenStreetMap / Overpass API から周辺8kmの病院・クリニック・診療所を取得
- 診療科（内科、耳鼻科、皮膚科、整形外科、眼科、歯科、小児科）で周辺医療機関を絞り込み
- 現在地または宮崎大学と、選択した病院をOpenStreetMapタイル上に表示
- 周辺医療機関、移動手段、空き時間から総所要時間を計算
- 症状の自由記述から想定診療内容と3割負担の概算費用レンジを表示
- バックエンドAPI経由でGemini APIによる症状見積もりを実行
- 1,000円の一律先払いと、窓口精算時の差額目安を表示
- 往路、待ち時間、診察、薬局、復路の内訳をタイムラインで可視化

OpenStreetMapの施設情報は登録状況に依存します。移動時間は現時点では直線距離を補正した概算です。表示される傷病名や金額は診断ではなく、プロトタイプ用の目安です。

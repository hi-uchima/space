# 3D Earth Map Webアプリケーション

## 概要

このプロジェクトは、CesiumJSを用いた3D地球地図Webアプリケーションです。日本全国のランドマークや観光地などをCSVで管理し、地図上にピンとして表示できます。地図の種類切替やCSVのアップロード・切替・削除、サンプルCSVのダウンロード機能も備えています。

## 主な機能

- CesiumJSによる3D地球地図表示
- OpenStreetMap/国土地理院/ESRIの地図切替
- CSVファイルによる地点データ管理（最大10件）
- CSVアップロード・切替・削除
- サンプルCSVのダウンロード
- 日本全体へのズーム（Homeボタン）
- レスポンシブなUI

## ディレクトリ構成

```
├── default.conf                # Nginx設定ファイル
├── docker-compose.yml          # Docker Compose構成ファイル
└── docs/
    ├── index.html              # メインHTML
    ├── script.js               # フロントエンドJavaScript
    ├── styles.css              # スタイルシート
    └── sample.csv              # サンプルCSVデータ
```

## 動作方法

### Dockerを利用する場合

1. このリポジトリをクローンまたはダウンロードします。
2. ターミナルでプロジェクトルートに移動し、以下を実行：

   ```bash
   docker-compose up -d
   ```

3. ブラウザで `http://localhost:8000` にアクセスします。

### ローカルで直接開発する場合

`docs/index.html` をブラウザで開くだけで動作します（ただし一部機能はローカルファイル制限の影響を受ける場合があります）。

## 主要ライブラリ

- [CesiumJS](https://cesium.com/)
- [Nginx (Docker)](https://hub.docker.com/_/nginx)

## CSVフォーマット

```
label,latitude,longitude,description
名称,緯度,経度,説明
...
```

例:

```
東京スカイツリー,35.7100,139.8092,東京のランドマーク
```

## ライセンス

このプロジェクトはMITライセンスです。

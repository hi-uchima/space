// --- CSV管理 ---
const csvList = [];
const maxCsvCount = 10;
const csvListSelect = document.getElementById('csvList');
const csvUpload = document.getElementById('csvUpload');
const downloadSampleBtn = document.getElementById('downloadSample');
const deleteCsvBtn = document.getElementById('deleteCsv');

// ハンバーガーメニューの開閉制御
const menuToggle = document.getElementById('menuToggle');
const csvMenu = document.getElementById('csvMenu');
const menuBtn = document.getElementById('menuBtn');
const menuBtnWrap = document.getElementById('menuBtnWrap');
document.addEventListener('click', (e) => {
  if (!csvMenu.contains(e.target) && !menuBtnWrap.contains(e.target)) {
    menuToggle.checked = false;
  }
});

// サンプルCSVダウンロード
downloadSampleBtn.addEventListener('click', () => {
  fetch('sample.csv')
    .then(res => res.blob())
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sample.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
});

// CSVアップロード
csvUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    const text = evt.target.result;
    addCsvToList(file.name, text);
  };
  reader.readAsText(file, 'utf-8');
});

// CSVリスト追加・管理
function addCsvToList(name, text) {
  if (csvList.length >= maxCsvCount) {
    csvList.shift();
    csvListSelect.remove(0);
  }
  csvList.push({ name, text });
  const option = document.createElement('option');
  option.value = csvList.length - 1;
  option.textContent = name;
  csvListSelect.appendChild(option);
  csvListSelect.value = csvList.length - 1;
  showCsvPins(text);
}

// CSV削除
deleteCsvBtn.addEventListener('click', () => {
  const idx = Number(csvListSelect.value);
  if (isNaN(idx) || !csvList[idx]) return;
  csvList.splice(idx, 1);
  csvListSelect.remove(idx);
  // 残りがあれば先頭を表示、なければピン消去
  if (csvList.length > 0) {
    csvListSelect.value = 0;
    showCsvPins(csvList[0].text);
  } else {
    showCsvPins('');
  }
});

// CSV切替
csvListSelect.addEventListener('change', (e) => {
  const idx = Number(e.target.value);
  if (!isNaN(idx) && csvList[idx]) {
    showCsvPins(csvList[idx].text);
  }
});

// CSVからピンを立てる
let pinEntities = [];
function showCsvPins(csvText) {
  // 既存ピン削除
  pinEntities.forEach(e => viewer.entities.remove(e));
  pinEntities = [];
  const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return;
  const header = lines[0].split(',');
  const idxLabel = header.indexOf('label');
  const idxLat = header.indexOf('latitude');
  const idxLon = header.indexOf('longitude');
  const idxDesc = header.indexOf('description');
  for (let i = 1; i < lines.length; ++i) {
    const cols = lines[i].split(',');
    if (cols.length < 3) continue;
    const lat = parseFloat(cols[idxLat]);
    const lon = parseFloat(cols[idxLon]);
    if (isNaN(lat) || isNaN(lon)) continue;
    const label = cols[idxLabel] || '';
    const desc = cols[idxDesc] || '';
    const entity = viewer.entities.add({
      name: label,
      position: Cesium.Cartesian3.fromDegrees(lon, lat),
      point: { pixelSize: 12, color: Cesium.Color.RED },
      label: {
        text: label,
        font: '16px sans-serif',
        fillColor: Cesium.Color.BLACK,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -20)
      },
      description: desc
    });
    pinEntities.push(entity);
  }
}

// 初期サンプルCSVをリストに追加し、最初にマッピング
fetch('sample.csv').then(r => r.text()).then(text => {
  addCsvToList('サンプル', text);
  csvListSelect.value = 0;
  showCsvPins(text);
});
// Cesium IonのAPIキー（Bing Mapsのみ利用、他は不要）
Cesium.Ion.defaultAccessToken = '';

function createImageryProvider(type) {
  switch(type) {
    case 'osm':
      return new Cesium.OpenStreetMapImageryProvider({
        url: 'https://a.tile.openstreetmap.org/'
      });
    // case 'osmjp' は削除
    case 'gsi':
      // 国土地理院 標準地図タイル（日本語地名）
      return new Cesium.UrlTemplateImageryProvider({
        url: 'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
        credit: '地図データ：国土地理院'
      });
    case 'esri':
      return new Cesium.UrlTemplateImageryProvider({
        url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      });
    default:
      return new Cesium.OpenStreetMapImageryProvider({
        url: 'https://a.tile.openstreetmap.org/'
      });
  }
}

const viewer = new Cesium.Viewer('cesiumContainer', {
  baseLayerPicker: false,
  timeline: false,
  animation: false
});

// CesiumのHomeボタン押下時に日本全体にズームインするように設定
viewer.homeButton.viewModel.command.beforeExecute.addEventListener(function(commandInfo) {
  commandInfo.cancel = true;
  viewer.camera.flyTo({
    destination: Cesium.Rectangle.fromDegrees(122, 24, 153, 46), // 日本の西端・南端・東端・北端
    duration: 1.5
  });
});

// 最初にデフォルト（osm）をセット
viewer.imageryLayers.removeAll();
viewer.imageryLayers.addImageryProvider(createImageryProvider('osm'));

// 初期表示で日本全体が入る範囲にズームイン
viewer.camera.flyTo({
  destination: Cesium.Rectangle.fromDegrees(122, 24, 153, 46), // 日本の西端・南端・東端・北端
  duration: 0
});

function changeImagery(type) {
  const newProvider = createImageryProvider(type);
  viewer.imageryLayers.removeAll();
  viewer.imageryLayers.addImageryProvider(newProvider);
}
window.changeImagery = changeImagery;

const imagerySelectEl = document.getElementById('imagerySelect');
imagerySelectEl.addEventListener('change', function(e) {
  changeImagery(e.target.value);
});

// 地図切替イベントをグローバルなselectにもバインド
if (window.imagerySelect) {
  window.imagerySelect.addEventListener('change', function(e) {
    const type = e.target.value;
    const newProvider = createImageryProvider(type);
    viewer.imageryLayers.removeAll();
    viewer.imageryLayers.addImageryProvider(newProvider);
  });
}

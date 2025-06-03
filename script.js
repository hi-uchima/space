// 地図の初期化
const map = L.map('map').setView([35.6812, 139.7671], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// 全画面表示コントロールの追加
map.addControl(new L.Control.FullScreen({
    position: 'topleft',
    title: {
        'false': '全画面表示',
        'true': '全画面解除'
    }
}));

// カスタムアイコンの設定
const customIcon = L.divIcon({
    className: 'custom-marker',
    html: '<div class="marker-pin"></div>',
    iconSize: [30, 30],
    iconAnchor: [15, 30]
});

// マーカークラスターの初期化
const markers = L.markerClusterGroup({
    iconCreateFunction: function(cluster) {
        return L.divIcon({
            html: '<div class="cluster-marker">' + cluster.getChildCount() + '</div>',
            className: 'marker-cluster',
            iconSize: L.point(40, 40)
        });
    }
});
map.addLayer(markers);

// ファイル選択ボタンの処理
document.querySelector('.file-select-button').addEventListener('click', function() {
    document.getElementById('csvFile').click();
});

// CSVファイルの読み込み処理
document.getElementById('csvFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const button = document.querySelector('.file-select-button');
    
    // ファイルが選択されていない場合は処理を中断
    if (!file) {
        button.textContent = 'CSVファイルを選択';
        return;
    }

    // ファイルの種類をチェック
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        alert('CSVファイルを選択してください。');
        this.value = ''; // ファイル選択をリセット
        button.textContent = 'CSVファイルを選択';
        return;
    }

    // ファイル名を表示
    button.textContent = file.name;

    const reader = new FileReader();

    reader.onload = function(event) {
        try {
            const csvData = event.target.result;
            const rows = csvData.split('\n');
            
            // マーカーをクリア
            markers.clearLayers();

            // ヘッダーをスキップして処理
            for (let i = 1; i < rows.length; i++) {
                if (!rows[i].trim()) continue; // 空行をスキップ
                
                const columns = rows[i].split(',');
                if (columns.length >= 4) {
                    const lat = parseFloat(columns[0]);
                    const lng = parseFloat(columns[1]);
                    const label = columns[2].trim();
                    const description = columns[3].trim();

                    if (!isNaN(lat) && !isNaN(lng)) {
                        const marker = L.marker([lat, lng], { icon: customIcon })
                            .bindPopup(`<b>${label}</b><br>${description}`);
                        markers.addLayer(marker);
                    }
                }
            }
        } catch (error) {
            console.error('CSVファイルの処理中にエラーが発生しました:', error);
            alert('CSVファイルの処理中にエラーが発生しました。ファイルの形式を確認してください。');
            button.textContent = 'CSVファイルを選択';
        }
    };

    reader.onerror = function() {
        alert('ファイルの読み込み中にエラーが発生しました。');
        button.textContent = 'CSVファイルを選択';
    };

    reader.readAsText(file);
});

// サンプルCSVのダウンロード
document.getElementById('downloadSample').addEventListener('click', function() {
    const sampleData = `latitude,longitude,label,description
35.6812,139.7671,東京駅,東京の中心駅
35.6895,139.6917,新宿駅,新宿の中心駅
35.6586,139.7454,渋谷駅,渋谷の中心駅`;

    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_markers.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}); 
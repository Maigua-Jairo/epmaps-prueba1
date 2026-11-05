import WebView from 'react-native-webview';
import { LEAFLET_CSS, LEAFLET_JS } from './leafletAssets';

interface Props {
  latitud: number;
  longitud: number;
  editable?: boolean;
  onCambiar?: (latitud: number, longitud: number) => void;
}

function construirHtml(latitud: number, longitud: number, editable: boolean) {
  return `<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>${LEAFLET_CSS}
    html, body, #mapa { height: 100%; margin: 0; }
    .medidor-marker { background: transparent; border: 0; }
    .marker-pin { width: 42px; height: 48px; filter: drop-shadow(0 3px 4px rgba(2, 51, 115, .35)); }
    .marker-pin svg { width: 100%; height: 100%; }
  </style>
  <script>${LEAFLET_JS}</script>
</head>
<body>
  <div id="mapa"></div>
  <script>
    const map = L.map('mapa').setView([${latitud}, ${longitud}], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const markerIcon = L.divIcon({
      className: 'medidor-marker',
      html: '<div class="marker-pin"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s8-7.2 8-13a8 8 0 1 0-16 0c0 5.8 8 13 8 13Z" fill="#0455BF"/><circle cx="12" cy="9" r="3" fill="white"/></svg></div>',
      iconSize: [42, 48],
      iconAnchor: [21, 46]
    });

    const marker = L.marker([${latitud}, ${longitud}], {
      draggable: ${editable},
      icon: markerIcon
    }).addTo(map);

    if (${editable}) {
      marker.on('dragend', function (event) {
        const position = marker.getLatLng();
        const payload = JSON.stringify({
          latitud: position.lat,
          longitud: position.lng
        });
        window.ReactNativeWebView.postMessage(payload);
      });

      map.on('click', function (event) {
        marker.setLatLng(event.latlng);
        const payload = JSON.stringify({
          latitud: event.latlng.lat,
          longitud: event.latlng.lng
        });
        window.ReactNativeWebView.postMessage(payload);
      });
    }
  </script>
</body>
</html>`;
}

export function MapaLectura({ latitud, longitud, editable = false, onCambiar }: Props) {
  return (
    <WebView
      originWhitelist={['*']}
      source={{ html: construirHtml(latitud, longitud, editable) }}
      onMessage={(e) => {
        const { latitud: lat, longitud: lng } = JSON.parse(e.nativeEvent.data);
        onCambiar?.(lat, lng);
      }}
      style={{ flex: 1, minHeight: 240, borderRadius: 16 }}
    />
  );
}
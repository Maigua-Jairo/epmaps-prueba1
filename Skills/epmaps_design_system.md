# Guía de Diseño Visual e Identidad EPMAPS-Lecturas

Este documento define la guía de diseño visual, paleta de colores, tipografía, marcas de identidad y extensiones de estilo para la aplicación **epmaps-lecturas-app**, desarrollada en React Native y NativeWind (Tailwind CSS).

---

## 1. Paleta de Colores Institucional

La paleta se compone de tonos azulados e hídricos adecuados para el contexto operativo de EPMAPS (Agua Potable y Alcantarillado), garantizando alto contraste para lectura bajo luz solar directa en trabajos de campo.

| Muestra | Nombre / Rol | Código Hexadecimal | RGB | Uso Principal / Semántica |
| :--- | :--- | :--- | :--- | :--- |
| ![#023373](https://via.placeholder.com/15/023373/023373.png) | **Azul Institucional Oscuro** | `#023373` | `rgb(2, 51, 115)` | Cabeceras (`Header`), barras de estado, texto principal en fondo claro, contenedores secundarios. |
| ![#0455BF](https://via.placeholder.com/15/0455BF/0455BF.png) | **Azul Primario EPMAPS** | `#0455BF` | `rgb(4, 85, 191)` | Botones primarios, elementos activos de la UI, bordes de enfoque (`focus`), acentos principales. |
| ![#0A6ABF](https://via.placeholder.com/15/0A6ABF/0A6ABF.png) | **Azul Intermedio / Secundario** | `#0A6ABF` | `rgb(10, 106, 191)` | Botones secundarios, tarjetas activas, íconos de navegación, insignias de estado normal. |
| ![#22B7F2](https://via.placeholder.com/15/22B7F2/22B7F2.png) | **Azul Cyan Accent** | `#22B7F2` | `rgb(34, 183, 242)` | Indicadores de progreso, elementos flotantes, bordes de selección, íconos interactivos destacados. |
| ![#F2F2F2](https://via.placeholder.com/15/F2F2F2/F2F2F2.png) | **Gris Claro de Fondo** | `#F2F2F2` | `rgb(242, 242, 242)` | Fondo general de las pantallas (`Canvas`), fondos de tarjetas deshabilitadas, divisores. |

---

## 2. Configuración para NativeWind (`tailwind.config.js`)

Agrega esta extensión de colores a tu archivo `tailwind.config.js` para usar las clases utilitarias directamente en la interfaz:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        epmaps: {
          dark: '#023373',      // bg-epmaps-dark, text-epmaps-dark
          primary: '#0455BF',   // bg-epmaps-primary, border-epmaps-primary
          secondary: '#0A6ABF', // bg-epmaps-secondary
          accent: '#22B7F2',    // text-epmaps-accent, border-epmaps-accent
          bg: '#F2F2F2',        // bg-epmaps-bg
        },
        // Colores semánticos adicionales de estado operativo
        status: {
          online: '#10B981',    // Verde para estado sincronizado
          offline: '#F59E0B',   // Amarillo/Naranja para pendiente de envío (R9)
          danger: '#EF4444',    // Rojo para medidor dañado / anomalía (R6)
        }
      },
    },
  },
  plugins: [],
}
```

---

## 3. Guía de Componentes y Clases Utilidades

### A. Pantalla Principal y Layout (Fondo y Header)
```tsx
// Contenedor principal con fondo gris claro
<View className="flex-1 bg-epmaps-bg">
  {/* Header Institucional */}
  <View className="bg-epmaps-dark p-4 pt-12 flex-row justify-between items-center shadow-md">
    <Text className="text-white text-xl font-bold">EPMAPS - Lecturas</Text>
  </View>
</View>
```

### B. Barra Global de Conexión y Estado Offline (Requisito R9)
```tsx
{/* Banner con estado de red en la parte superior */}
<View className={`px-4 py-2 flex-row items-center justify-between ${isOnline ? 'bg-status-online' : 'bg-status-offline'}`}>
  <Text className="text-white text-xs font-semibold">
    {isOnline ? 'Conectado a Red' : 'Modo Offline (Sin Señal)'}
  </Text>
  <View className="bg-white/20 px-2 py-0.5 rounded-full">
    <Text className="text-white text-xs font-bold">{pendingCount} pendientes</Text>
  </View>
</View>
```

### C. Tarjeta de Datos del Medidor (Requisito R3)
```tsx
<View className="bg-white m-4 p-4 rounded-xl border border-gray-200 shadow-sm">
  <View className="flex-row justify-between items-center mb-2">
    <Text className="text-epmaps-dark font-bold text-lg">MED-123456</Text>
    <View className="bg-epmaps-accent/20 px-3 py-1 rounded-full">
      <Text className="text-epmaps-dark text-xs font-bold">Normal</Text>
    </View>
  </View>
  <Text className="text-gray-600 text-sm">Cuenta: 987654321</Text>
  <Text className="text-gray-600 text-sm">Dirección: Av. Amazonas y Eloy Alfaro</Text>
  <View className="mt-3 pt-3 border-t border-gray-100 flex-row justify-between">
    <Text className="text-xs text-gray-500">Promedio: 25.4 m³</Text>
    <Text className="text-xs text-epmaps-primary font-semibold">Última: 24.0 m³</Text>
  </View>
</View>
```

### D. Botones Institucionales (Primario, Secundario y Captura)
```tsx
{/* Botón Primario */}
<TouchableOpacity className="bg-epmaps-primary py-3.5 px-6 rounded-lg items-center active:opacity-90 shadow-sm">
  <Text className="text-white font-bold text-base">Guardar Lectura</Text>
</TouchableOpacity>

{/* Botón Secundario */}
<TouchableOpacity className="bg-epmaps-secondary py-3 px-6 rounded-lg items-center active:opacity-90">
  <Text className="text-white font-semibold text-sm">Consultar Medidor</Text>
</TouchableOpacity>

{/* Botón de Captura de Foto (Requisito R7) */}
<TouchableOpacity className="border-2 border-epmaps-accent border-dashed p-4 rounded-lg items-center bg-epmaps-accent/5">
  <Text className="text-epmaps-primary font-semibold text-sm">Tomar Fotografía del Medidor</Text>
</TouchableOpacity>
```

---

## 4. Reglas de Accesibilidad y Visibilidad en Campo

1. **Lectura Bajo Luz Solar Directa:** 
   - Mantener siempre contraste alto utilizando texto blanco (`#FFFFFF`) sobre fondos oscuros (`#023373` o `#0455BF`), y texto azul oscuro (`#023373`) o negro sobre fondo gris claro (`#F2F2F2`) o blanco (`#FFFFFF`).
2. **Tamaños Táctiles Mínimos:**
   - Todos los botones e insumos interactivos deben tener un área de toque (*touch target*) de al menos `44px` de alto (`py-3.5` o mayor).
3. **Indicadores Duales (Texto + Color):**
   - No depender únicamente de colores para indicar estados. Los mensajes deben incluir etiquetas textuales explícitas (e.g., "Sin Conexión", "Lectura Anómala", "Medidor Dañado").

   Aplica: Liquid Glass
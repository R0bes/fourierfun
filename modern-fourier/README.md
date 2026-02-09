# Interactive Fourier Drawing 🎨✨

Eine interaktive Fourier-Zeichen-App mit WebGL, Three.js und React - zeichnen Sie und sehen Sie, wie Ihre Zeichnung in Echtzeit durch Fourier-Kreise rekonstruiert wird!

## 🚀 Features

### 🎨 Interaktives Zeichnen
- **Maus-Zeichnen**: Klicken und ziehen Sie, um zu zeichnen
- **Real-time FFT**: Ihre Zeichnung wird sofort in Fourier-Komponenten zerlegt
- **Fourier-Kreise**: Animierte Kreise zeigen die Fourier-Transformation
- **Rekonstruktion**: Sehen Sie, wie die Kreise Ihre Zeichnung nachbauen

### 🌟 Visuelle Effekte
- **Trail-System**: Leuchtende Spuren der Fourier-Animation
- **Farb-Animation**: Kreise ändern Farben basierend auf Frequenzen
- **Glow-Effekte**: Leuchtende Kreise und Linien
- **3D-Rendering**: WebGL für hochperformante Visualisierung

### 🎛️ Interaktive Controls
- **Leva Panel**: Real-time Parameter-Anpassung
- **Visualisierungsmodi**: Ein-/Ausschalten verschiedener Effekte
- **Camera Controls**: Orbit, Zoom, Pan für 3D-Navigation
- **Performance Stats**: FPS und Rendering-Info

## 🛠️ Technologie-Stack

- **React 18** + **TypeScript** für moderne UI
- **Three.js** + **React Three Fiber** für 3D-Rendering
- **WebGL Shaders** für spektakuläre Effekte
- **Web Audio API** für Audio-Analyse
- **Vite** für schnelle Entwicklung
- **Leva** für coole Controls

## 🚀 Installation & Start

```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev

# Build für Production
npm run build
```

## 🎮 Bedienung

1. **Mikrofon erlauben** für Audio-reaktive Effekte
2. **Leva Panel** für Parameter-Anpassung verwenden
3. **Mouse Controls**:
   - Links klicken + ziehen: Orbit
   - Scroll: Zoom
   - Rechts klicken + ziehen: Pan
4. **Info Panel** für Status-Informationen

## 🎨 Effekte im Detail

### Fourier Visualization
- Real-time FFT-Berechnung
- Custom Shader mit Noise und Distortion
- Chromatic Aberration für psychedelische Effekte

### Particle System
- 10.000 Partikel mit individueller Physik
- Audio-reaktive Bewegung und Farben
- Fourier-basierte Partikel-Generierung

### Audio Reactive Effects
- Real-time Frequenz-Analyse
- Bass/Mid/Treble Separation
- Volume-basierte Effekt-Intensität

## 🔧 Konfiguration

Alle Parameter können über das Leva Panel angepasst werden:

- **Fourier**: Frequenz-Anzahl, Animations-Geschwindigkeit
- **Audio**: Sensitivität, Smoothing, Frequenz-Bänder
- **Visual**: Glow-Intensität, Distortion, Farben
- **Performance**: Partikel-Anzahl, Shader-Qualität

## 🌟 Performance

- **WebGL**: Hardware-beschleunigte Rendering
- **Web Workers**: Für CPU-intensive Berechnungen
- **Optimierte Shader**: Effiziente GLSL-Programme
- **LOD System**: Automatische Detail-Anpassung

## 🎯 Nächste Features

- [ ] WebGPU Support für noch bessere Performance
- [ ] Mehr Shader-Effekte (Raymarching, Volumetric)
- [ ] VR/AR Support
- [ ] Export-Funktionen für Videos
- [ ] Mehr Audio-Quellen (Datei-Upload)

## 📱 Browser Support

- Chrome/Edge: Vollständig unterstützt
- Firefox: Vollständig unterstützt
- Safari: WebGL Shader Support erforderlich
- Mobile: Touch-Controls verfügbar

---

**Erstellt mit ❤️ für spektakuläre visuelle Effekte!** 🎵✨

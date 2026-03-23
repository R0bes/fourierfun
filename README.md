# FourierFun - Spaß mit Epizyklen

Eine interaktive Web-Anwendung zur Visualisierung von Fourier-Transformationen mit mehreren Maschinen.
Malen mit Zahlen :)

![FourierFun Demo](video/flower/ff.gif)

## Docker (GHCR)

Vorgefertigtes Image (nach erfolgreichem CI-Build auf `main`):

```bash
docker pull ghcr.io/<owner>/<repo>:latest
docker run --rm -p 3001:3001 ghcr.io/<owner>/<repo>:latest
```

`PORT` ist per Umgebungsvariable überschreibbar (Standard: `3001`).

Lokal bauen:

```bash
docker build -t fourierfun:local .
docker run --rm -p 3001:3001 fourierfun:local
```


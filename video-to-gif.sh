#!/bin/bash

echo "========================================"
echo "   Video zu GIF Konverter"
echo "========================================"
echo

INPUT_FILE="video/stars/two_cycle_crop.mp4"
OUTPUT_FILE="two_cycle_crop.gif"

echo "Eingabe: $INPUT_FILE"
echo "Ausgabe: $OUTPUT_FILE"
echo

# Check if input file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo "❌ Eingabedatei nicht gefunden: $INPUT_FILE"
    echo "Verfügbare Dateien im video/stars/ Ordner:"
    ls -la video/stars/
    exit 1
fi

echo "🔄 Konvertiere Video zu GIF..."
echo

# Convert video to GIF with optimized settings
ffmpeg -i "$INPUT_FILE" \
    -vf "fps=15,scale=640:-1:flags=lanczos,palettegen" \
    -y palette.png

ffmpeg -i "$INPUT_FILE" \
    -i palette.png \
    -filter_complex "fps=15,scale=640:-1:flags=lanczos[x];[x][1:v]paletteuse" \
    -y "$OUTPUT_FILE"

# Clean up palette file
rm -f palette.png

if [ -f "$OUTPUT_FILE" ]; then
    echo
    echo "✅ GIF erfolgreich erstellt: $OUTPUT_FILE"
    echo
    echo "📊 Dateigröße:"
    ls -lh "$OUTPUT_FILE" | awk '{print "   " $5}'
    echo
    echo "🎬 Möchtest du das GIF öffnen? (j/n)"
    read -r choice
    if [[ "$choice" == "j" || "$choice" == "J" ]]; then
        if command -v xdg-open > /dev/null; then
            xdg-open "$OUTPUT_FILE"
        elif command -v open > /dev/null; then
            open "$OUTPUT_FILE"
        else
            echo "Bitte öffne das GIF manuell: $OUTPUT_FILE"
        fi
    fi
else
    echo "❌ Fehler beim Erstellen des GIFs"
fi

echo

#!/bin/bash

echo "========================================"
echo "   FourierFun - Server Management"
echo "========================================"
echo

# Check if server is already running
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo "Server läuft bereits auf Port 3001"
    echo "Möchtest du ihn stoppen? (j/n)"
    read -r choice
    if [[ "$choice" == "j" || "$choice" == "J" ]]; then
        echo "Stoppe alle Node.js Prozesse..."
        pkill -f node
        echo "Server gestoppt."
        exit 0
    else
        echo "Server läuft weiter."
        exit 0
    fi
fi

echo "Starte FourierFun Server..."
echo

# Start the server
npm run dev

echo
echo "Server gestoppt."

const path = require('path');

module.exports = {
    mode: 'development', // Oder 'production' für Produktionsumgebungen
    entry: './src/script.js',
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'public'),
    },
    // Weitere Konfigurationen...
  };
  
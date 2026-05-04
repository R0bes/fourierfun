const express = require('express');

const app = express();
const port = process.env.PORT || 3001;

app.use(express.static('public'));

app.listen(port, '0.0.0.0', () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});

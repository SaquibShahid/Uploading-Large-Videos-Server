const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const multer = require('multer');

const videoRoutes = require('./routes/video')

const app = express();
app.use(express.json({
  limit: '500MB',
}));

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(cors());

app.use(morgan('dev'));

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).send('File size limit exceeded (max 500MB).');
    }
  }
  res.status(500).send(err.message);
});

app.use('/api', videoRoutes)

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`app running on port: ${port}`);
});
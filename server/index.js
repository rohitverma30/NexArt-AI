import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import connectDB from './mongodb/connect.js';
import postRoutes from './routes/postRoutes.js';
import dalleRoutes from './routes/dalleRoutes.js';
import removeBgRouter from './routes/removeBackground.js';
import reimagineRouter from './routes/reimagineRouter.js';
import removeTextRouter from './routes/removeTextRouter.js';
import upscaleImageRouter from './routes/upscaleImageRouter.js'; 
import replaceBackgroundRouter from './routes/replaceBackgroundRouter.js';
import sketchToImageRouter from './routes/sketchToImageRouter.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

 app.use('/api/v1/post', postRoutes);
 app.use('/api/v1/dalle', dalleRoutes);
 app.use('/api/v1/remove-background', removeBgRouter); 
 app.use('/api/v1/reimagine', reimagineRouter);
 app.use('/api/v1/remove-text', removeTextRouter);
 app.use('/api/v1/upscale-image', upscaleImageRouter);
 app.use('/api/v1/replace-background', replaceBackgroundRouter);
 app.use('/api/v1/sketch-to-image', sketchToImageRouter);
 app.use('/api/auth', authRoutes);

app.get('/', async (req, res) => {
  res.status(200).json({
    message: 'Hello from DALL.E!',
  });
});

const startServer = async () => {
  try {
    connectDB(process.env.MONGODB_URL);
    app.listen(8080, () => console.log('Server started on port 8080'));
  } catch (error) {
    console.log(error);
  }
};

startServer();
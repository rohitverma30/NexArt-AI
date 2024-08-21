import express from 'express';
import * as dotenv from 'dotenv';
import multer from 'multer';
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

dotenv.config();

const router = express.Router();

// Setup multer for handling file uploads
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('image_file'), async (req, res) => {
  const { path: filePath, originalname } = req.file;

  try {
    const fileStream = fs.createReadStream(filePath);
    const formData = new FormData();
    formData.append('image_file', fileStream, originalname);

    const response = await fetch('https://clipdrop-api.co/remove-background/v1', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.CLIPDROP_API_KEY,
      },
      body: formData,
    });

    await fs.promises.unlink(filePath);

    if (!response.ok) {
      const errorDetails = await response.json();
      console.error('ClipDrop API error:', errorDetails);
      return res.status(response.status).json(errorDetails);
    }

    // Log success message to the console
    console.log('Background removed successfully for file:', originalname);

    const contentType = response.headers.get('content-type');
    res.set('Content-Type', contentType);
    response.body.pipe(res);

  } catch (error) {
    console.error('Error removing background:', error);
    res.status(500).json({ error: 'Failed to remove background' });
    fs.unlink(filePath, (err) => {
      if (err) console.error('Failed to delete file:', err);
    });
  }
});

export default router;

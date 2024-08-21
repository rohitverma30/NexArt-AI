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
    // Create a read stream and delete the file after use
    const fileStream = fs.createReadStream(filePath);
    const formData = new FormData();
    formData.append('image_file', fileStream, originalname);

    // Make the request to the ClipDrop API
    const response = await fetch('https://clipdrop-api.co/remove-background/v1', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.CLIPDROP_API_KEY, // Updated as per documentation
      },
      body: formData,
    });

    // Ensure the file is deleted after the API call
    await fs.promises.unlink(filePath);

    if (!response.ok) {
      const errorDetails = await response.json();
      console.error('ClipDrop API error:', errorDetails);
      return res.status(response.status).json(errorDetails);
    }

    // Stream the response back to the client and log success
    const contentType = response.headers.get('content-type');
    res.set('Content-Type', contentType);
    response.body.pipe(res).on('finish', () => {
      console.log('Background removed successfully and image sent to client.');
    });

  } catch (error) {
    console.error('Error removing background:', error);
    res.status(500).json({ error: 'Failed to remove background' });

    // Ensure the file is deleted if an error occurs
    fs.unlink(filePath, (err) => {
      if (err) console.error('Failed to delete file:', err);
    });
  }
});

export default router;

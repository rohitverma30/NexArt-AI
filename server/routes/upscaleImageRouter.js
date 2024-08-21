import express from 'express';
import multer from 'multer';
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('image_file'), async (req, res) => {
  const { path: filePath, originalname } = req.file;
  const { target_width, target_height } = req.body;

  try {
    const fileStream = fs.createReadStream(filePath);
    const formData = new FormData();
    formData.append('image_file', fileStream, originalname);
    formData.append('target_width', target_width);
    formData.append('target_height', target_height);

    const response = await fetch('https://clipdrop-api.co/image-upscaling/v1/upscale', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.CLIPDROP_API_KEY,
      },
      body: formData,
    });

    // Remove the file after processing
    await fs.promises.unlink(filePath);

    if (!response.ok) {
      const errorDetails = await response.json();
      console.error('ClipDrop Image Upscaling API error:', errorDetails);
      return res.status(response.status).json(errorDetails);
    }

    const contentType = response.headers.get('content-type');
    res.set('Content-Type', contentType);

    // Stream the response back to the client and log success
    response.body.pipe(res).on('finish', () => {
      console.log('Image upscaled and sent successfully.');
    });

  } catch (error) {
    console.error('Error upscaling image:', error);
    res.status(500).json({ error: 'Failed to upscale image' });

    fs.unlink(filePath, (err) => {
      if (err) console.error('Failed to delete file:', err);
    });
  }
});

export default router;

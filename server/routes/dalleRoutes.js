import express from 'express';
import * as dotenv from 'dotenv';
//import { Configuration, OpenAIApi } from 'openai';
import { OpenAI } from 'openai';


dotenv.config();

const router = express.Router();

// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // Make sure your environment variable is set correctly
});


router.route('/').get((req, res) => {
  res.status(200).json({ message: 'Hello from DALL-E!' });
});

router.route('/').post(async (req, res) => {
  try {
    const { prompt } = req.body;

    const aiResponse = await openai.images.generate({
      prompt,
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json',
    });
    
//     console.log('aiResponse:', aiResponse);
// console.log('aiResponse.data:', aiResponse.data);
// console.log('aiResponse.data.data:', aiResponse.data.data);

    const image = aiResponse.data[0].b64_json;
    res.status(200).json({ photo: image });
  } catch (error) {
    console.error(error);
    // Check if error.response and error.response.data exist before accessing their properties
    const errorMessage = error.response && error.response.data && error.response.data.error ? error.response.data.error.message : 'Something went wrong';
    res.status(500).send(errorMessage);
  }
});


  
  
  

export default router;
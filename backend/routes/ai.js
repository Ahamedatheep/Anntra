const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// @route   POST api/ai/advise
// @desc    Get AI advice for a mission
router.post('/advise', auth, async (req, res) => {
    try {
        const { context } = req.body;

        const prompt = `You are the ANNTRA AI Mission Advisor. Given the following context about a food rescue mission, provide a short, actionable 2-sentence piece of advice for the volunteer. 
        Context: ${context}. Keep it professional, encouraging, and efficient.`;

        const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
            contents: [{ parts: [{ text: prompt }] }]
        });

        const advice = response.data.candidates[0].content.parts[0].text;
        res.json({ advice });
    } catch (err) {
        console.error('AI Error:', err.message);
        res.status(500).json({ advice: 'Optimize your route for the fastest delivery to ensure food freshness. Stay safe on the road!' });
    }
});

module.exports = router;

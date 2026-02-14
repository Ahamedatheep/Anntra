const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const Donor = require('../models/Donor');
const FoodBatch = require('../models/FoodBatch');

// @route   POST api/donor/register
// @desc    Create donor profile
router.post('/register', [auth, role(['donor'])], async (req, res) => {
    try {
        const { organizationType } = req.body;

        let donor = await Donor.findOne({ user: req.user.id });
        if (donor) return res.status(400).json({ msg: 'Donor profile already exists' });

        donor = new Donor({
            user: req.user.id,
            organizationType: organizationType || 'individual',
            approvalStatus: 'pending'
        });

        await donor.save();
        res.json(donor);
    } catch (err) {
        console.error('Donor Registration Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// @route   GET api/donor/profile
// @desc    Get donor profile with trust badge
router.get('/profile', [auth, role(['donor'])], async (req, res) => {
    try {
        let donor = await Donor.findOne({ user: req.user.id }).populate('user', 'name email');
        if (!donor) {
            // Create default donor profile
            donor = new Donor({ user: req.user.id });
            await donor.save();
            donor = await Donor.findById(donor._id).populate('user', 'name email');
        }
        res.json(donor);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET api/donor/analytics
// @desc    Get donor impact analytics
router.get('/analytics', [auth, role(['donor'])], async (req, res) => {
    try {
        const donor = await Donor.findOne({ user: req.user.id });

        const totalBatches = await FoodBatch.countDocuments({ donor: req.user.id });
        const delivered = await FoodBatch.countDocuments({ donor: req.user.id, status: 'delivered' });
        const active = await FoodBatch.countDocuments({
            donor: req.user.id,
            status: { $in: ['pending', 'assigned', 'picked_up', 'in_transit'] }
        });

        // Calculate best donation times based on history
        const batches = await FoodBatch.find({ donor: req.user.id, status: 'delivered' });
        const hourCounts = {};
        batches.forEach(batch => {
            const hour = new Date(batch.createdAt).getHours();
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });

        const bestHour = Object.keys(hourCounts).reduce((a, b) => hourCounts[a] > hourCounts[b] ? a : b, 0);

        res.json({
            donor: donor || { trustScore: 100, badges: [], totalDonations: 0 },
            totalBatches,
            delivered,
            active,
            successRate: totalBatches > 0 ? ((delivered / totalBatches) * 100).toFixed(1) : 0,
            bestDonationTime: `${bestHour}:00 - ${parseInt(bestHour) + 1}:00`
        });
    } catch (err) {
        console.error('Donor analytics error:', err);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/donor/suggestions
// @desc    Get AI suggestions for best donation time
router.get('/suggestions', [auth, role(['donor'])], async (req, res) => {
    try {
        // Simple logic - can be enhanced with ML
        const recentBatches = await FoodBatch.find({
            donor: req.user.id,
            status: 'delivered'
        }).sort({ createdAt: -1 }).limit(10);

        if (recentBatches.length === 0) {
            return res.json({
                suggestion: 'Based on platform data, evenings (6-8 PM) see highest volunteer availability.'
            });
        }

        const avgPickupTime = recentBatches.reduce((sum, batch) => {
            const created = new Date(batch.createdAt);
            const assigned = new Date(batch.updatedAt);
            return sum + (assigned - created);
        }, 0) / recentBatches.length;

        const minutes = Math.round(avgPickupTime / 1000 / 60);

        res.json({
            suggestion: `Your donations are typically picked up within ${minutes} minutes. Continue donating during your current schedule for optimal results.`,
            avgPickupTime: `${minutes} minutes`
        });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;

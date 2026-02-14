const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const User = require('../models/User');
const FoodBatch = require('../models/FoodBatch');
const VolunteerStats = require('../models/VolunteerStats');
const ImpactMetrics = require('../models/ImpactMetrics');
const DistributionRecord = require('../models/DistributionRecord');
const NGO = require('../models/NGO');

// @route   GET api/admin/analytics
// @desc    Get system-wide analytics
router.get('/analytics', [auth, role(['admin'])], async (req, res) => {
    try {
        let metrics = await ImpactMetrics.findOne();
        if (!metrics) {
            metrics = new ImpactMetrics();
            await metrics.save();
        }

        const activeDeliveries = await FoodBatch.countDocuments({
            status: { $in: ['assigned', 'picked_up', 'in_transit'] }
        });

        const urgentBatches = await FoodBatch.countDocuments({
            urgencyLevel: { $in: ['urgent', 'critical'] },
            status: 'pending'
        });

        const criticalBatches = await FoodBatch.countDocuments({
            urgencyLevel: 'critical',
            status: 'pending'
        });

        const totalDonors = await User.countDocuments({ role: 'donor' });
        const totalVolunteers = await User.countDocuments({ role: 'volunteer' });
        const totalNGOs = await NGO.countDocuments({ status: 'active' });

        // Calculate volunteer hours (approx 1 hour per delivery)
        const totalDeliveries = await DistributionRecord.countDocuments();
        const volunteerHours = totalDeliveries * 1; // Simplified

        res.json({
            metrics,
            activeDeliveries,
            urgentBatches,
            criticalBatches,
            totalDonors,
            totalVolunteers,
            totalNGOs,
            volunteerHours,
            methaneAvoided: (metrics.totalCO2Reduced * 0.01).toFixed(2) // Simplified calculation
        });
    } catch (err) {
        console.error('Analytics error:', err);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/admin/leaderboard
// @desc    Get Hall of Fame - top volunteers
router.get('/leaderboard', [auth], async (req, res) => {
    try {
        const topVolunteers = await VolunteerStats.find()
            .populate('volunteer', 'name email')
            .sort({ completedDeliveries: -1, reliabilityScore: -1 })
            .limit(10);

        res.json(topVolunteers);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET api/admin/alerts
// @desc    Get exception alerts for admin intervention
router.get('/alerts', [auth, role(['admin'])], async (req, res) => {
    try {
        const now = new Date();
        const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

        // RED-ZONE cases requiring intervention
        const criticalExpiry = await FoodBatch.find({
            status: 'pending',
            expiryTime: { $lt: twoHoursFromNow },
            urgencyLevel: 'critical'
        }).populate('donor', 'name phone');

        const recentCancellations = await FoodBatch.find({
            status: 'cancelled',
            updatedAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
        }).populate('donor', 'name');

        res.json({
            criticalExpiry,
            recentCancellations: recentCancellations.length,
            redZoneCount: criticalExpiry.length
        });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET api/admin/ngo/pending
// @desc    Get pending NGO approvals
router.get('/ngo/pending', [auth, role(['admin'])], async (req, res) => {
    try {
        const pendingNGOs = await NGO.find({ status: 'pending' })
            .populate('user', 'name email phone');
        res.json(pendingNGOs);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST api/admin/ngo/approve/:ngoId
// @desc    Approve an NGO
router.post('/ngo/approve/:ngoId', [auth, role(['admin'])], async (req, res) => {
    try {
        const ngo = await NGO.findByIdAndUpdate(
            req.params.ngoId,
            { status: 'active' },
            { new: true }
        );

        if (!ngo) return res.status(404).json({ msg: 'NGO not found' });
        res.json({ msg: 'NGO approved', ngo });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET api/admin/hunger-zones
// @desc    Get hunger zone heatmap data (for visualization)
router.get('/hunger-zones', [auth, role(['admin'])], async (req, res) => {
    try {
        // Get areas with high beneficiary concentration
        const deliveries = await DistributionRecord.find()
            .populate('beneficiary', 'location')
            .select('route.dropoff mealsServed');

        // Group by approximate zones (simplified - in production use proper geo clustering)
        const zones = deliveries.map(d => ({
            location: d.route?.dropoff?.coordinates || [0, 0],
            intensity: d.mealsServed
        }));

        res.json(zones);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET api/admin/ngo/all
// @desc    Get all NGOs for oversight
router.get('/ngo/all', [auth, role(['admin'])], async (req, res) => {
    try {
        const ngos = await NGO.find().populate('user', 'name email phone');
        res.json(ngos);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET api/admin/deliveries/active
// @desc    Get all active deliveries for monitoring
router.get('/deliveries/active', [auth, role(['admin'])], async (req, res) => {
    try {
        const deliveries = await FoodBatch.find({
            status: { $ne: 'delivered' }
        }).populate('donor', 'name').populate('assignedVolunteer', 'name');
        res.json(deliveries);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;

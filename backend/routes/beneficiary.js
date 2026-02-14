const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const Beneficiary = require('../models/Beneficiary');
const FoodBatch = require('../models/FoodBatch');
const Feedback = require('../models/Feedback');

// @route   POST api/beneficiary/register
// @desc    Register as beneficiary
router.post('/register', [auth, role(['beneficiary'])], async (req, res) => {
    try {
        const { familySize, preferredCategory, coordinates, address } = req.body;

        let beneficiary = await Beneficiary.findOne({ user: req.user.id });
        if (beneficiary) return res.status(400).json({ msg: 'Beneficiary profile already exists' });

        beneficiary = new Beneficiary({
            user: req.user.id,
            familySize,
            preferredCategory,
            location: {
                type: 'Point',
                coordinates: coordinates || [0, 0]
            },
            address,
            status: 'pending' // NGO needs to approve
        });

        await beneficiary.save();
        res.json(beneficiary);
    } catch (err) {
        console.error('Beneficiary Registration Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// @route   GET api/beneficiary/profile
// @desc    Get beneficiary profile
router.get('/profile', [auth, role(['beneficiary'])], async (req, res) => {
    try {
        const beneficiary = await Beneficiary.findOne({ user: req.user.id })
            .populate('user', 'name email phone')
            .populate('ngo', 'organizationName');

        if (!beneficiary) return res.status(404).json({ msg: 'Beneficiary profile not found' });
        res.json(beneficiary);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET api/beneficiary/available-food
// @desc    Get pending food batches in the area
router.get('/available-food', [auth, role(['beneficiary'])], async (req, res) => {
    try {
        const beneficiary = await Beneficiary.findOne({ user: req.user.id });
        if (!beneficiary) return res.status(404).json({ msg: 'Beneficiary profile not found' });

        const batches = await FoodBatch.find({
            status: 'pending',
            location: {
                $near: {
                    $geometry: beneficiary.location,
                    $maxDistance: 10000 // 10km radius
                }
            }
        }).populate('donor', 'name');

        res.json(batches);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST api/beneficiary/order/:foodBatchId
// @desc    Order/claim a specific food batch
router.post('/order/:foodBatchId', [auth, role(['beneficiary'])], async (req, res) => {
    try {
        const beneficiary = await Beneficiary.findOne({ user: req.user.id });
        if (!beneficiary) return res.status(404).json({ msg: 'Beneficiary profile not found' });

        const foodBatch = await FoodBatch.findById(req.params.foodBatchId);
        if (!foodBatch) return res.status(404).json({ msg: 'Food batch not found' });
        if (foodBatch.status !== 'pending') return res.status(400).json({ msg: 'Food is no longer available' });

        // Update FoodBatch
        foodBatch.beneficiary = req.user.id;
        // The status remains pending until a volunteer is assigned or claims it
        // but we link it to the beneficiary
        await foodBatch.save();

        beneficiary.requests.push({
            requestedAt: new Date(),
            status: 'approved',
            foodBatch: foodBatch._id
        });

        await beneficiary.save();
        res.json({ msg: 'Food ordered successfully. A volunteer will be notified.', foodBatch });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/beneficiary/request
// @desc    Request food support (generic)
router.post('/request', [auth, role(['beneficiary'])], async (req, res) => {
    try {
        const beneficiary = await Beneficiary.findOne({ user: req.user.id });
        if (!beneficiary) return res.status(404).json({ msg: 'Beneficiary profile not found' });

        beneficiary.requests.push({
            requestedAt: new Date(),
            status: 'pending'
        });

        await beneficiary.save();
        res.json({ msg: 'Food support request created', beneficiary });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET api/beneficiary/deliveries
// @desc    Track my deliveries
router.get('/deliveries', [auth, role(['beneficiary'])], async (req, res) => {
    try {
        const deliveries = await FoodBatch.find({
            beneficiary: req.user.id
        })
            .populate('donor', 'name')
            .populate('assignedVolunteer', 'name')
            .sort({ createdAt: -1 });

        res.json(deliveries);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST api/beneficiary/feedback
// @desc    Give feedback on delivery
router.post('/feedback', [auth, role(['beneficiary'])], async (req, res) => {
    try {
        const { foodBatchId, rating, foodQuality, deliveryTime, volunteerBehavior, comments } = req.body;

        const foodBatch = await FoodBatch.findById(foodBatchId);
        if (!foodBatch) return res.status(404).json({ msg: 'Food batch not found' });

        const feedback = new Feedback({
            foodBatch: foodBatchId,
            beneficiary: req.user.id,
            volunteer: foodBatch.assignedVolunteer,
            donor: foodBatch.donor,
            rating,
            foodQuality,
            deliveryTime,
            volunteerBehavior,
            comments,
            type: 'delivery'
        });

        await feedback.save();
        res.json({ msg: 'Feedback submitted successfully', feedback });
    } catch (err) {
        console.error('Feedback error:', err);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/beneficiary/history
// @desc    Get my history
router.get('/history', [auth, role(['beneficiary'])], async (req, res) => {
    try {
        const beneficiary = await Beneficiary.findOne({ user: req.user.id })
            .populate({
                path: 'requests.foodBatch',
                select: 'foodType quantity status createdAt'
            });

        if (!beneficiary) return res.status(404).json({ msg: 'Beneficiary not found' });
        res.json(beneficiary.requests);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;

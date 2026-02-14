const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const FoodBatch = require('../models/FoodBatch');
const Assignment = require('../models/Assignment');
const { assignVolunteer } = require('../services/assignmentService');
const { createDistributionRecord, updateVolunteerReliability } = require('../services/impactService');

// @route   POST api/food
// @desc    Register new food batch
// @access  Donor
router.post('/', [auth, role(['donor'])], async (req, res) => {
    try {
        const { foodType, quantity, category, preparationTime, pickupWindow, expiryTime, coordinates, address } = req.body;

        const newBatch = new FoodBatch({
            donor: req.user.id,
            foodType,
            quantity,
            category,
            preparationTime,
            pickupWindow,
            expiryTime,
            location: {
                type: 'Point',
                coordinates: coordinates || [0, 0]
            },
            address,
            status: 'pending'
        });

        const foodBatch = await newBatch.save();

        // Trigger Auto-Assignment
        assignVolunteer(foodBatch._id, req.io);

        res.json(foodBatch);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/food/donor
// @desc    Get donor's history
router.get('/donor', [auth, role(['donor'])], async (req, res) => {
    try {
        const batches = await FoodBatch.find({ donor: req.user.id }).sort({ createdAt: -1 });
        res.json(batches);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET api/food/volunteer/active
// @desc    Get active tasks for volunteer
router.get('/volunteer/active', [auth, role(['volunteer'])], async (req, res) => {
    try {
        const tasks = await FoodBatch.find({
            assignedVolunteer: req.user.id,
            status: { $in: ['assigned', 'picked_up', 'in_transit'] }
        }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/food/:id/status
// @desc    Update delivery status
router.put('/:id/status', [auth, role(['volunteer', 'admin'])], async (req, res) => {
    try {
        const { status, coordinates } = req.body;
        const foodBatch = await FoodBatch.findById(req.params.id);
        if (!foodBatch) return res.status(404).json({ msg: 'Batch not found' });

        foodBatch.status = status;
        await foodBatch.save();

        // Update assignment logs
        const assignment = await Assignment.findOne({ foodBatch: foodBatch._id, status: { $ne: 'reassigned' } });
        if (assignment) {
            assignment.status = status;
            assignment.lastMovementAt = new Date();
            assignment.logs.push({
                status,
                timestamp: new Date(),
                location: { type: 'Point', coordinates: coordinates || foodBatch.location.coordinates }
            });

            if (status === 'delivered') {
                assignment.completedAt = new Date();
                await assignment.save();

                // Create distribution record and update all metrics
                await createDistributionRecord(foodBatch, assignment);
            } else if (status === 'cancelled') {
                await assignment.save();
                // Update volunteer reliability for cancellation
                await updateVolunteerReliability(assignment.volunteer, 'cancelled');
            } else {
                await assignment.save();
            }
        }

        res.json(foodBatch);
    } catch (err) {
        console.error('Error updating status:', err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

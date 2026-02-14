const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const VolunteerStats = require('../models/VolunteerStats');
const Assignment = require('../models/Assignment');
const FoodBatch = require('../models/FoodBatch');

// @route   GET api/volunteer/stats
// @desc    Get volunteer reliability stats
router.get('/stats', [auth, role(['volunteer'])], async (req, res) => {
    try {
        let stats = await VolunteerStats.findOne({ volunteer: req.user.id });
        if (!stats) {
            stats = new VolunteerStats({ volunteer: req.user.id });
            await stats.save();
        }
        res.json(stats);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/volunteer/accept/:assignmentId
// @desc    Accept task
router.put('/accept/:assignmentId', [auth, role(['volunteer'])], async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.assignmentId);
        if (!assignment) return res.status(404).json({ msg: 'Assignment not found' });

        if (assignment.volunteer.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        assignment.status = 'assigned';
        assignment.lastMovementAt = new Date();
        await assignment.save();

        res.json({ msg: 'Task accepted', assignment });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/volunteer/reject/:assignmentId
// @desc    Reject task
router.put('/reject/:assignmentId', [auth, role(['volunteer'])], async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.assignmentId);
        if (!assignment) return res.status(404).json({ msg: 'Assignment not found' });

        if (assignment.volunteer.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        assignment.status = 'cancelled';
        await assignment.save();

        // Reset food batch to pending for reassignment
        const foodBatch = await FoodBatch.findById(assignment.foodBatch);
        if (foodBatch) {
            foodBatch.status = 'pending';
            foodBatch.assignedVolunteer = null;
            await foodBatch.save();

            // Trigger reassignment
            const { assignVolunteer } = require('../services/assignmentService');
            assignVolunteer(foodBatch._id, req.io);
        }

        res.json({ msg: 'Task rejected, reassigning...' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET api/volunteer/history
// @desc    Get delivery history
router.get('/history', [auth, role(['volunteer'])], async (req, res) => {
    try {
        const assignments = await Assignment.find({
            volunteer: req.user.id,
            status: { $in: ['delivered', 'reassigned', 'cancelled'] }
        })
            .populate('foodBatch')
            .sort({ assignedAt: -1 })
            .limit(20);

        res.json(assignments);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST api/volunteer/location/update
// @desc    Update live location (for GPS tracking)
router.post('/location/update', [auth, role(['volunteer'])], async (req, res) => {
    try {
        const { coordinates } = req.body;

        const User = require('../models/User');
        await User.findByIdAndUpdate(req.user.id, {
            location: {
                type: 'Point',
                coordinates: coordinates || [0, 0]
            }
        });

        // Also update in active assignment logs
        const activeAssignment = await Assignment.findOne({
            volunteer: req.user.id,
            status: { $in: ['assigned', 'picked_up', 'in_transit'] }
        });

        if (activeAssignment) {
            activeAssignment.lastMovementAt = new Date();
            activeAssignment.logs.push({
                status: activeAssignment.status,
                timestamp: new Date(),
                location: { type: 'Point', coordinates }
            });
            await activeAssignment.save();
        }

        res.json({ msg: 'Location updated' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET api/volunteer/available
// @desc    Get available unassigned food batches nearby
router.get('/available', [auth, role(['volunteer'])], async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user.id);

        const available = await FoodBatch.find({
            status: 'pending',
            location: {
                $near: {
                    $geometry: user.location,
                    $maxDistance: 10000 // 10km radius
                }
            }
        }).populate('donor', 'name');
        res.json(available);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST api/volunteer/claim/:id
// @desc    Manually claim an unassigned food batch
router.post('/claim/:id', [auth, role(['volunteer'])], async (req, res) => {
    try {
        const foodBatch = await FoodBatch.findById(req.params.id);
        if (!foodBatch) return res.status(404).json({ msg: 'Batch not found' });
        if (foodBatch.status !== 'pending') return res.status(400).json({ msg: 'Batch already assigned/claimed' });

        foodBatch.status = 'assigned';
        foodBatch.assignedVolunteer = req.user.id;
        await foodBatch.save();

        const assignment = new Assignment({
            foodBatch: foodBatch._id,
            volunteer: req.user.id,
            status: 'assigned'
        });
        await assignment.save();

        res.json({ msg: 'Batch claimed successfully', foodBatch });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;

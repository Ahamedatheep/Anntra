const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const NGO = require('../models/NGO');
const Donor = require('../models/Donor');
const Beneficiary = require('../models/Beneficiary');
const FoodBatch = require('../models/FoodBatch');
const VolunteerStats = require('../models/VolunteerStats');
const User = require('../models/User');

// @route   POST api/ngo/register
// @desc    Create NGO profile
router.post('/register', [auth, role(['ngo'])], async (req, res) => {
    try {
        const { organizationName, registrationNumber, operatingRadius, coordinates, address, emergencyContactNumber } = req.body;

        let ngo = await NGO.findOne({ user: req.user.id });
        if (ngo) return res.status(400).json({ msg: 'NGO profile already exists' });

        ngo = new NGO({
            user: req.user.id,
            organizationName,
            registrationNumber,
            operatingRadius: operatingRadius || 5000,
            location: {
                type: 'Point',
                coordinates: coordinates || [0, 0]
            },
            address,
            emergencyContactNumber,
            status: 'pending' // Admin needs to approve
        });

        await ngo.save();
        res.json(ngo);
    } catch (err) {
        console.error('NGO Registration Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// @route   GET api/ngo/profile
// @desc    Get NGO profile
router.get('/profile', [auth, role(['ngo'])], async (req, res) => {
    try {
        const ngo = await NGO.findOne({ user: req.user.id }).populate('user', 'name email');
        if (!ngo) return res.status(404).json({ msg: 'NGO profile not found' });
        res.json(ngo);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET api/ngo/pending/all
// @desc    Get all pending donors and volunteers in the area
router.get('/pending/all', [auth, role(['ngo'])], async (req, res) => {
    try {
        const ngo = await NGO.findOne({ user: req.user.id });
        if (!ngo) return res.status(404).json({ msg: 'NGO profile not found' });

        // Find users with role donor/volunteer who are NOT yet in this NGO's approved lists
        // and are near the NGO
        const pendingDonors = await User.find({
            role: 'donor',
            _id: { $nin: ngo.approvedDonors },
            location: {
                $near: {
                    $geometry: ngo.location,
                    $maxDistance: ngo.operatingRadius
                }
            }
        }).select('-password');

        const pendingVolunteers = await User.find({
            role: 'volunteer',
            _id: { $nin: ngo.approvedVolunteers },
            location: {
                $near: {
                    $geometry: ngo.location,
                    $maxDistance: ngo.operatingRadius
                }
            }
        }).select('-password');

        res.json({ donors: pendingDonors, volunteers: pendingVolunteers });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/ngo/approve/donor/:donorId
// @desc    Approve a donor
router.post('/approve/donor/:donorId', [auth, role(['ngo'])], async (req, res) => {
    try {
        const ngo = await NGO.findOne({ user: req.user.id });
        if (!ngo) return res.status(404).json({ msg: 'NGO not found' });

        let donor = await Donor.findOne({ user: req.params.donorId });
        if (!donor) {
            donor = new Donor({ user: req.params.donorId, ngo: ngo._id, approvalStatus: 'approved' });
        } else {
            donor.approvalStatus = 'approved';
            donor.ngo = ngo._id;
        }
        await donor.save();

        if (!ngo.approvedDonors.includes(req.params.donorId)) {
            ngo.approvedDonors.push(req.params.donorId);
            await ngo.save();
        }

        res.json({ msg: 'Donor approved successfully', donor });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST api/ngo/approve/volunteer/:volunteerId
// @desc    Approve a volunteer
router.post('/approve/volunteer/:volunteerId', [auth, role(['ngo'])], async (req, res) => {
    try {
        const ngo = await NGO.findOne({ user: req.user.id });
        if (!ngo) return res.status(404).json({ msg: 'NGO not found' });

        // Create volunteer stats if not exists
        let volunteerStats = await VolunteerStats.findOne({ volunteer: req.params.volunteerId });
        if (!volunteerStats) {
            volunteerStats = new VolunteerStats({ volunteer: req.params.volunteerId });
            await volunteerStats.save();
        }

        if (!ngo.approvedVolunteers.includes(req.params.volunteerId)) {
            ngo.approvedVolunteers.push(req.params.volunteerId);
            await ngo.save();
        }

        // Activate volunteer user
        await User.findByIdAndUpdate(req.params.volunteerId, { status: 'active' });

        res.json({ msg: 'Volunteer approved successfully' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET api/ngo/deliveries/local
// @desc    Monitor local deliveries within operating radius
router.get('/deliveries/local', [auth, role(['ngo'])], async (req, res) => {
    try {
        const ngo = await NGO.findOne({ user: req.user.id });
        if (!ngo) return res.status(404).json({ msg: 'NGO not found' });

        const deliveries = await FoodBatch.find({
            location: {
                $near: {
                    $geometry: ngo.location,
                    $maxDistance: ngo.operatingRadius
                }
            },
            status: { $in: ['assigned', 'picked_up', 'in_transit', 'delivered'] }
        })
            .populate('donor', 'name')
            .populate('assignedVolunteer', 'name')
            .sort({ createdAt: -1 })
            .limit(20);

        res.json(deliveries);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST api/ngo/beneficiary/add
// @desc    Add beneficiary to NGO management
router.post('/beneficiary/add', [auth, role(['ngo'])], async (req, res) => {
    try {
        const { userId, familySize, preferredCategory, coordinates, address } = req.body;

        const ngo = await NGO.findOne({ user: req.user.id });
        if (!ngo) return res.status(404).json({ msg: 'NGO not found' });

        let beneficiary = await Beneficiary.findOne({ user: userId });
        if (!beneficiary) {
            beneficiary = new Beneficiary({
                user: userId,
                ngo: ngo._id,
                familySize,
                preferredCategory,
                location: {
                    type: 'Point',
                    coordinates: coordinates || [0, 0]
                },
                address,
                status: 'active'
            });
        } else {
            beneficiary.ngo = ngo._id;
            beneficiary.status = 'active';
        }

        await beneficiary.save();

        if (!ngo.managedBeneficiaries.includes(beneficiary._id)) {
            ngo.managedBeneficiaries.push(beneficiary._id);
            await ngo.save();
        }

        res.json({ msg: 'Beneficiary added successfully', beneficiary });
    } catch (err) {
        console.error('Error adding beneficiary:', err);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/ngo/emergency/broadcast
// @desc    Activate emergency backup pickup (3km radius)
router.post('/emergency/broadcast', [auth, role(['ngo'])], async (req, res) => {
    try {
        const { foodBatchId, radius = 3000 } = req.body;

        const ngo = await NGO.findOne({ user: req.user.id });
        if (!ngo) return res.status(404).json({ msg: 'NGO not found' });

        const foodBatch = await FoodBatch.findById(foodBatchId);
        if (!foodBatch) return res.status(404).json({ msg: 'Food batch not found' });

        // Find volunteers within radius
        const volunteers = await User.find({
            role: 'volunteer',
            status: 'active',
            location: {
                $near: {
                    $geometry: foodBatch.location,
                    $maxDistance: radius
                }
            }
        });

        // Broadcast via Socket.IO
        volunteers.forEach(volunteer => {
            req.io.to(`user_${volunteer._id}`).emit('emergency_broadcast', {
                type: 'EMERGENCY_PICKUP',
                foodBatchId: foodBatch._id,
                address: foodBatch.address,
                urgency: 'critical',
                expiryTime: foodBatch.expiryTime
            });
        });

        res.json({ msg: `Emergency broadcast sent to ${volunteers.length} volunteers` });
    } catch (err) {
        console.error('Emergency broadcast error:', err);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/ngo/volunteers
// @desc    Get all volunteers approved by this NGO
router.get('/volunteers', [auth, role(['ngo'])], async (req, res) => {
    try {
        const ngo = await NGO.findOne({ user: req.user.id });
        if (!ngo) return res.status(404).json({ msg: 'NGO not found' });

        const volunteers = await User.find({ _id: { $in: ngo.approvedVolunteers } }).select('-password');

        // Fetch stats for each volunteer
        const volunteersWithStats = await Promise.all(volunteers.map(async (v) => {
            const stats = await VolunteerStats.findOne({ volunteer: v._id });
            return {
                ...v.toObject(),
                stats: stats || { completedDeliveries: 0, reliabilityScore: 100, tier: 3 }
            };
        }));

        res.json(volunteersWithStats);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET api/ngo/beneficiaries
// @desc    Get all beneficiaries managed by this NGO
router.get('/beneficiaries', [auth, role(['ngo'])], async (req, res) => {
    try {
        const ngo = await NGO.findOne({ user: req.user.id });
        if (!ngo) return res.status(404).json({ msg: 'NGO not found' });

        const beneficiaries = await Beneficiary.find({ ngo: ngo._id }).populate('user', 'name email phone');
        res.json(beneficiaries);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;

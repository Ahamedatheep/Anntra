const FoodBatch = require('../models/FoodBatch');
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const VolunteerStats = require('../models/VolunteerStats');
const { updateVolunteerReliability } = require('./impactService');

const assignVolunteer = async (foodBatchId, io) => {
    try {
        const foodBatch = await FoodBatch.findById(foodBatchId);
        if (!foodBatch || foodBatch.status !== 'pending') return;

        // 1. Calculate Urgency
        const now = new Date();
        const timeUntilExpiry = (foodBatch.expiryTime - now) / (1000 * 60 * 60); // in hours

        let targetTier = [1, 2, 3];
        let maxDistance = 5000; // 5km default

        if (timeUntilExpiry < 2) {
            foodBatch.urgencyLevel = 'critical';
            targetTier = [1]; // Tier-1 only for critical
            maxDistance = 3000; // 3km radius for speed
        } else if (timeUntilExpiry < 5) {
            foodBatch.urgencyLevel = 'urgent';
            targetTier = [1, 2];
        } else {
            foodBatch.urgencyLevel = 'normal';
        }

        await foodBatch.save();

        // 2. Find eligible volunteers
        // We need to filter by role='volunteer' and their reliability tier
        const eligibleVolunteers = await VolunteerStats.find({
            tier: { $in: targetTier }
        }).populate('volunteer');

        const volunteerIds = eligibleVolunteers.map(v => v.volunteer._id);

        // 3. Find nearest among eligible
        const nearbyVolunteers = await User.find({
            _id: { $in: volunteerIds },
            role: 'volunteer',
            status: 'active',
            location: {
                $near: {
                    $geometry: foodBatch.location,
                    $maxDistance: maxDistance
                }
            }
        }).limit(5);

        if (nearbyVolunteers.length > 0) {
            const selectedVolunteer = nearbyVolunteers[0];

            // Create Assignment
            const assignment = new Assignment({
                foodBatch: foodBatch._id,
                volunteer: selectedVolunteer._id,
                status: 'assigned'
            });
            await assignment.save();

            // Update FoodBatch
            foodBatch.status = 'assigned';
            foodBatch.assignedVolunteer = selectedVolunteer._id;
            await foodBatch.save();

            // Update volunteer assigned count
            await updateVolunteerReliability(selectedVolunteer._id, 'assigned');

            // Notify via Socket
            io.to(`user_${selectedVolunteer._id}`).emit('new_task', {
                type: 'PICKUP',
                foodBatchId: foodBatch._id,
                address: foodBatch.address
            });

            console.log(`Assigned FoodBatch ${foodBatch._id} to Volunteer ${selectedVolunteer._id}`);
        } else {
            // Fallback: If no tier-1 found for critical, expand to tier-2 after 5 mins (in a real system, use a job scheduler)
            console.log(`No eligible volunteers found for FoodBatch ${foodBatch._id}`);
        }

    } catch (err) {
        console.error('Error in assignVolunteer:', err);
    }
};

const checkInactivity = async (io) => {
    try {
        const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);

        // Find active assignments with no movement for 10 mins
        const inactiveAssignments = await Assignment.find({
            status: { $in: ['assigned', 'picked_up', 'in_transit'] },
            lastMovementAt: { $lt: tenMinsAgo }
        });

        for (const assignment of inactiveAssignments) {
            console.log(`Auto-reassigning assignment ${assignment._id} due to inactivity`);

            assignment.status = 'reassigned';
            await assignment.save();

            const foodBatch = await FoodBatch.findById(assignment.foodBatch);
            foodBatch.status = 'pending';
            foodBatch.assignedVolunteer = null;
            await foodBatch.save();

            // Trigger fresh assignment
            await assignVolunteer(foodBatch._id, io);
        }
    } catch (err) {
        console.error('Error checking inactivity:', err);
    }
};

module.exports = { assignVolunteer, checkInactivity };

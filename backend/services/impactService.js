const ImpactMetrics = require('../models/ImpactMetrics');
const DistributionRecord = require('../models/DistributionRecord');
const VolunteerStats = require('../models/VolunteerStats');
const Donor = require('../models/Donor');

/**
 * Calculate environmental impact from food rescue
 * Based on EPA data: 1kg food waste = 2.5kg CO2, 0.025kg methane
 */
const calculateEnvironmentalImpact = (mealsServed) => {
    const avgMealWeight = 0.4; // kg per meal
    const totalWeight = mealsServed * avgMealWeight;
    const co2Saved = totalWeight * 2.5; // kg CO2
    const methaneSaved = totalWeight * 0.025; // kg methane
    return { co2Saved, methaneSaved, totalWeight };
};

/**
 * Update impact metrics after successful delivery
 */
const updateImpactMetrics = async (distributionRecord) => {
    try {
        let metrics = await ImpactMetrics.findOne();
        if (!metrics) {
            metrics = new ImpactMetrics();
        }

        const { co2Saved, methaneSaved } = calculateEnvironmentalImpact(distributionRecord.mealsServed);

        metrics.totalMealsSaved += distributionRecord.mealsServed;
        metrics.totalCO2Reduced += co2Saved;
        metrics.updatedAt = new Date();

        await metrics.save();
        console.log(`Impact updated: +${distributionRecord.mealsServed} meals, +${co2Saved.toFixed(2)} kg CO2`);

        return metrics;
    } catch (err) {
        console.error('Error updating impact metrics:', err);
        throw err;
    }
};

/**
 * Update volunteer reliability score and tier
 */
const updateVolunteerReliability = async (volunteerId, action) => {
    try {
        let stats = await VolunteerStats.findOne({ volunteer: volunteerId });
        if (!stats) {
            stats = new VolunteerStats({ volunteer: volunteerId });
        }

        if (action === 'assigned') {
            stats.assignedDeliveries += 1;
        } else if (action === 'completed') {
            stats.completedDeliveries += 1;
            stats.lastActiveAt = new Date();
        } else if (action === 'cancelled') {
            // Cancelled deliveries reduce reliability
            // The assigned count already increased, so just update activity
            stats.lastActiveAt = new Date();
        }

        // Calculate reliability score
        if (stats.assignedDeliveries > 0) {
            stats.reliabilityScore = (stats.completedDeliveries / stats.assignedDeliveries) * 100;
        }

        // Assign tier based on reliability
        if (stats.reliabilityScore >= 95) {
            stats.tier = 1;
        } else if (stats.reliabilityScore >= 80) {
            stats.tier = 2;
        } else {
            stats.tier = 3;
        }

        await stats.save();
        console.log(`Volunteer ${volunteerId} reliability updated: ${stats.reliabilityScore.toFixed(1)}% (Tier ${stats.tier})`);

        return stats;
    } catch (err) {
        console.error('Error updating volunteer reliability:', err);
        throw err;
    }
};

/**
 * Update donor trust score based on donation quality
 */
const updateDonorTrustScore = async (donorUserId, successful = true) => {
    try {
        let donor = await Donor.findOne({ user: donorUserId });
        if (!donor) {
            donor = new Donor({ user: donorUserId });
        }

        donor.totalDonations += 1;

        if (successful) {
            donor.successfulDeliveries += 1;
            // Increase trust slightly for successful deliveries
            donor.trustScore = Math.min(100, donor.trustScore + 0.5);
        } else {
            // Decrease trust for failed/expired donations
            donor.trustScore = Math.max(0, donor.trustScore - 2);
        }

        // Award badges
        if (donor.totalDonations === 10 && !donor.badges.some(b => b.name === 'First Steps')) {
            donor.badges.push({ name: 'First Steps', icon: '🌱' });
        }
        if (donor.totalDonations === 50 && !donor.badges.some(b => b.name === 'Committed Giver')) {
            donor.badges.push({ name: 'Committed Giver', icon: '⭐' });
        }
        if (donor.totalDonations === 100 && !donor.badges.some(b => b.name === 'Food Hero')) {
            donor.badges.push({ name: 'Food Hero', icon: '🏆' });
        }

        donor.updatedAt = new Date();
        await donor.save();

        return donor;
    } catch (err) {
        console.error('Error updating donor trust score:', err);
        throw err;
    }
};

/**
 * Create distribution record when delivery is completed
 */
const createDistributionRecord = async (foodBatch, assignment) => {
    try {
        const mealsServed = parseInt(foodBatch.quantity) || 10; // Extract number from "50 meals"
        const { co2Saved, methaneSaved } = calculateEnvironmentalImpact(mealsServed);

        // Calculate distance (simplified - in real app would use actual route)
        const distance = 2000; // Mock 2km

        const record = new DistributionRecord({
            foodBatch: foodBatch._id,
            donor: foodBatch.donor,
            volunteer: assignment.volunteer,
            beneficiary: foodBatch.beneficiary,
            pickupTime: assignment.logs.find(l => l.status === 'picked_up')?.timestamp,
            deliveryTime: assignment.completedAt,
            distance,
            mealsServed,
            co2Saved,
            methaneSaved,
            photoProof: foodBatch.photoProof,
            route: {
                pickup: foodBatch.location,
                dropoff: assignment.logs[assignment.logs.length - 1]?.location || foodBatch.location
            },
            status: 'completed'
        });

        await record.save();

        // Update impact metrics
        await updateImpactMetrics(record);

        // Update volunteer stats
        await updateVolunteerReliability(assignment.volunteer, 'completed');

        // Update donor trust
        await updateDonorTrustScore(foodBatch.donor, true);

        console.log(`Distribution record created for FoodBatch ${foodBatch._id}`);
        return record;
    } catch (err) {
        console.error('Error creating distribution record:', err);
        throw err;
    }
};

module.exports = {
    calculateEnvironmentalImpact,
    updateImpactMetrics,
    updateVolunteerReliability,
    updateDonorTrustScore,
    createDistributionRecord
};

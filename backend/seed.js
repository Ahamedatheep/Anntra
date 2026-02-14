const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const FoodBatch = require('./models/FoodBatch');
const VolunteerStats = require('./models/VolunteerStats');
const ImpactMetrics = require('./models/ImpactMetrics');
const Donor = require('./models/Donor');
const NGO = require('./models/NGO');
const Beneficiary = require('./models/Beneficiary');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for Seeding');

        // Clear existing data
        await User.deleteMany({});
        await FoodBatch.deleteMany({});
        await VolunteerStats.deleteMany({});
        await ImpactMetrics.deleteMany({});
        await Donor.deleteMany({});
        await NGO.deleteMany({});
        await Beneficiary.deleteMany({});

        console.log('Database cleared');

        const DEFAULT_PASSWORD = 'rescue123';

        // 1. Create Admin
        await User.create({
            name: 'Main Admin',
            email: 'admin@anntra.com',
            password: DEFAULT_PASSWORD,
            role: 'admin',
            phone: '1234567890',
            address: 'Admin Headquarters',
            location: { type: 'Point', coordinates: [80.2707, 13.0827] },
            status: 'active'
        });
        console.log('✓ Admin created');

        // 2. Create NGO
        const ngoUser = await User.create({
            name: 'Helping Hands Trust',
            email: 'ngo@hope.org',
            password: DEFAULT_PASSWORD,
            role: 'ngo',
            phone: '9876543210',
            address: 'NGO Hub, Central Chennai',
            location: { type: 'Point', coordinates: [80.2710, 13.0830] },
            status: 'active'
        });

        const ngo = await NGO.create({
            user: ngoUser._id,
            organizationName: 'Helping Hands Trust',
            registrationNumber: 'NGO-2026-001',
            operatingRadius: 15000,
            location: { type: 'Point', coordinates: [80.2710, 13.0830] },
            address: 'NGO Hub, Central Chennai',
            status: 'active'
        });
        console.log('✓ NGO created');

        // 3. Create 3 Donors
        const donorData = [
            { name: 'Grand Plaza Hotel', email: 'donor1@hotel.com', type: 'hotel' },
            { name: 'Elite Catering Services', email: 'donor2@caterers.com', type: 'catering' },
            { name: 'Royal Wedding Mahal', email: 'donor3@mahal.com', type: 'event' }
        ];

        for (let i = 0; i < donorData.length; i++) {
            const user = await User.create({
                name: donorData[i].name,
                email: donorData[i].email,
                password: DEFAULT_PASSWORD,
                role: 'donor',
                phone: `999000111${i}`,
                address: `${donorData[i].name} Premises`,
                location: { type: 'Point', coordinates: [80.2720 + (i * 0.002), 13.0850 + (i * 0.002)] },
                status: 'active'
            });

            await Donor.create({
                user: user._id,
                organizationType: donorData[i].type,
                approvalStatus: 'approved',
                ngo: ngo._id,
                totalDonations: 0,
                successfulDeliveries: 0,
                trustScore: 0
            });

            // Add to NGO's approved donors
            ngo.approvedDonors.push(user._id);
        }
        await ngo.save();
        console.log('✓ 3 Donors created (Zero Metrics)');

        // 4. Create 1 Volunteer
        const volUser = await User.create({
            name: 'Arjun Volunteer',
            email: 'volunteer1@email.com',
            password: DEFAULT_PASSWORD,
            role: 'volunteer',
            phone: '7778889990',
            address: 'Volunteer Base Alpha',
            location: { type: 'Point', coordinates: [80.2690, 13.0810] },
            status: 'active'
        });

        await VolunteerStats.create({
            volunteer: volUser._id,
            reliabilityScore: 0,
            completedDeliveries: 0,
            assignedDeliveries: 0,
            tier: 3 // Default starting tier
        });

        ngo.approvedVolunteers.push(volUser._id);
        await ngo.save();
        console.log('✓ 1 Volunteer created');

        // 5. Create 1 Beneficiary
        const benUser = await User.create({
            name: 'Sunnyside Orphanage',
            email: 'beneficiary1@trust.org',
            password: DEFAULT_PASSWORD,
            role: 'beneficiary',
            phone: '6665554440',
            address: 'Sunnyside Building, West Chennai',
            location: { type: 'Point', coordinates: [80.2600, 13.0750] },
            status: 'active'
        });

        const beneficiary = await Beneficiary.create({
            user: benUser._id,
            ngo: ngoUser._id,
            familySize: 40,
            location: { type: 'Point', coordinates: [80.2600, 13.0750] },
            address: 'Sunnyside Building, West Chennai',
            status: 'active'
        });

        ngo.managedBeneficiaries.push(beneficiary._id);
        await ngo.save();
        console.log('✓ 1 Beneficiary created');

        // Initial Metrics
        await ImpactMetrics.create({
            totalMealsSaved: 0,
            donorsCount: 3,
            volunteersCount: 1,
            ngosCount: 1,
            beneficiariesCount: 1
        });

        console.log('\n🎉 Clean Production Environment Ready!');
        console.log('Passwords provided in chat only.');

        process.exit(0);
    } catch (err) {
        console.error('Seeding Error:', err);
        process.exit(1);
    }
};

seedData();

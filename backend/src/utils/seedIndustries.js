import mongoose from 'mongoose';
import connectDB from '../config/database.js';
import { IndustryConfig, User } from '../models/index.js';
import { industries as hospitalityHealthcare } from '../../data/industry-configs/hospitality-healthcare.js';
import { industries as education } from '../../data/industry-configs/education.js';
import { industries as events } from '../../data/industry-configs/events.js';
import { industries as automotiveWellness } from '../../data/industry-configs/automotive-wellness.js';
import { industries as retailCorporate } from '../../data/industry-configs/retail-corporate.js';

const allIndustries = [
    ...hospitalityHealthcare,
    ...education,
    ...events,
    ...automotiveWellness,
    ...retailCorporate
];

const seedDatabase = async () => {
    try {
        await connectDB();
        console.log('🌱 Starting database seed...\n');

        // Clear existing data
        await IndustryConfig.deleteMany({});
        console.log('✅ Cleared existing industry configs');

        // Seed industries
        await IndustryConfig.insertMany(allIndustries);
        console.log(`✅ Seeded ${allIndustries.length} industries`);

        // Create default admin user if not exists
        const existingAdmin = await User.findOne({ email: 'admin@b2bsurvey.com' });
        if (!existingAdmin) {
            await User.create({
                email: 'admin@b2bsurvey.com',
                passwordHash: 'admin123',
                name: 'Admin User',
                role: 'admin'
            });
            console.log('✅ Created default admin user (admin@b2bsurvey.com / admin123)');
        }

        console.log('\n🎉 Database seeding completed successfully!');
        console.log(`\nIndustries seeded:`);
        allIndustries.forEach(ind => console.log(`  - ${ind.icon} ${ind.displayName}`));

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedDatabase();

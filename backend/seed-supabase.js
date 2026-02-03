// Supabase seed script for industries and initial data
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// All industries with questions
const industries = [
    {
        industry_key: 'hotel_with_rooms',
        display_name: 'Hotel (With Rooms)',
        icon: '🏨',
        description: 'Hotels, resorts, and lodging with guest rooms',
        is_active: true,
        sub_categories: [
            { key: 'luxury', display_name: 'Luxury Hotel' },
            { key: 'budget', display_name: 'Budget Hotel' },
            { key: 'boutique', display_name: 'Boutique Hotel' },
            { key: 'resort', display_name: 'Resort' }
        ],
        questions: [
            { question_key: 'room_count', question_text: 'Number of Rooms', question_type: 'number', is_required: true },
            { question_key: 'avg_occupancy', question_text: 'Average Occupancy (%)', question_type: 'number', is_required: false },
            { question_key: 'has_restaurant', question_text: 'Has In-house Restaurant?', question_type: 'boolean', is_required: false },
            { question_key: 'staff_count', question_text: 'Total Staff Count', question_type: 'number', is_required: false }
        ]
    },
    {
        industry_key: 'restaurant',
        display_name: 'Restaurant',
        icon: '🍽️',
        description: 'Restaurants and dining establishments',
        is_active: true,
        sub_categories: [
            { key: 'fine_dining', display_name: 'Fine Dining' },
            { key: 'casual', display_name: 'Casual Dining' },
            { key: 'fast_food', display_name: 'Fast Food' },
            { key: 'cafe', display_name: 'Cafe/Coffee Shop' }
        ],
        questions: [
            { question_key: 'seating_capacity', question_text: 'Seating Capacity', question_type: 'number', is_required: true },
            { question_key: 'avg_daily_customers', question_text: 'Average Daily Customers', question_type: 'number', is_required: false },
            { question_key: 'cuisine_types', question_text: 'Cuisine Types', question_type: 'multi_select', is_required: false, options: ['Indian', 'Chinese', 'Continental', 'Italian', 'Multi-cuisine'] },
            { question_key: 'staff_count', question_text: 'Kitchen + Service Staff', question_type: 'number', is_required: false }
        ]
    },
    {
        industry_key: 'hospital',
        display_name: 'Hospital',
        icon: '🏥',
        description: 'Hospitals and large medical facilities',
        is_active: true,
        sub_categories: [
            { key: 'multispecialty', display_name: 'Multi-specialty' },
            { key: 'single_specialty', display_name: 'Single Specialty' },
            { key: 'government', display_name: 'Government Hospital' },
            { key: 'private', display_name: 'Private Hospital' }
        ],
        questions: [
            { question_key: 'bed_count', question_text: 'Number of Beds', question_type: 'number', is_required: true },
            { question_key: 'icu_beds', question_text: 'ICU Beds', question_type: 'number', is_required: false },
            { question_key: 'daily_patients', question_text: 'Daily OPD Patients (avg)', question_type: 'number', is_required: false },
            { question_key: 'staff_count', question_text: 'Total Staff Count', question_type: 'number', is_required: false }
        ]
    },
    {
        industry_key: 'clinic',
        display_name: 'Clinic',
        icon: '🩺',
        description: 'Clinics and nursing homes',
        is_active: true,
        sub_categories: [
            { key: 'general', display_name: 'General Clinic' },
            { key: 'dental', display_name: 'Dental Clinic' },
            { key: 'eye', display_name: 'Eye Clinic' },
            { key: 'skin', display_name: 'Dermatology' }
        ],
        questions: [
            { question_key: 'daily_patients', question_text: 'Daily Patients', question_type: 'number', is_required: true },
            { question_key: 'doctor_count', question_text: 'Number of Doctors', question_type: 'number', is_required: false },
            { question_key: 'has_beds', question_text: 'Has Inpatient Beds?', question_type: 'boolean', is_required: false }
        ]
    },
    {
        industry_key: 'school',
        display_name: 'School',
        icon: '🏫',
        description: 'Schools from primary to higher secondary',
        is_active: true,
        sub_categories: [
            { key: 'primary', display_name: 'Primary School' },
            { key: 'secondary', display_name: 'Secondary School' },
            { key: 'higher_secondary', display_name: 'Higher Secondary' },
            { key: 'international', display_name: 'International School' }
        ],
        questions: [
            { question_key: 'student_count', question_text: 'Total Students', question_type: 'number', is_required: true },
            { question_key: 'staff_count', question_text: 'Teaching Staff', question_type: 'number', is_required: false },
            { question_key: 'has_hostel', question_text: 'Has Hostel Facility?', question_type: 'boolean', is_required: false },
            { question_key: 'has_canteen', question_text: 'Has Canteen?', question_type: 'boolean', is_required: false }
        ]
    },
    {
        industry_key: 'college',
        display_name: 'College/University',
        icon: '🎓',
        description: 'Colleges, universities, and higher education',
        is_active: true,
        sub_categories: [
            { key: 'engineering', display_name: 'Engineering College' },
            { key: 'medical', display_name: 'Medical College' },
            { key: 'arts_science', display_name: 'Arts & Science' },
            { key: 'university', display_name: 'University' }
        ],
        questions: [
            { question_key: 'student_count', question_text: 'Total Students', question_type: 'number', is_required: true },
            { question_key: 'department_count', question_text: 'Number of Departments', question_type: 'number', is_required: false },
            { question_key: 'has_hostel', question_text: 'Has Hostel?', question_type: 'boolean', is_required: false }
        ]
    },
    {
        industry_key: 'gym',
        display_name: 'Gym/Fitness Center',
        icon: '🏋️',
        description: 'Gyms and fitness centers',
        is_active: true,
        sub_categories: [
            { key: 'standard', display_name: 'Standard Gym' },
            { key: 'premium', display_name: 'Premium Fitness Center' },
            { key: 'crossfit', display_name: 'CrossFit Box' }
        ],
        questions: [
            { question_key: 'member_count', question_text: 'Active Members', question_type: 'number', is_required: true },
            { question_key: 'area_sqft', question_text: 'Area (sqft)', question_type: 'number', is_required: false },
            { question_key: 'has_spa', question_text: 'Has Spa/Sauna?', question_type: 'boolean', is_required: false }
        ]
    },
    {
        industry_key: 'salon',
        display_name: 'Salon/Spa',
        icon: '💇',
        description: 'Beauty salons and spas',
        is_active: true,
        sub_categories: [
            { key: 'unisex', display_name: 'Unisex Salon' },
            { key: 'mens', display_name: "Men's Salon" },
            { key: 'womens', display_name: "Women's Salon" },
            { key: 'spa', display_name: 'Spa & Wellness' }
        ],
        questions: [
            { question_key: 'chair_count', question_text: 'Number of Chairs/Stations', question_type: 'number', is_required: true },
            { question_key: 'daily_customers', question_text: 'Daily Customers', question_type: 'number', is_required: false },
            { question_key: 'services', question_text: 'Services Offered', question_type: 'multi_select', is_required: false, options: ['Haircut', 'Coloring', 'Spa', 'Makeup', 'Manicure/Pedicure'] }
        ]
    },
    {
        industry_key: 'wedding_planner',
        display_name: 'Wedding Planner',
        icon: '💒',
        description: 'Wedding and event planning services',
        is_active: true,
        sub_categories: [
            { key: 'full_service', display_name: 'Full Service' },
            { key: 'partial', display_name: 'Partial Planning' },
            { key: 'destination', display_name: 'Destination Weddings' }
        ],
        questions: [
            { question_key: 'events_per_year', question_text: 'Events per Year', question_type: 'number', is_required: true },
            { question_key: 'avg_budget', question_text: 'Average Event Budget (₹)', question_type: 'number', is_required: false },
            { question_key: 'team_size', question_text: 'Team Size', question_type: 'number', is_required: false }
        ]
    },
    {
        industry_key: 'event_management',
        display_name: 'Event Management',
        icon: '🎪',
        description: 'Corporate and social event management',
        is_active: true,
        sub_categories: [
            { key: 'corporate', display_name: 'Corporate Events' },
            { key: 'social', display_name: 'Social Events' },
            { key: 'exhibition', display_name: 'Exhibitions' }
        ],
        questions: [
            { question_key: 'events_per_year', question_text: 'Events Managed per Year', question_type: 'number', is_required: true },
            { question_key: 'avg_attendees', question_text: 'Average Attendees per Event', question_type: 'number', is_required: false }
        ]
    },
    {
        industry_key: 'office',
        display_name: 'Corporate Office',
        icon: '🏢',
        description: 'Corporate offices and workspaces',
        is_active: true,
        sub_categories: [
            { key: 'it', display_name: 'IT/Software' },
            { key: 'finance', display_name: 'Finance/Banking' },
            { key: 'consulting', display_name: 'Consulting' },
            { key: 'general', display_name: 'General Corporate' }
        ],
        questions: [
            { question_key: 'employee_count', question_text: 'Number of Employees', question_type: 'number', is_required: true },
            { question_key: 'area_sqft', question_text: 'Office Area (sqft)', question_type: 'number', is_required: false },
            { question_key: 'has_cafeteria', question_text: 'Has Cafeteria?', question_type: 'boolean', is_required: false }
        ]
    },
    {
        industry_key: 'retail_store',
        display_name: 'Retail Store',
        icon: '🛍️',
        description: 'Retail shops and stores',
        is_active: true,
        sub_categories: [
            { key: 'clothing', display_name: 'Clothing/Apparel' },
            { key: 'electronics', display_name: 'Electronics' },
            { key: 'grocery', display_name: 'Grocery/Supermarket' },
            { key: 'general', display_name: 'General Store' }
        ],
        questions: [
            { question_key: 'store_area', question_text: 'Store Area (sqft)', question_type: 'number', is_required: true },
            { question_key: 'daily_footfall', question_text: 'Daily Customer Footfall', question_type: 'number', is_required: false },
            { question_key: 'staff_count', question_text: 'Staff Count', question_type: 'number', is_required: false }
        ]
    },
    {
        industry_key: 'workshop',
        display_name: 'Automobile Workshop',
        icon: '🔧',
        description: 'Auto repair and service centers',
        is_active: true,
        sub_categories: [
            { key: 'authorized', display_name: 'Authorized Service' },
            { key: 'multi_brand', display_name: 'Multi-brand Service' },
            { key: 'body_shop', display_name: 'Body Shop/Denting' }
        ],
        questions: [
            { question_key: 'bay_count', question_text: 'Number of Service Bays', question_type: 'number', is_required: true },
            { question_key: 'daily_vehicles', question_text: 'Vehicles Serviced Daily', question_type: 'number', is_required: false },
            { question_key: 'technician_count', question_text: 'Number of Technicians', question_type: 'number', is_required: false }
        ]
    },
    {
        industry_key: 'factory',
        display_name: 'Factory/Manufacturing',
        icon: '🏭',
        description: 'Manufacturing and production units',
        is_active: true,
        sub_categories: [
            { key: 'textile', display_name: 'Textile' },
            { key: 'food_processing', display_name: 'Food Processing' },
            { key: 'engineering', display_name: 'Engineering' },
            { key: 'chemical', display_name: 'Chemical' }
        ],
        questions: [
            { question_key: 'worker_count', question_text: 'Number of Workers', question_type: 'number', is_required: true },
            { question_key: 'shifts', question_text: 'Number of Shifts', question_type: 'select', is_required: false, options: ['1', '2', '3'] },
            { question_key: 'area_sqft', question_text: 'Factory Area (sqft)', question_type: 'number', is_required: false }
        ]
    },
    {
        industry_key: 'warehouse',
        display_name: 'Warehouse/Logistics',
        icon: '📦',
        description: 'Warehousing and logistics facilities',
        is_active: true,
        sub_categories: [
            { key: 'general', display_name: 'General Warehouse' },
            { key: 'cold_storage', display_name: 'Cold Storage' },
            { key: 'fulfillment', display_name: 'Fulfillment Center' }
        ],
        questions: [
            { question_key: 'area_sqft', question_text: 'Warehouse Area (sqft)', question_type: 'number', is_required: true },
            { question_key: 'staff_count', question_text: 'Staff Count', question_type: 'number', is_required: false },
            { question_key: 'is_temperature_controlled', question_text: 'Temperature Controlled?', question_type: 'boolean', is_required: false }
        ]
    },
    {
        industry_key: 'co_working',
        display_name: 'Co-working Space',
        icon: '💼',
        description: 'Shared workspaces and co-working facilities',
        is_active: true,
        sub_categories: [
            { key: 'hot_desk', display_name: 'Hot Desking' },
            { key: 'dedicated', display_name: 'Dedicated Desks' },
            { key: 'private_office', display_name: 'Private Offices' }
        ],
        questions: [
            { question_key: 'seat_capacity', question_text: 'Total Seat Capacity', question_type: 'number', is_required: true },
            { question_key: 'current_occupancy', question_text: 'Current Occupancy (%)', question_type: 'number', is_required: false },
            { question_key: 'has_cafeteria', question_text: 'Has Cafeteria?', question_type: 'boolean', is_required: false }
        ]
    },
    {
        industry_key: 'temple',
        display_name: 'Temple/Religious Place',
        icon: '🛕',
        description: 'Temples and religious institutions',
        is_active: true,
        sub_categories: [
            { key: 'temple', display_name: 'Hindu Temple' },
            { key: 'church', display_name: 'Church' },
            { key: 'mosque', display_name: 'Mosque' },
            { key: 'gurudwara', display_name: 'Gurudwara' }
        ],
        questions: [
            { question_key: 'daily_visitors', question_text: 'Daily Visitors (avg)', question_type: 'number', is_required: true },
            { question_key: 'has_kitchen', question_text: 'Has Community Kitchen?', question_type: 'boolean', is_required: false },
            { question_key: 'staff_count', question_text: 'Staff/Volunteers', question_type: 'number', is_required: false }
        ]
    },
    {
        industry_key: 'theatre',
        display_name: 'Theatre/Cinema',
        icon: '🎬',
        description: 'Movie theatres and performance venues',
        is_active: true,
        sub_categories: [
            { key: 'multiplex', display_name: 'Multiplex' },
            { key: 'single_screen', display_name: 'Single Screen' },
            { key: 'auditorium', display_name: 'Auditorium' }
        ],
        questions: [
            { question_key: 'seat_capacity', question_text: 'Total Seating Capacity', question_type: 'number', is_required: true },
            { question_key: 'screen_count', question_text: 'Number of Screens', question_type: 'number', is_required: false },
            { question_key: 'has_f_and_b', question_text: 'Has F&B Counter?', question_type: 'boolean', is_required: false }
        ]
    },
    {
        industry_key: 'petrol_pump',
        display_name: 'Petrol Pump',
        icon: '⛽',
        description: 'Fuel stations and petrol pumps',
        is_active: true,
        sub_categories: [
            { key: 'iocl', display_name: 'Indian Oil' },
            { key: 'bpcl', display_name: 'Bharat Petroleum' },
            { key: 'hpcl', display_name: 'Hindustan Petroleum' },
            { key: 'reliance', display_name: 'Reliance/Others' }
        ],
        questions: [
            { question_key: 'nozzle_count', question_text: 'Number of Nozzles', question_type: 'number', is_required: true },
            { question_key: 'daily_sales', question_text: 'Daily Sales (liters)', question_type: 'number', is_required: false },
            { question_key: 'has_convenience_store', question_text: 'Has Convenience Store?', question_type: 'boolean', is_required: false }
        ]
    }
];

async function seedDatabase() {
    console.log('🌱 Starting Supabase database seed...\n');

    try {
        // 1. Seed Industries
        console.log('📦 Seeding industries...');
        for (const industry of industries) {
            const { questions, sub_categories, ...industryData } = industry;

            // Insert industry
            const { data: insertedIndustry, error: industryError } = await supabase
                .from('industries')
                .upsert({
                    ...industryData,
                    sub_categories: sub_categories
                }, { onConflict: 'industry_key' })
                .select()
                .single();

            if (industryError) {
                console.error(`  ❌ Error inserting ${industry.display_name}:`, industryError.message);
                continue;
            }

            console.log(`  ✅ ${industry.icon} ${industry.display_name}`);

            // Insert questions for this industry
            if (questions && questions.length > 0 && insertedIndustry) {
                for (let i = 0; i < questions.length; i++) {
                    const q = questions[i];
                    const { error: questionError } = await supabase
                        .from('industry_questions')
                        .upsert({
                            industry_id: insertedIndustry.id,
                            question_key: q.question_key,
                            question_text: q.question_text,
                            question_type: q.question_type,
                            options: q.options || [],
                            is_required: q.is_required || false,
                            display_order: i + 1
                        }, { onConflict: 'industry_id,question_key' });

                    if (questionError) {
                        console.error(`    ❌ Question error: ${questionError.message}`);
                    }
                }
            }
        }

        // 2. Create default admin user
        console.log('\n👤 Creating admin user...');
        const passwordHash = await bcrypt.hash('admin123', 10);

        const { error: userError } = await supabase
            .from('users')
            .upsert({
                email: 'admin@b2bsurvey.com',
                password_hash: passwordHash,
                name: 'Admin User',
                role: 'admin',
                is_active: true
            }, { onConflict: 'email' });

        if (userError) {
            console.error('  ❌ Admin user error:', userError.message);
        } else {
            console.log('  ✅ Admin user created (admin@b2bsurvey.com / admin123)');
        }

        // 3. Create a sample collector user
        const collectorHash = await bcrypt.hash('collector123', 10);
        const { error: collectorError } = await supabase
            .from('users')
            .upsert({
                email: 'collector@b2bsurvey.com',
                password_hash: collectorHash,
                name: 'Survey Collector',
                role: 'collector',
                is_active: true
            }, { onConflict: 'email' });

        if (!collectorError) {
            console.log('  ✅ Collector user created (collector@b2bsurvey.com / collector123)');
        }

        console.log('\n🎉 Database seeding completed successfully!');
        console.log(`\n📊 Summary:`);
        console.log(`   - Industries: ${industries.length}`);
        console.log(`   - Users: 2 (admin + collector)`);

    } catch (error) {
        console.error('\n❌ Seeding failed:', error.message);
        process.exit(1);
    }
}

seedDatabase();

// Industry configurations for seeding the database
export const industries = [
    {
        industryKey: 'hotel_with_rooms',
        displayName: 'Hotel (With Rooms)',
        icon: '🏨',
        description: 'Hotels, resorts, and lodging with guest rooms',
        subCategories: [
            { key: 'luxury', displayName: 'Luxury Hotel', subTypes: [] },
            { key: 'budget', displayName: 'Budget Hotel', subTypes: [] },
            { key: 'boutique', displayName: 'Boutique Hotel', subTypes: [] },
            { key: 'resort', displayName: 'Resort', subTypes: [] }
        ],
        questions: [
            { fieldKey: 'roomCount', label: 'Number of Rooms', type: 'number', required: true, order: 1 },
            { fieldKey: 'avgOccupancy', label: 'Average Occupancy (%)', type: 'number', order: 2 },
            { fieldKey: 'bedsheetsPerRoom', label: 'Bedsheets per Room', type: 'number', order: 3 },
            { fieldKey: 'towelsPerRoom', label: 'Towels per Room', type: 'number', order: 4 },
            { fieldKey: 'replacementFrequency', label: 'Linen Replacement Frequency', type: 'select', options: ['Monthly', 'Quarterly', 'Bi-annually', 'Annually'], order: 5 },
            { fieldKey: 'hasRestaurant', label: 'Has In-house Restaurant?', type: 'boolean', order: 6 },
            { fieldKey: 'staffCount', label: 'Total Staff Count', type: 'number', order: 7 },
            { fieldKey: 'uniformsPerStaff', label: 'Uniforms per Staff', type: 'number', order: 8 }
        ],
        commonItems: [
            { category: 'Linen', items: [{ name: 'Bedsheets', unit: 'pieces' }, { name: 'Pillow Covers', unit: 'pieces' }, { name: 'Towels', unit: 'pieces' }, { name: 'Bathrobes', unit: 'pieces' }] },
            { category: 'Toiletries', items: [{ name: 'Soap', unit: 'pieces' }, { name: 'Shampoo', unit: 'bottles' }, { name: 'Toothpaste Kit', unit: 'pieces' }] },
            { category: 'Cleaning', items: [{ name: 'Floor Cleaner', unit: 'liters' }, { name: 'Glass Cleaner', unit: 'liters' }, { name: 'Disinfectant', unit: 'liters' }] }
        ]
    },
    {
        industryKey: 'hotel_without_rooms',
        displayName: 'Hotel (Restaurant Only)',
        icon: '🍽️',
        description: 'Restaurants and dining establishments without lodging',
        subCategories: [
            { key: 'fine_dining', displayName: 'Fine Dining', subTypes: [] },
            { key: 'casual', displayName: 'Casual Dining', subTypes: [] },
            { key: 'fast_food', displayName: 'Fast Food', subTypes: [] },
            { key: 'cloud_kitchen', displayName: 'Cloud Kitchen', subTypes: [] },
            { key: 'cafe', displayName: 'Cafe/Coffee Shop', subTypes: [] }
        ],
        questions: [
            { fieldKey: 'seatingCapacity', label: 'Seating Capacity', type: 'number', required: true, order: 1 },
            { fieldKey: 'avgDailyCustomers', label: 'Average Daily Customers', type: 'number', order: 2 },
            { fieldKey: 'cuisineTypes', label: 'Cuisine Types', type: 'multiselect', options: ['Indian', 'Chinese', 'Continental', 'Italian', 'Multi-cuisine'], order: 3 },
            { fieldKey: 'plateCount', label: 'Total Plates/Crockery', type: 'number', order: 4 },
            { fieldKey: 'glassCount', label: 'Total Glasses', type: 'number', order: 5 },
            { fieldKey: 'staffCount', label: 'Kitchen + Service Staff', type: 'number', order: 6 }
        ],
        commonItems: [
            { category: 'Crockery', items: [{ name: 'Plates', unit: 'pieces' }, { name: 'Bowls', unit: 'pieces' }, { name: 'Glasses', unit: 'pieces' }] },
            { category: 'Kitchen', items: [{ name: 'Cooking Oil', unit: 'liters' }, { name: 'Spices', unit: 'kg' }, { name: 'Disposables', unit: 'pieces' }] },
            { category: 'Cleaning', items: [{ name: 'Dishwash Liquid', unit: 'liters' }, { name: 'Floor Cleaner', unit: 'liters' }] }
        ]
    },
    {
        industryKey: 'hospital',
        displayName: 'Hospital',
        icon: '🏥',
        description: 'Hospitals and large medical facilities',
        subCategories: [
            { key: 'multispecialty', displayName: 'Multi-specialty', subTypes: [] },
            { key: 'single_specialty', displayName: 'Single Specialty', subTypes: [] },
            { key: 'government', displayName: 'Government Hospital', subTypes: [] },
            { key: 'private', displayName: 'Private Hospital', subTypes: [] }
        ],
        questions: [
            { fieldKey: 'bedCount', label: 'Number of Beds', type: 'number', required: true, order: 1 },
            { fieldKey: 'icuBeds', label: 'ICU Beds', type: 'number', order: 2 },
            { fieldKey: 'dailyPatients', label: 'Daily OPD Patients (avg)', type: 'number', order: 3 },
            { fieldKey: 'nurseCount', label: 'Number of Nurses', type: 'number', order: 4 },
            { fieldKey: 'doctorCount', label: 'Number of Doctors', type: 'number', order: 5 },
            { fieldKey: 'supportStaff', label: 'Support Staff Count', type: 'number', order: 6 }
        ],
        commonItems: [
            { category: 'Linen', items: [{ name: 'Bedsheets', unit: 'pieces' }, { name: 'Patient Gowns', unit: 'pieces' }, { name: 'Curtains', unit: 'pieces' }] },
            { category: 'Consumables', items: [{ name: 'Gloves', unit: 'boxes' }, { name: 'Masks', unit: 'boxes' }, { name: 'Syringes', unit: 'pieces' }] },
            { category: 'Uniforms', items: [{ name: 'Nurse Uniforms', unit: 'sets' }, { name: 'Doctor Coats', unit: 'pieces' }, { name: 'Scrubs', unit: 'sets' }] }
        ]
    },
    {
        industryKey: 'clinic_with_beds',
        displayName: 'Clinic (With Beds)',
        icon: '🩺',
        description: 'Clinics and nursing homes with inpatient facilities',
        subCategories: [
            { key: 'general', displayName: 'General Clinic', subTypes: [] },
            { key: 'maternity', displayName: 'Maternity Home', subTypes: [] },
            { key: 'nursing_home', displayName: 'Nursing Home', subTypes: [] }
        ],
        questions: [
            { fieldKey: 'bedCount', label: 'Number of Beds', type: 'number', required: true, order: 1 },
            { fieldKey: 'dailyPatients', label: 'Daily Patients', type: 'number', order: 2 },
            { fieldKey: 'staffCount', label: 'Total Staff', type: 'number', order: 3 }
        ],
        commonItems: [
            { category: 'Medical', items: [{ name: 'Gloves', unit: 'boxes' }, { name: 'Cotton', unit: 'rolls' }, { name: 'Bandages', unit: 'rolls' }] }
        ]
    },
    {
        industryKey: 'clinic_without_beds',
        displayName: 'Clinic (OPD Only)',
        icon: '👨‍⚕️',
        description: 'Outpatient clinics without beds',
        subCategories: [
            { key: 'general', displayName: 'General Practice', subTypes: [] },
            { key: 'dental', displayName: 'Dental Clinic', subTypes: [] },
            { key: 'eye', displayName: 'Eye Clinic', subTypes: [] },
            { key: 'skin', displayName: 'Skin/Dermatology', subTypes: [] },
            { key: 'ortho', displayName: 'Orthopedic', subTypes: [] }
        ],
        questions: [
            { fieldKey: 'dailyPatients', label: 'Daily Patients (avg)', type: 'number', required: true, order: 1 },
            { fieldKey: 'doctorCount', label: 'Number of Doctors', type: 'number', order: 2 },
            { fieldKey: 'assistantCount', label: 'Assistants/Nurses', type: 'number', order: 3 }
        ],
        commonItems: [
            { category: 'Consumables', items: [{ name: 'Gloves', unit: 'boxes' }, { name: 'Masks', unit: 'boxes' }, { name: 'Sanitizer', unit: 'liters' }] }
        ]
    }
];

export default industries;

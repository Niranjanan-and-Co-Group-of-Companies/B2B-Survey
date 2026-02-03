export const industries = [
    {
        industryKey: 'workshop',
        displayName: 'Workshop/Garage',
        icon: '🔧',
        description: 'Automobile service and repair workshops',
        subCategories: [
            { key: 'two_wheeler', displayName: 'Two Wheeler', subTypes: [] },
            { key: 'four_wheeler', displayName: 'Four Wheeler', subTypes: [] },
            { key: 'both', displayName: 'Both', subTypes: [] },
            { key: 'commercial', displayName: 'Commercial Vehicles', subTypes: [] }
        ],
        questions: [
            { fieldKey: 'vehiclesPerDay', label: 'Vehicles Serviced per Day', type: 'number', required: true, order: 1 },
            { fieldKey: 'mechanicCount', label: 'Number of Mechanics', type: 'number', order: 2 },
            { fieldKey: 'bayCount', label: 'Service Bays', type: 'number', order: 3 },
            { fieldKey: 'servicesOffered', label: 'Services Offered', type: 'multiselect', options: ['Oil Change', 'Brake Service', 'Denting', 'Painting', 'AC Repair', 'Electrical'], order: 4 }
        ],
        commonItems: [
            { category: 'Lubricants', items: [{ name: 'Engine Oil', unit: 'liters' }, { name: 'Grease', unit: 'kg' }, { name: 'Brake Fluid', unit: 'liters' }] },
            { category: 'Consumables', items: [{ name: 'Oil Filters', unit: 'pieces' }, { name: 'Air Filters', unit: 'pieces' }, { name: 'Brake Pads', unit: 'sets' }] }
        ]
    },
    {
        industryKey: 'car_wash',
        displayName: 'Car Wash Center',
        icon: '🚗',
        description: 'Vehicle washing and detailing services',
        subCategories: [
            { key: 'basic', displayName: 'Basic Wash', subTypes: [] },
            { key: 'premium', displayName: 'Premium/Detailing', subTypes: [] }
        ],
        questions: [
            { fieldKey: 'vehiclesPerDay', label: 'Vehicles per Day', type: 'number', required: true, order: 1 },
            { fieldKey: 'staffCount', label: 'Staff Count', type: 'number', order: 2 }
        ],
        commonItems: [
            { category: 'Chemicals', items: [{ name: 'Car Shampoo', unit: 'liters' }, { name: 'Polish', unit: 'liters' }, { name: 'Wax', unit: 'kg' }] }
        ]
    },
    {
        industryKey: 'salon',
        displayName: 'Salon',
        icon: '💇',
        description: 'Hair and beauty salons',
        subCategories: [
            { key: 'men', displayName: 'Men\'s Salon', subTypes: [] },
            { key: 'women', displayName: 'Women\'s Salon', subTypes: [] },
            { key: 'unisex', displayName: 'Unisex Salon', subTypes: [] }
        ],
        questions: [
            { fieldKey: 'dailyCustomers', label: 'Daily Customers', type: 'number', required: true, order: 1 },
            { fieldKey: 'chairCount', label: 'Number of Chairs/Stations', type: 'number', order: 2 },
            { fieldKey: 'stylistCount', label: 'Stylists/Staff', type: 'number', order: 3 },
            { fieldKey: 'servicesOffered', label: 'Services', type: 'multiselect', options: ['Haircut', 'Coloring', 'Facial', 'Manicure', 'Pedicure', 'Makeup'], order: 4 }
        ],
        commonItems: [
            { category: 'Hair Products', items: [{ name: 'Shampoo', unit: 'liters' }, { name: 'Conditioner', unit: 'liters' }, { name: 'Hair Color', unit: 'tubes' }] },
            { category: 'Consumables', items: [{ name: 'Towels', unit: 'pieces' }, { name: 'Aprons', unit: 'pieces' }] }
        ]
    },
    {
        industryKey: 'gym',
        displayName: 'Gym/Fitness Center',
        icon: '🏋️',
        description: 'Gyms and fitness facilities',
        subCategories: [
            { key: 'basic', displayName: 'Basic Gym', subTypes: [] },
            { key: 'premium', displayName: 'Premium Fitness Center', subTypes: [] },
            { key: 'crossfit', displayName: 'CrossFit/Functional', subTypes: [] }
        ],
        questions: [
            { fieldKey: 'memberCount', label: 'Total Members', type: 'number', required: true, order: 1 },
            { fieldKey: 'trainerCount', label: 'Trainers', type: 'number', order: 2 },
            { fieldKey: 'areaSize', label: 'Area (sq ft)', type: 'number', order: 3 }
        ],
        commonItems: [
            { category: 'Supplies', items: [{ name: 'Towels', unit: 'pieces' }, { name: 'Sanitizer', unit: 'liters' }, { name: 'Mats', unit: 'pieces' }] }
        ]
    }
];

export default industries;

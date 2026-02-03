export const industries = [
    {
        industryKey: 'retail_grocery',
        displayName: 'Grocery/Kirana Store',
        icon: '🛒',
        description: 'Grocery and general stores',
        subCategories: [
            { key: 'kirana', displayName: 'Kirana Store', subTypes: [] },
            { key: 'supermarket', displayName: 'Supermarket', subTypes: [] },
            { key: 'general', displayName: 'General Store', subTypes: [] }
        ],
        questions: [
            { fieldKey: 'dailyCustomers', label: 'Daily Customers', type: 'number', required: true, order: 1 },
            { fieldKey: 'storeSize', label: 'Store Size (sq ft)', type: 'number', order: 2 },
            { fieldKey: 'staffCount', label: 'Staff Count', type: 'number', order: 3 }
        ],
        commonItems: [
            { category: 'Packaging', items: [{ name: 'Carry Bags', unit: 'kg' }, { name: 'Packaging Material', unit: 'rolls' }] }
        ]
    },
    {
        industryKey: 'bakery',
        displayName: 'Bakery',
        icon: '🥖',
        description: 'Bakeries and confectioneries',
        subCategories: [
            { key: 'retail', displayName: 'Retail Bakery', subTypes: [] },
            { key: 'wholesale', displayName: 'Wholesale Bakery', subTypes: [] }
        ],
        questions: [
            { fieldKey: 'dailyProduction', label: 'Daily Production (items)', type: 'number', required: true, order: 1 },
            { fieldKey: 'staffCount', label: 'Staff Count', type: 'number', order: 2 }
        ],
        commonItems: [
            { category: 'Ingredients', items: [{ name: 'Flour', unit: 'kg' }, { name: 'Sugar', unit: 'kg' }, { name: 'Butter', unit: 'kg' }] },
            { category: 'Packaging', items: [{ name: 'Boxes', unit: 'pieces' }, { name: 'Paper Bags', unit: 'pieces' }] }
        ]
    },
    {
        industryKey: 'corporate_office',
        displayName: 'Corporate Office',
        icon: '🏢',
        description: 'Corporate offices and workspaces',
        subCategories: [
            { key: 'small', displayName: 'Small Office (<20)', subTypes: [] },
            { key: 'medium', displayName: 'Medium (20-100)', subTypes: [] },
            { key: 'large', displayName: 'Large (100+)', subTypes: [] },
            { key: 'coworking', displayName: 'Co-working Space', subTypes: [] }
        ],
        questions: [
            { fieldKey: 'employeeCount', label: 'Employee Count', type: 'number', required: true, order: 1 },
            { fieldKey: 'officeSize', label: 'Office Size (sq ft)', type: 'number', order: 2 },
            { fieldKey: 'hasCafeteria', label: 'Has Cafeteria?', type: 'boolean', order: 3 }
        ],
        commonItems: [
            { category: 'Pantry', items: [{ name: 'Tea/Coffee', unit: 'kg' }, { name: 'Sugar', unit: 'kg' }, { name: 'Disposable Cups', unit: 'pieces' }] },
            { category: 'Stationery', items: [{ name: 'Paper', unit: 'reams' }, { name: 'Pens', unit: 'pieces' }] },
            { category: 'Cleaning', items: [{ name: 'Tissues', unit: 'boxes' }, { name: 'Sanitizer', unit: 'liters' }] }
        ]
    },
    {
        industryKey: 'religious_place',
        displayName: 'Religious Place',
        icon: '🛕',
        description: 'Temples, churches, mosques, gurudwaras',
        subCategories: [
            { key: 'temple', displayName: 'Temple', subTypes: [] },
            { key: 'church', displayName: 'Church', subTypes: [] },
            { key: 'mosque', displayName: 'Mosque', subTypes: [] },
            { key: 'gurudwara', displayName: 'Gurudwara', subTypes: [] }
        ],
        questions: [
            { fieldKey: 'dailyVisitors', label: 'Daily Visitors', type: 'number', required: true, order: 1 },
            { fieldKey: 'staffCount', label: 'Staff Count', type: 'number', order: 2 },
            { fieldKey: 'hasLangar', label: 'Has Community Kitchen?', type: 'boolean', order: 3 }
        ],
        commonItems: [
            { category: 'Puja Items', items: [{ name: 'Flowers', unit: 'kg' }, { name: 'Oil/Ghee', unit: 'liters' }, { name: 'Incense', unit: 'packs' }] }
        ]
    }
];

export default industries;

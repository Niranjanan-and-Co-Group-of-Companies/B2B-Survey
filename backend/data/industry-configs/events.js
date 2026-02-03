export const industries = [
    {
        industryKey: 'wedding_planner',
        displayName: 'Wedding Planner',
        icon: '💒',
        description: 'Wedding planning and event management',
        subCategories: [
            { key: 'full_service', displayName: 'Full Service', subTypes: [] },
            { key: 'destination', displayName: 'Destination Weddings', subTypes: [] },
            { key: 'budget', displayName: 'Budget Weddings', subTypes: [] }
        ],
        questions: [
            { fieldKey: 'eventsPerMonth', label: 'Events per Month (avg)', type: 'number', required: true, order: 1 },
            { fieldKey: 'avgGuestCount', label: 'Average Guest Count', type: 'number', order: 2 },
            { fieldKey: 'avgBudgetPerEvent', label: 'Average Budget per Event (₹)', type: 'number', order: 3 },
            { fieldKey: 'servicesOffered', label: 'Services Offered', type: 'multiselect', options: ['Decoration', 'Catering', 'Photography', 'Entertainment', 'Venue'], order: 4 }
        ],
        commonItems: [
            { category: 'Decoration', items: [{ name: 'Flowers', unit: 'bunches' }, { name: 'Lights', unit: 'sets' }, { name: 'Drapes', unit: 'meters' }] },
            { category: 'Invites', items: [{ name: 'Invitation Cards', unit: 'pieces' }, { name: 'Gift Boxes', unit: 'pieces' }] }
        ]
    },
    {
        industryKey: 'event_management',
        displayName: 'Event Management',
        icon: '🎪',
        description: 'Corporate and social event management',
        subCategories: [
            { key: 'corporate', displayName: 'Corporate Events', subTypes: [] },
            { key: 'social', displayName: 'Social Events', subTypes: [] },
            { key: 'exhibitions', displayName: 'Exhibitions/Trade Shows', subTypes: [] }
        ],
        questions: [
            { fieldKey: 'eventsPerMonth', label: 'Events per Month', type: 'number', required: true, order: 1 },
            { fieldKey: 'avgAttendees', label: 'Average Attendees', type: 'number', order: 2 },
            { fieldKey: 'eventTypes', label: 'Event Types', type: 'multiselect', options: ['Conference', 'Seminar', 'Product Launch', 'Team Building', 'Award Ceremony'], order: 3 }
        ],
        commonItems: [
            { category: 'Equipment', items: [{ name: 'Sound Systems', unit: 'sets' }, { name: 'Projectors', unit: 'pieces' }, { name: 'Microphones', unit: 'pieces' }] }
        ]
    },
    {
        industryKey: 'tent_house',
        displayName: 'Tent House/Mandap',
        icon: '⛺',
        description: 'Tent and mandap service providers',
        subCategories: [
            { key: 'wedding', displayName: 'Wedding Mandaps', subTypes: [] },
            { key: 'general', displayName: 'General Events', subTypes: [] }
        ],
        questions: [
            { fieldKey: 'eventsPerMonth', label: 'Events per Month', type: 'number', required: true, order: 1 },
            { fieldKey: 'tentInventory', label: 'Tent Inventory (sq ft capacity)', type: 'number', order: 2 },
            { fieldKey: 'furnitureInventory', label: 'Furniture Items (chairs/tables)', type: 'number', order: 3 }
        ],
        commonItems: [
            { category: 'Tents', items: [{ name: 'Shamianas', unit: 'pieces' }, { name: 'Pandals', unit: 'pieces' }] },
            { category: 'Furniture', items: [{ name: 'Chairs', unit: 'pieces' }, { name: 'Tables', unit: 'pieces' }] }
        ]
    }
];

export default industries;

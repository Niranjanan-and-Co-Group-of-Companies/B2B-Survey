export const industries = [
    {
        industryKey: 'school',
        displayName: 'School',
        icon: '🏫',
        description: 'Educational institutions for K-12',
        subCategories: [
            { key: 'primary', displayName: 'Primary School', subTypes: [] },
            { key: 'secondary', displayName: 'Secondary School', subTypes: [] },
            { key: 'higher_secondary', displayName: 'Higher Secondary', subTypes: [] },
            { key: 'international', displayName: 'International School', subTypes: [] }
        ],
        questions: [
            { fieldKey: 'studentCount', label: 'Total Students', type: 'number', required: true, order: 1 },
            { fieldKey: 'classCount', label: 'Number of Classes', type: 'number', order: 2 },
            { fieldKey: 'sectionsPerClass', label: 'Sections per Class (avg)', type: 'number', order: 3 },
            { fieldKey: 'teacherCount', label: 'Number of Teachers', type: 'number', order: 4 },
            { fieldKey: 'supportStaff', label: 'Support Staff', type: 'number', order: 5 },
            { fieldKey: 'hasCanteen', label: 'Has Canteen?', type: 'boolean', order: 6 },
            { fieldKey: 'uniformSetsPerStudent', label: 'Uniform Sets per Student', type: 'number', order: 7 },
            { fieldKey: 'sportsUniform', label: 'Sports Uniform Required?', type: 'boolean', order: 8 }
        ],
        commonItems: [
            { category: 'Uniforms', items: [{ name: 'Regular Uniform', unit: 'sets' }, { name: 'Sports Uniform', unit: 'sets' }, { name: 'Shoes', unit: 'pairs' }] },
            { category: 'Stationery', items: [{ name: 'Notebooks', unit: 'pieces' }, { name: 'Textbooks', unit: 'pieces' }, { name: 'Registers', unit: 'pieces' }] },
            { category: 'Furniture', items: [{ name: 'Desks', unit: 'pieces' }, { name: 'Chairs', unit: 'pieces' }, { name: 'Boards', unit: 'pieces' }] }
        ]
    },
    {
        industryKey: 'college',
        displayName: 'College/University',
        icon: '🎓',
        description: 'Higher education institutions',
        subCategories: [
            { key: 'arts', displayName: 'Arts & Commerce', subTypes: [] },
            { key: 'engineering', displayName: 'Engineering', subTypes: [] },
            { key: 'medical', displayName: 'Medical', subTypes: [] },
            { key: 'management', displayName: 'Management/MBA', subTypes: [] }
        ],
        questions: [
            { fieldKey: 'studentCount', label: 'Total Students', type: 'number', required: true, order: 1 },
            { fieldKey: 'departmentCount', label: 'Number of Departments', type: 'number', order: 2 },
            { fieldKey: 'facultyCount', label: 'Faculty Members', type: 'number', order: 3 },
            { fieldKey: 'hasHostel', label: 'Has Hostel?', type: 'boolean', order: 4 },
            { fieldKey: 'hostelCapacity', label: 'Hostel Capacity', type: 'number', order: 5 }
        ],
        commonItems: [
            { category: 'Lab Equipment', items: [{ name: 'Lab Coats', unit: 'pieces' }, { name: 'Safety Goggles', unit: 'pieces' }] },
            { category: 'Furniture', items: [{ name: 'Desks', unit: 'pieces' }, { name: 'Lab Tables', unit: 'pieces' }] }
        ]
    },
    {
        industryKey: 'coaching_center',
        displayName: 'Coaching/Tuition Center',
        icon: '📚',
        description: 'Coaching institutes and tuition centers',
        subCategories: [
            { key: 'competitive', displayName: 'Competitive Exams', subTypes: [] },
            { key: 'school_tuition', displayName: 'School Tuition', subTypes: [] },
            { key: 'skill_training', displayName: 'Skill Training', subTypes: [] }
        ],
        questions: [
            { fieldKey: 'studentCount', label: 'Total Students Enrolled', type: 'number', required: true, order: 1 },
            { fieldKey: 'batchCount', label: 'Number of Batches', type: 'number', order: 2 },
            { fieldKey: 'facultyCount', label: 'Faculty/Teachers', type: 'number', order: 3 }
        ],
        commonItems: [
            { category: 'Study Material', items: [{ name: 'Printed Notes', unit: 'sets' }, { name: 'Test Papers', unit: 'sets' }] }
        ]
    },
    {
        industryKey: 'playschool',
        displayName: 'Play School/Day Care',
        icon: '🧒',
        description: 'Pre-schools and daycare centers',
        subCategories: [
            { key: 'playschool', displayName: 'Play School', subTypes: [] },
            { key: 'daycare', displayName: 'Day Care', subTypes: [] },
            { key: 'montessori', displayName: 'Montessori', subTypes: [] }
        ],
        questions: [
            { fieldKey: 'childCount', label: 'Number of Children', type: 'number', required: true, order: 1 },
            { fieldKey: 'ageGroups', label: 'Age Groups Served', type: 'text', order: 2 },
            { fieldKey: 'staffCount', label: 'Caretakers/Teachers', type: 'number', order: 3 }
        ],
        commonItems: [
            { category: 'Learning', items: [{ name: 'Toys', unit: 'pieces' }, { name: 'Activity Books', unit: 'pieces' }] },
            { category: 'Care', items: [{ name: 'Diapers', unit: 'pieces' }, { name: 'Wipes', unit: 'packs' }] }
        ]
    }
];

export default industries;

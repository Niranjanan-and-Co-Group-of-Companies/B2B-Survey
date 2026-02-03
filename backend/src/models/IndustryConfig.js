import mongoose from 'mongoose';

const industryConfigSchema = new mongoose.Schema({
    industryKey: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    displayName: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        default: '🏢'
    },
    description: {
        type: String
    },
    subCategories: [{
        key: {
            type: String,
            required: true
        },
        displayName: {
            type: String,
            required: true
        },
        subTypes: [{
            key: String,
            displayName: String
        }]
    }],
    questions: [{
        fieldKey: {
            type: String,
            required: true
        },
        label: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['number', 'text', 'select', 'multiselect', 'range', 'boolean', 'textarea'],
            required: true
        },
        options: [String],
        required: {
            type: Boolean,
            default: false
        },
        placeholder: String,
        helpText: String,
        validation: {
            min: Number,
            max: Number,
            pattern: String
        },
        dependsOn: {
            field: String,
            value: mongoose.Schema.Types.Mixed
        },
        order: {
            type: Number,
            default: 0
        }
    }],
    commonItems: [{
        category: String,
        items: [{
            name: String,
            unit: String,
            suggestedFrequency: String
        }]
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export default mongoose.model('IndustryConfig', industryConfigSchema);

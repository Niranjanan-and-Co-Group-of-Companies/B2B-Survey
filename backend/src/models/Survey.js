import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const surveySchema = new mongoose.Schema({
    surveyId: {
        type: String,
        unique: true,
        default: () => `SRV-${uuidv4().substring(0, 8).toUpperCase()}`
    },

    // Business Information
    business: {
        name: {
            type: String,
            required: true,
            trim: true
        },
        industry: {
            type: String,
            required: true,
            index: true
        },
        subCategory: {
            type: String,
            required: true
        },
        subType: String,
        yearsInOperation: Number,
        employeeCount: Number,
        ownerName: {
            type: String,
            trim: true
        },
        contactPhone: {
            type: String,
            trim: true
        },
        contactEmail: {
            type: String,
            trim: true,
            lowercase: true
        },
        address: {
            street: String,
            landmark: String,
            city: {
                type: String,
                index: true
            },
            state: {
                type: String,
                index: true
            },
            pincode: String,
            country: {
                type: String,
                default: 'India'
            }
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                default: [0, 0]
            }
        },
        locationSource: {
            type: String,
            enum: ['gps_auto', 'manual', 'not_provided'],
            default: 'not_provided'
        }
    },

    // Current Procurement Details
    currentProcurement: {
        method: {
            type: String,
            enum: ['single_vendor', 'multiple_vendors', 'wholesale_market', 'online', 'mixed', 'other']
        },
        methodOther: String,
        monthlyBudget: {
            min: Number,
            max: Number,
            currency: {
                type: String,
                default: 'INR'
            }
        },
        preferredCreditPeriod: Number, // days
        currentCreditPeriod: Number, // days
        paymentMethods: [{
            type: String,
            enum: ['cash', 'upi', 'bank_transfer', 'cheque', 'credit_card', 'credit']
        }],
        painPoints: [{
            type: String,
            enum: [
                'high_prices',
                'inconsistent_quality',
                'delivery_delays',
                'no_credit',
                'limited_variety',
                'poor_customer_service',
                'no_returns',
                'minimum_order_requirements',
                'no_bulk_discounts',
                'other'
            ]
        }],
        painPointsOther: String,
        vendorSatisfaction: {
            type: Number,
            min: 1,
            max: 5
        },
        willingToSwitch: {
            type: String,
            enum: ['yes', 'no', 'maybe']
        },
        switchReasons: [String],
        interestedInBNPL: Boolean, // Buy Now Pay Later
        interestedInBidding: Boolean
    },

    // Industry-Specific Data (dynamic based on industry)
    industryData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },

    // Recurring Requirements
    recurringItems: [{
        category: String,
        itemName: {
            type: String,
            required: true
        },
        quantity: Number,
        unit: String,
        frequency: {
            type: String,
            enum: ['daily', 'weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly', 'as_needed']
        },
        estimatedCost: Number,
        currentVendor: String,
        notes: String
    }],

    // Additional Notes
    additionalNotes: String,

    // Metadata
    meta: {
        source: {
            type: String,
            enum: ['mobile_app', 'website', 'manual'],
            required: true,
            index: true
        },
        collectedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        deviceInfo: {
            platform: String,
            appVersion: String,
            deviceModel: String
        },
        submittedAt: {
            type: Date,
            default: Date.now,
            index: true
        },
        updatedAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['draft', 'submitted', 'verified', 'rejected', 'duplicate'],
            default: 'submitted',
            index: true
        },
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        verifiedAt: Date,
        rejectionReason: String,
        internalNotes: String,
        tags: [String]
    }
}, {
    timestamps: true
});

// Indexes for geospatial queries
surveySchema.index({ 'business.location': '2dsphere' });

// Compound indexes for common queries
surveySchema.index({ 'business.industry': 1, 'meta.submittedAt': -1 });
surveySchema.index({ 'business.city': 1, 'business.industry': 1 });

// Virtual for full address
surveySchema.virtual('business.fullAddress').get(function () {
    const addr = this.business.address;
    if (!addr) return '';
    return [addr.street, addr.landmark, addr.city, addr.state, addr.pincode]
        .filter(Boolean)
        .join(', ');
});

// Pre-save middleware
surveySchema.pre('save', function (next) {
    this.meta.updatedAt = new Date();
    next();
});

export default mongoose.model('Survey', surveySchema);

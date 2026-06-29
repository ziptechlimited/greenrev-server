"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const User_1 = require("../models/User");
// Load environment variables
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") });
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error("MONGODB_URI is not defined in environment variables");
    process.exit(1);
}
const expertsData = [
    {
        "id": "1",
        "name": "GreenRev Lagos (Lekki)",
        "city": "Lagos",
        "country": "Nigeria",
        "address": "Plot 15, Admiralty Way, Lekki Phase 1, Lagos",
        "lat": 6.4487,
        "lng": 3.4735,
        "specialization": ["Performance Tuning", "Hybrid Systems", "Concierge Service"],
        "phone": "+234 800 123 4567",
        "email": "lekki@greenrev.com",
        "image": "/images/experts/london.png"
    },
    {
        "id": "2",
        "name": "GreenRev Abuja (Maitama)",
        "city": "Abuja",
        "country": "Nigeria",
        "address": "22 Gana Street, Maitama, Abuja",
        "lat": 9.0833,
        "lng": 7.5000,
        "specialization": ["Security Upgrades", "Diplomatic Fleet Care"],
        "phone": "+234 800 111 2222",
        "email": "abuja@greenrev.com",
        "image": "/images/experts/dubai.png"
    },
    {
        "id": "3",
        "name": "GreenRev Port Harcourt",
        "city": "Port Harcourt",
        "country": "Nigeria",
        "address": "Trans-Amadi Industrial Layout, Port Harcourt",
        "lat": 4.8156,
        "lng": 7.0498,
        "specialization": ["Heavy-Duty Modification", "Precision Electronics"],
        "phone": "+234 800 333 4444",
        "email": "ph@greenrev.com",
        "image": "/images/experts/tokyo.png"
    },
    {
        "id": "4",
        "name": "GreenRev Lagos (Ikeja)",
        "city": "Lagos",
        "country": "Nigeria",
        "address": "Obafemi Awolowo Way, Ikeja, Lagos",
        "lat": 6.6010,
        "lng": 3.3515,
        "specialization": ["Engine Reconstruction", "Paint & Detailing"],
        "phone": "+234 800 555 6666",
        "email": "ikeja@greenrev.com",
        "image": "/images/experts/la.png"
    },
    {
        "id": "5",
        "name": "GreenRev Ibadan",
        "city": "Ibadan",
        "country": "Nigeria",
        "address": "Ring Road, Ibadan, Oyo State",
        "lat": 7.3775,
        "lng": 3.9470,
        "specialization": ["Classic Restoration", "Chassis Alignment"],
        "phone": "+234 800 777 8888",
        "email": "ibadan@greenrev.com",
        "image": "/images/experts/munich.png"
    },
    {
        "id": "6",
        "name": "GreenRev Kano Lab",
        "city": "Kano",
        "country": "Nigeria",
        "address": "Bompai Road, Kano",
        "lat": 12.0022,
        "lng": 8.5920,
        "specialization": ["Off-Road Preparation", "Heat Optimization"],
        "phone": "+234 800 999 0000",
        "email": "kano@greenrev.com",
        "image": "/images/experts/tokyo.png"
    }
];
async function seed() {
    try {
        await mongoose_1.default.connect(MONGODB_URI);
        console.log("Connected to MongoDB");
        // Clean up existing seeded experts to prevent duplicates during repeated runs
        await User_1.User.deleteMany({ role: "mechanic", email: { $in: expertsData.map(e => e.email) } });
        console.log("Cleared existing expert entries");
        // Map JSON to User model structure
        const mechanicUsers = expertsData.map(expert => ({
            email: expert.email,
            name: expert.name,
            garageName: expert.name,
            role: "mechanic",
            phone: expert.phone,
            isEmailVerified: true,
            profileImage: expert.image,
            city: expert.city,
            country: expert.country,
            address: expert.address,
            lat: expert.lat,
            lng: expert.lng,
            specialization: expert.specialization,
            // Add a dummy password hash so they could theoretically log in if we knew it, or just leave null
            passwordHash: "seeded_no_password"
        }));
        await User_1.User.insertMany(mechanicUsers);
        console.log(`Successfully seeded ${mechanicUsers.length} experts into the User collection.`);
        process.exit(0);
    }
    catch (error) {
        console.error("Error seeding experts:", error);
        process.exit(1);
    }
}
seed();

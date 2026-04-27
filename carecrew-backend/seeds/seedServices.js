import "dotenv/config";
import { connectDB } from "../config/db.js";
import Service from "../models/Service.js";

const services = [
  { 
    name: "AC Repair & Service", 
    nameNe: "एसी मर्मत र सेवा",
    description: "Deep cleaning, gas refill, and full AC servicing by certified technicians.", 
    descriptionNe: "प्रमाणित प्राविधिकद्वारा गहिरो सफाई, ग्यास रिफिल र पूर्ण एसी सेवा।",
    price: 699, duration: 90, image: "" 
  },
  { 
    name: "Home Cleaning", 
    nameNe: "घर सफाई",
    description: "Complete home deep cleaning including kitchen, bathrooms, and all rooms.", 
    descriptionNe: "भान्साकोठा, बाथरूम र सबै कोठा सहित पूर्ण घर गहिरो सफाई।",
    price: 999, duration: 180, image: "" 
  },
  { 
    name: "Plumbing", 
    nameNe: "प्लम्बिङ",
    description: "Leak repairs, pipe fitting, tap installation and all plumbing issues.", 
    descriptionNe: "चुहावट मर्मत, पाइप फिटिङ, धारा जडान र सबै प्लम्बिङ समस्या।",
    price: 399, duration: 60, image: "" 
  },
  { 
    name: "Electrician", 
    nameNe: "इलेक्ट्रिसियन",
    description: "Wiring, switch/socket repairs, fan installation and electrical fixes.", 
    descriptionNe: "तार जडान, स्विच/सकेट मर्मत, पंखा जडान र विद्युतीय मर्मत।",
    price: 299, duration: 60, image: "" 
  },
  { 
    name: "Carpenter", 
    nameNe: "सिकर्मी",
    description: "Furniture repair, installation, custom woodwork and door fixing.", 
    descriptionNe: "फर्निचर मर्मत, जडान, कस्टम काठको काम र ढोका मर्मत।",
    price: 499, duration: 90, image: "" 
  },
  { 
    name: "Pest Control", 
    nameNe: "किरा नियन्त्रण",
    description: "Cockroach, termite, bed bug and general pest control treatment.", 
    descriptionNe: "काक्रो, दिमाक, खटिरा र सामान्य किरा नियन्त्रण उपचार।",
    price: 799, duration: 120, image: "" 
  },
];

const runSeed = async () => {
  try {
    await connectDB();
    await Service.deleteMany({});
    await Service.insertMany(services);
    // eslint-disable-next-line no-console
    console.log(`Seeded ${services.length} services successfully.`);
    process.exit(0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Service seed failed:", error);
    process.exit(1);
  }
};

runSeed();

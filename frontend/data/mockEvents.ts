// Rich mock events representing high-quality university and community activities
import type { IEvent } from "../types";

export const INITIAL_MOCK_EVENTS: IEvent[] = [
  {
    _id: "evt_1",
    title: "EveFest Tech Hackathon 2026",
    description: "Collaborate with developers, designers, and visionaries to build web applications addressing climate change and educational access. Win cash prizes, certificates, and recruitment opportunities from top tech firms on campus.",
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from now
    time: "09:00 AM - 06:00 PM",
    price: 0, // Free
    limit: 150,
    registeredCount: 84,
    isOnline: false,
    location: "Main Engineering Hall, Block C",
    mapLink: "https://maps.google.com/?q=Campus+Engineering+Hall",
    locationDescription: "Second floor auditorium. Registered participants should check in at the reception desk to collect their developer badges and lunch coupons.",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800&auto=format&fit=crop",
    category: "Technology",
    hostName: "Computer Science Association",
    hostId: "admin",
    proofDoc: "CS_Hackathon_Approval.pdf",
    rules: "",
    logo: "",
    isTakedown: false,
    maxSeatsPerUser: 5,
    takedownReason: ""
  },
  {
    _id: "evt_2",
    title: "Acoustic Sunset Concert Night",
    description: "Join us for a cozy evening featuring the university's finest student bands and acoustic soloists. Free snacks and beverages will be served. Bring your friends and unwind under the sunset skies.",
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
    time: "05:30 PM - 09:30 PM",
    price: 15, // Paid
    limit: 200,
    registeredCount: 198, // Almost full
    isOnline: false,
    location: "Campus Amphitheatre",
    mapLink: "https://maps.google.com/?q=Campus+Amphitheatre",
    locationDescription: "Outdoor open-air arena. In case of rain, the concert will be relocated to the Indoor Sports Center.",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop",
    category: "Music",
    hostName: "Music & Cultural Club",
    hostId: "admin",
    proofDoc: "Cultural_Dept_Permit.pdf",
    rules: "",
    logo: "",
    isTakedown: false,
    maxSeatsPerUser: 5,
    takedownReason: ""
  },
  {
    _id: "evt_3",
    title: "UI/UX Design Masterclass (Virtual)",
    description: "Learn essential design principles, layout strategies, color theory, and advanced Figma workflows. Ideal for beginners wishing to improve their project aesthetics and portfolios.",
    date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 8 days from now
    time: "02:00 PM - 05:00 PM",
    price: 5,
    limit: "unlimited", // Unlimited
    registeredCount: 312,
    isOnline: true,
    location: "Zoom Video Conferencing",
    mapLink: "https://zoom.us/j/mock_meeting_id",
    locationDescription: "Online meeting. Access link and event material drive will be available in the group chat and emailed to attendees prior to start.",
    image: "https://images.unsplash.com/photo-1561070791-26c113006238?q=80&w=800&auto=format&fit=crop",
    category: "Design",
    hostName: "Design Society",
    hostId: "admin",
    proofDoc: "Design_Masterclass_Flyer.pdf",
    rules: "",
    logo: "",
    isTakedown: false,
    maxSeatsPerUser: 5,
    takedownReason: ""
  },
  {
    _id: "evt_4",
    title: "Fine Arts & Charcoal Sketch Workshop",
    description: "A hands-on workshop led by renowned artist Sarah Jenkins. Learn shading techniques, depth principles, and life portrait sketching. Materials (charcoal pencils, textured paper, easels) are provided.",
    date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 12 days from now
    time: "10:30 AM - 01:30 PM",
    price: 30,
    limit: 20,
    registeredCount: 8,
    isOnline: false,
    location: "Visual Arts Studio 402",
    mapLink: "https://maps.google.com/?q=Fine+Arts+Studio+Building",
    locationDescription: "North Wing, Art Department Building. Parking is free in Lot B.",
    image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=800&auto=format&fit=crop",
    category: "Arts",
    hostName: "Fine Arts Club",
    hostId: "admin",
    proofDoc: "Art_Dept_Approval.pdf",
    rules: "",
    logo: "",
    isTakedown: false,
    maxSeatsPerUser: 5,
    takedownReason: ""
  }
];

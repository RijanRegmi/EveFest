import Event from "../models/Event";
import User from "../models/User";

export const seedDatabase = async (): Promise<void> => {
  try {
    const eventCount = await Event.countDocuments({});
    if (eventCount < 5) {
      console.log("[Seeding] Populating database with 7 demonstration campus events...");

      let adminHost = await User.findOne({ email: "admin.host@university.edu" });
      if (!adminHost) {
        adminHost = await User.create({
          name: "Campus Events Coordinator",
          username: "campusadmin",
          email: "admin.host@university.edu",
          phoneNumber: "0000000000",
          password: "password123",
          role: "admin",
        });
      }

      const initialEvents = [
        {
          title: "EveFest Tech Hackathon 2026",
          description:
            "Collaborate with developers, designers, and visionaries to build web applications addressing climate change and educational access. Win cash prizes, certificates, and recruitment opportunities from top tech firms on campus.",
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          time: "09:00 AM - 06:00 PM",
          price: 0,
          limit: 150,
          registeredCount: 45,
          isOnline: false,
          location: "Main Engineering Hall, Block C",
          mapLink: "https://maps.google.com/?q=Campus+Engineering+Hall",
          locationDescription:
            "Second floor auditorium. Registered participants should check in at the reception desk to collect their developer badges and lunch coupons.",
          image:
            "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800&auto=format&fit=crop",
          category: "Technology",
          hostName: "Computer Science Association",
          hostId: adminHost._id,
          proofDoc: "CS_Hackathon_Approval.pdf",
        },
        {
          title: "Acoustic Sunset Concert Night",
          description:
            "Join us for a cozy evening featuring the university's finest student bands and acoustic soloists. Free snacks and beverages will be served. Bring your friends and unwind under the sunset skies.",
          date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          time: "05:30 PM - 09:30 PM",
          price: 15,
          limit: 200,
          registeredCount: 188,
          isOnline: false,
          location: "Campus Amphitheatre",
          mapLink: "https://maps.google.com/?q=Campus+Amphitheatre",
          locationDescription:
            "Outdoor open-air arena. In case of rain, the concert will be relocated to the Indoor Sports Center.",
          image:
            "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop",
          category: "Music",
          hostName: "Music & Cultural Club",
          hostId: adminHost._id,
          proofDoc: "Cultural_Dept_Permit.pdf",
        },
        {
          title: "UI/UX Design Masterclass (Virtual)",
          description:
            "Learn essential design principles, layout strategies, color theory, and advanced Figma workflows. Ideal for beginners wishing to improve their project aesthetics and portfolios.",
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          time: "02:00 PM - 05:00 PM",
          price: 5,
          limit: "unlimited",
          registeredCount: 124,
          isOnline: true,
          location: "Zoom Video Conferencing",
          mapLink: "https://zoom.us/j/mock_meeting_id",
          locationDescription:
            "Online meeting. Access link and event material drive will be available in the group chat and emailed to attendees prior to start.",
          image:
            "https://images.unsplash.com/photo-1561070791-26c113006238?q=80&w=800&auto=format&fit=crop",
          category: "Design",
          hostName: "Design Society",
          hostId: adminHost._id,
          proofDoc: "Design_Masterclass_Flyer.pdf",
        },
        {
          title: "Inter-College Championship Football Final",
          description:
            "Cheer for your college team in the annual inter-college championship final derby. Live commentary, halftime performances, and trophies award ceremony.",
          date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          time: "04:00 PM - 07:00 PM",
          price: 10,
          limit: 300,
          registeredCount: 241,
          isOnline: false,
          location: "University Sports Complex Stadium",
          mapLink: "https://maps.google.com/?q=Campus+Stadium",
          locationDescription:
            "Gate 2 entrance. E-pass scanning at turnstiles.",
          image:
            "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop",
          category: "Sports",
          hostName: "Campus Sports Board",
          hostId: adminHost._id,
          proofDoc: "Sports_Permit_2026.pdf",
        },
        {
          title: "AI & Robotics Innovation Summit",
          description:
            "Keynote speeches from leading AI researchers, interactive autonomous robot demonstrations, and student research paper showcases.",
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          time: "10:00 AM - 04:30 PM",
          price: 20,
          limit: 100,
          registeredCount: 68,
          isOnline: false,
          location: "Science & Innovation Hub Auditorium",
          mapLink: "https://maps.google.com/?q=Campus+Science+Hub",
          locationDescription:
            "Ground floor convention room.",
          image:
            "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=800&auto=format&fit=crop",
          category: "Technology",
          hostName: "Robotics Club",
          hostId: adminHost._id,
          proofDoc: "Robotics_Summit_Approval.pdf",
        },
        {
          title: "Campus Photography & Film Exhibition",
          description:
            "Exhibition displaying award-winning student photography and short films. Refreshments, artist Q&A session, and community voting.",
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          time: "11:00 AM - 05:00 PM",
          price: 0,
          limit: 120,
          registeredCount: 115,
          isOnline: false,
          location: "Fine Arts Gallery Hall",
          mapLink: "https://maps.google.com/?q=Fine+Arts+Gallery",
          locationDescription:
            "Past Event - Completed Demonstration.",
          image:
            "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?q=80&w=800&auto=format&fit=crop",
          category: "Arts",
          hostName: "Film & Photography Club",
          hostId: adminHost._id,
          proofDoc: "Arts_Exhibition_Doc.pdf",
        },
        {
          title: "Global Startup Pitch Battle 2026",
          description:
            "Student founders pitched venture ideas to angel investors and industry mentors. Cash awards and incubator entry granted.",
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          time: "01:00 PM - 06:00 PM",
          price: 12,
          limit: 150,
          registeredCount: 150,
          isOnline: false,
          location: "Business School Innovation Lab",
          mapLink: "https://maps.google.com/?q=Business+School",
          locationDescription:
            "Past Event - Completed Demonstration.",
          image:
            "https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=800&auto=format&fit=crop",
          category: "Business",
          hostName: "Entrepreneurship Cell",
          hostId: adminHost._id,
          proofDoc: "Pitch_Battle_Approval.pdf",
        },
      ];

      await Event.deleteMany({});
      await Event.insertMany(initialEvents);
      console.log("[Seeding] Successfully seeded 7 demonstration campus events in MongoDB.");
    }
  } catch (err) {
    const e = err as Error;
    console.error("[Seeding] Error seeding initial database:", e.message);
  }
};

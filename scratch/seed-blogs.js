const { neon } = require("@neondatabase/serverless");
require("dotenv").config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not defined in .env");
  process.exit(1);
}

const sql = neon(databaseUrl);

const blogs = [
  {
    title: "Top 10 Must-Have Gadgets of 2025",
    slug: "top-10-gadgets-2025",
    excerpt: "From AI-powered earbuds to foldable displays, discover the tech that's reshaping daily life this year.",
    body: "The world of technology never stops evolving, and 2025 has brought us some of the most exciting gadgets yet. Whether you're a tech enthusiast or just looking to upgrade your everyday tools, there's something for everyone this year. From the latest AI-powered earbuds that can translate languages in real-time, to foldable smartphone displays that finally feel durable and practical, the innovation on display is remarkable. Smart home devices have also taken a leap forward, with whole-home AI assistants that learn your preferences and automate your routines seamlessly. Wearable health tech has matured significantly, with devices that can monitor blood glucose levels non-invasively. The gaming world has also seen huge advancements, with handheld devices powerful enough to run AAA titles at impressive framerates. It's a great time to be a tech consumer.",
    category: "Tech Trends",
    author: "Alex Thompson",
    image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&auto=format&fit=crop"
  },
  {
    title: "Best Budget Smartphones Under $300 in 2025",
    slug: "best-budget-smartphones",
    excerpt: "You don't need to spend a fortune to get a great phone. We tested 15 budget options and ranked the best.",
    body: "The smartphone market in 2025 has never been more competitive at the budget end of the spectrum. Manufacturers have pushed more premium features down to affordable price points, meaning you can now get a great camera, fast processor, and long battery life without breaking the bank. After rigorous testing of 15 devices priced under $300, we've identified the top picks for different use cases. Our overall winner offers a stunning 120Hz OLED display, a versatile triple-camera system, and 5000mAh battery that easily lasts two days. For those who prioritize camera quality, another strong contender features a periscope telephoto lens previously only seen in flagship devices. Gaming-focused users will appreciate the dedicated cooling system and extended battery life in our gaming pick.",
    category: "Smartphones",
    author: "Sarah Chen",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop"
  },
  {
    title: "The Ultimate Smart Home Setup Guide for Beginners",
    slug: "smart-home-setup-guide",
    excerpt: "Learn how to connect your devices, automate routines, and build an energy-efficient smart home from scratch.",
    body: "Building a smart home can seem overwhelming at first, but with the right approach it's surprisingly straightforward. The key is to start with a solid foundation and expand from there. Begin with your Wi-Fi network — you'll want a mesh system that covers every corner of your home without dead spots. Next, choose a primary voice assistant ecosystem, whether that's Amazon Alexa, Google Home, or Apple HomeKit. Once that's decided, start with smart lighting, which offers immediate visual impact and is easy to install. Then move to smart plugs to make your existing appliances smart. Security cameras and smart locks are the next logical step. Finally, integrate everything with automation routines that match your lifestyle — lights that dim at sunset, thermostats that adjust when you leave home, and morning routines that start your coffee maker before your alarm goes off.",
    category: "Smart Home",
    author: "Marcus Johnson",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop"
  },
  {
    title: "Wireless Audio in 2025: ANC Headphones Compared",
    slug: "wireless-audio-review",
    excerpt: "We pit the biggest names in wireless audio against each other. Find out which headphones truly deliver the best sound.",
    body: "Active Noise Cancellation technology has matured considerably, and the gap between budget and premium offerings has narrowed significantly. We tested twelve pairs of wireless headphones across four price categories to find the best value at every level. In our testing, we evaluated noise cancellation effectiveness in various environments including offices, cafes, public transit, and airplanes. Sound quality was assessed with a diverse music library spanning classical, hip-hop, rock, and electronic genres. Comfort was evaluated over extended listening sessions of four or more hours. Battery life was tested with ANC enabled and disabled. Our overall winner combines class-leading noise cancellation with a warm, detailed sound signature and exceptional 30-hour battery life. For those on a tighter budget, our value pick delivers surprisingly effective ANC and balanced sound at under $100.",
    category: "Audio",
    author: "Lisa Park",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop"
  },
  {
    title: "Complete Laptop Buying Guide for 2025",
    slug: "laptop-buying-guide-2025",
    excerpt: "Whether you need a laptop for work, gaming, or creativity, this guide covers every price point and use case.",
    body: "Whether you need a laptop for work, gaming, or creativity, this guide covers every price point and use case. From ultrabooks with amazing battery life to powerhouse systems for content creators, we compare specs, features, and screen quality to help you make an informed choice. Our top picks focus on processor performance, display brightness, keyboard comfort, and build quality.",
    category: "Laptops",
    author: "James Carter",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop"
  }
];

async function run() {
  console.log("Clearing existing blogs...");
  try {
    await sql`TRUNCATE TABLE blogs CASCADE;`;
    console.log("Inserting 5 initial blogs...");
    for (const blog of blogs) {
      await sql`
        INSERT INTO blogs (title, slug, excerpt, body, category, author, image, published_at, created_at)
        VALUES (${blog.title}, ${blog.slug}, ${blog.excerpt}, ${blog.body}, ${blog.category}, ${blog.author}, ${blog.image}, NOW(), NOW());
      `;
    }
    console.log("Successfully seeded 5 blogs!");
  } catch (err) {
    console.error("Error during blog seeding:", err);
  }
}

run();

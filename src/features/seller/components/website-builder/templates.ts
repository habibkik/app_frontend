import type { SiteBlock, SiteConfig } from "./types";
import type { LandingPageTheme } from "../content-studio/types";

export interface WebsiteTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string; // emoji or icon placeholder
  category: string;
  siteConfig: SiteConfig;
  blocks: SiteBlock[];
  theme: LandingPageTheme;
  /** If set, the template uses a fully custom HTML generator instead of standard blocks */
  customHtml?: string;
}

// ─── Evolu E-Bike Template ───────────────────────────────────────

const EVOLU_CUSTOM_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Evolu – Future of E-Bike</title>
<meta name="description" content="Evolu – The Future of E-Bike. Premium electric bikes with smart engineering, bold design, and unmatched performance.">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
:root{--lime:#C7FF2F;--bg-light:#F5F5F5;--bg-dark:#000;--text-primary:#111;--text-secondary:#6B6B6B;--card-dark:#0B0B0B;--radius:16px;--font:'Space Grotesk',system-ui,sans-serif;}
body{font-family:var(--font);color:var(--text-primary);-webkit-font-smoothing:antialiased;overflow-x:hidden;}
a{text-decoration:none;color:inherit;}
img{max-width:100%;display:block;}

/* ── Navbar ── */
.nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:20px 48px;background:transparent;transition:background .3s;}
.nav.scrolled{background:rgba(0,0,0,.85);backdrop-filter:blur(12px);}
.nav-logo{font-size:1.4rem;font-weight:700;letter-spacing:-.02em;}
.nav-menu{display:flex;gap:32px;font-size:.9rem;font-weight:500;color:var(--text-secondary);}
.nav-menu a:hover{color:var(--text-primary);}
.nav-cta{padding:10px 24px;background:var(--text-primary);color:#fff;border-radius:999px;font-size:.85rem;font-weight:600;transition:transform .2s,box-shadow .2s;}
.nav-cta:hover{transform:scale(1.05);box-shadow:0 0 20px rgba(199,255,47,.3);}

/* ── Hero ── */
.hero{min-height:100vh;display:flex;align-items:center;padding:120px 48px 80px;background:var(--bg-light);position:relative;overflow:hidden;}
.hero-content{flex:1;max-width:560px;z-index:2;}
.hero h1{font-size:clamp(3rem,10vw,8.5rem);font-weight:700;line-height:.92;letter-spacing:-.04em;color:var(--text-primary);}
.hero h1 span{display:block;}
.hero-desc{margin-top:24px;font-size:1rem;color:var(--text-secondary);line-height:1.6;max-width:400px;}
.hero-cta{display:inline-flex;align-items:center;gap:8px;margin-top:32px;padding:16px 36px;background:var(--lime);color:#111;border-radius:var(--radius);font-weight:600;font-size:.95rem;transition:transform .2s,box-shadow .2s;border:none;cursor:pointer;}
.hero-cta:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(199,255,47,.4);}
.hero-social{display:flex;align-items:center;gap:12px;margin-top:40px;}
.hero-avatars{display:flex;}
.hero-avatars span{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#C7FF2F,#333);border:2px solid var(--bg-light);margin-left:-10px;display:block;}
.hero-avatars span:first-child{margin-left:0;}
.hero-social-text{font-size:.8rem;color:var(--text-secondary);}
.hero-image{flex:1;display:flex;justify-content:center;align-items:center;position:relative;}
.hero-image img,.hero-image .bike-placeholder{max-height:520px;filter:drop-shadow(0 40px 60px rgba(0,0,0,.15));animation:float 6s ease-in-out infinite;}
.bike-placeholder{width:420px;height:320px;background:linear-gradient(135deg,#e0e0e0 0%,#ccc 50%,#bbb 100%);border-radius:var(--radius);display:flex;align-items:center;justify-content:center;font-size:4rem;}

@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}

/* ── Feature Grid ── */
.features{padding:100px 48px;background:var(--bg-dark);color:#fff;position:relative;}
.features-grid{display:grid;grid-template-columns:1fr 1fr;gap:32px;max-width:1100px;margin:0 auto;}
.feature-number{font-size:.85rem;color:var(--lime);font-weight:600;margin-bottom:16px;letter-spacing:.1em;}
.feature-card{background:var(--card-dark);border-radius:var(--radius);padding:40px;border:1px solid rgba(255,255,255,.06);transition:transform .3s,border-color .3s;}
.feature-card:hover{transform:translateY(-4px);border-color:var(--lime);}
.feature-card h3{font-size:1.6rem;font-weight:700;margin-bottom:12px;letter-spacing:-.02em;}
.feature-card p{color:var(--text-secondary);line-height:1.6;font-size:.9rem;}
.feature-card-image{background:linear-gradient(135deg,#1a1a1a,#0d0d0d);border-radius:var(--radius);padding:40px;border:1px solid rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;min-height:280px;font-size:3rem;}
.feature-outline-cta{display:inline-flex;align-items:center;gap:8px;margin-top:20px;padding:10px 24px;border:1px solid rgba(255,255,255,.2);border-radius:999px;color:#fff;font-size:.85rem;font-weight:500;transition:border-color .2s,color .2s;}
.feature-outline-cta:hover{border-color:var(--lime);color:var(--lime);}
.neon-divider{height:1px;background:linear-gradient(90deg,transparent,var(--lime),transparent);margin:24px 0;opacity:.3;}

/* ── Lifestyle ── */
.lifestyle{position:relative;min-height:500px;overflow:hidden;display:flex;align-items:center;}
.lifestyle-bg{position:absolute;inset:0;background:linear-gradient(135deg,#222 0%,#111 50%,#000 100%);z-index:1;}
.lifestyle-overlay{position:absolute;inset:0;background:linear-gradient(90deg,transparent 40%,rgba(0,0,0,.85));z-index:2;}
.lifestyle-content{position:relative;z-index:3;margin-left:auto;max-width:420px;padding:80px 48px;color:#fff;}
.lifestyle h2{font-size:2.5rem;font-weight:700;letter-spacing:-.03em;margin-bottom:16px;}
.lifestyle p{color:var(--text-secondary);line-height:1.6;margin-bottom:24px;}

/* ── Product Showcase ── */
.showcase{padding:100px 48px;background:var(--bg-light);display:flex;align-items:center;gap:60px;max-width:1200px;margin:0 auto;}
.showcase-text{flex:1;}
.showcase-text h2{font-size:3rem;font-weight:700;letter-spacing:-.03em;margin-bottom:8px;}
.showcase-text p{color:var(--text-secondary);line-height:1.6;max-width:380px;margin-bottom:24px;}
.showcase-image{flex:1;display:flex;align-items:center;justify-content:center;position:relative;}
.showcase-image .product-visual{width:360px;height:280px;background:linear-gradient(135deg,#e8e8e8,#d0d0d0);border-radius:var(--radius);display:flex;align-items:center;justify-content:center;font-size:3.5rem;transition:transform .4s;}
.showcase-image .product-visual:hover{transform:rotate(2deg) scale(1.02);}
.color-dots{display:flex;flex-direction:column;gap:10px;position:absolute;right:-20px;top:50%;transform:translateY(-50%);}
.color-dots span{width:14px;height:14px;border-radius:50%;border:2px solid #ccc;cursor:pointer;transition:transform .2s;}
.color-dots span:hover{transform:scale(1.3);}
.color-dots .active{border-color:var(--lime);box-shadow:0 0 8px rgba(199,255,47,.5);}

/* ── Testimonials ── */
.testimonials{padding:100px 48px;background:var(--bg-dark);color:#fff;text-align:center;}
.testimonials h2{font-size:2.5rem;font-weight:700;letter-spacing:-.03em;margin-bottom:8px;}
.testimonials .subtitle{color:var(--text-secondary);margin-bottom:48px;font-size:.95rem;}
.testimonial-grid{display:flex;gap:24px;justify-content:center;max-width:900px;margin:0 auto;}
.testimonial-card{background:var(--card-dark);border:1px solid rgba(255,255,255,.06);border-radius:var(--radius);padding:32px;text-align:left;flex:1;transition:border-color .3s,transform .3s;}
.testimonial-card:hover{border-color:var(--lime);transform:translateY(-4px);}
.testimonial-card .play-icon{width:48px;height:48px;background:var(--lime);border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:16px;font-size:1.2rem;color:#111;}
.testimonial-card .quote{color:#ccc;line-height:1.6;font-size:.9rem;margin-bottom:12px;}
.testimonial-card .author{font-weight:600;font-size:.85rem;color:var(--lime);}
.testimonial-cta{display:inline-flex;align-items:center;gap:8px;margin-top:40px;padding:12px 28px;border:1px solid rgba(255,255,255,.2);border-radius:999px;color:#fff;font-size:.85rem;font-weight:500;transition:border-color .2s,color .2s;}
.testimonial-cta:hover{border-color:var(--lime);color:var(--lime);}

/* ── Footer ── */
.evolu-footer{background:var(--bg-dark);border-top:1px solid rgba(255,255,255,.06);padding:48px;display:flex;justify-content:space-between;align-items:center;color:var(--text-secondary);font-size:.8rem;}
.evolu-footer-logo{font-size:1.2rem;font-weight:700;color:#fff;}

/* ── Responsive ── */
@media(max-width:768px){
  .nav{padding:16px 20px;}
  .nav-menu{display:none;}
  .hero{flex-direction:column;padding:100px 20px 60px;text-align:center;}
  .hero h1{font-size:3.2rem;}
  .hero-desc,.hero-social{margin-left:auto;margin-right:auto;}
  .hero-image{margin-top:40px;}
  .features{padding:60px 20px;}
  .features-grid{grid-template-columns:1fr;gap:20px;}
  .lifestyle-content{padding:40px 20px;max-width:100%;}
  .showcase{flex-direction:column;padding:60px 20px;gap:32px;}
  .testimonials{padding:60px 20px;}
  .testimonial-grid{flex-direction:column;}
  .evolu-footer{flex-direction:column;gap:16px;text-align:center;}
}
</style>
</head>
<body>

<!-- Navbar -->
<nav class="nav" id="mainNav">
  <div class="nav-logo">Evolu</div>
  <div class="nav-menu">
    <a href="#hero">Home</a>
    <a href="#features">About</a>
    <a href="#showcase">Models</a>
    <a href="#features">Tech</a>
    <a href="#testimonials">Contact</a>
  </div>
  <a href="#" class="nav-cta">Join Waitlist</a>
</nav>

<!-- Hero -->
<section class="hero" id="hero">
  <div class="hero-content">
    <h1><span>Future</span><span>of E-Bike</span></h1>
    <p class="hero-desc">Experience the next generation of urban mobility. Precision-engineered motor, extended-range battery, and intelligent smart controls — all in one breathtaking design.</p>
    <button class="hero-cta">Explore Bike →</button>
    <div class="hero-social">
      <div class="hero-avatars">
        <span></span><span></span><span></span><span></span>
      </div>
      <span class="hero-social-text">Trusted by <strong>15K+</strong> Loyal Customers</span>
    </div>
  </div>
  <div class="hero-image">
    <div class="bike-placeholder">🚲</div>
  </div>
</section>

<!-- Features -->
<section class="features" id="features">
  <div class="features-grid">
    <div class="feature-card">
      <span class="feature-number">01 / 06</span>
      <h3>Smart Engineering</h3>
      <p>Every component is precision-crafted for maximum energy efficiency. Our proprietary power management system adapts to your riding style in real-time.</p>
      <div class="neon-divider"></div>
      <a href="#" class="feature-outline-cta">Learn more →</a>
    </div>
    <div class="feature-card-image">⚡</div>
    <div class="feature-card-image">🔋</div>
    <div class="feature-card">
      <span class="feature-number">02 / 06</span>
      <h3>Aesthetic Meets Function</h3>
      <p>Where bold industrial design meets aerodynamic performance. Every curve serves a purpose — reducing drag, enhancing stability, and turning heads.</p>
      <div class="neon-divider"></div>
      <a href="#" class="feature-outline-cta">Learn more →</a>
    </div>
  </div>
</section>

<!-- Lifestyle -->
<section class="lifestyle">
  <div class="lifestyle-bg"></div>
  <div class="lifestyle-overlay"></div>
  <div class="lifestyle-content">
    <h2>Move at Your Own Pace</h2>
    <p>Whether it's the daily commute or a weekend adventure, Evolu adapts to your rhythm. Feel the freedom of effortless motion.</p>
    <button class="hero-cta">Discover More →</button>
  </div>
</section>

<!-- Product Showcase -->
<section class="showcase" id="showcase">
  <div class="showcase-text">
    <h2>Evolv X</h2>
    <p>Our flagship model combines a carbon-fiber frame with a 750W brushless motor and 100-mile range. Available in four signature colorways.</p>
    <button class="hero-cta">Explore bike →</button>
  </div>
  <div class="showcase-image">
    <div class="product-visual">🚴</div>
    <div class="color-dots">
      <span style="background:#111" class="active"></span>
      <span style="background:#C7FF2F"></span>
      <span style="background:#fff"></span>
      <span style="background:#666"></span>
    </div>
  </div>
</section>

<!-- Testimonials -->
<section class="testimonials" id="testimonials">
  <h2>Riders Who Love the Ride</h2>
  <p class="subtitle">Real stories from real riders around the world</p>
  <div class="testimonial-grid">
    <div class="testimonial-card">
      <div class="play-icon">▶</div>
      <p class="quote">"The Evolv X changed how I commute. Silent, fast, and the battery lasts all week. It's not just a bike — it's a statement."</p>
      <p class="author">— Alex R., Berlin</p>
    </div>
    <div class="testimonial-card">
      <div class="play-icon">▶</div>
      <p class="quote">"I've owned three e-bikes before this one. Nothing comes close to the build quality and ride feel. Absolutely worth every penny."</p>
      <p class="author">— Mia K., Amsterdam</p>
    </div>
    <div class="testimonial-card">
      <div class="play-icon">▶</div>
      <p class="quote">"The smart controls are game-changing. It learns how I ride and adjusts power delivery automatically. Pure engineering magic."</p>
      <p class="author">— James T., San Francisco</p>
    </div>
  </div>
  <a href="#" class="testimonial-cta">See all reviews →</a>
</section>

<!-- Footer -->
<footer class="evolu-footer">
  <div class="evolu-footer-logo">Evolu</div>
  <div>&copy; 2026 Evolu. All rights reserved.</div>
</footer>

<script>
// Navbar scroll effect
window.addEventListener('scroll',()=>{
  document.getElementById('mainNav').classList.toggle('scrolled',window.scrollY>50);
});
</script>
</body>
</html>`;

export const WEBSITE_TEMPLATES: WebsiteTemplate[] = [
  {
    id: "evolu-ebike",
    name: "Evolu – E-Bike",
    description: "Premium futuristic electric bike landing page with neon lime accent, dark/light alternating sections, and bold editorial layout.",
    thumbnail: "🚲",
    category: "Product Launch",
    siteConfig: {
      name: "Evolu",
      tagline: "Future of E-Bike",
      logoUrl: "",
    },
    blocks: [],
    theme: {
      primaryColor: "#C7FF2F",
      secondaryColor: "#000000",
      accentColor: "#C7FF2F",
      textColor: "#111111",
      bgColor: "#F5F5F5",
      headingFont: "'Space Grotesk', system-ui, sans-serif",
      bodyFont: "'Space Grotesk', system-ui, sans-serif",
      layout: "bold",
      borderRadius: "large",
      heroStyle: "split",
    },
    customHtml: EVOLU_CUSTOM_HTML,
  },
  {
    id: "blank",
    name: "Blank Canvas",
    description: "Start from scratch with the default blocks and your own design.",
    thumbnail: "✨",
    category: "Starter",
    siteConfig: {
      name: "My Store",
      tagline: "Quality products, competitive prices",
      logoUrl: "",
    },
    blocks: [],
    theme: {
      primaryColor: "#2563eb",
      secondaryColor: "#1a1a2e",
      accentColor: "#16213e",
      textColor: "#1a1a2e",
      bgColor: "#ffffff",
      headingFont: "Inter, system-ui, sans-serif",
      bodyFont: "Inter, system-ui, sans-serif",
      layout: "classic",
      borderRadius: "medium",
      heroStyle: "centered",
    },
  },
];

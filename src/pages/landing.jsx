import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BrandMark } from "../components/brand-mark";
import "./landing.css";
import {
  ArrowIcon,
  CheckIcon,
  CloseIcon,
  MenuIcon,
  ShieldIcon,
  TrendIcon,
  UsersIcon,
  WalletIcon,
} from "../components/icons";

const savingNames = ["Ajo", "Esusu", "Adashe", "Akawo", "Isusu", "Thrift", "Contribution", "ROSCA"];

const community = [
  { initials: "AO", name: "Amaka", tone: "coral" },
  { initials: "TY", name: "Tayo", tone: "blue" },
  { initials: "NU", name: "Nneka", tone: "gold" },
  { initials: "BA", name: "Bola", tone: "purple" },
];

const testimonials = [
  { quote: "AjoPay gave our office contribution the structure it needed. Everyone sees the same schedule, so there is no confusion.", name: "Kemi Adebayo", role: "Small business owner, Lagos", initials: "KA" },
  { quote: "I joined a school-fees circle and reached my target without borrowing. The reminders kept me consistent every month.", name: "Ibrahim Musa", role: "Parent and civil servant, Abuja", initials: "IM" },
  { quote: "Creating a circle for my family took minutes. We always know whose turn is next and which payments are confirmed.", name: "Ngozi Okafor", role: "Ajo creator, Port Harcourt", initials: "NO" },
];

function useScrollReveal() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const elements = document.querySelectorAll("[data-reveal]");
    if (reduceMotion) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
}

function StoreButton({ store }) {
  return <button className="store-button" type="button" aria-label={`Download AjoPay on ${store}`}><span aria-hidden="true">{store === "App Store" ? "●" : "▶"}</span><span><small>Download on the</small><b>{store}</b></span></button>;
}

function PhoneMockup({ variant = "home" }) {
  return <div className={`marketing-phone marketing-phone--${variant}`}>
    <div className="marketing-phone__speaker" /><div className="marketing-phone__status"><b>9:41</b><span>● ◒ ▰</span></div><div className="marketing-phone__appbar"><span className="mini-logo"><i /><i /><i /></span><span>•••</span></div>
    {variant === "home" ? <><p>Good afternoon, Mayowa</p><h3>Your money, growing together.</h3><div className="phone-balance"><span>Total Ajo balance</span><strong>₦820,000</strong><small>+12.5% this month</small></div><div className="phone-row"><b>Active circles</b><span>See all</span></div><div className="phone-plan"><i className="phone-plan__icon">🏠</i><div><b>New Home Fund</b><small>Round 5 of 8</small></div><strong>₦100k</strong><span><i /></span></div><div className="phone-plan"><i className="phone-plan__icon phone-plan__icon--yellow">✦</i><div><b>December Flex</b><small>Round 7 of 10</small></div><strong>₦20k</strong><span><i /></span></div></> : <><div className="phone-success"><span><CheckIcon /></span><small>PAYOUT RECEIVED</small><h3>₦600,000</h3><p>Family Support Circle</p></div><div className="phone-receipt"><div><span>Paid into</span><b>AjoPay Wallet</b></div><div><span>Reference</span><b>AJP-902184</b></div><div><span>Date</span><b>02 Sep 2026</b></div></div><button>View wallet</button></>}
    <div className="marketing-phone__home" />
  </div>;
}

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [testimonial, setTestimonial] = useState(0);
  useScrollReveal();

  return <div className="landing landing-v2">
    <header className="marketing-nav">
      <BrandMark /><nav aria-label="Marketing navigation"><a href="#products">How it works</a><a href="#why-ajopay">Why AjoPay</a><a href="#stories">Stories</a><a href="#security">Security</a></nav>
      <div className="marketing-nav__actions"><Link to="/login">Sign in</Link><Link to="/register" className="marketing-button marketing-button--dark">Create free account <ArrowIcon /></Link></div>
      <button className="marketing-menu" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle navigation" aria-expanded={menuOpen}>{menuOpen ? <CloseIcon /> : <MenuIcon />}</button>
      {menuOpen && <div className="marketing-mobile-menu"><a href="#products" onClick={() => setMenuOpen(false)}>How it works</a><a href="#why-ajopay" onClick={() => setMenuOpen(false)}>Why AjoPay</a><a href="#stories" onClick={() => setMenuOpen(false)}>Stories</a><a href="#security" onClick={() => setMenuOpen(false)}>Security</a><Link to="/login">Sign in</Link><Link to="/register" className="marketing-button marketing-button--dark">Create free account</Link></div>}
    </header>

    <main>
      <section className="marketing-hero">
        <div className="marketing-hero__copy"><a className="marketing-pill" href="#stories"><span>New</span> Meet the people saving better together <ArrowIcon /></a><h1>Money goals feel easier when we do them <em>together.</em></h1><p>Start or join a trusted savings circle, contribute on your schedule, and receive your payout when it’s your turn.</p><div className="marketing-hero__actions"><Link to="/register" className="marketing-button marketing-button--primary">Start for Free <ArrowIcon /></Link><Link to="/ajos" className="marketing-button marketing-button--outline">Explore savings circles</Link></div></div>
        <div className="marketing-hero__visual" aria-label="Preview of the AjoPay mobile experience"><div className="hero-blob hero-blob--one" /><div className="hero-blob hero-blob--two" /><div className="hero-grid" /><PhoneMockup /><div className="hero-float hero-float--payout"><span><CheckIcon /></span><div><small>Payout received</small><b>+ ₦600,000</b></div></div><div className="hero-float hero-float--members"><div className="proof-avatars">{community.slice(0, 3).map((person) => <span className={`avatar-${person.tone}`} key={person.initials}>{person.initials}</span>)}</div><div><b>8 of 10</b><small>members joined</small></div></div><div className="hero-float hero-float--secure"><ShieldIcon /><span>Protected<br/><b>24 / 7</b></span></div></div>
      </section>

      <section className="marketing-metrics" data-reveal><p>Trusted by people building real-life goals</p><div><strong>₦2.4B+</strong><span>saved together</span></div><div><strong>1,200+</strong><span>active circles</span></div><div><strong>98.7%</strong><span>on-time contributions</span></div><div><strong>4.9 / 5</strong><span>community rating</span></div></section>
      <section className="saving-marquee" aria-label="Different names for community saving"><div>{[...savingNames, ...savingNames].map((name, index) => <span key={`${name}-${index}`}>{name}<i>✦</i></span>)}</div></section>

      <section className="marketing-intro" id="products" data-reveal><span className="marketing-kicker">BUILT AROUND REAL LIFE</span><h2>However you like to save,<br/>there’s a circle for you.</h2><p>Bring your trusted people or discover a verified community. You stay in control of the goal, schedule, and payout order.</p></section>

      <section className="product-story product-story--private">
        <div className="product-story__visual" data-reveal><div className="story-orbit story-orbit--one" /><div className="story-orbit story-orbit--two" /><div className="story-card story-card--group"><div className="story-card__top"><span>Home Builders</span><span>•••</span></div><div className="story-members">{community.map((person) => <span className={`avatar-${person.tone}`} key={person.name}>{person.initials}</span>)}<i>+4</i></div><strong>₦100,000 <small>/ month</small></strong><div className="story-progress"><span style={{ width: "80%" }} /></div><p><span>8 of 10 slots filled</span><b>2 slots left</b></p></div><div className="story-mini story-mini--verified"><ShieldIcon /><span><b>Circle verified</b><small>All members reviewed</small></span></div></div>
        <div className="product-story__copy" data-reveal><span className="story-number">01</span><span className="marketing-kicker">PRIVATE AJO</span><h2>Save with the people you already trust.</h2><p>Create a private savings circle for friends, family, or colleagues. You set the contribution, choose the schedule, and approve every member.</p><ul><li><CheckIcon />You set clear rules from day one</li><li><CheckIcon />Every contribution is tracked</li><li><CheckIcon />Everyone sees the same payout order</li></ul><Link to="/register">Create your circle <ArrowIcon /></Link></div>
      </section>

      <section className="product-story product-story--community" id="why-ajopay">
        <div className="product-story__copy" data-reveal><span className="story-number">02</span><span className="marketing-kicker">COMMUNITY AJO</span><h2>Meet verified savers with goals like yours.</h2><p>Don’t have a circle yet? Explore open Ajos, review each creator’s history, and request the slot that works for your timeline.</p><ul><li><CheckIcon />Reputation you can understand</li><li><CheckIcon />Flexible daily, weekly, or monthly plans</li><li><CheckIcon />No payment before a circle starts</li></ul><Link to="/ajos">Explore open circles <ArrowIcon /></Link></div>
        <div className="product-story__visual product-story__visual--cards" data-reveal><article className="discover-card discover-card--one"><div><span>🏠</span><i>Open</i></div><h3>New Home Fund</h3><strong>₦100,000 <small>monthly</small></strong><p><UsersIcon />8 of 10 members</p><div><span style={{ width: "80%" }} /></div></article><article className="discover-card discover-card--two"><div><span>🎓</span><i>Open</i></div><h3>School Fees Plan</h3><strong>₦75,000 <small>monthly</small></strong><p><UsersIcon />9 of 12 members</p><div><span style={{ width: "75%" }} /></div></article><article className="discover-card discover-card--three"><div><span>✦</span><i>Popular</i></div><h3>December Flex</h3><strong>₦20,000 <small>weekly</small></strong><p><UsersIcon />11 of 15 members</p><div><span style={{ width: "73%" }} /></div></article></div>
      </section>

      <section className="marketing-how" data-reveal><div className="marketing-intro"><span className="marketing-kicker">SIMPLE BY DESIGN</span><h2>From goal to payout<br/>in three clear steps.</h2></div><div className="marketing-steps"><article><span>01</span><div><UsersIcon /></div><h3>Choose your people</h3><p>Create a private circle or find an open one that suits your budget.</p></article><article><span>02</span><div><WalletIcon /></div><h3>Contribute securely</h3><p>Pay from your wallet and follow every confirmed contribution.</p></article><article><span>03</span><div><TrendIcon /></div><h3>Get paid on your turn</h3><p>Your full payout lands safely in your AjoPay wallet on schedule.</p></article></div></section>

      <section className="security-story" id="security"><div className="security-story__copy" data-reveal><span className="marketing-kicker">PEACE OF MIND, BUILT IN</span><h2>Your money deserves more than promises.</h2><p>AjoPay only shows server-confirmed balances and transactions. Sensitive actions require your approval, and every circle keeps a transparent record.</p><div className="security-list"><span><i><ShieldIcon /></i><span><b>Protected transactions</b><small>Your financial information stays encrypted.</small></span></span><span><i><CheckIcon /></i><span><b>Clear, shared records</b><small>No hidden movements or confusing calculations.</small></span></span><span><i><UsersIcon /></i><span><b>Trust through reputation</b><small>Make informed choices with member history.</small></span></span></div><Link to="/register" className="marketing-button marketing-button--light">Start saving safely <ArrowIcon /></Link></div><div className="security-story__visual" data-reveal><div className="security-glow" /><PhoneMockup variant="payout" /><div className="security-seal"><ShieldIcon /><span><b>Secure by design</b><small>Every action tracked</small></span></div></div></section>

      <section className="stories" id="stories" data-reveal><div className="marketing-intro"><span className="marketing-kicker">REAL PEOPLE, REAL PROGRESS</span><h2>Saving stories we love.</h2><p>Goals are personal. Progress feels better when it’s shared.</p></div><div className="testimonial-wrap"><button onClick={() => setTestimonial((testimonial - 1 + testimonials.length) % testimonials.length)} aria-label="Previous story">←</button><article key={testimonial}><span className="quote-mark">“</span><blockquote>{testimonials[testimonial].quote}</blockquote><footer><span>{testimonials[testimonial].initials}</span><div><b>{testimonials[testimonial].name}</b><small>{testimonials[testimonial].role}</small></div></footer></article><button onClick={() => setTestimonial((testimonial + 1) % testimonials.length)} aria-label="Next story">→</button></div><div className="story-dots">{testimonials.map((item, index) => <button className={index === testimonial ? "active" : ""} onClick={() => setTestimonial(index)} aria-label={`Show story from ${item.name}`} key={item.name} />)}</div></section>

      <section className="marketing-cta" data-reveal><div className="cta-ring cta-ring--one" /><div className="cta-ring cta-ring--two" /><span className="marketing-kicker">YOUR NEXT GOAL STARTS HERE</span><h2>Ready to make money moves<br/>with your people?</h2><p>Open your free AjoPay account and start a savings circle in minutes.</p><div><Link to="/register" className="marketing-button marketing-button--light">Create free account <ArrowIcon /></Link></div></section>
    </main>

    <footer className="marketing-footer"><div><div><BrandMark light /><p>Community savings, made clear and dependable.</p></div><div><h3>Product</h3><Link to="/ajos">Explore Ajos</Link><a href="#products">How it works</a><a href="#security">Security</a></div><div><h3>Company</h3><a href="#stories">Stories</a><a href="mailto:hello@ajopay.ng">Contact</a><a href="#">Careers</a></div><div><h3>Support</h3><a href="#">Help centre</a><a href="#">Privacy</a><a href="#">Terms</a></div></div><div><span>© 2026 AjoPay. All rights reserved.</span><span>Made with care in Nigeria 🇳🇬</span></div></footer>
  </div>;
}

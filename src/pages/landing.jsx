import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BrandMark } from "../components/brand-mark";
import { LanguageSelector } from "../components/language-selector";
import { Trans, useTranslation } from "react-i18next";
import { COPYRIGHT_YEAR } from "../config/public-content";
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

const savingNames = [
  "Ajo",
  "Esusu",
  "Adashe",
  "Akawo",
  "Isusu",
  "Thrift",
  "Contribution",
  "ROSCA",
];

const community = [
  { initials: "AO", name: "Amaka", tone: "coral" },
  { initials: "TY", name: "Tayo", tone: "blue" },
  { initials: "NU", name: "Nneka", tone: "gold" },
  { initials: "BA", name: "Bola", tone: "purple" },
];

const testimonials = [
  {
    quote:
      "AjoPay gave our office contribution the structure it needed. Everyone sees the same schedule, so there is no confusion.",
    name: "Kemi Adebayo",
    role: "Small business owner, Lagos",
    initials: "KA",
  },
  {
    quote:
      "I joined a school-fees circle and reached my target without borrowing. The reminders kept me consistent every month.",
    name: "Ibrahim Musa",
    role: "Parent and civil servant, Abuja",
    initials: "IM",
  },
  {
    quote:
      "Creating a circle for my family took minutes. We always know whose turn is next and which payments are confirmed.",
    name: "Ngozi Okafor",
    role: "Ajo creator, Port Harcourt",
    initials: "NO",
  },
];

function useScrollReveal() {
  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const elements = document.querySelectorAll("[data-reveal]");
    if (reduceMotion) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
}

function StoreButton({ store }) {
  const { t } = useTranslation();
  return (
    <button
      className="store-button"
      type="button"
      aria-label={t("landing.downloadOn", { store, defaultValue: `Download AjoPay on ${store}` })}
    >
      <span aria-hidden="true">{store === "App Store" ? "●" : "▶"}</span>
      <span>
        <small>Download on the</small>
        <b>{store}</b>
      </span>
    </button>
  );
}

function PhoneMockup({ variant = "home" }) {
  const { t } = useTranslation();
  return (
    <div className={`marketing-phone marketing-phone--${variant}`}>
      <div className="marketing-phone__speaker" />
      <div className="marketing-phone__status">
        <b>9:41</b>
        <span>● ◒ ▰</span>
      </div>
      <div className="marketing-phone__appbar">
        <span className="mini-logo">
          <i />
          <i />
          <i />
        </span>
        <span>•••</span>
      </div>
      {variant === "home" ? (
        <>
          <p>{t("landing.goodAfternoon", { name: "Mayowa", defaultValue: "Good afternoon, Mayowa" })}</p>
          <h3>{t("landing.moneyGrowing", { defaultValue: "Your money, growing together." })}</h3>
          <div className="phone-balance">
            <span>{t("landing.totalBalance", { defaultValue: "Total Ajo balance" })}</span>
            <strong>₦820,000</strong>
            <small>{t("landing.thisMonth", { value: "+12.5%", defaultValue: "+12.5% this month" })}</small>
          </div>
          <div className="phone-row">
            <b>{t("landing.activeCircles")}</b>
            <span>{t("landing.seeAll", { defaultValue: "See all" })}</span>
          </div>
          <div className="phone-plan">
            <i className="phone-plan__icon">🏠</i>
            <div>
              <b>New Home Fund</b>
              <small>{t("landing.roundOf", { current: 5, total: 8, defaultValue: "Round 5 of 8" })}</small>
            </div>
            <strong>₦100k</strong>
            <span>
              <i />
            </span>
          </div>
          <div className="phone-plan">
            <i className="phone-plan__icon phone-plan__icon--yellow">✦</i>
            <div>
              <b>December Flex</b>
              <small>{t("landing.roundOf", { current: 7, total: 10, defaultValue: "Round 7 of 10" })}</small>
            </div>
            <strong>₦20k</strong>
            <span>
              <i />
            </span>
          </div>
        </>
      ) : (
        <>
          <div className="phone-success">
            <span>
              <CheckIcon />
            </span>
            <small>{t("landing.payoutReceived", { defaultValue: "PAYOUT RECEIVED" })}</small>
            <h3>₦600,000</h3>
            <p>Family Support Circle</p>
          </div>
          <div className="phone-receipt">
            <div>
              <span>{t("landing.paidInto", { defaultValue: "Paid into" })}</span>
              <b>{t("landing.ajoPayWallet", { defaultValue: "AjoPay Wallet" })}</b>
            </div>
            <div>
              <span>{t("landing.reference", { defaultValue: "Reference" })}</span>
              <b>AJP-902184</b>
            </div>
            <div>
              <span>{t("landing.date", { defaultValue: "Date" })}</span>
              <b>02 Sep 2026</b>
            </div>
          </div>
          <button>{t("landing.viewWallet", { defaultValue: "View wallet" })}</button>
        </>
      )}
      <div className="marketing-phone__home" />
    </div>
  );
}

export function LandingPage() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [testimonial, setTestimonial] = useState(0);
  useScrollReveal();

  return (
    <div className="landing landing-v2">
      <header className="marketing-nav">
        <BrandMark />
        <nav aria-label="Marketing navigation">
          <a href="#products">{t("landing.howItWorks")}</a>
          <a href="#why-ajopay">{t("landing.whyAjoPay")}</a>
          <a href="#stories">{t("landing.stories")}</a>
          <a href="#security">{t("landing.security")}</a>
        </nav>
        <div className="marketing-nav__actions">
          <LanguageSelector compact />
          <Link to="/login">{t("landing.signIn")}</Link>
          <Link
            to="/register"
            className="marketing-button marketing-button--dark"
          >
            {t("landing.getStarted")} <ArrowIcon />
          </Link>
        </div>
        <button
          className="marketing-menu"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
        {menuOpen && (
          <div className="marketing-mobile-menu">
            <a href="#products" onClick={() => setMenuOpen(false)}>
              {t("landing.howItWorks")}
            </a>
            <a href="#why-ajopay" onClick={() => setMenuOpen(false)}>
              {t("landing.whyAjoPay")}
            </a>
            <a href="#stories" onClick={() => setMenuOpen(false)}>
              {t("landing.stories")}
            </a>
            <a href="#security" onClick={() => setMenuOpen(false)}>
              {t("landing.security")}
            </a>
            <LanguageSelector />
            <Link to="/login">{t("landing.signIn")}</Link>
            <Link
              to="/register"
              className="marketing-button marketing-button--dark"
            >
              {t("landing.getStarted")}
            </Link>
          </div>
        )}
      </header>

      <main>
        <section className="marketing-hero">
          <div className="marketing-hero__copy">
            <a className="marketing-pill" href="#stories">
              <span>{t("landing.new")}</span> {t("landing.meetSavers")}{" "}
              <ArrowIcon />
            </a>
            <h1>
              <Trans i18nKey="landing.heroTitle" components={{ em: <em /> }} />
            </h1>
            <p>
              {t("landing.heroText")}
            </p>
            <div className="marketing-hero__actions">
              <Link
                to="/register"
                className="marketing-button marketing-button--primary"
              >
                {t("landing.startFree")} <ArrowIcon />
              </Link>
              <Link
                to="/ajos"
                className="marketing-button marketing-button--outline"
              >
                {t("landing.exploreCircles")}
              </Link>
            </div>
          </div>
          <div
            className="marketing-hero__visual"
            aria-label="Illustrative preview of the AjoPay mobile experience"
          >
            <div className="hero-blob hero-blob--one" />
            <div className="hero-blob hero-blob--two" />
            <div className="hero-grid" />
            <PhoneMockup />
            <small className="marketing-hero__disclaimer">Illustrative interface preview</small>
            <div className="hero-float hero-float--payout">
              <span>
                <CheckIcon />
              </span>
              <div>
                <small>{t("landing.payoutReceived", { defaultValue: "Payout received" })}</small>
                <b>+ ₦600,000</b>
              </div>
            </div>
            <div className="hero-float hero-float--members">
              <div className="proof-avatars">
                {community.slice(0, 3).map((person) => (
                  <span
                    className={`avatar-${person.tone}`}
                    key={person.initials}
                  >
                    {person.initials}
                  </span>
                ))}
              </div>
              <div>
                <b>8 of 10</b>
                <small>{t("landing.membersJoined", { defaultValue: "members joined" })}</small>
              </div>
            </div>
            <div className="hero-float hero-float--secure">
              <ShieldIcon />
              <span>
                {t("landing.protected", { defaultValue: "Protected" })}
                <br />
                <b>24 / 7</b>
              </span>
            </div>
          </div>
        </section>

        <section className="story-journey" id="products">
          <header className="story-journey__header" id="why-ajopay" data-reveal>
            <span className="marketing-kicker">{t("landing.journeyKicker")}</span>
            <h2><Trans i18nKey="landing.journeyTitle" components={{ br: <br /> }} /></h2>
            <p>{t("landing.journeyIntro")}</p>
          </header>

          <div className="story-journey__track">
            <svg className="story-journey__line" viewBox="0 0 100 1000" preserveAspectRatio="none" aria-hidden="true">
              <path d="M 68 0 C 68 100, 32 130, 32 250 S 68 370, 68 500 S 32 620, 32 750 S 68 900, 68 1000" />
            </svg>

            <article className="journey-card journey-card--left" data-reveal>
              <span className="journey-card__number">01</span>
              <div className="journey-card__visual journey-card__visual--create">
                <div className="journey-window">
                  <div className="journey-window__top"><span /><span /><span /><b>New savings circle</b></div>
                  <label>Circle name<strong>Home Builders</strong></label>
                  <div className="journey-window__fields"><label>Contribution<strong>₦100,000</strong></label><label>Frequency<strong>Monthly</strong></label></div>
                  <button><CheckIcon /> Circle ready</button>
                </div>
              </div>
              <div className="journey-card__copy"><span className="marketing-kicker">{t("landing.startGoal")}</span><h3>{t("landing.createCircle")}</h3><p>{t("landing.createCircleText")}</p><Link to="/register">{t("landing.createAjo")} <ArrowIcon /></Link></div>
            </article>

            <article className="journey-card journey-card--right" data-reveal>
              <span className="journey-card__number">02</span>
              <div className="journey-card__visual journey-card__visual--people">
                <div className="journey-people-card"><span className="avatar-coral">AO</span><div><b>Amaka Okoye</b><small>★ 4.9 · 8 completed circles</small></div><i><CheckIcon /></i></div>
                <div className="journey-people-card"><span className="avatar-blue">TY</span><div><b>Tayo Yusuf</b><small>★ 4.8 · 5 completed circles</small></div><i><CheckIcon /></i></div>
                <div className="journey-people-card"><span className="avatar-gold">NU</span><div><b>Nneka Udo</b><small>★ 5.0 · 11 completed circles</small></div><i><CheckIcon /></i></div>
                <div className="journey-members-pill"><UsersIcon /> 8 of 10 members joined</div>
              </div>
              <div className="journey-card__copy"><span className="marketing-kicker">{t("landing.bringPeople")}</span><h3>{t("landing.buildCircle")}</h3><p>{t("landing.buildCircleText")}</p><Link to="/ajos">{t("landing.exploreCircles")} <ArrowIcon /></Link></div>
            </article>

            <article className="journey-card journey-card--left" data-reveal>
              <span className="journey-card__number">03</span>
              <div className="journey-card__visual journey-card__visual--progress">
                <div className="journey-progress-card"><div><span>Home Builders</span><b>Round 5 of 8</b></div><strong>₦800,000</strong><small>saved together so far</small><div className="journey-progress-bar"><span /></div><footer><span><CheckIcon /> 8 contributions confirmed</span><b>80%</b></footer></div>
                <div className="journey-payment"><i><WalletIcon /></i><span><small>Your contribution</small><b>₦100,000 confirmed</b></span></div>
              </div>
              <div className="journey-card__copy"><span className="marketing-kicker">{t("landing.keepMomentum")}</span><h3>{t("landing.contributeClearly")}</h3><p>{t("landing.contributeText")}</p><Link to="/register">{t("landing.startSaving")} <ArrowIcon /></Link></div>
            </article>

            <article className="journey-card journey-card--right" data-reveal>
              <span className="journey-card__number">04</span>
              <div className="journey-card__visual journey-card__visual--payout">
                <div className="journey-confetti journey-confetti--one">✦</div><div className="journey-confetti journey-confetti--two">●</div><div className="journey-confetti journey-confetti--three">◆</div>
                <div className="journey-payout-card"><span><CheckIcon /></span><small>PAYOUT RECEIVED</small><strong>₦600,000</strong><p>Right on schedule</p><div><ShieldIcon /> Confirmed by AjoPay</div></div>
              </div>
              <div className="journey-card__copy"><span className="marketing-kicker">{t("landing.yourTurn")}</span><h3>{t("landing.receivePayout")}</h3><p>{t("landing.receiveText")}</p><Link to="/register">{t("landing.beginJourney")} <ArrowIcon /></Link></div>
            </article>
          </div>
        </section>

        <section className="marketing-metrics" data-reveal>
          <p>Illustrative examples of the progress AjoPay is designed to support.</p>
          <div>
            <strong>₦2.4B+</strong>
            <span>{t("landing.savedTogether")}</span>
          </div>
          <div>
            <strong>1,200+</strong>
            <span>{t("landing.activeCircles")}</span>
          </div>
          <div>
            <strong>98.7%</strong>
            <span>{t("landing.onTime")}</span>
          </div>
          <div>
            <strong>4.9 / 5</strong>
            <span>{t("landing.rating")}</span>
          </div>
        </section>
        <section
          className="saving-marquee"
          aria-label="Different names for community saving"
        >
          <div>
            {[...savingNames, ...savingNames].map((name, index) => (
              <span key={`${name}-${index}`}>
                {name}
                <i>✦</i>
              </span>
            ))}
          </div>
        </section>

        <section className="marketing-how" data-reveal>
          <div className="marketing-intro">
            <span className="marketing-kicker">{t("landing.simpleKicker")}</span>
            <h2>
              <Trans i18nKey="landing.threeSteps" components={{ br: <br /> }} />
            </h2>
          </div>
          <div className="marketing-steps">
            <article>
              <span>01</span>
              <div>
                <UsersIcon />
              </div>
              <h3>{t("landing.choosePeople")}</h3>
              <p>{t("landing.choosePeopleText")}</p>
            </article>
            <article>
              <span>02</span>
              <div>
                <WalletIcon />
              </div>
              <h3>{t("landing.contributeSecurely")}</h3>
              <p>{t("landing.contributeSecurelyText")}</p>
            </article>
            <article>
              <span>03</span>
              <div>
                <TrendIcon />
              </div>
              <h3>{t("landing.paidTurn")}</h3>
              <p>{t("landing.paidTurnText")}</p>
            </article>
          </div>
        </section>

        <section className="security-story" id="security">
          <div className="security-story__copy" data-reveal>
            <span className="marketing-kicker">{t("landing.peaceKicker")}</span>
            <h2>{t("landing.moneyDeserves")}</h2>
            <p>{t("landing.securityText")}</p>
            <div className="security-list">
              <span>
                <i>
                  <ShieldIcon />
                </i>
                <span>
                  <b>{t("landing.protectedTransactions")}</b>
                  <small>{t("landing.protectedTransactionsText")}</small>
                </span>
              </span>
              <span>
                <i>
                  <CheckIcon />
                </i>
                <span>
                  <b>{t("landing.sharedRecords")}</b>
                  <small>{t("landing.sharedRecordsText")}</small>
                </span>
              </span>
              <span>
                <i>
                  <UsersIcon />
                </i>
                <span>
                  <b>{t("landing.trustReputation")}</b>
                  <small>{t("landing.trustReputationText")}</small>
                </span>
              </span>
            </div>
            <Link
              to="/register"
              className="marketing-button marketing-button--light"
            >
              {t("landing.startSafely")} <ArrowIcon />
            </Link>
          </div>
          <div className="security-story__visual" data-reveal>
            <div className="security-glow" />
            <PhoneMockup variant="payout" />
            <div className="security-seal">
              <ShieldIcon />
              <span>
                <b>Secure by design</b>
                <small>Every action tracked</small>
              </span>
            </div>
          </div>
        </section>

        <section className="stories" id="stories" data-reveal>
          <div className="marketing-intro">
            <span className="marketing-kicker">{t("landing.realPeople")}</span>
            <h2>{t("landing.savingStories")}</h2>
            <p>{t("landing.personalGoals")}</p>
          </div>
          <div className="testimonial-wrap">
            <button
              onClick={() =>
                setTestimonial(
                  (testimonial - 1 + testimonials.length) % testimonials.length,
                )
              }
              aria-label={t("landing.previousStory")}
            >
              ←
            </button>
            <article key={testimonial}>
              <span className="quote-mark">“</span>
              <blockquote>{testimonials[testimonial].quote}</blockquote>
              <footer>
                <span>{testimonials[testimonial].initials}</span>
                <div>
                  <b>{testimonials[testimonial].name}</b>
                  <small>{testimonials[testimonial].role}</small>
                </div>
              </footer>
            </article>
            <button
              onClick={() =>
                setTestimonial((testimonial + 1) % testimonials.length)
              }
              aria-label={t("landing.nextStory")}
            >
              →
            </button>
          </div>
          <div className="story-dots">
            {testimonials.map((item, index) => (
              <button
                className={index === testimonial ? "active" : ""}
                onClick={() => setTestimonial(index)}
                aria-label={t("landing.showStory", { name: item.name })}
                key={item.name}
              />
            ))}
          </div>
        </section>

        <section className="marketing-cta" data-reveal>
          <div className="cta-ring cta-ring--one" />
          <div className="cta-ring cta-ring--two" />
          <span className="marketing-kicker">{t("landing.nextGoal")}</span>
          <h2>
            <Trans i18nKey="landing.ready" components={{ br: <br /> }} />
          </h2>
          <p>
            {t("landing.openAccount")}
          </p>
          <div>
            <Link
              to="/register"
              className="marketing-button marketing-button--light"
            >
              {t("landing.createFree")} <ArrowIcon />
            </Link>
          </div>
        </section>
      </main>

      <footer className="marketing-footer">
        <div>
          <div>
            <BrandMark light />
            <p>{t("landing.footerText")}</p>
          </div>
          <div>
            <h3>{t("landing.product")}</h3>
            <Link to="/ajos">{t("landing.exploreAjos")}</Link>
            <a href="#products">{t("landing.howItWorks")}</a>
            <a href="#security">{t("landing.security")}</a>
          </div>
          {/* <div>
            <h3>Company</h3>
            <a href="#stories">Stories</a>
            <a href="mailto:hello@ajopay.ng">Contact</a>
            <a href="#">Careers</a>
          </div> */}
          <div>
            <h3>{t("landing.support")}</h3>
            <a href="#">{t("landing.helpCentre")}</a>
            <Link to="/privacy">{t("landing.privacy")}</Link>
            <Link to="/terms">{t("landing.terms")}</Link>
          </div>
        </div>
        <div>
          <span>© {COPYRIGHT_YEAR} AjoPay. All rights reserved.</span>
          <span>{t("landing.madeNigeria")}</span>
        </div>
      </footer>
    </div>
  );
}

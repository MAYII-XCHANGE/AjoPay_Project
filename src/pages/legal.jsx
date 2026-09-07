import { useEffect } from "react";
import { Link } from "react-router-dom";
import { BrandMark } from "../components/brand-mark";
import { ArrowIcon, ShieldIcon } from "../components/icons";
import { COPYRIGHT_YEAR, LEGAL_LAST_UPDATED } from "../config/public-content";
import "./legal.css";

const termsSections = [
  {
    id: "agreement",
    title: "1. Agreement to these Terms",
    content: (
      <>
        <p>
          These Terms of Service govern your access to and use of AjoPay’s
          website, applications, wallet tools, savings-circle features, and
          related services (collectively, the “Services”). By creating an
          account or using the Services, you agree to these Terms and our
          Privacy Policy.
        </p>
        <p>
          If you do not agree, do not access or use the Services. If you use
          AjoPay for an organisation or another person, you confirm that you
          have authority to accept these Terms on their behalf.
        </p>
      </>
    ),
  },
  {
    id: "eligibility",
    title: "2. Eligibility and your account",
    content: (
      <>
        <p>
          You must be legally capable of entering a binding agreement and meet
          any minimum age, identity, residency, or verification requirements
          shown during registration. You must provide accurate information and
          keep it current.
        </p>
        <ul>
          <li>Keep your password, verification codes, and devices secure.</li>
          <li>Do not share, sell, or transfer your AjoPay account.</li>
          <li>Notify us promptly if you suspect unauthorised access.</li>
          <li>You are responsible for activity authorised through your account.</li>
        </ul>
      </>
    ),
  },
  {
    id: "services",
    title: "3. How the Services work",
    content: (
      <>
        <p>
          AjoPay provides technology for creating, joining, and managing
          rotating savings circles, recording contributions, receiving
          scheduled payouts, and managing supported wallet transactions.
          Product availability may depend on your location, verification
          status, and the capabilities of our payment partners.
        </p>
        <p>
          AjoPay may provide records, reminders, schedules, ratings, and other
          coordination tools. You remain responsible for reviewing a circle’s
          amount, frequency, members, payout order, and rules before joining.
        </p>
      </>
    ),
  },
  {
    id: "circles",
    title: "4. Contributions, circles, and payouts",
    content: (
      <>
        <p>
          When you join a circle, you authorise the contributions and payout
          schedule presented to you. Contributions may become committed or
          non-refundable once processed or allocated to a circle, except where
          required by law or expressly stated in the applicable circle rules.
        </p>
        <ul>
          <li>Make contributions by the stated due dates.</li>
          <li>Maintain enough available funds for authorised payments.</li>
          <li>Review payout details before confirming a transaction.</li>
          <li>Resolve member disputes respectfully and provide truthful records.</li>
        </ul>
        <p>
          Processing times can be affected by banks, payment processors,
          verification reviews, network interruptions, weekends, or public
          holidays. A displayed transaction is final only when marked as
          successfully confirmed.
        </p>
      </>
    ),
  },
  {
    id: "fees",
    title: "5. Fees and payment authorisation",
    content: (
      <>
        <p>
          Any applicable fee will be shown before you authorise a transaction.
          By confirming a payment, you authorise AjoPay and its payment partners
          to debit the selected payment method for the disclosed amount.
        </p>
        <p>
          Your bank or provider may charge separate fees. You are responsible
          for taxes or government charges that legally apply to your use of the
          Services.
        </p>
      </>
    ),
  },
  {
    id: "verification",
    title: "6. Verification and risk checks",
    content: (
      <>
        <p>
          We may request identity, contact, bank-account, source-of-funds, or
          other information needed to protect users, prevent fraud, satisfy
          legal obligations, or enable a feature. We may delay, limit, reject,
          or review activity where information is incomplete or risk is
          detected.
        </p>
        <p>
          A verification badge or community rating is a trust signal based on
          available information; it is not a guarantee of another member’s
          identity, conduct, creditworthiness, or future performance.
        </p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "7. Acceptable use",
    content: (
      <>
        <p>You must not use AjoPay to:</p>
        <ul>
          <li>break the law, facilitate fraud, or launder illicit funds;</li>
          <li>impersonate someone or submit false or misleading information;</li>
          <li>harass members or manipulate ratings, payouts, or circle records;</li>
          <li>bypass security controls or access another user’s account;</li>
          <li>introduce malicious code, scrape the Services, or disrupt availability;</li>
          <li>use the Services for prohibited goods, sanctions evasion, or abuse.</li>
        </ul>
      </>
    ),
  },
  {
    id: "third-parties",
    title: "8. Banks and third-party services",
    content: (
      <p>
        Some transactions and features are provided with banks, identity
        providers, payment processors, communications providers, or other third
        parties. Their terms and privacy notices may also apply. We are not
        responsible for services that a third party controls, but we will work
        to help investigate eligible transaction issues.
      </p>
    ),
  },
  {
    id: "suspension",
    title: "9. Suspension and account closure",
    content: (
      <>
        <p>
          You may request account closure from your profile settings, subject
          to pending transactions, outstanding obligations, retention duties,
          and any necessary investigation. We may restrict or suspend access to
          protect users, comply with law, investigate misuse, or enforce these
          Terms.
        </p>
        <p>
          Where reasonably possible, we will explain a restriction and provide
          a path to review. Provisions that should logically survive closure—
          including payment obligations, ownership, disclaimers, and dispute
          terms—will continue to apply.
        </p>
      </>
    ),
  },
  {
    id: "ownership",
    title: "10. Intellectual property",
    content: (
      <p>
        AjoPay and its licensors own the Services, software, brand, content,
        and related intellectual property. We give you a limited, personal,
        revocable, non-transferable right to use the Services as intended. You
        retain ownership of content you submit and grant us the permissions
        reasonably needed to host, process, display, and protect it while
        providing the Services.
      </p>
    ),
  },
  {
    id: "disclaimers",
    title: "11. Important financial disclaimers",
    content: (
      <>
        <p>
          AjoPay’s circle-management tools are not financial, investment, tax,
          or legal advice. Participation in a savings circle involves member
          and payment risk. Past contribution history or ratings do not promise
          future performance, and AjoPay does not promise investment returns.
        </p>
        <p>
          We aim to keep the Services reliable and accurate, but availability
          may occasionally be interrupted. Nothing in these Terms excludes a
          warranty, duty, or remedy that cannot legally be excluded.
        </p>
      </>
    ),
  },
  {
    id: "liability",
    title: "12. Responsibility and liability",
    content: (
      <p>
        To the extent permitted by applicable law, AjoPay is not responsible
        for indirect or consequential loss, losses caused solely by another
        member or third-party service, or losses caused by your failure to
        secure your account. Any limitation will be applied fairly and will not
        restrict liability that the law does not allow us to limit.
      </p>
    ),
  },
  {
    id: "changes",
    title: "13. Changes to these Terms",
    content: (
      <p>
        We may update these Terms to reflect new features, legal requirements,
        security needs, or business changes. We will publish the revised date
        and provide additional notice when a change materially affects your
        rights. Continuing to use the Services after the effective date means
        the updated Terms apply.
      </p>
    ),
  },
  {
    id: "law-disputes",
    title: "14. Governing law and disputes",
    content: (
      <p>
        These Terms are governed by the laws of the Federal Republic of
        Nigeria. Please contact us first so we can try to resolve a concern
        promptly. If informal resolution is unsuccessful, disputes may be
        submitted to a court of competent jurisdiction in Nigeria, subject to
        any mandatory consumer rights or dispute process that applies.
      </p>
    ),
  },
  {
    id: "terms-contact",
    title: "15. Contact us",
    content: (
      <p>
        Questions about these Terms can be sent to{` `}
        <a href="mailto:hello@ajopay.ng">hello@ajopay.ng</a>. Please include
        the email connected to your account and enough detail for us to review
        your request safely.
      </p>
    ),
  },
];

const privacySections = [
  {
    id: "privacy-scope",
    title: "1. Scope of this Policy",
    content: (
      <p>
        This Privacy Policy explains how AjoPay collects, uses, stores, shares,
        and protects personal data when you use our website, applications,
        wallet features, savings-circle tools, customer support, and related
        services. It should be read together with our Terms of Service and any
        notice shown when information is collected.
      </p>
    ),
  },
  {
    id: "data-collected",
    title: "2. Information we collect",
    content: (
      <>
        <p>Depending on the features you use, we may collect:</p>
        <ul>
          <li><b>Identity and profile data:</b> name, date of birth, photograph, account ID, verification status, and government-issued identity information where required.</li>
          <li><b>Contact data:</b> email address, phone number, residential address, and communication preferences.</li>
          <li><b>Financial and transaction data:</b> payment references, wallet activity, linked bank details, contribution history, payout schedules, fees, and transaction status. Full payment credentials may be processed directly by authorised payment partners.</li>
          <li><b>Circle and community data:</b> memberships, invitations, roles, ratings, disputes, and information you choose to share with a circle.</li>
          <li><b>Device and usage data:</b> IP address, device and browser type, identifiers, login activity, diagnostic records, and interactions with the Services.</li>
          <li><b>Support and communications:</b> messages, feedback, complaints, and records needed to resolve a request.</li>
        </ul>
      </>
    ),
  },
  {
    id: "data-use",
    title: "3. How we use personal data",
    content: (
      <ul>
        <li>create, verify, secure, and support your account;</li>
        <li>process wallet activity, contributions, payouts, and transaction records;</li>
        <li>operate circles, reminders, invitations, ratings, and account features;</li>
        <li>prevent fraud, abuse, money laundering, and unauthorised access;</li>
        <li>provide support and communicate service or security updates;</li>
        <li>analyse and improve performance, reliability, accessibility, and design;</li>
        <li>meet legal, regulatory, audit, reporting, and dispute-resolution duties;</li>
        <li>send optional marketing where you have consented or may lawfully opt out.</li>
      </ul>
    ),
  },
  {
    id: "lawful-bases",
    title: "4. Lawful bases for processing",
    content: (
      <p>
        We process personal data where necessary to perform our agreement with
        you, comply with a legal obligation, protect vital interests, carry out
        tasks permitted in the public interest, pursue a legitimate interest
        that does not override your rights, or where you have given consent.
        Where processing relies on consent, you may withdraw it without
        affecting earlier lawful processing.
      </p>
    ),
  },
  {
    id: "sharing",
    title: "5. When we share information",
    content: (
      <>
        <p>We may share only what is reasonably necessary with:</p>
        <ul>
          <li>banks, payment processors, verification providers, cloud hosts, communications vendors, analytics providers, and professional advisers working for us;</li>
          <li>members of your circle, where names, contribution status, payout order, roles, or ratings are needed to operate the group transparently;</li>
          <li>regulators, courts, law-enforcement bodies, or other authorities where required or lawfully requested;</li>
          <li>a successor organisation in a merger, financing, restructuring, or sale, subject to appropriate safeguards.</li>
        </ul>
        <p>We do not sell personal data in exchange for money.</p>
      </>
    ),
  },
  {
    id: "transfers",
    title: "6. International data transfers",
    content: (
      <p>
        Some trusted service providers may process information outside Nigeria.
        Where personal data is transferred internationally, we use a transfer
        mechanism and safeguards required by applicable data-protection law,
        taking account of the destination and the nature of the information.
      </p>
    ),
  },
  {
    id: "retention",
    title: "7. How long we keep information",
    content: (
      <p>
        We retain personal data only for as long as needed for the purposes
        described here, including to provide the Services, maintain transaction
        and audit records, prevent fraud, resolve disputes, and meet financial
        or legal obligations. Retention periods vary by record type. When data
        is no longer required, we delete, anonymise, or securely isolate it.
      </p>
    ),
  },
  {
    id: "security",
    title: "8. How we protect information",
    content: (
      <p>
        We use administrative, technical, and physical safeguards designed to
        protect personal data, including access controls, encryption where
        appropriate, monitoring, secure development practices, and vendor
        reviews. No system is completely secure, so you should also use a
        unique password, protect verification codes, and report suspicious
        activity immediately.
      </p>
    ),
  },
  {
    id: "rights",
    title: "9. Your privacy rights",
    content: (
      <>
        <p>
          Subject to applicable exceptions, the Nigeria Data Protection Act
          2023 gives data subjects rights that may include the right to:
        </p>
        <ul>
          <li>be informed about processing and access your personal data;</li>
          <li>correct inaccurate or incomplete data;</li>
          <li>request deletion or restriction in eligible circumstances;</li>
          <li>object to certain processing and withdraw consent;</li>
          <li>receive eligible data in a portable format;</li>
          <li>seek human review of qualifying automated decisions;</li>
          <li>complain to the Nigeria Data Protection Commission.</li>
        </ul>
        <p>
          To make a request, email <a href="mailto:hello@ajopay.ng">hello@ajopay.ng</a>.
          We may verify your identity before acting and may retain information
          where the law permits or requires it. You can learn more from the{` `}
          <a href="https://www.ndpc.gov.ng/" target="_blank" rel="noreferrer">Nigeria Data Protection Commission</a>.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "10. Cookies and similar technology",
    content: (
      <p>
        We may use essential browser storage and cookies to keep you signed in,
        remember preferences, protect sessions, and operate the Services. If we
        use optional analytics or advertising cookies, we will provide choices
        where required. You can also manage cookies through your browser, but
        blocking essential storage may prevent some features from working.
      </p>
    ),
  },
  {
    id: "children",
    title: "11. Children’s privacy",
    content: (
      <p>
        AjoPay is not intended for children who cannot legally consent to the
        Services. We do not knowingly create accounts for children contrary to
        applicable law. If you believe a child’s information was provided
        improperly, contact us so we can investigate and take appropriate
        action.
      </p>
    ),
  },
  {
    id: "privacy-changes",
    title: "12. Changes to this Policy",
    content: (
      <p>
        We may update this Policy when our Services, practices, or legal duties
        change. We will post the new version with a revised date and provide
        additional notice when a material change requires it.
      </p>
    ),
  },
  {
    id: "privacy-contact",
    title: "13. Contact and complaints",
    content: (
      <>
        <p>
          For privacy questions or requests, email{` `}
          <a href="mailto:hello@ajopay.ng">hello@ajopay.ng</a>. Please do not
          send passwords, PINs, or one-time verification codes.
        </p>
        <p>
          You also have the right to contact the Nigeria Data Protection
          Commission through its official website if you believe your concern
          has not been resolved.
        </p>
      </>
    ),
  },
];

function LegalPage({ type }) {
  const isPrivacy = type === "privacy";
  const title = isPrivacy ? "Privacy Policy" : "Terms of Service";
  const eyebrow = isPrivacy ? "YOUR DATA, RESPECTED" : "CLEAR TERMS, FAIR USE";
  const introduction = isPrivacy
    ? "How AjoPay handles and protects the information entrusted to us."
    : "The rules that help keep AjoPay useful, transparent, and safe for everyone.";
  const sections = isPrivacy ? privacySections : termsSections;

  useEffect(() => {
    document.title = `${title} | AjoPay`;
    window.scrollTo(0, 0);
    return () => {
      document.title = "AjoPay";
    };
  }, [title]);

  return (
    <div className="legal-page" id="legal-top">
      <header className="legal-nav">
        <Link to="/" aria-label="AjoPay home"><BrandMark /></Link>
        <nav aria-label="Legal navigation">
          <Link className={!isPrivacy ? "active" : ""} to="/terms">Terms</Link>
          <Link className={isPrivacy ? "active" : ""} to="/privacy">Privacy</Link>
          <Link className="legal-nav__account" to="/register">Create account <ArrowIcon /></Link>
        </nav>
      </header>

      <main>
        <section className="legal-hero">
          <span className="legal-kicker"><ShieldIcon /> {eyebrow}</span>
          <h1>{title}</h1>
          <p>{introduction}</p>
          <div><span>Effective date</span><b>{LEGAL_LAST_UPDATED}</b></div>
        </section>

        <div className="legal-layout">
          <aside>
            <span>ON THIS PAGE</span>
            <nav aria-label={`${title} table of contents`}>
              {sections.map((section) => <a href={`#${section.id}`} key={section.id}>{section.title.replace(/^\d+\.\s/, "")}</a>)}
            </nav>
            <div className="legal-help">
              <ShieldIcon />
              <b>Need clarification?</b>
              <a href="mailto:hello@ajopay.ng">Contact AjoPay support</a>
            </div>
          </aside>

          <article className="legal-document">
            <div className="legal-summary">
              <b>In plain language</b>
              <p>
                {isPrivacy
                  ? "We collect the information needed to run and secure AjoPay, use it responsibly, and give you meaningful control over it."
                  : "Use AjoPay honestly, protect your account, understand each circle before joining, and contact us quickly if something goes wrong."}
              </p>
            </div>
            {sections.map((section) => (
              <section id={section.id} key={section.id}>
                <h2>{section.title}</h2>
                {section.content}
              </section>
            ))}
          </article>
        </div>
      </main>

      <footer className="legal-footer">
        <BrandMark light />
        <p>Save, manage money, and reach your goals with confidence.</p>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </nav>
        <span>© {COPYRIGHT_YEAR} AjoPay. All rights reserved.</span>
      </footer>
    </div>
  );
}

export function TermsPage() {
  return <LegalPage type="terms" />;
}

export function PrivacyPage() {
  return <LegalPage type="privacy" />;
}

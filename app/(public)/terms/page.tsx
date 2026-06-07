import type { Metadata } from 'next';
import { LegalPolicyPage } from '@/components/legal-policy-page';

export const metadata: Metadata = {
  title: 'Terms of Service | Zyng',
  description: 'Read the Zyng Terms of Service for campus, alumni, marketplace, messaging, referrals, jobs, events, rooms, and AI-assisted features.',
};

const sections = [
  {
    title: 'Agreement to these Terms',
    lead: 'These Terms of Service govern access to Zyng, including student, alumni, staff, partner, marketplace, jobs, events, rooms, messaging, portfolio, referral, search, and community features.',
    items: [
      'By creating an account, browsing public pages, joining a school community, posting content, using messaging, submitting forms, or otherwise using Zyng, you agree to these Terms and any additional policies referenced here.',
      'If your school, alumni organization, employer, event organizer, or marketplace partner has additional rules for a specific community or feature, those rules may apply alongside these Terms.',
      'If you use Zyng on behalf of an organization, you confirm that you are authorized to bind that organization and that all users you invite will follow these Terms.',
    ],
  },
  {
    title: 'Eligibility and School Identity',
    lead: 'Zyng is built for people connected to higher schools and structured learning communities, including universities, polytechnics, colleges, institutes, academies, and approved alumni networks.',
    items: [
      'You must provide accurate registration information, including school, faculty, department, program, graduation status, and other profile details where requested.',
      'You may not create accounts using false school affiliation, misleading alumni status, fabricated verification details, or another person’s credentials.',
      'We may verify identity, school membership, graduation status, alumni status, referral eligibility, or organizational authority using documents, institutional records, school email domains, geolocation, trusted administrators, or other reasonable methods.',
      'We may reject, suspend, limit, or remove accounts where the information provided is inaccurate, unsafe, fraudulent, or unverifiable.',
    ],
  },
  {
    title: 'Accounts, Security, and Recovery',
    lead: 'You are responsible for keeping your account secure and for activity that happens through your account, personas, devices, credentials, and sessions.',
    items: [
      'Keep your password, phone, email, recovery codes, and session access confidential. Notify us quickly if you believe your account has been compromised.',
      'You may not sell, rent, transfer, share, or operate an account for someone else without our written permission.',
      'We may use login throttling, device checks, recovery flows, fraud screening, maintenance restrictions, or administrative review to protect accounts and platform integrity.',
      'Account recovery may require proof of ownership. We may deny recovery requests where the request appears fraudulent, incomplete, or unsafe.',
    ],
  },
  {
    title: 'Personas and Semi-Anonymous Use',
    lead: 'Personas are designed to let users participate with context and privacy while keeping the platform understandable and safer.',
    items: [
      'You remain responsible for all content, messages, listings, applications, comments, replies, reactions, reports, and transactions made through your personas.',
      'Personas may not be used to impersonate, harass, mislead, defraud, evade moderation, manipulate trust scores, or create false community consensus.',
      'Zyng may reveal limited account-level information internally, to moderators, or to authorized parties when needed for safety, legal compliance, abuse prevention, support, or enforcement.',
      'We may remove, rename, restrict, or merge personas that violate these Terms, infringe rights, create confusion, or harm community trust.',
    ],
  },
  {
    title: 'Content You Submit',
    lead: 'You own your content, but you grant Zyng permission to host and use it so the service can operate.',
    items: [
      'Content includes posts, replies, media, messages, reports, feedback, portfolio information, job applications, event submissions, room content, marketplace listings, profile details, personas, reactions, and any files or metadata you provide.',
      'You grant Zyng a worldwide, non-exclusive, royalty-free license to host, store, reproduce, display, format, moderate, analyze, transmit, and distribute your content as needed to operate, improve, secure, and promote the service.',
      'You represent that you have the rights needed to submit your content and that your content does not violate law, privacy rights, intellectual property rights, school rules, or these Terms.',
      'We may remove, downrank, label, restrict, preserve, or disclose content when needed for safety, moderation, legal process, product integrity, or community operations.',
    ],
  },
  {
    title: 'Acceptable Use',
    lead: 'Zyng should be useful, expressive, and honest. You may not use the platform in ways that harm people, communities, systems, or trust.',
    items: [
      'Do not harass, threaten, stalk, exploit, dox, blackmail, bully, sexually exploit, or target people based on protected characteristics or vulnerable status.',
      'Do not post illegal content, scams, malware, spam, phishing, fake opportunities, misleading listings, non-consensual intimate material, graphic threats, or content that encourages self-harm or real-world violence.',
      'Do not scrape, automate, reverse engineer, overload, probe, bypass security, evade bans, manipulate metrics, or interfere with platform infrastructure.',
      'Do not use Zyng for academic dishonesty, credential fraud, fake referrals, unlawful employment screening, unauthorized surveillance, or unauthorized data brokerage.',
      'Do not use school spaces, alumni features, rooms, events, messages, or marketplace tools to misrepresent affiliation, authority, sponsorship, compensation, or availability.',
    ],
  },
  {
    title: 'AI Features and Automated Systems',
    lead: 'Zyng may introduce artificial intelligence and automated systems to assist with recommendations, moderation, search, summaries, safety review, content drafting, matching, support, and product personalization.',
    items: [
      'AI outputs may be inaccurate, incomplete, biased, delayed, or unsuitable for your situation. You should review AI-assisted results before relying on them, especially for academic, career, health, financial, legal, safety, or employment decisions.',
      'You may not submit content to AI features that you do not have permission to use, including confidential school records, private messages from others, copyrighted materials, sensitive personal data, or third-party proprietary information.',
      'You may not use AI features to generate harassment, impersonation, spam, deception, malware, exploit instructions, fake credentials, discriminatory screening, or content that violates these Terms.',
      'AI-assisted moderation or ranking may help prioritize reports, classify content, detect abuse, suggest safety actions, or personalize feeds, but Zyng may use human review where appropriate.',
      'We may log prompts, uploaded materials, generated outputs, feedback, and safety signals to operate, secure, evaluate, and improve AI features, subject to our Privacy Policy.',
      'Unless we state otherwise, AI outputs are provided as product assistance and not as professional advice, institutional endorsement, admission guidance, legal advice, employment advice, or verified fact.',
    ],
  },
  {
    title: 'Jobs, Referrals, Events, Rooms, and Marketplace',
    lead: 'Zyng may host opportunities and community tools, but users and organizers remain responsible for the accuracy and legality of what they offer.',
    items: [
      'Job posts, referrals, applications, mentorship offers, marketplace listings, event pages, and rooms must be truthful, lawful, relevant, and clearly describe material terms such as compensation, eligibility, deadlines, location, fees, and organizer identity where applicable.',
      'Zyng does not guarantee that listings, employers, alumni, buyers, sellers, organizers, candidates, events, rooms, or opportunities are safe, available, accurate, or successful.',
      'Users are responsible for evaluating opportunities, meeting safely, complying with school policies, and avoiding scams or risky transactions.',
      'We may remove listings, rooms, events, referrals, or accounts that appear misleading, discriminatory, unsafe, fraudulent, irrelevant, or abusive.',
    ],
  },
  {
    title: 'Moderation and Enforcement',
    lead: 'We may take action to protect users, schools, alumni networks, partners, and the platform.',
    items: [
      'Enforcement may include warnings, content removal, visibility limits, feature restrictions, trust score changes, account suspension, account termination, school-level restrictions, or referral to administrators or legal authorities.',
      'We may consider account history, severity, intent, risk, repeated behavior, reports, automated signals, and context when deciding how to enforce these Terms.',
      'Appeals or support requests may be available for certain actions, but we are not required to restore content, accounts, or access.',
      'We may preserve records where needed for safety, fraud prevention, dispute resolution, audits, or legal obligations.',
    ],
  },
  {
    title: 'Intellectual Property',
    lead: 'Zyng and its related names, logos, designs, software, interfaces, databases, workflows, documentation, and product features are protected by intellectual property laws.',
    items: [
      'You may not copy, modify, distribute, sell, lease, reverse engineer, or create derivative services from Zyng except as permitted by law or with our written permission.',
      'If you submit feedback, ideas, suggestions, bug reports, or product requests, you allow Zyng to use them without restriction or compensation.',
      'If you believe content on Zyng infringes your rights, contact us with enough detail to review the claim and identify the content.',
    ],
  },
  {
    title: 'Disclaimers and Limitation of Liability',
    lead: 'Zyng is provided on an as-is and as-available basis, and some parts of the service may change, break, pause, or be discontinued.',
    items: [
      'We do not guarantee uninterrupted service, specific outcomes, perfect security, accurate recommendations, successful matches, verified opportunities, or error-free AI output.',
      'To the maximum extent permitted by law, Zyng is not liable for indirect, incidental, consequential, special, exemplary, or punitive damages, or for lost profits, lost data, reputation harm, missed opportunities, or user conduct.',
      'Some jurisdictions do not allow certain limitations, so parts of this section may not apply to you.',
    ],
  },
  {
    title: 'Changes to These Terms',
    lead: 'We may update these Terms as Zyng evolves, including when we introduce AI features, new community products, new legal requirements, or new safety controls.',
    items: [
      'When changes are material, we will take reasonable steps to notify users through the service, email, in-app notices, or an updated effective date.',
      'Your continued use of Zyng after changes take effect means you accept the updated Terms.',
      'If you do not agree with updated Terms, you should stop using Zyng and may contact us about account options where available.',
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPolicyPage
      eyebrow="Zyng Legal"
      title="Terms of Service"
      summary="These Terms explain the rules for using Zyng across campus, alumni, marketplace, messaging, referrals, jobs, events, rooms, AI-assisted features, and future product surfaces."
      effectiveDate="June 7, 2026"
      sections={sections}
    />
  );
}

import type { Metadata } from 'next';
import { LegalPolicyPage } from '@/components/legal-policy-page';

export const metadata: Metadata = {
  title: 'Privacy Policy | Zyng',
  description: 'Learn how Zyng collects, uses, protects, and shares information across campus, alumni, community, safety, and AI-assisted features.',
};

const sections = [
  {
    title: 'Scope of this Privacy Policy',
    lead: 'This Privacy Policy explains how Zyng collects, uses, stores, shares, and protects information when people use our websites, mobile web experience, campus communities, alumni tools, messaging, marketplace, jobs, events, rooms, portfolios, referrals, support channels, and AI-assisted features.',
    items: [
      'This Policy applies to users, visitors, students, graduates, alumni, staff, partners, organizers, applicants, administrators, and anyone who interacts with Zyng.',
      'Some schools, alumni organizations, employers, event organizers, or partners may have their own privacy notices. Their notices may apply to information they independently collect or control.',
      'If you do not want Zyng to process information as described here, you should not use the service.',
    ],
  },
  {
    title: 'Information You Provide',
    lead: 'We collect information you choose to submit or that is necessary to create and operate your account.',
    items: [
      'Account information may include name, username, phone number, email address, password credentials, recovery details, profile photo, date or year information, school affiliation, faculty, department, program, graduation status, alumni status, skills, hobbies, bio, location, and other profile fields.',
      'Community information may include personas, posts, replies, comments, reactions, messages, rooms, event participation, marketplace listings, job applications, referrals, portfolio content, reports, feedback, contact forms, search queries, and support conversations.',
      'Verification information may include school email domains, school identifiers, student or alumni documents, admin approvals, referral codes, geolocation-derived context, or other evidence used to confirm eligibility.',
      'Payment or transaction information may be collected in the future if paid products, marketplace payments, subscriptions, promotions, or partner services are introduced.',
    ],
  },
  {
    title: 'Information Collected Automatically',
    lead: 'Like most online services, Zyng collects technical and usage information when you access or interact with the platform.',
    items: [
      'We may collect device identifiers, browser type, operating system, IP address, approximate location, language, referral URLs, pages viewed, links clicked, session times, crash logs, diagnostic events, notification status, and feature usage.',
      'We may use cookies, local storage, service workers, pixels, analytics tools, and similar technologies to keep you signed in, remember preferences, secure sessions, measure performance, and improve the product.',
      'We may infer school, campus, city, or region-level context from technical signals where needed for security, verification, abuse prevention, or community relevance.',
    ],
  },
  {
    title: 'How We Use Information',
    lead: 'We use information to provide Zyng, keep communities safe, improve the product, and prepare new features responsibly.',
    items: [
      'We authenticate users, maintain sessions, recover accounts, verify eligibility, route users to the correct campus or alumni spaces, and personalize core product surfaces.',
      'We operate feeds, messages, rooms, personas, search, notifications, jobs, referrals, marketplace listings, events, portfolios, applications, admin tools, reports, and support workflows.',
      'We analyze product performance, detect bugs, prevent spam and fraud, protect infrastructure, enforce policies, respond to legal requests, and investigate safety issues.',
      'We may use aggregated or de-identified information for analytics, product planning, investor or partner reporting, school insights, and public business metrics where individuals are not reasonably identifiable.',
    ],
  },
  {
    title: 'AI and Automated Processing',
    lead: 'Zyng may integrate AI and automated systems to improve search, recommendations, moderation, support, matching, content organization, summaries, and productivity features.',
    items: [
      'AI inputs may include prompts, selected content, uploaded files, profile context, school context, posts, reports, support messages, feedback, and interaction signals depending on the feature you use.',
      'AI outputs may include drafts, summaries, suggested tags, recommended connections, opportunity matches, moderation classifications, safety alerts, search results, ranking signals, or support suggestions.',
      'We may log prompts, outputs, feedback, model performance signals, abuse indicators, and error details to operate, evaluate, secure, debug, and improve AI features.',
      'We may use service providers to process AI workloads. Where we do, they may process information on our behalf under contractual restrictions.',
      'AI-assisted systems may support decisions, but we may use human review for safety, appeals, abuse, account enforcement, verification, and other sensitive contexts.',
      'You should not submit highly sensitive personal information, confidential school records, private third-party data, secrets, passwords, financial account details, or legally privileged information into AI features unless the feature clearly asks for it and you are authorized to provide it.',
    ],
  },
  {
    title: 'Sharing and Disclosure',
    lead: 'We do not sell personal information to advertisers. We share information only in limited circumstances needed to operate and protect Zyng.',
    items: [
      'Other users may see information you choose to make available, such as personas, posts, comments, reactions, listings, event participation, rooms, portfolio links, public profile details, and relevant alumni or school context.',
      'Service providers may process information for hosting, database operations, authentication, analytics, email, messaging, storage, security, AI processing, customer support, and other operational services.',
      'School administrators, alumni moderators, organizers, employers, or partners may receive limited information where needed to manage communities, review applications, operate events, verify eligibility, or respond to reports.',
      'We may disclose information when required by law, subpoena, court order, governmental request, safety emergency, rights protection, fraud investigation, business transfer, merger, acquisition, financing, or asset sale.',
    ],
  },
  {
    title: 'Messages, Reports, and Safety Review',
    lead: 'Zyng includes semi-anonymous and private surfaces, but they are not a guarantee that content can never be reviewed.',
    items: [
      'Messages, reports, rooms, support requests, applications, listings, and other private or limited-audience content may be reviewed when needed for safety, support, abuse prevention, legal compliance, debugging, or enforcement.',
      'We may use automated tools to detect spam, scams, harassment, threats, suspicious activity, policy violations, or platform misuse.',
      'When users report content, we may process the report, the reported content, account history, technical signals, and related context to investigate and respond.',
    ],
  },
  {
    title: 'Retention',
    lead: 'We keep information for as long as needed to provide Zyng, comply with obligations, enforce policies, resolve disputes, and protect users.',
    items: [
      'Retention periods may vary depending on account status, content type, school requirements, legal obligations, backup schedules, audit needs, safety risks, and operational requirements.',
      'Deleted content may remain in backups, logs, security records, moderation records, legal holds, or de-identified datasets for a limited period or as required by law.',
      'We may retain information about suspended or terminated accounts to prevent abuse, enforce bans, defend claims, and protect communities.',
    ],
  },
  {
    title: 'Your Choices and Rights',
    lead: 'Depending on your location, you may have rights to access, correct, delete, export, restrict, or object to certain processing of your personal information.',
    items: [
      'You can update many profile fields, personas, preferences, and account details through the product where available.',
      'You may contact us to request help with account access, privacy questions, deletion, correction, export, content review, or safety concerns.',
      'We may need to verify your identity before completing certain requests, and some requests may be limited by security, legal, operational, or community safety requirements.',
      'You may adjust browser settings for cookies and local storage, but some features may stop working if required technologies are disabled.',
    ],
  },
  {
    title: 'Security',
    lead: 'We use technical, organizational, and operational controls designed to protect information, but no online service can guarantee perfect security.',
    items: [
      'Security controls may include authentication, access restrictions, audit logs, database policies, role-based permissions, monitoring, rate limits, backup controls, and abuse detection.',
      'You are responsible for securing your devices, credentials, email, phone, recovery channels, and sessions.',
      'If you suspect unauthorized access or a vulnerability, contact us promptly with enough detail to investigate.',
    ],
  },
  {
    title: 'Children and Younger Users',
    lead: 'Zyng is designed for higher-school communities and is not intended for children under the age required by applicable law.',
    items: [
      'Users must meet the minimum age required to use online services in their jurisdiction and any school-specific eligibility requirements.',
      'If we learn that an account was created by someone who is not eligible, we may delete or restrict the account.',
      'Schools or guardians may contact us with concerns about underage or unauthorized use.',
    ],
  },
  {
    title: 'International Processing',
    lead: 'Zyng may process and store information in countries other than where you live.',
    items: [
      'Data protection laws may differ between jurisdictions, but we take steps intended to protect information in line with this Policy.',
      'Where required, we may rely on contractual, organizational, or legal mechanisms to support cross-border processing.',
    ],
  },
  {
    title: 'Changes to this Privacy Policy',
    lead: 'We may update this Policy as Zyng grows, including when we launch AI features, paid services, new integrations, new school tools, or new legal requirements.',
    items: [
      'We will update the effective date when changes are made.',
      'For material changes, we may provide notice through the service, email, public pages, or other reasonable methods.',
      'Your continued use of Zyng after an update means the revised Policy applies to your use going forward.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPolicyPage
      eyebrow="Zyng Legal"
      title="Privacy Policy"
      summary="This Privacy Policy describes how Zyng handles personal information across student, alumni, professional, community, safety, and future AI-assisted features."
      effectiveDate="June 7, 2026"
      sections={sections}
    />
  );
}

import type { Metadata } from 'next';
import { LegalPolicyPage } from '@/components/legal-policy-page';

export const metadata: Metadata = {
  title: 'Cookie Policy | Zyng',
  description: 'Review how Zyng uses cookies, local storage, analytics, security signals, preference storage, and similar technologies.',
};

const sections = [
  {
    title: 'What Cookies Are',
    lead: 'Cookies and similar technologies are small pieces of information stored on your browser or device. Zyng uses them, along with local storage, session storage, service workers, pixels, SDKs, and related technologies, to operate and improve the service.',
    items: [
      'Cookies may be set by Zyng directly or by service providers that support hosting, authentication, security, analytics, messaging, storage, support, or future AI features.',
      'Similar technologies may store preferences, cache app data, support offline behavior, measure page performance, or help protect accounts.',
      'This Cookie Policy should be read together with our Privacy Policy and Terms of Service.',
    ],
  },
  {
    title: 'Strictly Necessary Technologies',
    lead: 'Some technologies are required for Zyng to work and cannot be disabled through our product controls.',
    items: [
      'We use necessary cookies and storage for login sessions, authentication, account recovery, security, routing, load balancing, fraud prevention, maintenance mode, and abuse detection.',
      'These technologies may remember that you are signed in, keep requests secure, preserve settings needed for navigation, and prevent repeated security checks.',
      'If you block these technologies in your browser, parts of Zyng may fail, including login, feeds, messages, profile updates, forms, and admin tools.',
    ],
  },
  {
    title: 'Preference Technologies',
    lead: 'Preference technologies help Zyng remember choices that make the app feel consistent.',
    items: [
      'We may store theme preference, language or region settings, dismissed banners, notification preferences, device layout choices, selected tabs, and other interface settings.',
      'These technologies help keep the experience stable across visits and reduce repetitive prompts.',
      'Some preference data may be stored locally on your device rather than in your account.',
    ],
  },
  {
    title: 'Analytics and Performance',
    lead: 'Analytics and performance technologies help us understand how Zyng is used and where the product needs improvement.',
    items: [
      'We may measure page views, navigation paths, feature usage, crashes, load times, browser capabilities, referral sources, and aggregate engagement patterns.',
      'We use this information to debug issues, prioritize product work, improve accessibility, plan infrastructure, and understand whether features are useful.',
      'Where possible, we use aggregated or de-identified metrics for reporting and planning.',
    ],
  },
  {
    title: 'Security and Abuse Prevention',
    lead: 'Security technologies help protect Zyng users, communities, school networks, and infrastructure.',
    items: [
      'We may use cookies, IP signals, device signals, rate-limit tokens, session identifiers, and browser integrity checks to detect suspicious activity.',
      'These technologies may help identify spam, credential attacks, scraping, automated abuse, fake accounts, ban evasion, fraud, and malicious traffic.',
      'Security signals may be combined with account and usage information for investigation, enforcement, and platform protection.',
    ],
  },
  {
    title: 'AI Feature Support',
    lead: 'As Zyng introduces AI-assisted features, cookies and similar technologies may help those features operate safely and consistently.',
    items: [
      'We may use storage to remember AI feature settings, model preference, conversation state, consent prompts, safety notices, or whether a user has dismissed an AI disclosure.',
      'We may collect technical signals about AI feature usage, errors, latency, prompt volume, output feedback, and abuse indicators.',
      'AI-related cookies do not make AI outputs automatically reliable. Users should review AI-assisted results before relying on them.',
    ],
  },
  {
    title: 'Advertising and Marketing',
    lead: 'Zyng does not currently describe itself as selling personal information to advertisers. If we introduce advertising or marketing technologies, we will update this Policy and provide controls where required.',
    items: [
      'We may use basic marketing measurement for public pages, campaign attribution, referral links, product announcements, and growth analytics.',
      'We do not intend for school community activity, private messages, sensitive reports, or private AI prompts to be used for third-party behavioral advertising.',
      'Future paid promotions, employer campaigns, school campaigns, or marketplace placements should be clearly identified where required.',
    ],
  },
  {
    title: 'Your Controls',
    lead: 'You can control many cookies and similar technologies through your browser, device, or future Zyng preference tools.',
    items: [
      'Most browsers let you block, delete, or limit cookies. Browser controls vary, so review your browser’s help pages for details.',
      'You can clear local storage and site data, but doing so may sign you out, reset preferences, remove cached data, and affect offline behavior.',
      'Some privacy tools may block analytics or scripts, but the service may behave differently when required technologies are unavailable.',
      'Where required by law, we may provide additional consent or opt-out tools for non-essential cookies.',
    ],
  },
  {
    title: 'Changes to this Cookie Policy',
    lead: 'We may update this Cookie Policy as Zyng changes, especially when we add AI features, analytics tools, paid services, security providers, or new user controls.',
    items: [
      'We will update the effective date when this Policy changes.',
      'Material changes may be communicated through in-app notices, banners, email, or public pages.',
      'Continuing to use Zyng after changes take effect means the updated Cookie Policy applies to your use going forward.',
    ],
  },
];

export default function CookiesPage() {
  return (
    <LegalPolicyPage
      eyebrow="Zyng Legal"
      title="Cookie Policy"
      summary="This Cookie Policy explains how Zyng uses cookies, local storage, service workers, analytics, security signals, preference storage, and similar technologies across the product."
      effectiveDate="June 7, 2026"
      sections={sections}
    />
  );
}

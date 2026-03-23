import { Link } from "wouter";
import { Lock, FileText, Mail, Users, Trash2 } from "lucide-react";
import { SEO } from "@/components/SEO";

function PublicTopBar({ title }: { title: string }) {
  return (
    <header className="sm-topbar" role="banner">
      <div className="flex items-center gap-3">
        <img src="/logo.png" alt="DisabilitySquare Logo" className="h-6 w-6 object-contain" />
        <Link href="/">
          <span className="font-bold text-white text-sm hover:text-white/80 cursor-pointer hidden sm:inline">
            DisabilitySquare
          </span>
        </Link>
        <span className="text-white/30 hidden sm:inline">·</span>
        <span className="text-white/80 text-sm font-medium">{title}</span>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <Link href="/safety">
          <span className="text-white/80 hover:text-white text-xs cursor-pointer transition-colors">Safety Centre</span>
        </Link>
        <Link href="/terms">
          <span className="text-white/80 hover:text-white text-xs cursor-pointer transition-colors">Terms</span>
        </Link>
        <Link href="/">
          <span className="text-white/80 hover:text-white text-xs cursor-pointer transition-colors">← Back</span>
        </Link>
      </div>
    </header>
  );
}

export default function PrivacyPolicy() {
  return (
    <>
      <SEO
        title="Privacy Policy | DisabilitySquare"
        description="How DisabilitySquare collects, uses, and protects your personal information."
      />
      <div className="min-h-screen bg-background">
        <PublicTopBar title="Privacy Policy" />

        <div className="max-w-3xl mx-auto px-4 pb-12" style={{ paddingTop: "72px" }}>

          <div className="sm-card mb-4">
            <div className="sm-card-title">
              <Lock className="h-4 w-4" aria-hidden="true" />
              Privacy Policy
            </div>
            <div className="sm-card-body">
              <p className="text-sm text-muted-foreground">
                Last updated: March 2026. This policy explains what personal data we collect, how we use it, and your rights regarding that data. We are committed to protecting your privacy in accordance with the <em>Privacy Act 1988</em> (Cth) and the Australian Privacy Principles.
              </p>
            </div>
          </div>

          <div className="sm-card mb-4">
            <div className="sm-card-title">
              <FileText className="h-4 w-4" aria-hidden="true" />
              1. What Personal Data We Collect
            </div>
            <div className="sm-card-body text-sm text-foreground/80 space-y-3">
              <p>We collect only the data necessary to provide and improve the platform.</p>
              <div className="divide-y divide-border/50 rounded-xl border border-border/60 overflow-hidden">
                {[
                  { category: "Account Information", detail: "First name, last name, email address, date of birth (to verify age eligibility), and password hash. We do not store plain-text passwords." },
                  { category: "Profile Information", detail: "Display name, profile photo, bio, location (optional), disability type (optional, self-disclosed), and accessibility preferences." },
                  { category: "Content You Post", detail: "Posts, forum threads, comments, private messages, group contributions, journal entries (stored locally in your browser and not transmitted), and recognition badges you award." },
                  { category: "Usage Data", detail: "Page views, feature interactions, session timestamps, and device/browser type collected for security and product improvement. We do not use third-party advertising trackers." },
                  { category: "Safety and Moderation Data", detail: "Reports you make or receive, moderation decisions applied to your account, and audit logs required for legal compliance." },
                  { category: "Health and Spoon Data", detail: "Spoon tracker entries and health journal notes you create. This data is sensitive health information and is never shared with third parties." },
                ].map((item) => (
                  <div key={item.category} className="px-4 py-3">
                    <p className="font-semibold text-primary text-sm">{item.category}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="sm-card mb-4">
            <div className="sm-card-title">
              <FileText className="h-4 w-4" aria-hidden="true" />
              2. How We Use Your Data
            </div>
            <div className="sm-card-body text-sm text-foreground/80 space-y-2">
              <p>We use your data to:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Create and manage your account.</li>
                <li>Provide community features (posts, forums, groups, games, peer connect).</li>
                <li>Verify that users meet the 16+ age requirement.</li>
                <li>Detect and prevent abuse, spam, and policy violations.</li>
                <li>Respond to safety reports and comply with eSafety Commissioner notices.</li>
                <li>Improve accessibility features and overall platform experience.</li>
                <li>Send transactional emails (account verification, password reset, moderation notices). We do not send marketing emails without your explicit opt-in.</li>
              </ul>
              <p className="font-medium">We do not sell your personal data to third parties. We do not use your data for targeted advertising.</p>
            </div>
          </div>

          <div className="sm-card mb-4">
            <div className="sm-card-title">
              <FileText className="h-4 w-4" aria-hidden="true" />
              3. Data Sharing
            </div>
            <div className="sm-card-body text-sm text-foreground/80 space-y-2">
              <p>We share your data only in the following limited circumstances:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li><strong>Service providers:</strong> We use third-party hosting and infrastructure providers who process data on our behalf under strict data processing agreements.</li>
                <li><strong>Legal obligations:</strong> We may disclose data to the eSafety Commissioner, police, or other authorities where required by law or where we have a good-faith belief that disclosure is necessary to prevent serious harm.</li>
                <li><strong>With your consent:</strong> For any other purpose not listed here, we will ask for your explicit consent first.</li>
              </ul>
            </div>
          </div>

          <div className="sm-card mb-4">
            <div className="sm-card-title">
              <FileText className="h-4 w-4" aria-hidden="true" />
              4. Data Retention and Deletion
            </div>
            <div className="sm-card-body text-sm text-foreground/80 space-y-2">
              <p>We retain your account data for as long as your account is active. If you delete your account, your personal data is deleted within <strong>30 days</strong>, except where we are required by law to retain certain records (for example, safety moderation logs which may be retained for up to 7 years to comply with eSafety obligations).</p>
              <p>Content you have posted publicly (forum posts, group messages) may be anonymised rather than deleted to preserve the continuity of community conversations. Anonymised posts do not identify you.</p>
            </div>
          </div>

          <div className="sm-card mb-4">
            <div className="sm-card-title">
              <Users className="h-4 w-4" aria-hidden="true" />
              5. Special Provisions for Users Aged 16–17
            </div>
            <div className="sm-card-body text-sm text-foreground/80 space-y-2">
              <p>Users aged 16–17 are considered minors under Australian law. We apply additional protections for this group:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Profiles of users aged 16–17 are set to the lowest public visibility by default.</li>
                <li>We do not use the data of users aged 16–17 for any purpose other than providing the service.</li>
                <li>A parent or guardian of a 16–17 year old may contact us to request access to, correction of, or deletion of their child's data.</li>
                <li>If an account holder under 18 requests deletion, we process that request within 14 days (rather than the standard 30 days).</li>
              </ul>
            </div>
          </div>

          <div className="sm-card mb-4">
            <div className="sm-card-title">
              <Lock className="h-4 w-4" aria-hidden="true" />
              6. Your Privacy Rights
            </div>
            <div className="sm-card-body text-sm text-foreground/80 space-y-2">
              <p>Under the Australian Privacy Principles you have the right to:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li><strong>Access</strong> the personal data we hold about you.</li>
                <li><strong>Correct</strong> inaccurate or out-of-date data.</li>
                <li><strong>Delete</strong> your account and associated data.</li>
                <li><strong>Complain</strong> to the Office of the Australian Information Commissioner (OAIC) if you believe we have handled your data in breach of the Privacy Act.</li>
              </ul>
              <p>To exercise these rights, email <a href="mailto:privacy@disabilitysquare.com.au" className="text-primary underline">privacy@disabilitysquare.com.au</a>. We will respond within 30 days.</p>
            </div>
          </div>

          <div className="sm-card mb-4">
            <div className="sm-card-title">
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              7. Requesting Data Deletion
            </div>
            <div className="sm-card-body text-sm text-foreground/80 space-y-2">
              <p>You can delete your account at any time from your Profile Settings page. Alternatively, email <a href="mailto:privacy@disabilitysquare.com.au" className="text-primary underline">privacy@disabilitysquare.com.au</a> with the subject line "Data Deletion Request" and include the email address associated with your account.</p>
              <p>We will confirm deletion within 30 days. For users aged under 18, deletion is completed within 14 days.</p>
            </div>
          </div>

          <div className="sm-card mb-4">
            <div className="sm-card-title">
              <Lock className="h-4 w-4" aria-hidden="true" />
              8. Security
            </div>
            <div className="sm-card-body text-sm text-foreground/80 space-y-2">
              <p>We take reasonable technical and organisational measures to protect your data against unauthorised access, disclosure, or destruction. These include encrypted data storage, HTTPS-only communication, and restricted internal access controls.</p>
              <p>If we become aware of a data breach that is likely to result in serious harm, we will notify affected users and the OAIC within 30 days as required by the Notifiable Data Breaches scheme.</p>
            </div>
          </div>

          <div className="sm-card mb-4">
            <div className="sm-card-title">
              <FileText className="h-4 w-4" aria-hidden="true" />
              9. Changes to This Policy
            </div>
            <div className="sm-card-body text-sm text-foreground/80">
              <p>We may update this policy from time to time. Material changes will be notified by email and by a notice on the platform at least 14 days before taking effect. Continued use of the platform after changes take effect constitutes acceptance of the updated policy.</p>
            </div>
          </div>

          <div className="sm-card mb-4">
            <div className="sm-card-title">
              <Mail className="h-4 w-4" aria-hidden="true" />
              10. Contact
            </div>
            <div className="sm-card-body text-sm text-foreground/80 space-y-1">
              <p>Privacy enquiries: <a href="mailto:privacy@disabilitysquare.com.au" className="text-primary underline">privacy@disabilitysquare.com.au</a></p>
              <p>Safety enquiries: <a href="mailto:safety@disabilitysquare.com.au" className="text-primary underline">safety@disabilitysquare.com.au</a></p>
              <p>OAIC: <a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer" className="text-primary underline">www.oaic.gov.au</a></p>
            </div>
          </div>

          <div className="sm-card">
            <div className="sm-card-body flex flex-wrap gap-4 text-xs">
              <Link href="/safety"><span className="text-primary underline cursor-pointer" data-testid="link-footer-safety">Safety Centre</span></Link>
              <Link href="/terms"><span className="text-primary underline cursor-pointer" data-testid="link-footer-terms">Terms of Service</span></Link>
              <Link href="/"><span className="text-primary underline cursor-pointer" data-testid="link-footer-home">Back to DisabilitySquare</span></Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

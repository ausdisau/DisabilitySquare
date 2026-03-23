import { Link } from "wouter";
import { Shield, AlertTriangle, Phone, ExternalLink, FileText, Users, Lock } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function SafetyCentre() {
  return (
    <>
      <SEO
        title="Safety Centre | DisabilitySquare"
        description="Learn how DisabilitySquare keeps you safe, how to report harm, and where to get help."
      />
      <div className="min-h-screen bg-background">
        {/* Top bar */}
        <div className="retro-topbar">
          <Link href="/">
            <span className="retro-nav-link font-bold">DisabilitySquare</span>
          </Link>
          <span className="mx-2 text-white/40">|</span>
          <span className="text-white/80 text-xs">Safety Centre</span>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/terms"><span className="retro-nav-link">Terms</span></Link>
            <Link href="/privacy"><span className="retro-nav-link">Privacy</span></Link>
          </div>
        </div>

        <div className="pt-10 max-w-3xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="retro-box mb-6">
            <div className="retro-box-header">
              <Shield className="h-3 w-3" aria-hidden="true" />
              Safety Centre
            </div>
            <div className="retro-box-content">
              <p className="text-sm text-gray-700 leading-relaxed">
                DisabilitySquare is committed to being a safe, inclusive community for people with disabilities. This Safety Centre explains our commitments, how to report harm, and where to get help.
              </p>
            </div>
          </div>

          {/* Safety Commitments */}
          <div className="retro-box mb-4">
            <div className="retro-box-header">
              <Shield className="h-3 w-3" aria-hidden="true" />
              Our Safety Commitments
            </div>
            <div className="retro-box-content space-y-3 text-sm text-gray-700">
              <div className="flex gap-2">
                <Shield className="h-4 w-4 text-[#1B4B8A] shrink-0 mt-0.5" aria-hidden="true" />
                <p><strong>Accessible by design.</strong> The platform is built to WCAG AAA standards so every person — regardless of disability — can participate safely and comfortably.</p>
              </div>
              <div className="flex gap-2">
                <Users className="h-4 w-4 text-[#1B4B8A] shrink-0 mt-0.5" aria-hidden="true" />
                <p><strong>16+ minimum age.</strong> DisabilitySquare is for adults and older teenagers only. All accounts must be held by persons aged 16 or over. Accounts found to belong to users under 16 are suspended immediately pending review.</p>
              </div>
              <div className="flex gap-2">
                <Lock className="h-4 w-4 text-[#1B4B8A] shrink-0 mt-0.5" aria-hidden="true" />
                <p><strong>eSafety compliance.</strong> We operate in accordance with the Australian Online Safety Act 2021 and respond promptly to notices issued by the eSafety Commissioner.</p>
              </div>
              <div className="flex gap-2">
                <AlertTriangle className="h-4 w-4 text-[#1B4B8A] shrink-0 mt-0.5" aria-hidden="true" />
                <p><strong>Zero tolerance for Class 1 and Class 2 material.</strong> Content that meets the definition of Class 1 or Class 2 harmful online content under the Online Safety Act is removed immediately and may be referred to law enforcement.</p>
              </div>
              <div className="flex gap-2">
                <FileText className="h-4 w-4 text-[#1B4B8A] shrink-0 mt-0.5" aria-hidden="true" />
                <p><strong>Transparent moderation.</strong> We will notify users of moderation actions that affect their account and explain the policy that was applied.</p>
              </div>
            </div>
          </div>

          {/* Age Requirement */}
          <div className="retro-box mb-4">
            <div className="retro-box-header">
              <Users className="h-3 w-3" aria-hidden="true" />
              Minimum Age Requirement (16+)
            </div>
            <div className="retro-box-content text-sm text-gray-700 space-y-2">
              <p>DisabilitySquare is available to people aged <strong>16 years and over</strong>. This age threshold reflects our obligations under Australian eSafety regulations and our duty of care to younger people who are more vulnerable to online harm.</p>
              <p>During registration, all users are asked to confirm their date of birth. If we have reason to believe an account is held by someone under 16, the account is suspended immediately. The account holder (or their parent or guardian) may contact us to resolve the matter.</p>
              <p>If you believe a user is under 16, please report them using the report function on their profile or by emailing <a href="mailto:safety@disabilitysquare.com.au" className="text-[#1B4B8A] underline">safety@disabilitysquare.com.au</a>.</p>
            </div>
          </div>

          {/* How to Report */}
          <div className="retro-box mb-4">
            <div className="retro-box-header">
              <AlertTriangle className="h-3 w-3" aria-hidden="true" />
              How to Report Harm
            </div>
            <div className="retro-box-content text-sm text-gray-700 space-y-4">
              <p>You can report content or users directly on the platform. Click the flag icon on any post, comment, or user profile to open the report form. The following schemes are available:</p>
              <div className="border border-[#c8d0dc] divide-y divide-[#e8edf4]">
                {[
                  {
                    type: "Underage User",
                    desc: "If you believe a user is under 16 years of age.",
                    scheme: "underage",
                  },
                  {
                    type: "Harassment or Cyberbullying",
                    desc: "Threats, sustained abusive behaviour, or targeted bullying.",
                    scheme: "harassment",
                  },
                  {
                    type: "Inappropriate or Harmful Content",
                    desc: "Content that is offensive, harmful, or may constitute Class 1 or Class 2 material.",
                    scheme: "inappropriate_content",
                  },
                  {
                    type: "Spam",
                    desc: "Unwanted, repetitive, or commercial content.",
                    scheme: "spam",
                  },
                  {
                    type: "Other Policy Violation",
                    desc: "Anything else that breaches our community guidelines.",
                    scheme: "other",
                  },
                ].map((item) => (
                  <div key={item.type} className="p-3">
                    <p className="font-bold text-[#1B4B8A]">{item.type}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
              <p>You can also email reports to <a href="mailto:safety@disabilitysquare.com.au" className="text-[#1B4B8A] underline">safety@disabilitysquare.com.au</a>.</p>
              <p className="text-xs text-gray-500">Reports are reviewed by our safety team. Serious reports may be referred to the eSafety Commissioner or Australian law enforcement.</p>
            </div>
          </div>

          {/* External Complaints */}
          <div className="retro-box mb-4">
            <div className="retro-box-header">
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
              External Reporting &amp; Complaints
            </div>
            <div className="retro-box-content text-sm text-gray-700 space-y-3">
              <p>If your concern is not resolved to your satisfaction, or if you need to make a formal complaint about online content or cyber abuse, you can contact the Australian eSafety Commissioner directly:</p>
              <div className="border border-[#c8d0dc] p-3 space-y-2">
                <p className="font-bold text-[#1B4B8A]">eSafety Commissioner</p>
                <a
                  href="https://www.esafety.gov.au"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1B4B8A] underline flex items-center gap-1"
                  data-testid="link-esafety"
                >
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  www.esafety.gov.au
                </a>
                <div className="flex flex-col gap-1 text-xs text-gray-600">
                  <a
                    href="https://www.esafety.gov.au/report/cyberbullying"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1B4B8A] underline flex items-center gap-1"
                    data-testid="link-esafety-cyberbullying"
                  >
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    Cyberbullying Complaint Form
                  </a>
                  <a
                    href="https://www.esafety.gov.au/report/adult-cyber-abuse"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1B4B8A] underline flex items-center gap-1"
                    data-testid="link-esafety-adult"
                  >
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    Adult Cyber Abuse Complaint Form
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Crisis Support */}
          <div className="retro-box mb-4">
            <div className="retro-box-header">
              <Phone className="h-3 w-3" aria-hidden="true" />
              Crisis Support &amp; Helplines
            </div>
            <div className="retro-box-content text-sm text-gray-700">
              <p className="mb-3">If you or someone you know is in immediate danger, call <strong>000</strong>.</p>
              <div className="border border-[#c8d0dc] divide-y divide-[#e8edf4]">
                {[
                  {
                    name: "Kids Helpline",
                    number: "1800 55 1800",
                    desc: "Free, confidential support for young people aged 5–25.",
                    href: "https://www.kidshelpline.com.au",
                    testId: "link-kids-helpline",
                  },
                  {
                    name: "Beyond Blue",
                    number: "1300 22 4636",
                    desc: "Mental health support for anxiety, depression, and crisis.",
                    href: "https://www.beyondblue.org.au",
                    testId: "link-beyond-blue",
                  },
                  {
                    name: "13YARN",
                    number: "13 92 76",
                    desc: "Crisis support for Aboriginal and Torres Strait Islander peoples.",
                    href: "https://www.13yarn.org.au",
                    testId: "link-13yarn",
                  },
                  {
                    name: "Lifeline",
                    number: "13 11 14",
                    desc: "24/7 crisis support and suicide prevention.",
                    href: "https://www.lifeline.org.au",
                    testId: "link-lifeline",
                  },
                ].map((line) => (
                  <div key={line.name} className="p-3 flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-[#1B4B8A]">{line.name}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{line.desc}</p>
                      <a
                        href={line.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#1B4B8A] underline flex items-center gap-1 mt-1"
                        data-testid={line.testId}
                      >
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        {line.href.replace("https://www.", "")}
                      </a>
                    </div>
                    <a
                      href={`tel:${line.number.replace(/\s/g, "")}`}
                      className="font-mono font-bold text-[#E07830] whitespace-nowrap text-sm shrink-0"
                      aria-label={`Call ${line.name} on ${line.number}`}
                    >
                      {line.number}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer links */}
          <div className="retro-box mb-4">
            <div className="retro-box-content text-xs text-gray-500 flex flex-wrap gap-4">
              <Link href="/terms"><span className="text-[#1B4B8A] underline cursor-pointer" data-testid="link-footer-terms">Terms of Service</span></Link>
              <Link href="/privacy"><span className="text-[#1B4B8A] underline cursor-pointer" data-testid="link-footer-privacy">Privacy Policy</span></Link>
              <Link href="/"><span className="text-[#1B4B8A] underline cursor-pointer" data-testid="link-footer-home">Back to DisabilitySquare</span></Link>
              <span>safety@disabilitysquare.com.au</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

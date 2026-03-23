import { Link } from "wouter";
import { Shield, AlertTriangle, Phone, ExternalLink, FileText, Users, Lock } from "lucide-react";
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
        <Link href="/terms">
          <span className="text-white/80 hover:text-white text-xs cursor-pointer transition-colors">Terms</span>
        </Link>
        <Link href="/privacy">
          <span className="text-white/80 hover:text-white text-xs cursor-pointer transition-colors">Privacy</span>
        </Link>
        <Link href="/">
          <span className="text-white/80 hover:text-white text-xs cursor-pointer transition-colors">← Back</span>
        </Link>
      </div>
    </header>
  );
}

export default function SafetyCentre() {
  return (
    <>
      <SEO
        title="Safety Centre | DisabilitySquare"
        description="Learn how DisabilitySquare keeps you safe, how to report harm, and where to get help."
      />
      <div className="min-h-screen bg-background">
        <PublicTopBar title="Safety Centre" />

        <div className="max-w-3xl mx-auto px-4 pb-12" style={{ paddingTop: "72px" }}>

          <div className="sm-card mb-4">
            <div className="sm-card-title">
              <Shield className="h-4 w-4" aria-hidden="true" />
              Safety Centre
            </div>
            <div className="sm-card-body">
              <p className="text-sm text-foreground/80 leading-relaxed">
                DisabilitySquare is committed to being a safe, inclusive community for people with disabilities. This Safety Centre explains our commitments, how to report harm, and where to get help.
              </p>
            </div>
          </div>

          <div className="sm-card mb-4">
            <div className="sm-card-title">
              <Shield className="h-4 w-4" aria-hidden="true" />
              Our Safety Commitments
            </div>
            <div className="sm-card-body space-y-3">
              {[
                { icon: Shield, text: <><strong>Accessible by design.</strong> The platform is built to WCAG AAA standards so every person — regardless of disability — can participate safely and comfortably.</> },
                { icon: Users, text: <><strong>16+ minimum age.</strong> DisabilitySquare is for adults and older teenagers only. All accounts must be held by persons aged 16 or over. Accounts found to belong to users under 16 are suspended immediately pending review.</> },
                { icon: Lock, text: <><strong>eSafety compliance.</strong> We operate in accordance with the Australian Online Safety Act 2021 and respond promptly to notices issued by the eSafety Commissioner.</> },
                { icon: AlertTriangle, text: <><strong>Zero tolerance for Class 1 and Class 2 material.</strong> Content that meets the definition of Class 1 or Class 2 harmful online content under the Online Safety Act is removed immediately and may be referred to law enforcement.</> },
                { icon: FileText, text: <><strong>Transparent moderation.</strong> We will notify users of moderation actions that affect their account and explain the policy that was applied.</> },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 text-sm text-foreground/80">
                  <item.icon className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="sm-card mb-4">
            <div className="sm-card-title">
              <Users className="h-4 w-4" aria-hidden="true" />
              Minimum Age Requirement (16+)
            </div>
            <div className="sm-card-body space-y-2 text-sm text-foreground/80">
              <p>DisabilitySquare is available to people aged <strong>16 years and over</strong>. This age threshold reflects our obligations under Australian eSafety regulations and our duty of care to younger people who are more vulnerable to online harm.</p>
              <p>During registration, all users are asked to confirm their date of birth. If we have reason to believe an account is held by someone under 16, the account is suspended immediately.</p>
              <p>If you believe a user is under 16, please report them using the report function on their profile or by emailing <a href="mailto:safety@disabilitysquare.com.au" className="text-primary underline">safety@disabilitysquare.com.au</a>.</p>
            </div>
          </div>

          <div className="sm-card mb-4">
            <div className="sm-card-title">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              How to Report Harm
            </div>
            <div className="sm-card-body text-sm text-foreground/80 space-y-3">
              <p>Click the flag icon on any post, comment, or user profile to open the report form. The following schemes are available:</p>
              <div className="divide-y divide-border/50 rounded-xl border border-border/60 overflow-hidden">
                {[
                  { type: "Underage User", desc: "If you believe a user is under 16 years of age." },
                  { type: "Harassment or Cyberbullying", desc: "Threats, sustained abusive behaviour, or targeted bullying." },
                  { type: "Inappropriate or Harmful Content", desc: "Content that is offensive, harmful, or may constitute Class 1 or Class 2 material." },
                  { type: "Spam", desc: "Unwanted, repetitive, or commercial content." },
                  { type: "Other Policy Violation", desc: "Anything else that breaches our community guidelines." },
                ].map((item) => (
                  <div key={item.type} className="px-4 py-3">
                    <p className="font-semibold text-primary text-sm">{item.type}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
              <p>You can also email reports to <a href="mailto:safety@disabilitysquare.com.au" className="text-primary underline">safety@disabilitysquare.com.au</a>.</p>
              <p className="text-xs text-muted-foreground">Reports are reviewed by our safety team. Serious reports may be referred to the eSafety Commissioner or Australian law enforcement.</p>
            </div>
          </div>

          <div className="sm-card mb-4">
            <div className="sm-card-title">
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              External Reporting &amp; Complaints
            </div>
            <div className="sm-card-body text-sm text-foreground/80 space-y-3">
              <p>If your concern is not resolved to your satisfaction, you can contact the Australian eSafety Commissioner directly:</p>
              <div className="rounded-xl border border-border/60 px-4 py-3 space-y-2">
                <p className="font-semibold text-primary">eSafety Commissioner</p>
                <a href="https://www.esafety.gov.au" target="_blank" rel="noopener noreferrer" className="text-primary underline flex items-center gap-1 text-sm" data-testid="link-esafety">
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />www.esafety.gov.au
                </a>
                <div className="flex flex-col gap-1 text-xs">
                  <a href="https://www.esafety.gov.au/report/cyberbullying" target="_blank" rel="noopener noreferrer" className="text-primary underline flex items-center gap-1" data-testid="link-esafety-cyberbullying">
                    <ExternalLink className="h-3 w-3" />Cyberbullying Complaint Form
                  </a>
                  <a href="https://www.esafety.gov.au/report/adult-cyber-abuse" target="_blank" rel="noopener noreferrer" className="text-primary underline flex items-center gap-1" data-testid="link-esafety-adult">
                    <ExternalLink className="h-3 w-3" />Adult Cyber Abuse Complaint Form
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="sm-card mb-4">
            <div className="sm-card-title">
              <Phone className="h-4 w-4" aria-hidden="true" />
              Crisis Support &amp; Helplines
            </div>
            <div className="sm-card-body text-sm text-foreground/80 space-y-3">
              <p>If you or someone you know is in immediate danger, call <strong>000</strong>.</p>
              <div className="divide-y divide-border/50 rounded-xl border border-border/60 overflow-hidden">
                {[
                  { name: "Kids Helpline", number: "1800 55 1800", desc: "Free, confidential support for young people aged 5–25.", href: "https://www.kidshelpline.com.au", testId: "link-kids-helpline" },
                  { name: "Beyond Blue", number: "1300 22 4636", desc: "Mental health support for anxiety, depression, and crisis.", href: "https://www.beyondblue.org.au", testId: "link-beyond-blue" },
                  { name: "13YARN", number: "13 92 76", desc: "Crisis support for Aboriginal and Torres Strait Islander peoples.", href: "https://www.13yarn.org.au", testId: "link-13yarn" },
                  { name: "Lifeline", number: "13 11 14", desc: "24/7 crisis support and suicide prevention.", href: "https://www.lifeline.org.au", testId: "link-lifeline" },
                ].map((line) => (
                  <div key={line.name} className="px-4 py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-primary">{line.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{line.desc}</p>
                      <a href={line.href} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline flex items-center gap-1 mt-1" data-testid={line.testId}>
                        <ExternalLink className="h-3 w-3" />{line.href.replace("https://www.", "")}
                      </a>
                    </div>
                    <a href={`tel:${line.number.replace(/\s/g, "")}`} className="font-mono font-bold text-accent whitespace-nowrap text-sm shrink-0" aria-label={`Call ${line.name} on ${line.number}`}>
                      {line.number}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="sm-card">
            <div className="sm-card-body flex flex-wrap gap-4 text-xs">
              <Link href="/terms"><span className="text-primary underline cursor-pointer" data-testid="link-footer-terms">Terms of Service</span></Link>
              <Link href="/privacy"><span className="text-primary underline cursor-pointer" data-testid="link-footer-privacy">Privacy Policy</span></Link>
              <Link href="/"><span className="text-primary underline cursor-pointer" data-testid="link-footer-home">Back to DisabilitySquare</span></Link>
              <span className="text-muted-foreground">safety@disabilitysquare.com.au</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

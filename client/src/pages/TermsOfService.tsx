import { Link } from "wouter";
import { FileText, Shield, AlertTriangle, Mail } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function TermsOfService() {
  return (
    <>
      <SEO
        title="Terms of Service | DisabilitySquare"
        description="DisabilitySquare Terms of Service — acceptable use, account eligibility, content moderation, and eSafety obligations."
      />
      <div className="min-h-screen bg-background">
        {/* Top bar */}
        <div className="retro-topbar">
          <Link href="/">
            <span className="retro-nav-link font-bold">DisabilitySquare</span>
          </Link>
          <span className="mx-2 text-white/40">|</span>
          <span className="text-white/80 text-xs">Terms of Service</span>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/safety"><span className="retro-nav-link">Safety Centre</span></Link>
            <Link href="/privacy"><span className="retro-nav-link">Privacy</span></Link>
          </div>
        </div>

        <div className="pt-10 max-w-3xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="retro-box mb-4">
            <div className="retro-box-header">
              <FileText className="h-3 w-3" aria-hidden="true" />
              Terms of Service
            </div>
            <div className="retro-box-content text-xs text-gray-500">
              <p>Last updated: March 2026. These terms govern your use of DisabilitySquare. By creating an account you agree to these terms in full.</p>
            </div>
          </div>

          {/* Account Eligibility */}
          <div className="retro-box mb-4">
            <div className="retro-box-header">
              <Shield className="h-3 w-3" aria-hidden="true" />
              1. Account Eligibility
            </div>
            <div className="retro-box-content text-sm text-gray-700 space-y-2">
              <p>You must be at least <strong>16 years of age</strong> to create an account on DisabilitySquare. By registering you confirm that you meet this requirement. We reserve the right to request proof of age and to suspend accounts where we have reason to believe the account holder is under 16.</p>
              <p>Accounts may not be created on behalf of another person without their knowledge and consent, except that a parent or guardian may create an account for a dependent aged 16 or over if the dependent consents.</p>
              <p>You are responsible for maintaining the security of your account credentials. You must not share your password or allow any other person to access your account.</p>
            </div>
          </div>

          {/* Acceptable Use */}
          <div className="retro-box mb-4">
            <div className="retro-box-header">
              <Shield className="h-3 w-3" aria-hidden="true" />
              2. Acceptable Use Policy
            </div>
            <div className="retro-box-content text-sm text-gray-700 space-y-3">
              <p>You may use DisabilitySquare only for lawful purposes and in a manner that does not infringe the rights of others or inhibit their use of the platform.</p>
              <p className="font-bold text-[#1B4B8A]">Prohibited content includes but is not limited to:</p>
              <div className="border border-[#c8d0dc] divide-y divide-[#e8edf4]">
                {[
                  {
                    label: "Class 1 Material",
                    desc: "Content that would be classified RC (Refused Classification) or X18+ under the National Classification Code, including child sexual abuse material, detailed instructions for crime or drug use, or content advocating terrorism. Such material will be removed immediately and referred to law enforcement.",
                  },
                  {
                    label: "Class 2 Material",
                    desc: "Content that would be classified R18+ under the National Classification Code that is not accompanied by appropriate access controls, or content that promotes, normalises, or glorifies violence, exploitation, or degradation.",
                  },
                  {
                    label: "Cyberbullying and Cyber Abuse",
                    desc: "Content that seriously threatens, seriously harasses, or seriously intimidates another person, including persistent unwanted contact, doxing, or targeted hate campaigns.",
                  },
                  {
                    label: "Harassment and Discrimination",
                    desc: "Content that targets a person or group based on disability, race, gender, sexual orientation, religion, nationality, or any other protected attribute.",
                  },
                  {
                    label: "Misinformation Causing Harm",
                    desc: "Health or medical misinformation that could endanger the health or safety of users, particularly relating to disability management, medication, or crisis intervention.",
                  },
                  {
                    label: "Spam and Commercial Solicitation",
                    desc: "Unsolicited commercial messages, pyramid schemes, or repetitive off-topic posting.",
                  },
                  {
                    label: "Impersonation",
                    desc: "Pretending to be another person, organisation, or official body in a way that is misleading or deceptive.",
                  },
                ].map((item) => (
                  <div key={item.label} className="p-3">
                    <p className="font-bold text-[#1B4B8A] text-xs">{item.label}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Content Moderation */}
          <div className="retro-box mb-4">
            <div className="retro-box-header">
              <AlertTriangle className="h-3 w-3" aria-hidden="true" />
              3. Content Moderation and Removal
            </div>
            <div className="retro-box-content text-sm text-gray-700 space-y-2">
              <p>We reserve the right to remove any content that violates these terms, without prior notice. Where content is removed we will, where practicable, notify the account holder of the reason for removal.</p>
              <p>Accounts that repeatedly violate these terms, or that post material in the Class 1 or Class 2 categories, may be suspended or permanently terminated.</p>
              <p>You may appeal a moderation decision by emailing <a href="mailto:safety@disabilitysquare.com.au" className="text-[#1B4B8A] underline">safety@disabilitysquare.com.au</a> with the subject line "Moderation Appeal". Appeals are reviewed within 5 business days.</p>
            </div>
          </div>

          {/* eSafety Obligations */}
          <div className="retro-box mb-4">
            <div className="retro-box-header">
              <Shield className="h-3 w-3" aria-hidden="true" />
              4. Platform Obligations Under the Online Safety Act 2021
            </div>
            <div className="retro-box-content text-sm text-gray-700 space-y-2">
              <p>DisabilitySquare operates as an online service provider subject to the <em>Online Safety Act 2021</em> (Cth). We are obligated to:</p>
              <ul className="list-disc list-inside text-sm space-y-1 text-gray-700 pl-2">
                <li>Respond to End-User Notices and Provider Notices issued by the eSafety Commissioner within the statutory timeframes.</li>
                <li>Remove Class 1 material within 24 hours of receiving a removal notice from the eSafety Commissioner.</li>
                <li>Cooperate with investigations by the eSafety Commissioner.</li>
                <li>Maintain a complaints system that is accessible to all users.</li>
              </ul>
              <p>For more information about the Online Safety Act, visit <a href="https://www.esafety.gov.au" target="_blank" rel="noopener noreferrer" className="text-[#1B4B8A] underline">www.esafety.gov.au</a>.</p>
            </div>
          </div>

          {/* Intellectual Property */}
          <div className="retro-box mb-4">
            <div className="retro-box-header">
              <FileText className="h-3 w-3" aria-hidden="true" />
              5. Intellectual Property
            </div>
            <div className="retro-box-content text-sm text-gray-700 space-y-2">
              <p>You retain ownership of content you post. By posting content you grant DisabilitySquare a non-exclusive, royalty-free licence to display, distribute, and store that content for the purpose of operating the platform.</p>
              <p>You must not post content that infringes the intellectual property rights of any third party.</p>
            </div>
          </div>

          {/* Limitation of Liability */}
          <div className="retro-box mb-4">
            <div className="retro-box-header">
              <FileText className="h-3 w-3" aria-hidden="true" />
              6. Limitation of Liability
            </div>
            <div className="retro-box-content text-sm text-gray-700 space-y-2">
              <p>DisabilitySquare is provided on an "as is" basis. To the maximum extent permitted by law, we disclaim all warranties and exclude liability for any indirect, incidental, or consequential loss arising from your use of the platform.</p>
              <p>Nothing in these terms limits any rights you may have under the Australian Consumer Law.</p>
            </div>
          </div>

          {/* Governing Law */}
          <div className="retro-box mb-4">
            <div className="retro-box-header">
              <FileText className="h-3 w-3" aria-hidden="true" />
              7. Governing Law
            </div>
            <div className="retro-box-content text-sm text-gray-700">
              <p>These terms are governed by the laws of the Australian Capital Territory, Australia. Any disputes shall be subject to the exclusive jurisdiction of the courts of the ACT.</p>
            </div>
          </div>

          {/* Contact */}
          <div className="retro-box mb-4">
            <div className="retro-box-header">
              <Mail className="h-3 w-3" aria-hidden="true" />
              8. Safety &amp; Legal Contact
            </div>
            <div className="retro-box-content text-sm text-gray-700 space-y-1">
              <p>For safety reports and eSafety enquiries: <a href="mailto:safety@disabilitysquare.com.au" className="text-[#1B4B8A] underline">safety@disabilitysquare.com.au</a></p>
              <p>For legal enquiries: <a href="mailto:legal@disabilitysquare.com.au" className="text-[#1B4B8A] underline">legal@disabilitysquare.com.au</a></p>
            </div>
          </div>

          {/* Footer links */}
          <div className="retro-box mb-4">
            <div className="retro-box-content text-xs text-gray-500 flex flex-wrap gap-4">
              <Link href="/safety"><span className="text-[#1B4B8A] underline cursor-pointer" data-testid="link-footer-safety">Safety Centre</span></Link>
              <Link href="/privacy"><span className="text-[#1B4B8A] underline cursor-pointer" data-testid="link-footer-privacy">Privacy Policy</span></Link>
              <Link href="/"><span className="text-[#1B4B8A] underline cursor-pointer" data-testid="link-footer-home">Back to DisabilitySquare</span></Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

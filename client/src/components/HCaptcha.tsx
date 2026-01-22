import { useRef, useCallback, useState, useEffect } from "react";
import HCaptchaComponent from "@hcaptcha/react-hcaptcha";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Loader2 } from "lucide-react";

interface HCaptchaProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (err: string) => void;
  isLoading?: boolean;
}

export function HCaptcha({ onVerify, onExpire, onError, isLoading }: HCaptchaProps) {
  const captchaRef = useRef<HCaptchaComponent>(null);
  const [siteKey, setSiteKey] = useState<string>("");
  const [loadingKey, setLoadingKey] = useState(true);

  useEffect(() => {
    fetch('/api/config/hcaptcha')
      .then(res => res.json())
      .then(data => {
        setSiteKey(data.siteKey || '');
        setLoadingKey(false);
      })
      .catch(() => setLoadingKey(false));
  }, []);

  const handleVerify = useCallback((token: string) => {
    onVerify(token);
  }, [onVerify]);

  const handleExpire = useCallback(() => {
    onExpire?.();
    captchaRef.current?.resetCaptcha();
  }, [onExpire]);

  const handleError = useCallback((err: string) => {
    onError?.(err);
    captchaRef.current?.resetCaptcha();
  }, [onError]);

  if (loadingKey) {
    return (
      <Card className="w-full max-w-md mx-auto border-2 border-primary/20">
        <CardContent className="pt-6 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!siteKey) {
    return (
      <Card className="w-full max-w-md mx-auto border-2 border-destructive/20">
        <CardContent className="pt-6 text-center text-destructive">
          Security verification is not configured.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto border-2 border-primary/20">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <ShieldCheck className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl font-display text-primary">Security Check</CardTitle>
        <CardDescription className="text-base">
          Please complete the security verification to continue.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Verifying...</span>
          </div>
        ) : (
          <HCaptchaComponent
            ref={captchaRef}
            sitekey={siteKey}
            onVerify={handleVerify}
            onExpire={handleExpire}
            onError={handleError}
            theme="light"
            data-testid="hcaptcha-widget"
          />
        )}
        <p className="text-xs text-muted-foreground text-center max-w-xs">
          This helps us prevent bots and keep DisabilitySquare safe for everyone.
        </p>
      </CardContent>
    </Card>
  );
}

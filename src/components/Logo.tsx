import logo from "../data/logo.json";

/**
 * The restaurant's own logo (red swirl, script "keno", rule and "SUSHI"), traced from the printed
 * menu by media/logo/extract_logo.py. Colours come from CSS (--logo-mark, --logo-type).
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg className={`logo ${className}`} viewBox={logo.viewBox} role="img" aria-label="Okeno Sushi">
      <path d={logo.mark} fillRule="evenodd" className="logo__mark" />
      <path d={logo.type} fillRule="evenodd" className="logo__type" />
    </svg>
  );
}

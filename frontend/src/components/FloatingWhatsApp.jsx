import { SITE } from "../lib/site";
import { WhatsAppIcon } from "./SocialLinks";

export default function FloatingWhatsApp() {
  return (
    <a href={SITE.whatsapp} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp"
      data-testid="floating-whatsapp"
      className="fixed bottom-6 right-6 z-[70] grid place-items-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-8px_rgba(37,211,102,0.6)] hover:scale-105 transition-transform">
      <WhatsAppIcon size={26} />
    </a>
  );
}

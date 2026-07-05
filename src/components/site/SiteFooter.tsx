import { Mail, Phone, MapPin } from "lucide-react";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-muted/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Trusted supplier of pathological equipment, reagents and lab accessories for clinics and diagnostic labs.
          </p>
        </div>
        <div className="text-sm">
          <h4 className="mb-3 text-base font-semibold">Contact</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2"><Phone className="mt-0.5 h-4 w-4 text-primary" /> +91 9425405655</li>
            <li className="flex items-start gap-2"><Phone className="mt-0.5 h-4 w-4 text-primary" /> Orders (WhatsApp): +91 9617655655</li>
            <li className="flex items-start gap-2"><Mail className="mt-0.5 h-4 w-4 text-primary" /> medisysbpl@rediffmail.com</li>
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-primary" /> Medisys A-273, New Minal Residency JK Road Bhopal, India</li>
          </ul>
        </div>
        <div className="text-sm">
          <h4 className="mb-3 text-base font-semibold">Business hours</h4>
          <p className="text-muted-foreground">Mon – Sat, 10:30 AM to 7:30 PM</p>
          <p className="mt-2 text-muted-foreground">Orders placed before 4 PM deliver same day.</p>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Medisys. All rights reserved.
      </div>
    </footer>
  );
}

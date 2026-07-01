export function WhatsAppFab() {
  return (
    <a
      href="https://wa.me/919876543210?text=Hi%20Medisys%2C%20I%20need%20help"
      target="_blank"
      rel="noreferrer"
      aria-label="Contact us on WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full text-white shadow-elevated transition-transform hover:scale-105"
      style={{ backgroundColor: "var(--color-whatsapp)" }}
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7" fill="currentColor" aria-hidden>
        <path d="M19.11 17.28c-.29-.15-1.7-.84-1.96-.94-.26-.1-.45-.15-.64.15-.19.29-.74.94-.9 1.13-.17.19-.33.22-.62.07-.29-.15-1.22-.45-2.32-1.43-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.44.13-.59.13-.13.29-.33.44-.5.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.15-.64-1.55-.88-2.13-.23-.55-.47-.48-.64-.49l-.55-.01c-.19 0-.5.07-.76.36-.26.29-1 .98-1 2.38 0 1.4 1.03 2.76 1.17 2.95.15.19 2.02 3.09 4.9 4.33.68.29 1.22.46 1.63.59.69.22 1.31.19 1.8.12.55-.08 1.7-.7 1.94-1.37.24-.67.24-1.25.17-1.37-.07-.12-.26-.19-.55-.34zM16.02 4C9.4 4 4 9.4 4 16.02c0 2.11.55 4.16 1.6 5.97L4 28l6.14-1.6a11.98 11.98 0 0 0 5.88 1.52h.01C22.65 27.94 28 22.63 28 16.02 28 9.4 22.63 4 16.02 4z"/>
      </svg>
    </a>
  );
}

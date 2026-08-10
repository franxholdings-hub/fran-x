import { WHATSAPP_URL } from "@/lib/site";

export function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with FRAN-X on WhatsApp"
      title="Chat with FRAN-X"
      className="group fixed right-4 bottom-4 z-[90] flex items-center gap-3 sm:right-6 sm:bottom-6"
    >
      <span className="pointer-events-none hidden rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 sm:block">
        Chat with FRAN-X
      </span>
      <span className="relative grid h-14 w-14 place-items-center rounded-full bg-[#25D366] shadow-[0_18px_40px_-16px_rgba(37,211,102,0.9)] transition-transform duration-200 hover:scale-105">
        <span className="pulse-ring absolute inset-0 rounded-full bg-[#25D366]/60" />
        <svg viewBox="0 0 32 32" className="relative h-7 w-7 fill-white" aria-hidden="true">
          <path d="M16.02 3.2c-7.06 0-12.8 5.73-12.8 12.79 0 2.25.6 4.45 1.73 6.39L3.2 28.8l6.6-1.72a12.77 12.77 0 0 0 6.22 1.59h.01c7.05 0 12.79-5.74 12.79-12.8 0-3.42-1.33-6.63-3.75-9.04a12.7 12.7 0 0 0-9.05-3.63Zm0 23.28h-.01a10.6 10.6 0 0 1-5.41-1.48l-.39-.23-4.02 1.05 1.07-3.92-.25-.4a10.58 10.58 0 0 1-1.62-5.65c0-5.86 4.77-10.63 10.64-10.63 2.84 0 5.51 1.11 7.52 3.12a10.56 10.56 0 0 1 3.11 7.52c0 5.87-4.77 10.62-10.64 10.62Zm5.83-7.96c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.71.16-.21.32-.82 1.04-1.01 1.25-.18.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.58-.95-.85-1.59-1.89-1.78-2.21-.18-.32-.02-.5.14-.66.15-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.72-.98-2.35-.26-.62-.52-.53-.71-.54l-.61-.01c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65 0 1.57 1.14 3.08 1.3 3.29.16.21 2.24 3.42 5.43 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.89-.77 2.16-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37Z" />
        </svg>
      </span>
    </a>
  );
}
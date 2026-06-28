"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <>
      <style>{`
        /* ============================
           FizTopz — Light & Elegant Toasts
        ============================ */

        @keyframes fz-slide {
          0%   { opacity: 0; transform: translateX(40px) scale(0.95); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }

        @keyframes fz-pop {
          0%   { transform: scale(0.5); opacity: 0; }
          70%  { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        /* Base */
        [data-sonner-toaster] {
          z-index: 99999 !important;
        }

        [data-sonner-toast] {
          font-family: 'Inter', system-ui, sans-serif !important;
          background: #ffffff !important;
          border: 1px solid rgba(184, 146, 74, 0.2) !important;
          border-radius: 8px !important;
          box-shadow: 0 12px 40px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.05) !important;
          color: #1a0d0d !important;
          padding: 16px 20px !important;
          animation: fz-slide 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
        }

        /* Text */
        [data-sonner-toast] [data-title] {
          font-size: 0.95rem !important;
          font-weight: 600 !important;
          color: #1a0d0d !important;
          letter-spacing: 0.01em !important;
        }
        [data-sonner-toast] [data-description] {
          font-size: 0.85rem !important;
          color: #666666 !important;
          margin-top: 4px !important;
        }

        /* Close Button */
        [data-sonner-toast] [data-close-button] {
          background: #f5f0e8 !important;
          border: 1px solid rgba(184, 146, 74, 0.2) !important;
          color: #1a0d0d !important;
          border-radius: 6px !important;
          transition: all 0.2s !important;
          right: 12px !important;
          top: 25px !important;
          width: 26px !important;
          height: 26px !important;
          display: grid !important;
          place-items: center !important;
          left: auto !important; /* Fix for overflow issues */
        }
        [data-sonner-toast] [data-close-button]:hover {
          background: #b8924a !important;
          color: #ffffff !important;
          border-color: #b8924a !important;
        }

        /* Icons */
        [data-sonner-toast] [data-icon] {
          animation: fz-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards !important;
          margin-right: 4px !important;
        }
        [data-sonner-toast] [data-icon] svg {
          width: 24px !important;
          height: 24px !important;
        }

        /* Types - using thick left borders */
        [data-sonner-toast][data-type="success"] {
          border-left: 6px solid #bf8f34 !important;
        }
        [data-sonner-toast][data-type="success"] [data-icon] svg {
          color: #bf8f34 !important;
        }

        [data-sonner-toast][data-type="error"] {
          border-left: 6px solid #ef4444 !important;
        }
        [data-sonner-toast][data-type="error"] [data-icon] svg {
          color: #ef4444 !important;
        }

        [data-sonner-toast][data-type="warning"] {
          border-left: 6px solid #f59e0b !important;
        }
        [data-sonner-toast][data-type="warning"] [data-icon] svg {
          color: #f59e0b !important;
        }

        [data-sonner-toast][data-type="info"] {
          border-left: 6px solid #3b82f6 !important;
        }
        [data-sonner-toast][data-type="info"] [data-icon] svg {
          color: #3b82f6 !important;
        }

        [data-sonner-toast]:not([data-type]),
        [data-sonner-toast][data-type="default"] {
          border-left: 6px solid #b8924a !important;
        }
        [data-sonner-toast]:not([data-type]) [data-icon] svg,
        [data-sonner-toast][data-type="default"] [data-icon] svg {
          color: #b8924a !important;
        }
      `}</style>
      <Sonner
        position="top-right"
        closeButton
        toastOptions={{ duration: 4000 }}
        {...props}
      />
    </>
  );
};

export { Toaster };

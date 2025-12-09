import { useEffect } from 'react';

interface CalendlyEmbedProps {
  url: string;
  minHeight?: string;
}

const CalendlyEmbed = ({ url, minHeight = '700px' }: CalendlyEmbedProps) => {
  useEffect(() => {
    // Load Calendly widget script
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <div 
      className="calendly-inline-widget w-full rounded-xl overflow-hidden"
      data-url={url}
      style={{ minWidth: '320px', height: minHeight }}
    />
  );
};

export default CalendlyEmbed;

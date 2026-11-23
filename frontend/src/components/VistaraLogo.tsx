import React from 'react';

interface VistaraLogoProps {
  className?: string;
}

export const VistaraLogo: React.FC<VistaraLogoProps> = ({
  className = 'w-8 h-8',
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1000 1000"
      role="img"
      aria-label="Vistara Logo"
      className={`${className} flex-shrink-0 text-ink dark:text-white transition-colors duration-200`}
    >
      {/* Primary Structural Lines */}
      <g stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Outer Octagon */}
        <polygon points="500,110 775.8,224.2 890,500 775.8,775.8 500,890 224.2,775.8 110,500 224.2,224.2" />

        {/* Inner Octagon */}
        <polygon points="576.5,315.2 684.8,423.5 684.8,576.5 576.5,684.8 423.5,684.8 315.2,576.5 315.2,423.5 423.5,315.2" />

        {/* Center Star (Inner Octagon Diameters) */}
        <line x1="576.5" y1="315.2" x2="423.5" y2="684.8" />
        <line x1="684.8" y1="423.5" x2="315.2" y2="576.5" />
        <line x1="684.8" y1="576.5" x2="315.2" y2="423.5" />
        <line x1="576.5" y1="684.8" x2="423.5" y2="315.2" />

        {/* Outer-to-Inner Connecting Spokes */}
        <line x1="500" y1="110" x2="423.5" y2="315.2" />
        <line x1="500" y1="110" x2="576.5" y2="315.2" />
        <line x1="775.8" y1="224.2" x2="576.5" y2="315.2" />
        <line x1="775.8" y1="224.2" x2="684.8" y2="423.5" />
        <line x1="890" y1="500" x2="684.8" y2="423.5" />
        <line x1="890" y1="500" x2="684.8" y2="576.5" />
        <line x1="775.8" y1="775.8" x2="684.8" y2="576.5" />
        <line x1="775.8" y1="775.8" x2="576.5" y2="684.8" />
        <line x1="500" y1="890" x2="576.5" y2="684.8" />
        <line x1="500" y1="890" x2="423.5" y2="684.8" />
        <line x1="224.2" y1="775.8" x2="423.5" y2="684.8" />
        <line x1="224.2" y1="775.8" x2="315.2" y2="576.5" />
        <line x1="110" y1="500" x2="315.2" y2="576.5" />
        <line x1="110" y1="500" x2="315.2" y2="423.5" />
        <line x1="224.2" y1="224.2" x2="315.2" y2="423.5" />
        <line x1="224.2" y1="224.2" x2="423.5" y2="315.2" />
      </g>

      {/* Secondary Thin Accent Lines */}
      <g stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" fill="none">
        <line x1="532" y1="114" x2="750" y2="226" />
        <line x1="802" y1="248" x2="902" y2="468" />
        <line x1="790" y1="248" x2="790" y2="752" />
        <line x1="758" y1="796" x2="532" y2="892" />
        <line x1="468" y1="892" x2="242" y2="796" />
        <line x1="98" y1="468" x2="198" y2="250" />
        <line x1="252" y1="240" x2="468" y2="108" />
        <line x1="105" y1="535" x2="442" y2="878" />
        <line x1="607" y1="222" x2="890" y2="500" />
        <line x1="730" y1="643" x2="890" y2="500" />
        <line x1="698" y1="755" x2="565" y2="880" />
        <line x1="135" y1="528" x2="401" y2="712" />
        <line x1="270" y1="372" x2="110" y2="500" />
      </g>

      {/* Small Terminal Accent Dots */}
      <g fill="currentColor">
        <circle cx="607" cy="222" r="9" />
        <circle cx="730" cy="643" r="9" />
        <circle cx="698" cy="755" r="9" />
        <circle cx="268" cy="620" r="9" />
        <circle cx="270" cy="372" r="9" />
      </g>

      {/* Inner Ring Nodes (8 Medium Circles) */}
      <g fill="currentColor">
        <circle cx="576.5" cy="315.2" r="31" />
        <circle cx="684.8" cy="423.5" r="31" />
        <circle cx="684.8" cy="576.5" r="31" />
        <circle cx="576.5" cy="684.8" r="31" />
        <circle cx="423.5" cy="684.8" r="31" />
        <circle cx="315.2" cy="576.5" r="31" />
        <circle cx="315.2" cy="423.5" r="31" />
        <circle cx="423.5" cy="315.2" r="31" />
      </g>

      {/* Outer Ring Nodes (8 Large Circles) */}
      <g fill="currentColor">
        <circle cx="500" cy="110" r="41" />
        <circle cx="775.8" cy="224.2" r="41" />
        <circle cx="890" cy="500" r="41" />
        <circle cx="775.8" cy="775.8" r="41" />
        <circle cx="500" cy="890" r="41" />
        <circle cx="224.2" cy="775.8" r="41" />
        <circle cx="110" cy="500" r="41" />
        <circle cx="224.2" cy="224.2" r="41" />
      </g>
    </svg>
  );
};
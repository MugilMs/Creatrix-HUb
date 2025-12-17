interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const Logo = ({ size = 'md', showText = true, className = '' }: LogoProps) => {
  const sizes = {
    sm: { icon: 32, text: 'text-lg' },
    md: { icon: 40, text: 'text-xl' },
    lg: { icon: 56, text: 'text-3xl' },
  };

  const { icon, text } = sizes[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo Icon - Geometric C with hexagon pattern */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5227FF" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#FF9FFC" />
          </linearGradient>
        </defs>
        
        {/* Outer hexagon ring */}
        <path
          d="M50 5 L85 27.5 L85 72.5 L50 95 L15 72.5 L15 27.5 Z"
          stroke="url(#logoGradient)"
          strokeWidth="3"
          fill="none"
        />
        
        {/* Inner C shape made of hexagons */}
        <path
          d="M65 35 C65 28 60 23 50 23 C40 23 35 28 35 35 L35 65 C35 72 40 77 50 77 C60 77 65 72 65 65"
          stroke="url(#logoGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Small hexagon accents */}
        <circle cx="50" cy="50" r="3" fill="url(#logoGradient)" />
        <circle cx="70" cy="50" r="2" fill="url(#logoGradient)" opacity="0.6" />
      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-bold ${text} bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent`}>
            Creatrix
          </span>
          <span className={`text-xs font-medium text-gray-600 tracking-wider`}>
            HUB
          </span>
        </div>
      )}
    </div>
  );
};

// Simplified icon-only version
export const LogoIcon = ({ size = 40, className = '' }: { size?: number; className?: string }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5227FF" />
          <stop offset="50%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#FF9FFC" />
        </linearGradient>
      </defs>
      
      <path
        d="M50 5 L85 27.5 L85 72.5 L50 95 L15 72.5 L15 27.5 Z"
        stroke="url(#iconGradient)"
        strokeWidth="3"
        fill="none"
      />
      
      <path
        d="M65 35 C65 28 60 23 50 23 C40 23 35 28 35 35 L35 65 C35 72 40 77 50 77 C60 77 65 72 65 65"
        stroke="url(#iconGradient)"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      
      <circle cx="50" cy="50" r="3" fill="url(#iconGradient)" />
      <circle cx="70" cy="50" r="2" fill="url(#iconGradient)" opacity="0.6" />
    </svg>
  );
};

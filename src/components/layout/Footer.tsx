import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border-base bg-surface-base py-6 transition-colors duration-150 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Brand Copyright */}
        <div className="flex items-center gap-2 text-xs text-text-mute font-mono">
          <span>&copy; {currentYear} SkillDrill.</span>
          <span>•</span>
          <span>Sharpen your documentation skills.</span>
        </div>

        {/* System Status Indicators (GitHub/Vercel inspired style) */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-success-base">
            <span className="h-2 w-2 rounded-full bg-success-base animate-pulse"></span>
            <span>All Systems Operational</span>
          </div>
          <span className="text-text-mute">v1.0.0 (MVP)</span>
        </div>
      </div>
    </footer>
  );
};
export default Footer;

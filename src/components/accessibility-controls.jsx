import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Type, Plus, Minus, RotateCcw, Settings, Eye, Palette, Focus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AccessibilityControls({ className, ...props }) {
  const [fontSize, setFontSize] = useState(100); // Percentage
  const [isExpanded, setIsExpanded] = useState(false);
  const [colorblindFilter, setColorblindFilter] = useState('none');
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Load saved settings from localStorage on component mount
  useEffect(() => {
    const savedFontSize = localStorage.getItem('accessibility-font-size');
    const savedColorblindFilter = localStorage.getItem('accessibility-colorblind-filter');
    const savedHighContrast = localStorage.getItem('accessibility-high-contrast');
    const savedReducedMotion = localStorage.getItem('accessibility-reduced-motion');

    if (savedFontSize) {
      const size = parseInt(savedFontSize);
      setFontSize(size);
      applyFontSize(size);
    }

    if (savedColorblindFilter) {
      setColorblindFilter(savedColorblindFilter);
      applyColorblindFilter(savedColorblindFilter);
    }

    if (savedHighContrast) {
      const contrast = savedHighContrast === 'true';
      setHighContrast(contrast);
      applyHighContrast(contrast);
    }

    if (savedReducedMotion) {
      const motion = savedReducedMotion === 'true';
      setReducedMotion(motion);
      applyReducedMotion(motion);
    }
  }, []);

  // Apply font size to document root
  const applyFontSize = (size) => {
    document.documentElement.style.fontSize = `${size}%`;
    localStorage.setItem('accessibility-font-size', size.toString());
  };

  // Apply colorblind filters
  const applyColorblindFilter = (filter) => {
    const body = document.body;
    // Remove existing filter classes
    body.classList.remove('accessibility-protanopia', 'accessibility-deuteranopia', 'accessibility-tritanopia', 'accessibility-monochrome');

    if (filter !== 'none') {
      body.classList.add(`accessibility-${filter}`);
    }
    localStorage.setItem('accessibility-colorblind-filter', filter);
  };

  // Apply high contrast mode
  const applyHighContrast = (enabled) => {
    const body = document.body;
    if (enabled) {
      body.classList.add('accessibility-high-contrast');
    } else {
      body.classList.remove('accessibility-high-contrast');
    }
    localStorage.setItem('accessibility-high-contrast', enabled.toString());
  };

  // Apply reduced motion
  const applyReducedMotion = (enabled) => {
    const body = document.body;
    if (enabled) {
      body.classList.add('accessibility-reduced-motion');
    } else {
      body.classList.remove('accessibility-reduced-motion');
    }
    localStorage.setItem('accessibility-reduced-motion', enabled.toString());
  };

  // Font size controls
  const increaseFontSize = () => {
    const newSize = Math.min(fontSize + 10, 150);
    setFontSize(newSize);
    applyFontSize(newSize);
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(fontSize - 10, 80);
    setFontSize(newSize);
    applyFontSize(newSize);
  };

  const resetFontSize = () => {
    setFontSize(100);
    applyFontSize(100);
  };

  // Colorblind filter controls
  const toggleColorblindFilter = () => {
    const filters = ['none', 'protanopia', 'deuteranopia', 'tritanopia', 'monochrome'];
    const currentIndex = filters.indexOf(colorblindFilter);
    const nextFilter = filters[(currentIndex + 1) % filters.length];
    setColorblindFilter(nextFilter);
    applyColorblindFilter(nextFilter);
  };

  // High contrast toggle
  const toggleHighContrast = () => {
    const newContrast = !highContrast;
    setHighContrast(newContrast);
    applyHighContrast(newContrast);
  };

  // Reduced motion toggle
  const toggleReducedMotion = () => {
    const newMotion = !reducedMotion;
    setReducedMotion(newMotion);
    applyReducedMotion(newMotion);
  };

  // Reset all settings
  const resetAllSettings = () => {
    setFontSize(100);
    setColorblindFilter('none');
    setHighContrast(false);
    setReducedMotion(false);

    applyFontSize(100);
    applyColorblindFilter('none');
    applyHighContrast(false);
    applyReducedMotion(false);
  };

  const getColorblindFilterLabel = () => {
    const labels = {
      'none': 'Normal',
      'protanopia': 'Protanopia',
      'deuteranopia': 'Deuteranopia',
      'tritanopia': 'Tritanopia',
      'monochrome': 'Monochrome'
    };
    return labels[colorblindFilter];
  };

  return (
    <>
      <div
        className={cn(
          'fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out',
          className
        )}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        {...props}
      >
        <TooltipProvider>
          <div
            className={cn(
              'flex gap-2 p-2 bg-background border rounded-lg shadow-lg transition-all duration-300 ease-in-out',
              isExpanded ? 'flex-col' : 'flex-row'
            )}
          >
            {/* Collapsed state - Settings icon */}
            {!isExpanded && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Accessibility Controls</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Expanded state - All controls */}
            {isExpanded && (
              <>
                {/* Header */}
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground px-2 pb-1 border-b">
                  <Settings className="h-3 w-3" />
                  <span>Accessibility</span>
                </div>

                {/* Font Size Section */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground px-2">
                    <Type className="h-3 w-3" />
                    <span>Font: {fontSize}%</span>
                  </div>

                  <div className="flex gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={decreaseFontSize}
                          disabled={fontSize <= 80}
                          className="h-6 w-6 p-0 text-xs"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>Decrease font size</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={increaseFontSize}
                          disabled={fontSize >= 150}
                          className="h-6 w-6 p-0 text-xs"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>Increase font size</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* Vision Filters Section */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground px-2">
                    <Palette className="h-3 w-3" />
                    <span>Vision</span>
                  </div>

                  {/* Colorblind Filter */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={colorblindFilter !== 'none' ? 'default' : 'outline'}
                        size="sm"
                        onClick={toggleColorblindFilter}
                        className="h-6 text-xs justify-start px-2"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        {getColorblindFilterLabel()}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>Toggle colorblind filters</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* High Contrast */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={highContrast ? 'default' : 'outline'}
                        size="sm"
                        onClick={toggleHighContrast}
                        className="h-6 text-xs justify-start px-2"
                      >
                        <Focus className="h-3 w-3 mr-1" />
                        High Contrast
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>Toggle high contrast mode</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Reset Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetAllSettings}
                      className="h-6 text-xs"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Reset All
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Reset all accessibility settings</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        </TooltipProvider>
      </div>

      {/* CSS Styles for accessibility filters */}
      <style jsx>{`
        .accessibility-protanopia {
          filter: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><defs><filter id="protanopia"><feColorMatrix type="matrix" values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0"/></filter></defs></svg>#protanopia');
        }
        
        .accessibility-deuteranopia {
          filter: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><defs><filter id="deuteranopia"><feColorMatrix type="matrix" values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0"/></filter></defs></svg>#deuteranopia');
        }
        
        .accessibility-tritanopia {
          filter: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><defs><filter id="tritanopia"><feColorMatrix type="matrix" values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0"/></filter></defs></svg>#tritanopia');
        }
        
        .accessibility-monochrome {
          filter: grayscale(100%);
        }
        
        .accessibility-high-contrast {
          filter: contrast(150%) brightness(110%);
        }
        
        .accessibility-reduced-motion * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `}</style>
    </>
  );
}

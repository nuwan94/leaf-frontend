import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export default function LocalizedFieldGroup({
  label,
  name,
  register,
  errors = {},
  required = false,
  languages = ['si', 'ta'],
  placeholders = {},
  textarea = false,
}) {
  const { t } = useTranslation();
  const langLabels = {
    en: t('English') || 'English',
    si: t('Sinhala') || 'සිංහල',
    ta: t('Tamil') || 'தமිழ்',
  };
  
  const allLanguages = ['en', ...languages];
  const [selectedLang, setSelectedLang] = useState('en');

  return (
    <div className="flex flex-col gap-2 w-full">
      <Label className="mb-1">
        {label}{required ? ' *' : ''}
      </Label>
      
      {/* Input Field with Appended Language Toggle */}
      <div className="relative">
        {textarea ? (
          <div className="relative">
            <textarea
              key={selectedLang}
              className="w-full border rounded px-3 py-2 pr-32 min-h-[80px] resize-y"
              {...register(`${name}.${selectedLang}`)}
              autoComplete="off"
              placeholder={placeholders[selectedLang] || `${label} (${langLabels[selectedLang]})`}
            />
            {/* Language Toggle Buttons for Textarea */}
            <div className="absolute top-2 right-2 flex gap-1">
              {allLanguages.map((lang) => (
                <Button
                  key={lang}
                  type="button"
                  variant={selectedLang === lang ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLang(lang)}
                  className="h-6 px-2 text-xs"
                >
                  {lang.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-stretch border border-input rounded-md bg-background">
            <Input
              key={selectedLang}
              className="flex-1 border-0 rounded-r-none focus-visible:ring-0 focus-visible:ring-offset-0"
              {...register(`${name}.${selectedLang}`)}
              autoComplete="off"
              placeholder={placeholders[selectedLang] || `${label} (${langLabels[selectedLang]})`}
            />
            {/* Language Toggle Buttons for Input */}
            <div className="flex border-l">
              {allLanguages.map((lang, index) => (
                <Button
                  key={lang}
                  type="button"
                  variant={selectedLang === lang ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedLang(lang)}
                  className={`h-auto px-3 text-xs rounded-none border-0 ${
                    index !== 0 ? 'border-l border-border' : ''
                  } ${
                    index === allLanguages.length - 1 ? 'rounded-r-[calc(0.375rem-1px)]' : ''
                  }`}
                >
                  {lang.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {errors[name]?.[selectedLang] && (
          <p className="text-xs text-red-500 mt-1">
            {errors[name][selectedLang].message}
          </p>
        )}
      </div>
    </div>
  );
}

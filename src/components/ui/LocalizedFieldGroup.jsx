
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Globe } from 'lucide-react';

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
    ta: t('Tamil') || 'தமிழ்',
  };
  const [popoverOpen, setPopoverOpen] = useState(false);
  // Always show EN, others in popover
  return (
    <div className="flex flex-col gap-2 w-full">
      <Label className="mb-1">
        {label} ({langLabels['en']}){required ? ' *' : ''}
      </Label>
      <div className="flex flex-row items-center gap-2 w-full">
        {textarea ? (
          <textarea
            className="flex-1 border rounded px-3 py-2 min-h-[80px] resize-y"
            {...register(`${name}.en`)}
            autoComplete="off"
            placeholder={placeholders['en'] || ''}
          />
        ) : (
          <Input
            className="flex-1"
            {...register(`${name}.en`)}
            autoComplete="off"
            placeholder={placeholders['en'] || ''}
          />
        )}
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="icon" className="align-middle border border-gray-300 dark:border-gray-600">
              <Globe className="w-5 h-5" />
              <span className="sr-only">{t('Other Languages') || 'Other Languages'}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 max-w-full">
            <div className="flex flex-col gap-4">
              {languages.filter(lang => lang !== 'en').map((lang) => (
                <div className="flex flex-col gap-2" key={lang}>
                  <Label className="mb-1">
                    {label} ({langLabels[lang] || lang})
                  </Label>
                  {textarea ? (
                    <textarea
                      className="border rounded px-3 py-2 min-h-[80px] resize-y"
                      {...register(`${name}.${lang}`)}
                      autoComplete="off"
                      placeholder={placeholders[lang] || ''}
                    />
                  ) : (
                    <Input
                      {...register(`${name}.${lang}`)}
                      autoComplete="off"
                      placeholder={placeholders[lang] || ''}
                    />
                  )}
                  {errors?.[name]?.[lang]?.message && (
                    <p className="text-xs text-red-500 mt-1">{errors[name][lang].message}</p>
                  )}
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      {errors?.[name]?.en?.message && (
        <p className="text-xs text-red-500 mt-1">{errors[name].en.message}</p>
      )}
    </div>
  );
}

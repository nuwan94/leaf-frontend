import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export function LangSelector() {
  const { i18n } = useTranslation();

  // Load saved language preference on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('user-language');
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  const handleLanguageChange = (language) => {
    i18n.changeLanguage(language);
    // Save language preference to localStorage
    localStorage.setItem('user-language', language);
  };

  return (
    <Select value={i18n.language} onValueChange={handleLanguageChange}>
      <SelectTrigger className="min-w-[110px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="si">සිංහල</SelectItem>
        <SelectItem value="ta">தமிழ்</SelectItem>
      </SelectContent>
    </Select>
  );
}

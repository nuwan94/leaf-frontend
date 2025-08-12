import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { changeLanguageWithFetch } from '@/lib/i18n';
import { Loader2 } from 'lucide-react';

export function LangSelector() {
  const { i18n } = useTranslation();
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);

  // Load saved language preference on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('user-language');
    if (savedLanguage && savedLanguage !== i18n.language) {
      changeLanguageWithFetch(savedLanguage);
    }
  }, [i18n]);

  const handleLanguageChange = async (language) => {
    if (language === i18n.language) return; // Don't change if same language

    setIsChangingLanguage(true);
    try {
      const success = await changeLanguageWithFetch(language);
      if (!success) {
        console.error('Failed to change language');
        // Optionally show an error toast here
      }
    } catch (error) {
      console.error('Error changing language:', error);
    } finally {
      setIsChangingLanguage(false);
    }
  };

  return (
    <Select
      value={i18n.language}
      onValueChange={handleLanguageChange}
      disabled={isChangingLanguage}
    >
      <SelectTrigger className="min-w-[110px]">
        {isChangingLanguage ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </div>
        ) : (
          <SelectValue />
        )}
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="si">සිංහල</SelectItem>
        <SelectItem value="ta">தமிழ்</SelectItem>
      </SelectContent>
    </Select>
  );
}

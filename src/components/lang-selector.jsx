import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';

export function LangSelector() {
  const { i18n } = useTranslation();
  return (
    <Select value={i18n.language} onValueChange={i18n.changeLanguage}>
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


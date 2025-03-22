import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { translations } from './translations';

export const useTranslation = () => {
  const language = useSelector((state: RootState) => state.app.language);

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  return { t };
};
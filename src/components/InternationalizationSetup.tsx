import React, { useState, useEffect, createContext, useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { 
  Globe, 
  Languages, 
  MapPin, 
  Clock, 
  DollarSign,
  Users,
  Settings,
  Check
} from 'lucide-react';

// Translation context
interface TranslationContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
};

// Sample translations - in a real app, these would come from a translation service
const translations = {
  en: {
    'app.title': 'Final Form AI',
    'nav.home': 'Home',
    'nav.workouts': 'Workouts',
    'nav.nutrition': 'Nutrition',
    'nav.progress': 'Progress',
    'nav.profile': 'Profile',
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'workout.start': 'Start Workout',
    'nutrition.log_meal': 'Log Meal',
    'progress.view_stats': 'View Stats'
  },
  es: {
    'app.title': 'Final Form AI',
    'nav.home': 'Inicio',
    'nav.workouts': 'Entrenamientos',
    'nav.nutrition': 'Nutrición',
    'nav.progress': 'Progreso',
    'nav.profile': 'Perfil',
    'common.loading': 'Cargando...',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'workout.start': 'Iniciar Entrenamiento',
    'nutrition.log_meal': 'Registrar Comida',
    'progress.view_stats': 'Ver Estadísticas'
  },
  fr: {
    'app.title': 'Final Form AI',
    'nav.home': 'Accueil',
    'nav.workouts': 'Entraînements',
    'nav.nutrition': 'Nutrition',
    'nav.progress': 'Progrès',
    'nav.profile': 'Profil',
    'common.loading': 'Chargement...',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'workout.start': 'Commencer l\'Entraînement',
    'nutrition.log_meal': 'Enregistrer un Repas',
    'progress.view_stats': 'Voir les Statistiques'
  },
  de: {
    'app.title': 'Final Form AI',
    'nav.home': 'Startseite',
    'nav.workouts': 'Training',
    'nav.nutrition': 'Ernährung',
    'nav.progress': 'Fortschritt',
    'nav.profile': 'Profil',
    'common.loading': 'Laden...',
    'common.save': 'Speichern',
    'common.cancel': 'Abbrechen',
    'workout.start': 'Training Starten',
    'nutrition.log_meal': 'Mahlzeit Erfassen',
    'progress.view_stats': 'Statistiken Anzeigen'
  },
  ja: {
    'app.title': 'Final Form AI',
    'nav.home': 'ホーム',
    'nav.workouts': 'ワークアウト',
    'nav.nutrition': '栄養',
    'nav.progress': '進捗',
    'nav.profile': 'プロフィール',
    'common.loading': '読み込み中...',
    'common.save': '保存',
    'common.cancel': 'キャンセル',
    'workout.start': 'ワークアウト開始',
    'nutrition.log_meal': '食事記録',
    'progress.view_stats': '統計を見る'
  },
  ar: {
    'app.title': 'Final Form AI',
    'nav.home': 'الرئيسية',
    'nav.workouts': 'التمارين',
    'nav.nutrition': 'التغذية',
    'nav.progress': 'التقدم',
    'nav.profile': 'الملف الشخصي',
    'common.loading': 'جاري التحميل...',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'workout.start': 'بدء التمرين',
    'nutrition.log_meal': 'تسجيل الوجبة',
    'progress.view_stats': 'عرض الإحصائيات'
  }
};

const supportedLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸', rtl: false },
  { code: 'es', name: 'Español', flag: '🇪🇸', rtl: false },
  { code: 'fr', name: 'Français', flag: '🇫🇷', rtl: false },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', rtl: false },
  { code: 'ja', name: '日本語', flag: '🇯🇵', rtl: false },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'zh', name: '中文', flag: '🇨🇳', rtl: false },
  { code: 'pt', name: 'Português', flag: '🇧🇷', rtl: false },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', rtl: false },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', rtl: false }
];

export const TranslationProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('app_language') || navigator.language.split('-')[0] || 'en';
  });

  const currentLang = supportedLanguages.find(lang => lang.code === language);
  const isRTL = currentLang?.rtl || false;

  const t = (key: string): string => {
    const langTranslations = translations[language as keyof typeof translations];
    return langTranslations?.[key as keyof typeof langTranslations] || key;
  };

  const changeLanguage = (newLang: string) => {
    setLanguage(newLang);
    localStorage.setItem('app_language', newLang);
    
    // Update document direction for RTL languages
    document.dir = supportedLanguages.find(lang => lang.code === newLang)?.rtl ? 'rtl' : 'ltr';
  };

  useEffect(() => {
    document.dir = isRTL ? 'rtl' : 'ltr';
  }, [isRTL]);

  return (
    <TranslationContext.Provider value={{ language, setLanguage: changeLanguage, t, isRTL }}>
      {children}
    </TranslationContext.Provider>
  );
};

interface RegionSettings {
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
  currency: string;
  measurementSystem: 'metric' | 'imperial';
  firstDayOfWeek: 'sunday' | 'monday';
}

export const InternationalizationSetup = () => {
  const { toast } = useToast();
  const { language, setLanguage, t } = useTranslation();
  const [regionSettings, setRegionSettings] = useState<RegionSettings>({
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    numberFormat: 'en-US',
    currency: 'USD',
    measurementSystem: 'imperial',
    firstDayOfWeek: 'sunday'
  });
  const [autoDetect, setAutoDetect] = useState(false);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    toast({
      title: "Language Updated! 🌍",
      description: `App language changed to ${supportedLanguages.find(l => l.code === newLanguage)?.name}`,
    });
  };

  const handleRegionSettingChange = (key: keyof RegionSettings, value: string) => {
    setRegionSettings(prev => ({ ...prev, [key]: value }));
  };

  const detectUserRegion = async () => {
    try {
      // Simulate detecting user region based on IP/browser
      const mockRegion = {
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        numberFormat: 'en-GB',
        currency: 'EUR',
        measurementSystem: 'metric' as const,
        firstDayOfWeek: 'monday' as const
      };
      
      setRegionSettings(mockRegion);
      toast({
        title: "Region Auto-Detected! 📍",
        description: "Settings updated based on your location.",
      });
    } catch (error) {
      toast({
        title: "Detection Failed",
        description: "Unable to detect your region automatically.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
          Internationalization Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Customize your app experience for your language and region
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="w-5 h-5" />
              Language & Localization
            </CardTitle>
            <CardDescription>
              Choose your preferred language and enable auto-detection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>App Language</Label>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {supportedLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                        {lang.code === language && <Check className="w-4 h-4" />}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="auto-detect">Auto-detect language</Label>
              <Switch
                id="auto-detect"
                checked={autoDetect}
                onCheckedChange={setAutoDetect}
              />
            </div>

            {/* Translation Status */}
            <div className="space-y-2">
              <Label>Translation Status</Label>
              <div className="grid grid-cols-2 gap-2">
                {supportedLanguages.slice(0, 6).map((lang) => (
                  <div key={lang.code} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span className="text-sm">{lang.name}</span>
                    </div>
                    <Badge variant={lang.code === 'en' ? 'default' : 'secondary'} className="text-xs">
                      {lang.code === 'en' ? '100%' : '85%'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Regional Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Regional Settings
            </CardTitle>
            <CardDescription>
              Customize date, time, and number formats for your region
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <Button onClick={detectUserRegion} variant="outline" size="sm">
                <Globe className="w-4 h-4 mr-2" />
                Auto-detect Region
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Date Format</Label>
              <Select 
                value={regionSettings.dateFormat} 
                onValueChange={(value) => handleRegionSettingChange('dateFormat', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (US)</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (UK)</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
                  <SelectItem value="DD.MM.YYYY">DD.MM.YYYY (DE)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Time Format</Label>
              <Select 
                value={regionSettings.timeFormat}
                onValueChange={(value) => handleRegionSettingChange('timeFormat', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                  <SelectItem value="24h">24-hour</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Currency</Label>
              <Select 
                value={regionSettings.currency}
                onValueChange={(value) => handleRegionSettingChange('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                  <SelectItem value="CAD">CAD ($)</SelectItem>
                  <SelectItem value="AUD">AUD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Measurement System</Label>
              <Select 
                value={regionSettings.measurementSystem}
                onValueChange={(value) => handleRegionSettingChange('measurementSystem', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Metric (kg, cm, °C)</SelectItem>
                  <SelectItem value="imperial">Imperial (lbs, ft, °F)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Preview & Testing
            </CardTitle>
            <CardDescription>
              See how your settings affect the app interface
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* UI Preview */}
              <div className="space-y-3">
                <h4 className="font-semibold">Interface Elements</h4>
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="space-y-2">
                    <div className="font-medium">{t('app.title')}</div>
                    <div className="flex gap-2 text-sm">
                      <span>{t('nav.home')}</span>
                      <span>•</span>
                      <span>{t('nav.workouts')}</span>
                      <span>•</span>
                      <span>{t('nav.nutrition')}</span>
                    </div>
                    <Button size="sm" className="mt-2">
                      {t('workout.start')}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Format Preview */}
              <div className="space-y-3">
                <h4 className="font-semibold">Format Examples</h4>
                <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Date:</span>
                    <span className="text-sm font-mono">
                      {regionSettings.dateFormat === 'MM/DD/YYYY' ? '12/25/2024' :
                       regionSettings.dateFormat === 'DD/MM/YYYY' ? '25/12/2024' :
                       regionSettings.dateFormat === 'YYYY-MM-DD' ? '2024-12-25' : '25.12.2024'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Time:</span>
                    <span className="text-sm font-mono">
                      {regionSettings.timeFormat === '12h' ? '2:30 PM' : '14:30'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Currency:</span>
                    <span className="text-sm font-mono">
                      {regionSettings.currency === 'USD' ? '$29.99' :
                       regionSettings.currency === 'EUR' ? '€29.99' :
                       regionSettings.currency === 'GBP' ? '£29.99' : '¥2999'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Weight:</span>
                    <span className="text-sm font-mono">
                      {regionSettings.measurementSystem === 'metric' ? '70 kg' : '154 lbs'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
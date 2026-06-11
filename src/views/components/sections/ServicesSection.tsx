import {
  BarChart3,
  Bell,
  Bot,
  Building2,
  CalendarCheck,
  ClipboardList,
  Cloud,
  Database,
  FileSpreadsheet,
  FileText,
  Globe,
  Headphones,
  LayoutTemplate,
  Lightbulb,
  Link2,
  MapPin,
  MessageCircle,
  Package,
  PenTool,
  Plug,
  Receipt,
  RefreshCw,
  Search,
  Shield,
  ShoppingCart,
  Smartphone,
  Store,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import type { ServiceCategory, ServiceOffering } from '../../../models';
import { Button } from '../ui/Button';
import { SectionTitle } from '../ui/SectionTitle';
import './ServicesSection.css';

interface ServicesSectionProps {
  services: ServiceOffering[];
  onNavigate: (href: string) => void;
}

const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  web: 'Sitios web y presencia digital',
  commerce: 'E-commerce y ventas online',
  business: 'Gestión empresarial',
  mobile: 'Aplicaciones móviles',
  data: 'Automatización y datos',
  integrations: 'APIs e integraciones',
  custom: '¿Algo más en mente?',
};

const CATEGORY_ORDER: ServiceCategory[] = [
  'web',
  'commerce',
  'business',
  'mobile',
  'data',
  'integrations',
  'custom',
];

const SERVICE_ICONS: Record<string, LucideIcon> = {
  'web-corporate': Building2,
  'web-landing': LayoutTemplate,
  'web-portfolio': PenTool,
  'web-blog': FileText,
  'web-redesign': RefreshCw,
  'web-multilang': Globe,
  'web-niche': Store,
  'ecommerce-store': ShoppingCart,
  'ecommerce-catalog': Package,
  'ecommerce-payments': Wallet,
  'ecommerce-orders': ClipboardList,
  'ecommerce-marketplace': Store,
  'biz-inventory': Package,
  'biz-invoicing': Receipt,
  'biz-pos': Store,
  'biz-crm': Users,
  'biz-expenses': FileSpreadsheet,
  'biz-hr': Users,
  'biz-booking': CalendarCheck,
  'biz-documents': FileText,
  'biz-dashboard': BarChart3,
  'biz-reports': FileSpreadsheet,
  'mobile-android': Smartphone,
  'mobile-field': MapPin,
  'mobile-audit': ClipboardList,
  'mobile-cloud': Cloud,
  'data-etl': Database,
  'data-reports': FileSpreadsheet,
  'data-sync': RefreshCw,
  'data-scraping': Search,
  'data-analytics': BarChart3,
  'int-api': Plug,
  'int-external': Link2,
  'int-auth': Shield,
  'int-microservices': Cloud,
  'int-migration': Database,
  'int-search': Search,
  'int-chatbot': Bot,
  'int-notifications': Bell,
  'int-maps': MapPin,
  'int-media': FileText,
  'int-tickets': Headphones,
  'custom-idea': Lightbulb,
  'custom-consult': MessageCircle,
};

export function ServicesSection({ services, onNavigate }: ServicesSectionProps) {
  return (
    <section id="servicios" className="services section">
      <div className="container">
        <SectionTitle
          label="Servicios"
          title="¿Qué puedo desarrollar para ti?"
          subtitle="Desde una landing page hasta un sistema completo a medida. Si lo puedes imaginar, lo podemos construir."
          align="center"
        />

        <div className="services__categories">
          {CATEGORY_ORDER.map((category) => {
            const items = services.filter((service) => service.category === category);
            if (items.length === 0) return null;

            return (
              <div key={category} className="services__category">
                <h3 className="services__category-title">{CATEGORY_LABELS[category]}</h3>
                <div className="services__grid">
                  {items.map((service) => {
                    const Icon = SERVICE_ICONS[service.id] ?? Lightbulb;

                    return (
                      <article key={service.id} className="services__card">
                        <div className="services__card-icon">
                          <Icon size={22} />
                        </div>
                        <h4 className="services__card-title">{service.title}</h4>
                        <p className="services__card-desc">{service.description}</p>
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="services__cta">
          <p className="services__cta-text">
            ¿No ves exactamente lo que necesitas? Escríbeme tu idea — sin compromiso — y te digo
            cómo podemos hacerla realidad.
          </p>
          <Button onClick={() => onNavigate('#contacto')} size="lg">
            <MessageCircle size={18} /> Cuéntame tu proyecto
          </Button>
        </div>
      </div>
    </section>
  );
}

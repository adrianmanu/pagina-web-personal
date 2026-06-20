import type { Profile, Project, Skill, NavItem, ServiceOffering } from '../models';

const PROFILE: Profile = {
  name: 'Adrian Esteban Ramos Acosta',
  title: 'Ingeniero de Software Full Stack & Mobile',
  tagline:
    'Transformo requerimientos complejos en productos digitales de alto rendimiento con arquitecturas escalables',
  bio: 'Ingeniero de Software con 3 años de experiencia en el ciclo completo de desarrollo (SDLC). Especialista en Java (Spring Boot) y JavaScript/TypeScript (React, Angular, Node.js), con experiencia en microservicios, contenedores Docker y desarrollo móvil nativo con Kotlin. Destaco por innovación técnica: motores de búsqueda con Elasticsearch, procesamiento multimedia y sistemas de autenticación OAuth2. Graduando de Ingeniería de Software en la Universidad de las Fuerzas Armadas ESPE.',
  email: 'adrianestebanra@hotmail.com',
  phone: '+593 97 916 5437',
  location: 'Quito, Ecuador',
  linkedin: 'https://www.linkedin.com/in/adrian-e-ramos',
};

const NAV_ITEMS: NavItem[] = [
  { id: 'inicio', label: 'Inicio', href: '#inicio' },
  { id: 'sobre-mi', label: 'Sobre mí', href: '#sobre-mi' },
  { id: 'servicios', label: 'Servicios', href: '#servicios' },
  { id: 'habilidades', label: 'Habilidades', href: '#habilidades' },
  { id: 'proyectos', label: 'Proyectos', href: '#proyectos' },
  { id: 'contacto', label: 'Contacto', href: '#contacto' },
];

const SERVICES: ServiceOffering[] = [
  {
    id: 'web-corporate',
    title: 'Páginas web corporativas',
    description:
      'Sitios institucionales para empresas, negocios o profesionales con diseño moderno y responsive.',
    category: 'web',
  },
  {
    id: 'web-landing',
    title: 'Landing pages',
    description:
      'Páginas de aterrizaje enfocadas en conversión: captar leads, promocionar un producto o lanzar una campaña.',
    category: 'web',
  },
  {
    id: 'web-portfolio',
    title: 'Portafolios y sitios personales',
    description:
      'Presencia digital profesional para freelancers, artistas, consultores o cualquier marca personal.',
    category: 'web',
  },
  {
    id: 'web-blog',
    title: 'Blogs y sitios de contenido',
    description:
      'Plataformas para publicar artículos, noticias, tutoriales o contenido SEO con panel de administración.',
    category: 'web',
  },
  {
    id: 'web-redesign',
    title: 'Rediseño y modernización',
    description:
      'Actualizo sitios antiguos: nuevo diseño, mejor rendimiento, versión móvil y tecnologías actuales.',
    category: 'web',
  },
  {
    id: 'web-multilang',
    title: 'Sitios multilingües',
    description:
      'Páginas web en varios idiomas para llegar a más clientes en Ecuador y el exterior.',
    category: 'web',
  },
  {
    id: 'web-niche',
    title: 'Sitios por rubro',
    description:
      'Web a medida para restaurantes, clínicas, abogados, inmobiliarias, gimnasios, talleres y más.',
    category: 'web',
  },
  {
    id: 'ecommerce-store',
    title: 'Tiendas online (e-commerce)',
    description:
      'Tienda completa con catálogo, carrito, checkout y panel para administrar productos y pedidos.',
    category: 'commerce',
  },
  {
    id: 'ecommerce-catalog',
    title: 'Catálogos digitales con pedidos',
    description:
      'Muestra tus productos o servicios online y recibe pedidos por WhatsApp, email o formulario.',
    category: 'commerce',
  },
  {
    id: 'ecommerce-payments',
    title: 'Pasarelas de pago',
    description:
      'Integración de pagos en línea para cobrar con tarjeta, transferencia u otros métodos seguros.',
    category: 'commerce',
  },
  {
    id: 'ecommerce-orders',
    title: 'Gestión de pedidos online',
    description:
      'Panel para ver, confirmar, despachar y dar seguimiento a todos los pedidos de tu negocio.',
    category: 'commerce',
  },
  {
    id: 'ecommerce-marketplace',
    title: 'Marketplaces y plataformas',
    description:
      'Sistemas donde varios vendedores publican productos y los clientes compran en un solo lugar.',
    category: 'commerce',
  },
  {
    id: 'biz-inventory',
    title: 'Control de inventario',
    description:
      'Registra productos, entradas, salidas, stock mínimo y alertas. Ideal para bodegas, tiendas y distribuidoras.',
    category: 'business',
  },
  {
    id: 'biz-invoicing',
    title: 'Facturación y ventas',
    description:
      'Emite facturas, controla clientes, descuenta stock automáticamente y genera reportes de ventas.',
    category: 'business',
  },
  {
    id: 'biz-pos',
    title: 'Punto de venta (POS)',
    description:
      'Sistema de caja para registrar ventas rápidas en mostrador, con impresión o envío de comprobantes.',
    category: 'business',
  },
  {
    id: 'biz-crm',
    title: 'CRM — gestión de clientes',
    description:
      'Organiza contactos, historial de compras, seguimiento de oportunidades y comunicación con clientes.',
    category: 'business',
  },
  {
    id: 'biz-expenses',
    title: 'Control de gastos y finanzas',
    description:
      'Registra ingresos, egresos, cuentas por cobrar y reportes financieros básicos para tu negocio.',
    category: 'business',
  },
  {
    id: 'biz-hr',
    title: 'Gestión de personal',
    description:
      'Control de empleados, asistencia, turnos, permisos y datos del equipo en un solo sistema.',
    category: 'business',
  },
  {
    id: 'biz-booking',
    title: 'Reservas y citas',
    description:
      'Agenda online para clínicas, salones, consultorios, hoteles o cualquier negocio con turnos.',
    category: 'business',
  },
  {
    id: 'biz-documents',
    title: 'Gestión documental',
    description:
      'Archiva, busca y organiza documentos legales, contratos o archivos institucionales con control de acceso.',
    category: 'business',
  },
  {
    id: 'biz-dashboard',
    title: 'Dashboards y KPIs',
    description:
      'Paneles visuales con métricas en tiempo real: ventas, inventario, productividad y rendimiento.',
    category: 'business',
  },
  {
    id: 'biz-reports',
    title: 'Reportes en PDF y Excel',
    description:
      'Exporta información de tu sistema en formatos listos para imprimir, enviar o analizar.',
    category: 'business',
  },
  {
    id: 'mobile-android',
    title: 'Apps Android nativas',
    description:
      'Aplicaciones móviles instalables con diseño moderno, rendimiento nativo y publicación en Play Store.',
    category: 'mobile',
  },
  {
    id: 'mobile-field',
    title: 'Apps de operaciones en campo',
    description:
      'Herramientas para equipos en terreno: rondas, entregas, inspecciones, checklists y geolocalización.',
    category: 'mobile',
  },
  {
    id: 'mobile-audit',
    title: 'Apps de registro y auditoría',
    description:
      'Captura evidencias, fotos, firmas y reportes desde el celular con sincronización en la nube.',
    category: 'mobile',
  },
  {
    id: 'mobile-cloud',
    title: 'Apps con sincronización cloud',
    description:
      'Datos disponibles en móvil y web al mismo tiempo, con respaldo automático y acceso multiusuario.',
    category: 'mobile',
  },
  {
    id: 'data-etl',
    title: 'Automatización de datos (ETL)',
    description:
      'Extrae información de APIs, hojas de cálculo o sistemas externos y consolídala automáticamente.',
    category: 'data',
  },
  {
    id: 'data-reports',
    title: 'Reportes automáticos',
    description:
      'Genera informes periódicos sin intervención manual: ventas diarias, inventario semanal, métricas mensuales.',
    category: 'data',
  },
  {
    id: 'data-sync',
    title: 'Sincronización entre sistemas',
    description:
      'Conecta dos o más plataformas para que los datos se actualicen solos entre ellas.',
    category: 'data',
  },
  {
    id: 'data-scraping',
    title: 'Recolección y consolidación',
    description:
      'Reúne datos de fuentes públicas o privadas y organízalos en un formato útil para tu negocio.',
    category: 'data',
  },
  {
    id: 'data-analytics',
    title: 'Análisis y visualización',
    description:
      'Convierte tus datos en gráficos, tendencias y conclusiones para tomar mejores decisiones.',
    category: 'data',
  },
  {
    id: 'int-api',
    title: 'APIs REST a medida',
    description:
      'Backend robusto para que tu web, app o terceros consuman datos de forma segura y escalable.',
    category: 'integrations',
  },
  {
    id: 'int-external',
    title: 'Integración con servicios externos',
    description:
      'Conecto tu sistema con WhatsApp, email, mapas, pasarelas de pago, ERPs u otras herramientas.',
    category: 'integrations',
  },
  {
    id: 'int-auth',
    title: 'Login, roles y permisos',
    description:
      'Sistemas de acceso con usuarios, contraseñas, recuperación y niveles de permiso por rol.',
    category: 'integrations',
  },
  {
    id: 'int-microservices',
    title: 'Arquitectura de microservicios',
    description:
      'Sistemas modulares y escalables para proyectos que crecen en complejidad y volumen de usuarios.',
    category: 'integrations',
  },
  {
    id: 'int-migration',
    title: 'Migración de datos',
    description:
      'Traslado seguro de información entre sistemas antiguos y nuevos sin perder historial.',
    category: 'integrations',
  },
  {
    id: 'int-search',
    title: 'Búsqueda avanzada',
    description:
      'Motores de búsqueda rápidos con filtros, autocompletado y resultados relevantes en grandes volúmenes.',
    category: 'integrations',
  },
  {
    id: 'int-chatbot',
    title: 'Chatbots y asistentes',
    description:
      'Atención automática 24/7 para responder preguntas frecuentes y captar leads en tu web.',
    category: 'integrations',
  },
  {
    id: 'int-notifications',
    title: 'Notificaciones automáticas',
    description:
      'Alertas por email, SMS o WhatsApp cuando ocurre un evento: pedido nuevo, stock bajo, cita confirmada.',
    category: 'integrations',
  },
  {
    id: 'int-maps',
    title: 'Mapas y geolocalización',
    description:
      'Rutas, ubicación en tiempo real, zonas de cobertura y seguimiento de equipos en el mapa.',
    category: 'integrations',
  },
  {
    id: 'int-media',
    title: 'Procesamiento de archivos',
    description:
      'Subida, compresión y gestión de imágenes, PDFs, videos o documentos en la nube.',
    category: 'integrations',
  },
  {
    id: 'int-tickets',
    title: 'Soporte y tickets',
    description:
      'Sistema de incidencias para que clientes o empleados reporten problemas y den seguimiento.',
    category: 'integrations',
  },
  {
    id: 'custom-idea',
    title: 'Proyecto 100% a medida',
    description:
      '¿Tienes una idea única? La analizamos juntos y construyo la solución exacta que necesitas.',
    category: 'custom',
  },
  {
    id: 'custom-consult',
    title: 'Consultoría técnica',
    description:
      'Te asesoro sobre qué tecnología usar, cómo estructurar tu proyecto y cuál es el mejor camino.',
    category: 'custom',
  },
];

const SKILLS: Skill[] = [
  { name: 'Java', category: 'language', level: 'expert', icon: '☕' },
  { name: 'TypeScript', category: 'language', level: 'expert', icon: '📘' },
  { name: 'JavaScript', category: 'language', level: 'expert', icon: '🟨' },
  { name: 'Python', category: 'language', level: 'advanced', icon: '🐍' },
  { name: 'Kotlin', category: 'language', level: 'advanced', icon: '🤖' },
  { name: 'React', category: 'frontend', level: 'expert', icon: '⚛️' },
  { name: 'Angular', category: 'frontend', level: 'advanced', icon: '🅰️' },
  { name: 'Next.js', category: 'frontend', level: 'advanced', icon: '▲' },
  { name: 'Spring Boot', category: 'backend', level: 'expert', icon: '🍃' },
  { name: 'Node.js', category: 'backend', level: 'advanced', icon: '🟢' },
  { name: 'Express.js', category: 'backend', level: 'advanced', icon: '🚀' },
  { name: 'REST APIs', category: 'backend', level: 'expert', icon: '🔌' },
  { name: 'MySQL', category: 'tools', level: 'expert', icon: '🐬' },
  { name: 'PostgreSQL', category: 'tools', level: 'advanced', icon: '🐘' },
  { name: 'SQL Server', category: 'tools', level: 'intermediate', icon: '🗄️' },
  { name: 'MongoDB', category: 'tools', level: 'advanced', icon: '🍃' },
  { name: 'Elasticsearch', category: 'tools', level: 'advanced', icon: '🔍' },
  { name: 'Firebase', category: 'tools', level: 'advanced', icon: '🔥' },
  { name: 'Docker', category: 'tools', level: 'advanced', icon: '🐳' },
  { name: 'Git', category: 'tools', level: 'expert', icon: '📦' },
  { name: 'AWS', category: 'tools', level: 'intermediate', icon: '☁️' },
  { name: 'Android SDK', category: 'tools', level: 'advanced', icon: '📱' },
];

const PROJECTS: Project[] = [
  {
    id: 'utic-gestion-documental',
    title: 'Sistema de Gestión Documental',
    company: 'UTIC - ESPE',
    period: '2025 – 2026',
    description:
      'Proyecto de titulación: plataforma institucional para gestión y búsqueda de documentos legales.',
    longDescription:
      'Arquitectura de microservicios con Spring Boot para la gestión documental institucional, con búsqueda avanzada y control de acceso OAuth2.',
    technologies: ['Angular 17', 'Spring Boot', 'Java', 'Elasticsearch', 'MongoDB', 'OAuth2', 'Docker'],
    category: 'fullstack',
    featured: true,
    liveUrl: 'demos/utic-documental/',
    imageGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    highlights: [
      'Frontend institucional con Angular 17',
      'Microservicios modulares con Spring Boot',
      'Búsqueda avanzada con Elasticsearch (+70% eficiencia)',
      'Código en repositorio privado por contrato de confidencialidad',
      'Producción accesible solo mediante VPN institucional',
    ],
  },
  {
    id: 'gusvivan-mobile',
    title: 'App de Control de Rondas y Parqueaderos',
    company: 'GUSVIVAN',
    period: '2026',
    description:
      'Aplicación móvil nativa para seguridad: control de rondas, parqueaderos y auditorías en tiempo real.',
    longDescription:
      'App Android de alto impacto con sincronización cloud, procesamiento de imágenes y exportación de reportes para auditorías de seguridad.',
    technologies: ['Kotlin', 'Jetpack Compose', 'Firebase', 'Cloudinary', 'Android SDK'],
    category: 'mobile',
    featured: true,
    liveUrl: 'demos/gusvivan-mobile/',
    apkUrl: 'downloads/app-debug.apk',
    imageGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    highlights: [
      'UI nativa con Kotlin y Jetpack Compose',
      'Backend serverless con Firebase Auth & Firestore',
      'Procesamiento de evidencias fotográficas con Cloudinary',
      'Exportación masiva en PDF y Excel para auditorías',
    ],
  },
  {
    id: 'automatizacion-datos',
    title: 'Automatización de Datos Empresariales',
    company: 'Portafolio Personal',
    period: '2026',
    description:
      'Plataforma full stack con login, dashboard y CRUD para automatizar extracción de datos y reportes analíticos.',
    longDescription:
      'Sistema con FastAPI y React: autenticación JWT, gestión de fuentes de datos, registros de ventas, jobs ETL y exportación de reportes. Demo interactiva en el navegador con datos de ejemplo; el backend FastAPI completo está en el repositorio.',
    technologies: ['React', 'TypeScript', 'FastAPI', 'Python', 'SQLAlchemy', 'JWT'],
    category: 'data',
    featured: true,
    githubPath: 'projects/automatizacion-datos',
    liveUrl: 'demos/automatizacion-datos/',
    imageGradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    highlights: [
      'Login, registro y dashboard con roles de usuario',
      'CRUD de fuentes de datos, registros y jobs ETL',
      'Pipeline automático desde APIs REST externas',
      'Exportación de reportes en PDF y Excel desde el dashboard',
    ],
  },
  {
    id: 'inventory-api',
    title: 'API de Inventario Empresarial',
    company: 'Portafolio Personal',
    period: '2026',
    description:
      'SaaS full stack para inventario, facturación electrónica SRI (Ecuador) y membresías PayPhone.',
    longDescription:
      'Backend Spring Boot con JWT, Factuplan y PayPhone. Frontend React con demo interactiva en el navegador (portafolio) y modo servidor para pruebas SRI reales. Incluye facturas, NC/ND, guías, retenciones, ATS y onboarding.',
    technologies: ['Spring Boot', 'Java', 'React', 'Factuplan', 'PayPhone', 'JWT'],
    category: 'api',
    featured: true,
    githubPath: 'projects/inventory-api',
    liveUrl: 'demos/inventory-api/',
    imageGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    highlights: [
      'Demo en portafolio sin servidor — un clic y listo',
      'Facturación SRI: facturas, NC/ND, guías y retenciones',
      'Membresías con PayPhone (Ecuador) y trial 14 días',
      'Modo servidor con Factuplan ak_test_ para pruebas reales',
      'Exportación PDF/Excel desde dashboard y facturación',
    ],
  },
  {
    id: 'metrics-dashboard',
    title: 'Metrix — Suite de Gestión Empresarial',
    company: 'Portafolio Personal',
    period: '2026',
    description:
      'Suite de gestión en React: dashboard de métricas, CRUD de pedidos y clientes con datos persistentes.',
    longDescription:
      'Aplicación SPA con arquitectura MVC estricta (modelos, servicios, controladores y vistas). KPIs y gráficos calculados en tiempo real a partir de los pedidos y clientes registrados, con persistencia local.',
    technologies: ['React', 'TypeScript', 'React Router', 'SVG Charts', 'CSS3'],
    category: 'frontend',
    featured: true,
    githubPath: 'projects/metrics-dashboard',
    liveUrl: 'demos/metrics-dashboard/',
    imageGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    highlights: [
      'CRUD completo de pedidos y clientes con validaciones',
      'KPIs y gráficos derivados de los datos reales',
      'Búsqueda, filtros, paginación y exportación PDF/Excel',
      'Arquitectura MVC con hooks como controladores',
    ],
  },
  {
    id: 'task-manager-api',
    title: 'TaskFlow — Gestión de Tareas',
    company: 'Portafolio Personal',
    period: '2026',
    description:
      'Aplicación full-stack de gestión de tareas con tablero kanban, prioridades, fechas límite y métricas de productividad.',
    longDescription:
      'Backend en Node.js + Express + TypeScript con autenticación JWT, patrón repositorio y manejo centralizado de errores. Frontend en React con tablero kanban, dashboard de estadísticas y filtros por prioridad. Demo interactiva en el navegador con datos de ejemplo; el backend Node completo está en el repositorio.',
    technologies: ['Node.js', 'TypeScript', 'Express', 'JWT', 'React'],
    category: 'fullstack',
    featured: true,
    githubPath: 'projects/task-manager-api',
    liveUrl: 'demos/task-manager-api/',
    imageGradient: 'linear-gradient(135deg, #06b6d4 0%, #38bdf8 100%)',
    highlights: [
      'Tablero kanban con estados, prioridades y fechas límite',
      'Dashboard con KPIs: vencidas, % completado y próximos vencimientos',
      'Autenticación JWT con registro e inicio de sesión',
      'Exportación de tareas y resumen en PDF y Excel',
    ],
  },
  {
    id: 'ecommerce-store',
    title: 'TiendaNova — E-commerce Completo',
    company: 'Portafolio Personal',
    period: '2026',
    description:
      'Tienda online con catálogo, filtros, carrito, pedidos, cuentas de cliente y panel administrador con inventario.',
    longDescription:
      'Demo de e-commerce completo en React + TypeScript: tienda pública con categorías y filtros, registro de clientes, checkout, historial de pedidos y panel admin con CRUD de productos, categorías, inventario, pedidos y usuarios. Datos persistentes en localStorage para probar el flujo sin backend.',
    technologies: ['React', 'TypeScript', 'React Router', 'localStorage', 'CSS3'],
    category: 'fullstack',
    featured: true,
    githubPath: 'projects/ecommerce-store',
    liveUrl: 'demos/ecommerce-store/',
    imageGradient: 'linear-gradient(135deg, #c45c3e 0%, #f4a261 100%)',
    highlights: [
      'Catálogo con categorías, filtros y carrito de compras',
      'Cuentas de cliente con historial de pedidos',
      'Panel admin: productos, inventario, pedidos y usuarios',
      'Roles administrador y cliente con flujo completo',
    ],
  },
  {
    id: 'ecommerce-store-basic',
    title: 'TiendaNova Básica — E-commerce Esencial',
    company: 'Portafolio Personal',
    period: '2026',
    description:
      'Plan básico para emprendimientos: catálogo, carrito, pedidos como invitado y panel admin simple.',
    longDescription:
      'Demo del plan básico ($450): tienda sin cuentas de cliente, checkout como invitado, disponible/agotado manual sin inventario numérico, máximo 30 productos y pedidos con estados nuevo/atendido. Ideal para mostrar la opción de entrada antes de ampliar al plan completo.',
    technologies: ['React', 'TypeScript', 'React Router', 'localStorage', 'CSS3'],
    category: 'fullstack',
    featured: true,
    githubPath: 'projects/ecommerce-store-basic',
    liveUrl: 'demos/ecommerce-store-basic/',
    imageGradient: 'linear-gradient(135deg, #8b5a3c 0%, #d4a574 100%)',
    highlights: [
      'Pedidos como invitado sin registro de clientes',
      'Disponible / agotado manual (sin stock numérico)',
      'Panel admin: productos (máx. 30) y pedidos',
      'Estados de pedido: nuevo y atendido',
    ],
  },
  {
    id: 'restaurant-web-basic',
    title: 'Mi Restaurante — Web Esencial',
    company: 'Portafolio Personal',
    period: '2026',
    description:
      'Paquete esencial para restaurantes: menú con fotos, horarios, ubicación y WhatsApp.',
    longDescription:
      'Demo del paquete esencial ($230): sitio compacto con inicio, carta por categorías con fotos y precios, horarios, mapa, teléfono y botón a WhatsApp. Incluye enlaces a Instagram y Facebook. Ideal para mostrar la opción de entrada antes del paquete profesional.',
    technologies: ['React', 'TypeScript', 'CSS3', 'WhatsApp', 'Google Maps'],
    category: 'frontend',
    featured: true,
    githubPath: 'projects/restaurant-web-basic',
    liveUrl: 'demos/restaurant-web-basic/',
    imageGradient: 'linear-gradient(135deg, #5c3d2e 0%, #a67c52 100%)',
    highlights: [
      'Menú por categorías con fotos y precios',
      'Horarios y mapa de ubicación',
      'Contacto directo por WhatsApp',
      'Enlaces a Instagram y Facebook',
    ],
  },
  {
    id: 'restaurant-web',
    title: 'Mi Restaurante — Web Profesional',
    company: 'Portafolio Personal',
    period: '2026',
    description:
      'Sitio multipágina para restaurantes: menú con fotos, reservas, galería, promociones, horarios y delivery.',
    longDescription:
      'Demo del paquete profesional para restaurantes en React + TypeScript: secciones de nosotros, carta con precios, promociones, galería, horarios, mapa, redes sociales, reservas por WhatsApp y enlaces a apps de delivery. Contenido centralizado para personalizar por cliente.',
    technologies: ['React', 'TypeScript', 'CSS3', 'WhatsApp', 'Google Maps'],
    category: 'frontend',
    featured: true,
    githubPath: 'projects/restaurant-web',
    liveUrl: 'demos/restaurant-web/',
    imageGradient: 'linear-gradient(135deg, #7a2e2e 0%, #c9a227 100%)',
    highlights: [
      'Menú por categorías con precios',
      'Reservas vía WhatsApp y formulario',
      'Galería, promociones y horarios',
      'Mapa, redes sociales y delivery',
    ],
  },
];

export class PortfolioService {
  static getProfile(): Profile {
    return PROFILE;
  }

  static getNavItems(): NavItem[] {
    return NAV_ITEMS;
  }

  static getSkills(): Skill[] {
    return SKILLS;
  }

  static getServices(): ServiceOffering[] {
    return SERVICES;
  }

  static getProjects(): Project[] {
    return PROJECTS;
  }

  static getFeaturedProjects(): Project[] {
    return PROJECTS.filter((project) => project.featured);
  }

  static getProjectsByCategory(category: Project['category']): Project[] {
    return PROJECTS.filter((project) => project.category === category);
  }
}

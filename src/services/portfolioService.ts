import type { Profile, Project, Skill, NavItem } from '../models';

const PROFILE: Profile = {
  name: 'Adrian Esteban Ramos Acosta',
  title: 'Ingeniero de Software Full Stack & Mobile',
  tagline:
    'Transformo requerimientos complejos en productos digitales de alto rendimiento con arquitecturas escalables',
  bio: 'Ingeniero de Software con 3 años de experiencia en el ciclo completo de desarrollo (SDLC). Especialista en Java (Spring Boot) y JavaScript/TypeScript (React, Angular, Node.js), con experiencia en microservicios, contenedores Docker y desarrollo móvil nativo con Kotlin. Destaco por innovación técnica: motores de búsqueda con Elasticsearch, procesamiento multimedia y sistemas de autenticación OAuth2. Graduando de Ingeniería de Software en la Universidad de las Fuerzas Armadas ESPE.',
  email: 'adrianestebanra@hotmail.com',
  phone: '+593 97 916 5437',
  location: 'Quito, Ecuador',
};

const NAV_ITEMS: NavItem[] = [
  { id: 'inicio', label: 'Inicio', href: '#inicio' },
  { id: 'sobre-mi', label: 'Sobre mí', href: '#sobre-mi' },
  { id: 'habilidades', label: 'Habilidades', href: '#habilidades' },
  { id: 'proyectos', label: 'Proyectos', href: '#proyectos' },
  { id: 'contacto', label: 'Contacto', href: '#contacto' },
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
    liveUrl: 'apps/automatizacion-datos/',
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
      'Plataforma full stack con Spring Boot y React para gestión de inventario, facturación y ventas.',
    longDescription:
      'Backend con JWT, validación y arquitectura en capas. Frontend React con login, dashboard, CRUD de productos y módulo de facturación con control de stock. Demo interactiva en el navegador con datos de ejemplo; el backend Spring Boot completo está en el repositorio.',
    technologies: ['Spring Boot', 'Java', 'React', 'JWT', 'Swagger'],
    category: 'api',
    featured: true,
    githubPath: 'projects/inventory-api',
    liveUrl: 'apps/inventory-api/',
    imageGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    highlights: [
      'Login y registro con JWT',
      'Facturación con descuento automático de stock',
      'CRUD de productos y reposición rápida de stock',
      'Dashboard con KPIs de inventario y ventas',
      'Exportación de inventario y facturas en PDF y Excel',
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
    liveUrl: 'metrics-dashboard/',
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
    liveUrl: 'apps/task-manager/',
    imageGradient: 'linear-gradient(135deg, #06b6d4 0%, #38bdf8 100%)',
    highlights: [
      'Tablero kanban con estados, prioridades y fechas límite',
      'Dashboard con KPIs: vencidas, % completado y próximos vencimientos',
      'Autenticación JWT con registro e inicio de sesión',
      'Exportación de tareas y resumen en PDF y Excel',
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

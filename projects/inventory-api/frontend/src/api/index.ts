import { api as demoApi } from './client';
import { api as liveApi } from './client-live';

export * from './client-live';
export { DEMO_EMAIL, DEMO_PASSWORD, getToken, clearToken, resetDemoData } from './client';

export const IS_DEMO_MODE = import.meta.env.VITE_USE_LIVE_API !== 'true';

const useLiveApi = import.meta.env.VITE_USE_LIVE_API === 'true';

export const api: typeof liveApi = useLiveApi ? liveApi : (demoApi as unknown as typeof liveApi);

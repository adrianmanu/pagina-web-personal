import { api as demoApi } from './client';
import { api as liveApi } from './client-live';

const useLiveApi = import.meta.env.VITE_USE_LIVE_API === 'true';

export * from './client';
export const api = useLiveApi ? liveApi : demoApi;

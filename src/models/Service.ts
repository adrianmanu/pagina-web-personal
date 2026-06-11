export type ServiceCategory =
  | 'web'
  | 'commerce'
  | 'business'
  | 'mobile'
  | 'data'
  | 'integrations'
  | 'custom';

export interface ServiceOffering {
  id: string;
  title: string;
  description: string;
  category: ServiceCategory;
}

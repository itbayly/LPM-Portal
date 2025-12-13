export interface TabItem {
  id: string;
  label: string;
  status: 'active' | 'missing' | 'expired';
}

export interface BenefitItem {
  title: string;
  description: string;
}

export interface Notification {
  icon: string;
  title: string;
  message: string;
}

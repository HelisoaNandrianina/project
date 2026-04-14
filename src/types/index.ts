export type UserRole = 'admin' | 'analyst' | 'decision-maker';
export type Theme = 'light' | 'dark';
export type PageId =
  | 'auth'
  | 'dashboard'
  | 'map'
  | 'data'
  | 'analysis'
  | 'decision'
  | 'dashboards'
  | 'reporting'
  | 'notifications'
  | 'settings';

export type ZoneScore = 'high' | 'medium' | 'low';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  status: 'active' | 'inactive';
  lastLogin: string;
}

export interface DataPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  zone: string;
  score: number;
  status: 'active' | 'inactive' | 'pending';
  type: 'client' | 'prospect' | 'partner';
  revenue: number;
  createdAt: string;
}

export interface Zone {
  id: string;
  name: string;
  score: ZoneScore;
  scoreValue: number;
  coverage: number;
  pointCount: number;
  revenue: number;
  trend: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'info' | 'warning' | 'success';
  priority: 'high' | 'medium' | 'low';
  read: boolean;
  timestamp: string;
}

export interface KPI {
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: string;
  color: string;
}

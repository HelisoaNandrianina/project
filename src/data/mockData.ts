import type { DataPoint, Zone, Notification, User } from '../types';

export const mockUsers: User[] = [
  { id: '1', name: 'Sophie Martin', email: 'sophie.martin@geo.io', role: 'admin', status: 'active', lastLogin: '2026-04-14 09:32' },
  { id: '2', name: 'Lucas Bernard', email: 'lucas.bernard@geo.io', role: 'analyst', status: 'active', lastLogin: '2026-04-14 08:15' },
  { id: '3', name: 'Emma Dubois', email: 'emma.dubois@geo.io', role: 'decision-maker', status: 'active', lastLogin: '2026-04-13 17:44' },
  { id: '4', name: 'Antoine Moreau', email: 'antoine.moreau@geo.io', role: 'analyst', status: 'inactive', lastLogin: '2026-04-10 11:22' },
  { id: '5', name: 'Chloé Leroy', email: 'chloe.leroy@geo.io', role: 'decision-maker', status: 'active', lastLogin: '2026-04-14 07:58' },
];

export const mockDataPoints: DataPoint[] = [
  { id: 'DP001', name: 'Client Industriel A', lat: 48.85, lng: 2.35, zone: 'Zone Nord', score: 92, status: 'active', type: 'client', revenue: 48500, createdAt: '2026-01-15' },
  { id: 'DP002', name: 'Prospect PME B', lat: 48.87, lng: 2.33, zone: 'Zone Nord', score: 67, status: 'pending', type: 'prospect', revenue: 0, createdAt: '2026-02-01' },
  { id: 'DP003', name: 'Partenaire Logistique C', lat: 48.83, lng: 2.38, zone: 'Zone Est', score: 85, status: 'active', type: 'partner', revenue: 32000, createdAt: '2026-01-20' },
  { id: 'DP004', name: 'Client Retail D', lat: 48.80, lng: 2.30, zone: 'Zone Sud', score: 41, status: 'inactive', type: 'client', revenue: 12400, createdAt: '2025-11-10' },
  { id: 'DP005', name: 'Client Tech E', lat: 48.82, lng: 2.40, zone: 'Zone Est', score: 78, status: 'active', type: 'client', revenue: 67800, createdAt: '2026-03-05' },
  { id: 'DP006', name: 'Prospect Finance F', lat: 48.89, lng: 2.28, zone: 'Zone Ouest', score: 55, status: 'pending', type: 'prospect', revenue: 0, createdAt: '2026-04-01' },
  { id: 'DP007', name: 'Client Santé G', lat: 48.78, lng: 2.36, zone: 'Zone Sud', score: 88, status: 'active', type: 'client', revenue: 91200, createdAt: '2025-09-18' },
  { id: 'DP008', name: 'Partenaire Tech H', lat: 48.86, lng: 2.45, zone: 'Zone Est', score: 72, status: 'active', type: 'partner', revenue: 44600, createdAt: '2026-02-14' },
  { id: 'DP009', name: 'Client GovTech I', lat: 48.91, lng: 2.32, zone: 'Zone Nord', score: 94, status: 'active', type: 'client', revenue: 130000, createdAt: '2025-08-05' },
  { id: 'DP010', name: 'Prospect Energie J', lat: 48.77, lng: 2.42, zone: 'Zone Sud', score: 48, status: 'pending', type: 'prospect', revenue: 0, createdAt: '2026-04-10' },
];

export const mockZones: Zone[] = [
  { id: 'Z1', name: 'Zone Nord', score: 'high', scoreValue: 89, coverage: 94, pointCount: 124, revenue: 892400, trend: 12.4 },
  { id: 'Z2', name: 'Zone Est', score: 'high', scoreValue: 81, coverage: 87, pointCount: 98, revenue: 644800, trend: 8.2 },
  { id: 'Z3', name: 'Zone Ouest', score: 'medium', scoreValue: 63, coverage: 71, pointCount: 67, revenue: 378200, trend: -2.1 },
  { id: 'Z4', name: 'Zone Sud', score: 'low', scoreValue: 38, coverage: 44, pointCount: 42, revenue: 198600, trend: -9.7 },
  { id: 'Z5', name: 'Zone Centre', score: 'medium', scoreValue: 71, coverage: 78, pointCount: 85, revenue: 512300, trend: 3.8 },
];

export const mockNotifications: Notification[] = [
  { id: 'N1', title: 'Zone critique détectée', message: 'La Zone Sud a atteint un score critique de 38/100. Intervention recommandée.', type: 'alert', priority: 'high', read: false, timestamp: '2026-04-14 09:15' },
  { id: 'N2', title: 'Anomalie géospatiale', message: 'Densité anormale détectée dans le secteur Est (cluster inhabituel de 14 points).', type: 'warning', priority: 'high', read: false, timestamp: '2026-04-14 08:42' },
  { id: 'N3', title: 'Import données réussi', message: '247 nouveaux points importés avec succès depuis le fichier clients_Q1_2026.csv.', type: 'success', priority: 'low', read: true, timestamp: '2026-04-13 17:30' },
  { id: 'N4', title: 'Rapport mensuel disponible', message: 'Le rapport d\'analyse géospatiale de mars 2026 est prêt à être téléchargé.', type: 'info', priority: 'medium', read: false, timestamp: '2026-04-13 16:00' },
  { id: 'N5', title: 'Score Zone Ouest en baisse', message: 'Le score de la Zone Ouest a diminué de 5 points ce mois-ci (-2.1%).', type: 'warning', priority: 'medium', read: true, timestamp: '2026-04-12 11:22' },
  { id: 'N6', title: 'Nouveau prospect qualifié', message: 'Prospect Finance F a été qualifié et est prêt pour la conversion.', type: 'success', priority: 'low', read: true, timestamp: '2026-04-11 14:50' },
];

export const revenueTimeline = [
  { month: 'Oct', value: 380000 },
  { month: 'Nov', value: 420000 },
  { month: 'Déc', value: 395000 },
  { month: 'Jan', value: 458000 },
  { month: 'Fév', value: 512000 },
  { month: 'Mar', value: 498000 },
  { month: 'Avr', value: 571000 },
];

export const zoneBarData = [
  { zone: 'Nord', value: 89 },
  { zone: 'Est', value: 81 },
  { zone: 'Centre', value: 71 },
  { zone: 'Ouest', value: 63 },
  { zone: 'Sud', value: 38 },
];

export const segmentData = [
  { label: 'Clients', value: 52, color: '#2563EB' },
  { label: 'Prospects', value: 28, color: '#F59E0B' },
  { label: 'Partenaires', value: 20, color: '#10B981' },
];

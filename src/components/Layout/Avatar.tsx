// ─── Avatar.tsx  (composant partagé) ─────────────────────────────────────────
import type { UserOut } from '../../services/auth';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

/** Résout photo_url (relative ou absolue) en URL complète. */
function resolvePhotoUrl(photoUrl: string): string {
  return photoUrl.startsWith('http') ? photoUrl : `${API_URL}${photoUrl}`;
}

interface AvatarProps {
  user: UserOut | null;
  /** Taille en unités Tailwind (ex: 8 → w-8 h-8). Défaut : 8 */
  size?: number;
  className?: string;
}

export function Avatar({ user, size = 8, className = '' }: AvatarProps) {
  const sizeClass = `w-${size} h-${size}`;

  if (user?.photo_url) {
    return (
      <img
        src={resolvePhotoUrl(user.photo_url)}
        alt={user.first_name}
        className={`${sizeClass} rounded-full object-cover shrink-0 ring-2 ring-primary-500/30 ${className}`}
      />
    );
  }

  const initials = user
    ? `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase()
    : '?';

  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 ${className}`}
    >
      {initials}
    </div>
  );
}
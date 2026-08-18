import { Mail, Shield, CircleDot, Hash } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../../components/Layout/Avatar';

const ROLE_LABELS: Record<number, string> = {
  1: 'Administrateur',
  2: 'Analyste',
};

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  const displayName = user.name ?? `${user.first_name} ${user.last_name}`;
  const roleLabel = ROLE_LABELS[user.role] ?? `Rôle ${user.role}`;
  const isActive = user.status === 'active';

  const infoRows = [
    { icon: Mail, label: 'Adresse email', value: user.email },
    { icon: Shield, label: 'Rôle', value: roleLabel },
    { icon: Hash, label: 'Identifiant', value: `#${user.id}` },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="page-title">Mon profil</h1>
        <p className="text-sm text-neutral-500 dark:text-dark-muted mt-0.5">
          Informations liées à votre compte GeoPulse
        </p>
      </div>

      <div className="max-w-2xl space-y-4">
        <div className="card p-6 flex items-center gap-4">
          <Avatar user={user} size={16} />
          <div className="min-w-0">
            <p className="text-lg font-bold text-neutral-900 dark:text-dark-text truncate">{displayName}</p>
            <p className="text-sm text-neutral-400 dark:text-dark-muted">{roleLabel}</p>
          </div>
        </div>

        <div className="card p-5 space-y-1">
          <h3 className="section-title mb-3">Informations du compte</h3>

          {infoRows.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between py-3 border-b border-neutral-100 dark:border-dark-border last:border-0"
            >
              <div className="flex items-center gap-2.5 text-neutral-500 dark:text-dark-muted">
                <Icon size={14} />
                <span className="text-sm">{label}</span>
              </div>
              <span className="text-sm font-medium text-neutral-800 dark:text-dark-text truncate max-w-[60%] text-right">
                {value}
              </span>
            </div>
          ))}

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2.5 text-neutral-500 dark:text-dark-muted">
              <CircleDot size={14} />
              <span className="text-sm">Statut</span>
            </div>
            {isActive ? (
              <span className="badge-success">Actif</span>
            ) : (
              <span className="badge-gray">{user.status}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

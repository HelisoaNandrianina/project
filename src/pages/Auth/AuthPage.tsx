import { useState } from 'react';
import { Globe, Mail, Lock, User, Eye, EyeOff, ArrowRight, MapPin, BarChart2, Brain } from 'lucide-react';
import type { UserRole } from '../../types';

interface AuthPageProps {
  onLogin: () => void;
}

const roles: { id: UserRole; label: string; desc: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
  { id: 'admin', label: 'Administrateur', desc: 'Accès complet à toutes les fonctionnalités', icon: User },
  { id: 'analyst', label: 'Analyste', desc: 'Analyse géospatiale et visualisation', icon: BarChart2 },
  { id: 'decision-maker', label: 'Décideur', desc: 'Dashboards et rapports stratégiques', icon: Brain },
];

const features = [
  { icon: MapPin, label: 'Cartographie interactive multi-couches' },
  { icon: BarChart2, label: 'Analyses géospatiales avancées' },
  { icon: Brain, label: 'Aide à la décision par scoring IA' },
];

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('analyst');
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0F172A] to-[#1E3A5F] relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="absolute border border-white rounded-full"
              style={{ width: (i + 1) * 150, height: (i + 1) * 150, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 1 / (i + 1) }} />
          ))}
        </div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="absolute w-1.5 h-1.5 rounded-full bg-primary-500"
              style={{ left: `${10 + (i * 17) % 80}%`, top: `${15 + (i * 23) % 70}%`, opacity: 0.3 + (i % 5) * 0.12 }} />
          ))}
        </div>

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
            <Globe size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-none">GeoPulse</p>
            <p className="text-blue-300 text-xs leading-none mt-0.5">Data Intelligence Platform</p>
          </div>
        </div>

        <div className="relative space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-white leading-tight">
              Analysez vos données<br />géospatiales en temps réel
            </h2>
            <p className="text-blue-200 mt-3 text-sm leading-relaxed">
              Plateforme SaaS de data intelligence dédiée à la visualisation, l'analyse et l'aide à la décision géographique.
            </p>
          </div>
          <div className="space-y-3">
            {features.map(({ icon: Icon, label }, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-blue-300" />
                </div>
                <span className="text-sm text-blue-100">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="flex gap-4">
            {[{ v: '416', l: 'Points actifs' }, { v: '5', l: 'Zones' }, { v: '94%', l: 'Précision' }].map((s, i) => (
              <div key={i} className="bg-white/10 rounded-xl p-3 flex-1 text-center backdrop-blur-sm">
                <p className="text-white font-bold text-xl">{s.v}</p>
                <p className="text-blue-300 text-xs mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-neutral-50 dark:bg-dark-bg">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
              <Globe size={16} className="text-white" />
            </div>
            <span className="font-bold text-neutral-900 dark:text-dark-text">GeoIntel</span>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-dark-text">
              {mode === 'login' ? 'Connexion' : 'Créer un compte'}
            </h1>
            <p className="text-sm text-neutral-500 dark:text-dark-muted mt-1">
              {mode === 'login' ? 'Accédez à votre espace GeoIntel' : 'Rejoignez la plateforme GeoIntel'}
            </p>
          </div>

          <div className="flex p-1 bg-neutral-100 dark:bg-dark-card rounded-lg mb-6 border border-neutral-200 dark:border-dark-border">
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${mode === m ? 'bg-white dark:bg-dark-border text-neutral-900 dark:text-dark-text shadow-sm' : 'text-neutral-500 dark:text-dark-muted'}`}>
                {m === 'login' ? 'Connexion' : 'Inscription'}
              </button>
            ))}
          </div>

          <div className="card p-6 space-y-4">
            {mode === 'register' && (
              <div>
                <label className="label">Nom complet</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input type="text" placeholder="Sophie Martin" className="input pl-8" />
                </div>
              </div>
            )}

            <div>
              <label className="label">Adresse email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input type="email" placeholder="email@domaine.com" className="input pl-8"
                  value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="label">Mot de passe</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input type={showPwd ? 'text' : 'password'} placeholder="••••••••" className="input pl-8 pr-9"
                  value={password} onChange={e => setPassword(e.target.value)} />
                <button onClick={() => setShowPwd(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Rôle</label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map(({ id, label, desc, icon: Icon }) => (
                  <button key={id} onClick={() => setSelectedRole(id)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${selectedRole === id ? 'border-primary-500 bg-primary-50 dark:bg-blue-900/20 dark:border-blue-500' : 'border-neutral-200 dark:border-dark-border hover:border-neutral-300'}`}>
                    <Icon size={16} className={selectedRole === id ? 'text-primary-500' : 'text-neutral-400'} />
                    <p className={`text-xs font-medium mt-1 ${selectedRole === id ? 'text-primary-600 dark:text-blue-400' : 'text-neutral-700 dark:text-dark-text'}`}>{label}</p>
                    <p className="text-[10px] text-neutral-400 dark:text-dark-muted mt-0.5 leading-tight">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {mode === 'login' && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-neutral-300 text-primary-500" />
                  <span className="text-xs text-neutral-500 dark:text-dark-muted">Se souvenir de moi</span>
                </label>
                <button className="text-xs text-primary-500 hover:text-primary-600 font-medium">Mot de passe oublié ?</button>
              </div>
            )}

            <button onClick={onLogin}
              className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
              {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
              <ArrowRight size={15} />
            </button>
          </div>

          <p className="text-center text-xs text-neutral-400 dark:text-dark-muted mt-4">
            {mode === 'login' ? 'Pas encore de compte ?' : 'Déjà un compte ?'}{' '}
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-primary-500 font-medium hover:text-primary-600">
              {mode === 'login' ? 'S\'inscrire' : 'Se connecter'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

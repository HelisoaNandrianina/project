import { useState, useRef } from "react";
import {
  Globe,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  MapPin,
  BarChart2,
  Brain,
  AlertCircle,
  Camera,
} from "lucide-react";
import type { UserRole } from "../../types";
import { loginApi, registerApi } from "../../services/auth";
import type { UserOut } from "../../services/auth";


// TYPES

interface AuthPageProps {
  onLogin: (token: string, user: UserOut) => void;
}



// CONSTANTS

const roles: {
  id: UserRole;
  label: string;
  desc: string;
  roleInt: number;
  icon: React.FC<{ size?: number; className?: string }>;
}[] = [
  {
    id: "admin",
    label: "Administrateur",
    desc: "Accès complet à toutes les fonctionnalités",
    roleInt: 1,
    icon: User,
  },
  {
    id: "analyst",
    label: "Analyste",
    desc: "Analyse géospatiale et visualisation",
    roleInt: 2,
    icon: BarChart2,
  },
];

const features = [
  { icon: MapPin, label: "Cartographie interactive multi-couches" },
  { icon: BarChart2, label: "Analyses géospatiales avancées" },
  { icon: Brain, label: "Aide à la décision par scoring IA" },
];


// COMPONENT

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [selectedRole, setSelectedRole] = useState<UserRole>("analyst");
  const [showPwd, setShowPwd] = useState(false);

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Photo
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Photo handler
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    // Vérification type
    if (!file.type.startsWith("image/")) {
      setError("Le fichier doit être une image (jpg, png, webp…).");
      return;
    }
    // Vérification taille (max 2 Mo)
    if (file.size > 2 * 1024 * 1024) {
      setError("La photo ne doit pas dépasser 2 Mo.");
      return;
    }

    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError("");
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Submit handler
  const handleSubmit = async () => {
    setError("");

    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    if (mode === "register" && !firstName.trim()) {
      setError("Veuillez entrer votre prénom.");
      return;
    }
    if (mode === "register" && !lastName.trim()) {
      setError("Veuillez entrer votre nom.");
      return;
    }

    setLoading(true);
    try {
      let data: { access_token: string; token_type: string; user: UserOut };

      if (mode === "login") {
        data = await loginApi(email, password);
      } else {
        const roleInt = roles.find((r) => r.id === selectedRole)?.roleInt ?? 2;
        data = await registerApi(firstName, lastName, email, password, roleInt, photo);
      }

      // Délègue la persistance au AuthContext
      onLogin(data.access_token, data.user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  const switchMode = (m: "login" | "register") => {
    setMode(m);
    setError("");
    setFirstName("");
    setLastName("");
    removePhoto();
  };

  //  Render 
  return (
    <div className="min-h-screen flex">
      {/*  LEFT PANEL  */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0F172A] to-[#1E3A5F] relative overflow-hidden flex-col justify-between p-12">
        {/* Decorative rings */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute border border-white rounded-full"
              style={{
                width: (i + 1) * 150,
                height: (i + 1) * 150,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                opacity: 1 / (i + 1),
              }}
            />
          ))}
        </div>

        {/* Decorative dots */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-primary-500"
              style={{
                left: `${10 + ((i * 17) % 80)}%`,
                top: `${15 + ((i * 23) % 70)}%`,
                opacity: 0.3 + (i % 5) * 0.12,
              }}
            />
          ))}
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
            <Globe size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-none">GeoPulse</p>
            <p className="text-blue-300 text-xs leading-none mt-0.5">
              Data Intelligence Platform
            </p>
          </div>
        </div>

        {/* Tagline + features */}
        <div className="relative space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-white leading-tight">
              Analysez vos données
              <br />
              géospatiales en temps réel
            </h2>
            <p className="text-blue-200 mt-3 text-sm leading-relaxed">
              Plateforme SaaS de data intelligence dédiée à la visualisation,
              l'analyse et l'aide à la décision géographique.
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

        {/* Stats */}
        <div className="relative">
          <div className="flex gap-4">
            {[
              { v: "416", l: "Points actifs" },
              { v: "5", l: "Zones" },
              { v: "94%", l: "Précision" },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-white/10 rounded-xl p-3 flex-1 text-center backdrop-blur-sm"
              >
                <p className="text-white font-bold text-xl">{s.v}</p>
                <p className="text-blue-300 text-xs mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ──────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-neutral-50 dark:bg-dark-bg">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
              <Globe size={16} className="text-white" />
            </div>
            <span className="font-bold text-neutral-900 dark:text-dark-text">
              GeoIntel
            </span>
          </div>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-dark-text">
              {mode === "login" ? "Connexion" : "Créer un compte"}
            </h1>
            <p className="text-sm text-neutral-500 dark:text-dark-muted mt-1">
              {mode === "login"
                ? "Accédez à votre espace GeoIntel"
                : "Rejoignez la plateforme GeoIntel"}
            </p>
          </div>

          {/* Mode switch */}
          <div className="flex p-1 bg-neutral-100 dark:bg-dark-card rounded-lg mb-6 border border-neutral-200 dark:border-dark-border">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                  mode === m
                    ? "bg-white dark:bg-dark-border text-neutral-900 dark:text-dark-text shadow-sm"
                    : "text-neutral-500 dark:text-dark-muted"
                }`}
              >
                {m === "login" ? "Connexion" : "Inscription"}
              </button>
            ))}
          </div>

          {/* Form card */}
          <div className="card p-6 space-y-4" onKeyDown={handleKeyDown}>

            {/* ── PHOTO DE PROFIL — register only ── */}
            {mode === "register" && (
              <div className="flex flex-col items-center gap-2 pb-2">
                {/* Avatar / aperçu */}
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-neutral-300 dark:border-dark-border bg-neutral-100 dark:bg-dark-card flex items-center justify-center transition-all group-hover:border-primary-400">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Aperçu photo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={28} className="text-neutral-300 dark:text-dark-muted" />
                    )}
                  </div>

                  {/* Bouton caméra superposé */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary-500 hover:bg-primary-600 flex items-center justify-center shadow-md transition-colors"
                    title="Choisir une photo"
                  >
                    <Camera size={12} className="text-white" />
                  </button>
                </div>

                {/* Input caché */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />

                {/* Texte d'action */}
                {photoPreview ? (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-primary-500 hover:text-primary-600 font-medium"
                    >
                      Changer
                    </button>
                    <span className="text-neutral-300">|</span>
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="text-xs text-red-400 hover:text-red-500 font-medium"
                    >
                      Supprimer
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-primary-500 hover:text-primary-600 font-medium"
                  >
                    Ajouter une photo <span className="text-neutral-400 font-normal">(optionnel)</span>
                  </button>
                )}
              </div>
            )}

            {/* Prénom & Nom — register only */}
            {mode === "register" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Prénom</label>
                  <div className="relative">
                    <User
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                    />
                    <input
                      type="text"
                      placeholder="Sophie"
                      className="input pl-8"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Nom</label>
                  <div className="relative">
                    <User
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                    />
                    <input
                      type="text"
                      placeholder="Martin"
                      className="input pl-8"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="label">Adresse email</label>
              <div className="relative">
                <Mail
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                  type="email"
                  placeholder="email@domaine.com"
                  className="input pl-8"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label">Mot de passe</label>
              <div className="relative">
                <Lock
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  className="input pl-8 pr-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  onClick={() => setShowPwd((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  type="button"
                >
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Role selector — register only */}
            {mode === "register" && (
              <div>
                <label className="label">Rôle</label>
                <div className="grid grid-cols-2 gap-4 w-full">
                  {roles.map(({ id, label, desc, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSelectedRole(id)}
                      className={`w-full p-4 rounded-xl border text-left transition-all flex flex-col ${
                        selectedRole === id
                          ? "border-primary-500 bg-primary-50 dark:bg-blue-900/20"
                          : "border-neutral-200 dark:border-dark-border hover:border-neutral-300"
                      }`}
                    >
                      <Icon
                        size={18}
                        className={`mb-2 ${
                          selectedRole === id
                            ? "text-primary-500"
                            : "text-neutral-400"
                        }`}
                      />
                      <p className="text-sm font-semibold">{label}</p>
                      <p className="text-xs text-neutral-400 mt-1">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Remember me / Forgot password — login only */}
            {mode === "login" && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-neutral-300 text-primary-500"
                  />
                  <span className="text-xs text-neutral-500 dark:text-dark-muted">
                    Se souvenir de moi
                  </span>
                </label>
                <button
                  type="button"
                  className="text-xs text-primary-500 hover:text-primary-600 font-medium"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  {mode === "login" ? "Connexion..." : "Création..."}
                </>
              ) : (
                <>
                  {mode === "login" ? "Se connecter" : "Créer mon compte"}
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>

          {/* Switch link */}
          <p className="text-center text-xs text-neutral-400 dark:text-dark-muted mt-4">
            {mode === "login" ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
            <button
              type="button"
              onClick={() => switchMode(mode === "login" ? "register" : "login")}
              className="text-primary-500 font-medium hover:text-primary-600"
            >
              {mode === "login" ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { resetPasswordApi } from "../../services/auth";

const REDIRECT_DELAY_MS = 1500;

interface ResetPasswordPageProps {
  token: string;
  onDone: () => void;
}

export default function ResetPasswordPage({ token, onDone }: ResetPasswordPageProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError("");

    if (!password || !confirm) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      await resetPasswordApi(token, password);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  // Redirection automatique vers le login : l'utilisateur n'a rien à faire
  // une fois le mot de passe changé, le message de succès ne fait que
  // confirmer l'action avant de quitter la page.
  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(onDone, REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [success, onDone]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-neutral-50 dark:bg-dark-bg">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-dark-text">
            Réinitialiser le mot de passe
          </h1>
          <p className="text-sm text-neutral-500 dark:text-dark-muted mt-1">
            Choisissez un nouveau mot de passe pour votre compte.
          </p>
        </div>

        <div className="card p-6 space-y-4" onKeyDown={handleKeyDown}>
          {success ? (
            <div className="flex items-start gap-2 text-xs text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
              <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
              <span>Mot de passe réinitialisé avec succès. Redirection vers la connexion…</span>
            </div>
          ) : (
            <>
              <div>
                <label className="label">Nouveau mot de passe</label>
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

              <div>
                <label className="label">Confirmer le mot de passe</label>
                <div className="relative">
                  <Lock
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                  <input
                    type={showPwd ? "text" : "password"}
                    placeholder="••••••••"
                    className="input pl-8"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Réinitialiser <ArrowRight size={15} />
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

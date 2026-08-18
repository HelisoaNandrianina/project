import { useState } from "react";
import { Mail, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { forgotPasswordApi } from "../../services/auth";

interface ForgotPasswordFormProps {
  onClose: () => void;
}

export default function ForgotPasswordForm({ onClose }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!email) {
      setError("Veuillez entrer votre adresse email.");
      return;
    }

    setLoading(true);
    try {
      await forgotPasswordApi(email);
    } catch {
      // Le backend répond déjà le même message que l'email existe ou non ;
      // on ignore aussi les erreurs réseau côté UI pour ne jamais révéler
      // via un état d'erreur distinct si un compte est rattaché à cet email.
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm card p-6 space-y-4 animate-fade-in" onKeyDown={handleKeyDown}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-dark-text">
              Mot de passe oublié
            </h2>
            <p className="text-sm text-neutral-500 dark:text-dark-muted mt-1">
              Entrez votre email, nous vous enverrons un lien de réinitialisation.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600"
          >
            <X size={18} />
          </button>
        </div>

        {sent ? (
          <div className="flex items-start gap-2 text-xs text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
            <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
            <span>Si cet email existe, un lien de réinitialisation a été envoyé.</span>
          </div>
        ) : (
          <>
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
                  autoFocus
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
                "Envoyer le lien"
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

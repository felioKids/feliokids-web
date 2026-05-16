import { useState } from "react";
import "./NewsletterPopup.css";

export default function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [postal, setPostal] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const BREVO_ACTION =
    "https://96175f46.sibforms.com/serve/MUIFACXO7nJu-zDsKtsOd9Nk4G4qAm_R5fZeuDEMD3MHtPo6y36gdoXErksRK2XmVguP-8RJsD2Px-MV4JZmEQYdotjLAFEuFNsy6D1W2kDYuqYIGvVfEFAqXYxzFNgLLgBZUM9Uap2_19bgIJ-qpG_vGWjOWIn1Qp4wTiLHsLPl7u0WBDW0HYqtTEFXfhlOKOo6Giav7FRulUe18g==";

  const handleOpen = () => {
    setIsOpen(true);
    setSuccess(false);
    setEmail("");
    setPostal("");
    setEmailError("");
  };

  const handleClose = () => setIsOpen(false);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Veuillez entrer une adresse email valide.");
      return;
    }
    setEmailError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("EMAIL", email);
    formData.append("JOB_TITLE", postal);
    formData.append("locale", "fr");
    formData.append("email_address_check", "");

    try {
      await fetch(BREVO_ACTION, {
        method: "POST",
        body: formData,
        mode: "no-cors",
      });
    } catch (_) {
      // no-cors toujours résout — on affiche le succès
    } finally {
      setLoading(false);
      setSuccess(true);
    }
  };

  return (
    <>
      <button className="fk-alert-btn" onClick={handleOpen}>
        🔔 Alertes
      </button>

      {isOpen && (
        <div className="fk-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-labelledby="fk-popup-title">
          <div className="fk-popup">
            <button className="fk-close" onClick={handleClose} aria-label="Fermer">
              ✕
            </button>

            {!success ? (
              <>
                <span className="fk-tag">Newsletter gratuit</span>
                <h2 className="fk-title" id="fk-popup-title">
                  Les meilleures sorties famille près de chez vous ✨
                </h2>
                <p className="fk-sub">
                  Idées gratuites, activités par temps de pluie, pépites locales — chaque semaine dans ta boîte.
                </p>

                <form onSubmit={handleSubmit} noValidate>
                  <label className="fk-label" htmlFor="fk-email">
                    Adresse email
                  </label>
                  <input
                    className={`fk-input${emailError ? " fk-input--error" : ""}`}
                    type="email"
                    id="fk-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="prenom@exemple.com"
                    required
                    autoComplete="email"
                  />
                  {emailError && <p className="fk-error-msg">{emailError}</p>}

                  <label className="fk-label" htmlFor="fk-postal">
                    Code postal
                  </label>
                  <input
                    className="fk-input"
                    type="text"
                    id="fk-postal"
                    value={postal}
                    onChange={(e) => setPostal(e.target.value)}
                    placeholder="75001"
                    maxLength={10}
                    autoComplete="postal-code"
                  />

                  <button className="fk-btn" type="submit" disabled={loading}>
                    {loading ? <span className="fk-spinner" /> : "Je veux des idées !"}
                  </button>
                </form>

                <p className="fk-privacy">
                  Pas de spam. Désabonnement en 1 clic. Tes données restent privées.
                </p>
              </>
            ) : (
              <div className="fk-success">
                <span className="fk-success-icon">🎉</span>
                <p className="fk-success-title">Merci, tu es inscrit·e !</p>
                <p className="fk-success-sub">
                  Chaque semaine, les meilleures idées famille arrivent dans ta boîte.
                </p>
                <button className="fk-btn fk-btn--ghost" onClick={handleClose}>
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

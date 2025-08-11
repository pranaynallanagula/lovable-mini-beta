import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function SignInPage({ onSignedIn }: { onSignedIn: () => void }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function handleMagicLink() {
    setMessage(null);
    if (!email) {
      setMessage("Enter an email to continue.");
      return;
    }
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) setMessage(error.message);
      else
        setMessage(
          "Magic link sent — check your inbox. Or click 'Continue as guest'."
        );
    } catch (err) {
      setMessage(String(err));
    }
  }

  return (
    <div className="card">
      <h2>Sign in (demo)</h2>
      <p className="small">
        Sign in with magic link (Supabase). You can also continue as guest.
      </p>
      <input
        className="input"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
        <button className="button" onClick={handleMagicLink}>
          Send magic link
        </button>
        <button
          className="button"
          onClick={onSignedIn}
          style={{ background: "#6b7280" }}
        >
          Continue as guest
        </button>
      </div>
      {message && (
        <p className="small" style={{ marginTop: 10 }}>
          {message}
        </p>
      )}
    </div>
  );
}

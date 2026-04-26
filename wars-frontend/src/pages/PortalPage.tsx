import { useAuth } from "../auth/AuthContext";

const ROLE_LANDING: Record<string, string> = {
  citizen: "Citizen tools: submit and track reports.",
  technician: "Technician tools: triage alerts and resolve report statuses.",
  manager: "Manager tools: monitor analytics, reports, and alerts.",
  admin: "Admin tools: full access plus user management."
};

export function PortalPage() {
  const { auth } = useAuth();
  const role = auth?.user.role ?? "citizen";

  return (
    <section className="card">
      <h2>Role Portal</h2>
      <p>
        Logged in as <strong>{role}</strong>
      </p>
      <p>{ROLE_LANDING[role]}</p>
    </section>
  );
}

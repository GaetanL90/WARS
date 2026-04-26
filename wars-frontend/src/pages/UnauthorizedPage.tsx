import { Link } from "react-router-dom";

export function UnauthorizedPage() {
  return (
    <section className="card">
      <h2>Unauthorized</h2>
      <p>Your current role does not have access to this page.</p>
      <Link to="/portal">Go back to portal</Link>
    </section>
  );
}

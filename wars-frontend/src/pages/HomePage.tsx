import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getDashboardPathForRole } from "../auth/dashboardPaths";
import warsLogo from "../assets/WARS_logo.png";
import bustedPipeImage from "../assets/bursted_pipe.jpg";
import contaminatedTapImage from "../assets/solving-brown-water-from-tap.jpg";

export function HomePage() {
  const { isAuthenticated, auth } = useAuth();

  const getDashboardLink = () => {
    if (!isAuthenticated) return "/login";
    const role = auth?.user?.role;
    return role ? getDashboardPathForRole(role) : "/login";
  };
  
  const dashboardLink = getDashboardLink();

  return (
    <main className="landing">
      <header className="landing-nav">
        <div className="landing-brand">
          <img className="landing-logo" src={warsLogo} alt="WARS logo" />
          <div>
            <p className="eyebrow">WARS Platform</p>
            <strong>Water Access & Reporting System</strong>
          </div>
        </div>
        <nav className="landing-links">
          <a href="#what">What we solve</a>
          <a href="#how">How it works</a>
          <a href="#rewards">Rewards</a>
          <Link className="btn-link primary" to={dashboardLink}>
            {isAuthenticated ? "Dashboard" : "Login"}
          </Link>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-main card">
          <p className="eyebrow">Water Access & Reporting System</p>
          <h1>Report damaged public water infrastructure and unsafe tap water</h1>
          <p className="hero-copy">
            WARS helps citizens quickly report broken pipelines, leaking public taps, and contamination signs. Your
            reports are routed to response teams so issues are verified and fixed faster.
          </p>
          <div className="actions">
            <Link className="btn-link primary" to={dashboardLink}>
              {isAuthenticated ? "Open dashboard" : "Start reporting"}
            </Link>
            <a className="btn-link secondary" href="#how">
              See how it works
            </a>
          </div>
        </div>

        <div className="hero-side card">
          <h3>Why citizens use WARS</h3>
          <div className="stats-grid">
            <article>
              <strong>Fast Reporting</strong>
              <p>File water issues in minutes from your phone.</p>
            </article>
            <article>
              <strong>Direct Escalation</strong>
              <p>Reports reach the right response teams quickly.</p>
            </article>
            <article>
              <strong>Transparent Status</strong>
              <p>Track progress from submission to resolution.</p>
            </article>
            <article>
              <strong>Reward Points</strong>
              <p>Frequent valid reports earn recognition benefits.</p>
            </article>
          </div>
          <p className="subtle">Community reports make public water systems safer for everyone.</p>
        </div>
      </section>

      <section className="impact-gallery">
        <article className="impact-card card">
          <img src={bustedPipeImage} alt="Busted public water pipe leaking" />
          <div>
            <h3>Busted water infrastructure</h3>
            <p>
              Report leaking, burst, or damaged public pipes so authorities can dispatch repair teams before losses
              escalate.
            </p>
          </div>
        </article>
        <article className="impact-card card">
          <img src={contaminatedTapImage} alt="Contaminated or discolored tap water" />
          <div>
            <h3>Contaminated tap water</h3>
            <p>
              Flag unsafe water signs like brown color, bad smell, or unusual taste so water safety checks can start
              immediately.
            </p>
          </div>
        </article>
      </section>

      <section className="card" id="what">
        <h2>What problem WARS solves</h2>
        <p>
          Many communities face delayed fixes for damaged public water infrastructure and contaminated tap water
          incidents. WARS shortens that delay by giving citizens one clear channel to report problems and trigger
          action.
        </p>
        <div className="feature-strip">
          <article>
            <h4>Broken Infrastructure</h4>
            <p>Report busted pipes, broken taps, and damaged public water points.</p>
          </article>
          <article>
            <h4>Water Quality Concerns</h4>
            <p>Flag suspicious color, smell, or contamination from household taps.</p>
          </article>
          <article>
            <h4>Faster Resolution</h4>
            <p>Help authorities prioritize urgent zones through reliable citizen reporting.</p>
          </article>
        </div>
      </section>

      <section className="card" id="how">
        <h2>How WARS works</h2>
        <div className="workflow">
          <article>
            <span>01</span>
            <h3>Report</h3>
            <p>Citizen submits a case with location, issue details, and optional photo evidence.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Verify</h3>
            <p>Technical teams review, validate, and categorize urgency.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Resolve</h3>
            <p>Responsible teams fix the issue and update the case status.</p>
          </article>
          <article>
            <span>04</span>
            <h3>Track</h3>
            <p>Citizen follows progress and confirms closure after resolution.</p>
          </article>
        </div>
      </section>

      <section className="card" id="rewards">
        <h2>Citizen rewards program</h2>
        <p>
          WARS rewards active community members who consistently submit valid reports. The more accurate and useful
          your reports are, the more points you earn for public recognition and future benefit programs.
        </p>
        <div className="feature-strip">
          <article>
            <h4>Earn</h4>
            <p>Receive points for approved reports that help detect real issues.</p>
          </article>
          <article>
            <h4>Rank</h4>
            <p>Climb community contributor levels with continuous participation.</p>
          </article>
          <article>
            <h4>Benefit</h4>
            <p>Redeem or receive incentives as the rewards module is expanded.</p>
          </article>
        </div>
      </section>

      <footer className="landing-footer">
        <p>WARS - Community-driven reporting for safer public water.</p>
        <Link to={dashboardLink}>{isAuthenticated ? "Go to dashboard" : "Login to continue"}</Link>
      </footer>
    </main>
  );
}

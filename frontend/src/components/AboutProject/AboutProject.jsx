import React from "react";
import "./AboutProject.css";
import GoGirlLogo from "../../assets/GoGirl.png";
import SeerLogo from "../../assets/seer.png";

export default function AboutProject({ className = "", compact = false, showLogos = true }) {
  return (
    <div className={`about-container ${className} ${compact ? "about-compact" : ""}`}>
      {/* Header */}
      <header className="about-header">
        <div className="about-header-left">
          <p className="about-subtitle">
            SnapCode helps students convert handwritten HTML into interactive, mobile‑friendly code,
            lowering the barrier to learning web development in resource‑constrained contexts.
          </p>
        </div>
      </header>

      <div className="about-grid">
        <Section title="Overview">
          SnapCode is a learning tool designed for underserved communities. Learners photograph handwritten HTML; the app
          performs OCR, validates the markup, and renders interactive previews.
        </Section>

        <Section title="Who it's for">
          Students and facilitators at Go Girl workshops (and similar initiatives) who need a lightweight, mobile‑first
          way to learn the web stack basics, starting with HTML and progressively expanding to CSS and JavaScript.
        </Section>

        <Section title="Impact and goals">
          Reduce friction to first contact with coding, support self‑efficacy in early learners, and give instructors a
          repeatable path to run web‑dev activities in classrooms with limited infrastructure.
        </Section>

        <Section title="Partners and collaborators">
          <p>Built with Go Girl (educational non‑profit) and the SEER Lab at Ontario Tech University.</p>
          
          {showLogos && (
            <div className="about-logos">
              <div className="logo-container">
                <img 
                  src={GoGirlLogo} 
                  alt="Go Girl" 
                  className="partner-logo"
                />
                <span className="logo-label">Go Girl</span>
              </div>
              <div className="logo-container">
                <img 
                  src={SeerLogo} 
                  alt="SEER Lab" 
                  className="partner-logo"
                />
                <span className="logo-label">SEER Lab</span>
              </div>
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

const Section = ({ title, children }) => {
  return (
    <section className="about-section">
      <h3 className="about-h3">{title}</h3>
      <div className="about-body">{children}</div>
    </section>
  );
};
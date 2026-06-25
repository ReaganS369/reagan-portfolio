/** @format */

'use client';

import './contact.css';

import { Mail, MapPin, Clock3, Send } from 'lucide-react';

export default function Contact() {
  return (
    <section className="contact-section">
      <div className="contact-container">
        {/* TOP */}

        <div className="contact-top">
          {/* LEFT */}

          <div className="contact-left">
            <span className="section-label">WHERE CONNECTIONS BEGIN</span>

            <h2>
              Let's build
              <br />
              something
              <br />
              worth remembering.
            </h2>

            <p>
              Whether you're looking for a Game Designer, Technical Artist, 3D
              Generalist, or simply want to collaborate, I'd love to hear about
              your next project.
            </p>
          </div>

          {/* RIGHT */}

          <div className="contact-card">
            <h4>CONTACT CARD</h4>

            <div className="info">
              <div>
                <Mail size={18} />

                <div>
                  <span>Email</span>
                  <p>hello@nngtw.com</p>
                </div>
              </div>

              <div>
                <Clock3 size={18} />

                <div>
                  <span>Status</span>
                  <p>Available for Work</p>
                </div>
              </div>

              <div>
                <MapPin size={18} />

                <div>
                  <span>Location</span>
                  <p>Manipur, India</p>
                </div>
              </div>
            </div>

            <div className="socials">
              <a
                href="https://github.com/ReaganS369"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>

              <a href="https://linkedin.com" target="_blank" rel="noreferrer">
                LinkedIn
              </a>

              <a href="https://youtube.com" target="_blank" rel="noreferrer">
                YouTube
              </a>

              <a href="https://upwork.com" target="_blank" rel="noreferrer">
                Upwork
              </a>
            </div>

            <button className="contact-btn">Start a Conversation</button>
          </div>
        </div>

        {/* FORM */}

        <form className="contact-form">
          <input type="text" placeholder="Your Name" />

          <input type="email" placeholder="Email Address" />

          <input type="text" placeholder="Project / Company" />

          <textarea rows={7} placeholder="Tell me about your project..." />

          <button type="submit" className="send-btn">
            <Send size={18} />
            <span>Send Message</span>
          </button>
        </form>
      </div>
    </section>
  );
}

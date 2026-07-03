/** @format */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Mail, MapPin, Clock3, Send, ArrowLeft } from 'lucide-react';
import { getSocialLinks, type SocialLink } from '@/src/features/social-links/api/social-links';
import { createContactSubmission } from '../../api/contactSubmissions';
import './contact.css';

const EMPTY_FORM = { name: '', email: '', project: '', message: '' };

export function ContactPage() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

  useEffect(() => {
    getSocialLinks().then(setSocialLinks).catch(console.error);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('pending');
    try {
      await createContactSubmission({
        name: form.name,
        email: form.email,
        project: form.project || null,
        message: form.message,
      });
      setStatus('success');
      setForm(EMPTY_FORM);
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  }

  return (
    <section className="contact-section">
      <div className="contact-container">
        <Link href="/" className="contact-back">
          <ArrowLeft size={16} />
          <span>Back home</span>
        </Link>

        <div className="contact-top">
          <div className="contact-left">
            <span className="section-label">WHERE CONNECTIONS BEGIN</span>

            <h2>
              Let&apos;s build
              <br />
              something
              <br />
              worth remembering.
            </h2>

            <p>
              Whether you&apos;re looking for a Game Designer, Technical Artist, 3D
              Generalist, or simply want to collaborate, I&apos;d love to hear about
              your next project.
            </p>
          </div>

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

            {socialLinks.length > 0 && (
              <div className="socials">
                {socialLinks.map((link) => (
                  <a key={link.id} href={link.url} target="_blank" rel="noreferrer">
                    {link.platform}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Your Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            type="email"
            placeholder="Email Address"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="text"
            placeholder="Project / Company"
            value={form.project}
            onChange={(e) => setForm({ ...form, project: e.target.value })}
          />

          <textarea
            rows={7}
            placeholder="Tell me about your project..."
            required
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />

          <button type="submit" className="send-btn" disabled={status === 'pending'}>
            <Send size={18} />
            <span>{status === 'pending' ? 'Sending…' : 'Send Message'}</span>
          </button>

          {status === 'success' && (
            <p className="contact-form__status contact-form__status--success">
              Thanks — I&apos;ll get back to you soon.
            </p>
          )}
          {status === 'error' && (
            <p className="contact-form__status contact-form__status--error">
              Something went wrong — please try again.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}

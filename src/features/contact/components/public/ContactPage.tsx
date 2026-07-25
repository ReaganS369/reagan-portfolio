/** @format */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, MapPin, Clock3, Send, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

import { getSocialLinks, type SocialLink } from '@/src/features/social-links/api/social-links';
import { createContactSubmission } from '../../api/contactSubmissions';
import './contact.css';

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const EMPTY_FORM = { name: '', email: '', project: '', message: '' };

const rise = {
  initial: { opacity: 0, y: 32, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
};

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
        <motion.div {...rise} transition={{ duration: 0.7, ease: EASE }}>
          <Link href="/" className="contact-back">
            <ArrowLeft size={16} />
            <span>Back home</span>
          </Link>
        </motion.div>

        <div className="contact-top">
          <div className="contact-left">
            <motion.span
              className="section-label"
              {...rise}
              transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            >
              WHERE CONNECTIONS BEGIN
            </motion.span>

            <motion.h2 {...rise} transition={{ duration: 0.9, delay: 0.2, ease: EASE }}>
              Let&apos;s build
              <br />
              something
              <br />
              <em className="contact-accent">worth remembering.</em>
            </motion.h2>

            <motion.p {...rise} transition={{ duration: 0.9, delay: 0.35, ease: EASE }}>
              Whether you&apos;re looking for a Game Designer, Technical Artist, 3D
              Generalist, or simply want to collaborate, I&apos;d love to hear about
              your next project.
            </motion.p>
          </div>

          <motion.div
            className="contact-card"
            {...rise}
            transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
          >
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
                  <p>
                    <span className="contact-pulse" aria-hidden />
                    Available for Work
                  </p>
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
          </motion.div>
        </div>

        <motion.form
          className="contact-form"
          onSubmit={handleSubmit}
          {...rise}
          transition={{ duration: 0.9, delay: 0.45, ease: EASE }}
        >
          <div className="contact-form__row">
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
          </div>

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

          <AnimatePresence>
            {status === 'success' && (
              <motion.p
                className="contact-form__status contact-form__status--success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <CheckCircle2 size={16} />
                Thanks — I&apos;ll get back to you soon.
              </motion.p>
            )}
            {status === 'error' && (
              <motion.p
                className="contact-form__status contact-form__status--error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <AlertCircle size={16} />
                Something went wrong — please try again.
              </motion.p>
            )}
          </AnimatePresence>
        </motion.form>
      </div>
    </section>
  );
}

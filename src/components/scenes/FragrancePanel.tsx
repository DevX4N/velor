"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { setExperience, useExperience } from "@/lib/store";
import { dossier } from "@/content/velor";

/**
 * "Explore the fragrance": an editorial dossier, not a checkout. A native <dialog> (focus
 * containment, Esc, inert page for free), opened with a curtain wipe from the right.
 */
export function FragrancePanel() {
  const open = useExperience((s) => s.panelOpen);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (open && !d.open) {
      opener.current = document.activeElement;
      d.showModal();
      document.documentElement.classList.add("panel-open");
      const sheet = d.querySelector(".dossier__sheet");
      const items = d.querySelectorAll("[data-dossier-item]");
      if (reduced) {
        gsap.fromTo(sheet, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      } else {
        gsap.fromTo(d, { "--veil": 0 }, { "--veil": 1, duration: 0.6, ease: "velor.out" });
        gsap.fromTo(sheet, { clipPath: "inset(0 0 0 100%)" }, { clipPath: "inset(0 0 0 0%)", duration: 0.9, ease: "velor.inOut" });
        gsap.fromTo(items, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1, stagger: 0.06, delay: 0.35, ease: "velor.out" });
      }
    }
    if (!open && d.open) {
      const finish = () => {
        d.close();
        document.documentElement.classList.remove("panel-open");
        (opener.current as HTMLElement | null)?.focus?.();
      };
      if (reduced) finish();
      else {
        gsap.to(d, { "--veil": 0, duration: 0.45, ease: "velor.in" });
        gsap.to(d.querySelector(".dossier__sheet"), {
          clipPath: "inset(0 0 0 100%)",
          duration: 0.55,
          ease: "velor.in",
          onComplete: finish,
        });
      }
    }
  }, [open]);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    // Esc fires `cancel`: animate out through state instead of the instant native close.
    const onCancel = (e: Event) => {
      e.preventDefault();
      setExperience({ panelOpen: false });
    };
    // A click on the veil (the dialog itself, outside the sheet) closes it.
    const onClick = (e: MouseEvent) => {
      if (e.target === d) setExperience({ panelOpen: false });
    };
    d.addEventListener("cancel", onCancel);
    d.addEventListener("click", onClick);
    return () => {
      d.removeEventListener("cancel", onCancel);
      d.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <dialog ref={dialog} className="dossier" aria-labelledby="dossier-title">
      <div className="dossier__sheet">
        <div className="dossier__head">
          <button type="button" className="dossier__close t-label" onClick={() => setExperience({ panelOpen: false })}>
            Fechar
            <svg viewBox="0 0 12 12" aria-hidden="true">
              <path d="M1 1l10 10M11 1 1 11" stroke="currentColor" strokeWidth="1" />
            </svg>
          </button>
        </div>

        <h2 id="dossier-title" className="dossier__title t-serif" data-dossier-item>
          {dossier.title}
        </h2>
        <p className="dossier__lede t-serif" data-dossier-item>
          {dossier.lede}
          <span className="dossier__spec t-label">{dossier.subtitle}</span>
        </p>

        <section className="dossier__block" data-dossier-item aria-labelledby="dossier-pyramid">
          <h3 id="dossier-pyramid" className="t-label dossier__dim">
            Pirâmide olfativa
          </h3>
          <dl className="dossier__pyramid">
            {dossier.pyramid.map((n) => (
              <div key={n.tier}>
                <dt className="t-label">{n.tier}</dt>
                <dd>
                  <span className="t-serif dossier__note">{n.name}</span>
                  <span className="dossier__note-text">{n.text}</span>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="dossier__block" data-dossier-item aria-labelledby="dossier-object">
          <h3 id="dossier-object" className="t-label dossier__dim">
            O objeto
          </h3>
          <dl className="dossier__specs">
            {dossier.object.map((o) => (
              <div key={o.k}>
                <dt className="t-label">{o.k}</dt>
                <dd>{o.v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="dossier__block" data-dossier-item aria-labelledby="dossier-ritual">
          <h3 id="dossier-ritual" className="t-label dossier__dim">
            Ritual
          </h3>
          <p className="dossier__ritual">{dossier.ritual}</p>
        </section>

        <p className="dossier__note-legal" data-dossier-item>
          {dossier.disclaimer}
        </p>
      </div>
    </dialog>
  );
}

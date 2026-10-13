"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { setExperience, useExperience } from "@/lib/store";
import { scenes, type SceneId } from "@/content/velor";
import { goToScene } from "./navigate";

const NAV = scenes.filter((s) => s.nav);

/** Which nav item lights for each scene (the hero and the closing scenes map onto their neighbours). */
const OWNER: Record<SceneId, SceneId | null> = {
  awakening: null,
  revelation: "revelation",
  anatomy: "anatomy",
  essence: "essence",
  presence: "presence",
  desire: null,
  statement: null,
};

export function LuxuryNavigation() {
  const active = useExperience((s) => s.activeScene);
  const revealed = useExperience((s) => s.revealed);
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  // The header arrives after the hero light, never before.
  useEffect(() => {
    const el = header.current;
    if (!el) return;
    if (!revealed) {
      gsap.set(el, { opacity: 0 });
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(el, { opacity: 1 });
      return;
    }
    gsap.to(el, { opacity: 1, duration: 1.4, delay: 1.6, ease: "velor.out" });
  }, [revealed]);

  // Mobile menu: full-screen scene list, focus kept inside, Esc closes.
  useEffect(() => {
    const el = menu.current;
    if (!el) return;
    const items = el.querySelectorAll("[data-menu-item]");
    if (open) {
      document.documentElement.classList.add("menu-open");
      gsap.set(el, { visibility: "visible" });
      gsap.fromTo(el, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.7, ease: "velor.inOut" });
      gsap.fromTo(items, { yPercent: 110 }, { yPercent: 0, duration: 0.9, stagger: 0.05, delay: 0.25, ease: "velor.out" });
      el.querySelector<HTMLElement>("a")?.focus();
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
        if (e.key === "Tab") {
          const f = el.querySelectorAll<HTMLElement>("a, button");
          const first = f[0];
          const last = f[f.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
    document.documentElement.classList.remove("menu-open");
    gsap.to(el, {
      clipPath: "inset(0 0 100% 0)",
      duration: 0.5,
      ease: "velor.in",
      onComplete: () => {
        gsap.set(el, { visibility: "hidden" });
      },
    });
  }, [open]);

  const go = (id: SceneId) => {
    if (open) {
      setOpen(false);
      toggle.current?.focus();
    }
    goToScene(id);
  };

  const owner = OWNER[active];

  return (
    <header ref={header} className="nav">
      <a
        href="#awakening"
        className="nav__logo t-serif"
        aria-label="VÉLOR — voltar ao início"
        data-cursor="link"
        onClick={(e) => {
          e.preventDefault();
          go("awakening");
        }}
      >
        VÉLOR
      </a>

      <nav className="nav__links" aria-label="Cenas">
        <ul>
          {NAV.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="nav__link t-label"
                aria-current={owner === s.id ? "true" : undefined}
                data-cursor="link"
                onClick={(e) => {
                  e.preventDefault();
                  go(s.id);
                }}
              >
                {s.nav}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <button type="button" className="nav__explore t-label" data-cursor="link" onClick={() => setExperience({ panelOpen: true })} aria-haspopup="dialog">
        Explore
      </button>

      <button
        ref={toggle}
        type="button"
        className="nav__toggle t-label"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((o) => !o)}
      >
        <span>{open ? "Fechar" : "Menu"}</span>
        <span className="nav__toggle-bars" aria-hidden="true" data-open={open} />
      </button>

      <div ref={menu} id="mobile-menu" className="menu" role="dialog" aria-modal="true" aria-label="Cenas" style={{ visibility: "hidden" }}>
        <ol className="menu__list">
          {scenes.map((s) => (
            <li key={s.id} className="mask">
              <a
                href={`#${s.id}`}
                data-menu-item
                className="menu__item"
                aria-current={active === s.id ? "true" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  go(s.id);
                }}
              >
                <span className="t-serif">{s.title}</span>
              </a>
            </li>
          ))}
        </ol>
        <button
          type="button"
          className="menu__explore t-label"
          onClick={() => {
            setOpen(false);
            setExperience({ panelOpen: true });
          }}
        >
          Explore the fragrance
        </button>
      </div>
    </header>
  );
}

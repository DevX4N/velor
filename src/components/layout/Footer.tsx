"use client";

import { scenes, statement } from "@/content/velor";
import { goToScene } from "./navigate";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__grid">
        <div className="footer__brand">
          <p className="footer__mark t-serif">VÉLOR</p>
          <p className="t-label footer__dim">Parfums · Nº 01</p>
        </div>

        <nav className="footer__nav" aria-label="Cenas do filme">
          <ol>
            {scenes.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  data-cursor="link"
                  onClick={(e) => {
                    e.preventDefault();
                    goToScene(s.id);
                  }}
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="footer__credits">
          <p>{statement.credits}</p>
          <a
            href="#awakening"
            className="footer__top t-label"
            data-cursor="link"
            onClick={(e) => {
              e.preventDefault();
              goToScene("awakening");
            }}
          >
            Voltar ao início
          </a>
        </div>
      </div>
      <div className="footer__base t-label">
        <span>© 2026 VÉLOR — Parfums</span>
        <span>Marca fictícia · sem venda</span>
        <span>The art of presence</span>
      </div>
    </footer>
  );
}

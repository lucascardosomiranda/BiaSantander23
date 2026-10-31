(() => {
  document.documentElement.classList.add("js");

  const destaque = document.querySelector(".vd-player video");
  const cards = [...document.querySelectorAll(".vd-card")];
  const semMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const naTela = new Map();

  const aparecer = new IntersectionObserver(
    (entradas) =>
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("vis");
        aparecer.unobserve(e.target);
      }),
    { threshold: 0.15 },
  );
  document.querySelectorAll(".reveal").forEach((el) => aparecer.observe(el));

  const atualizar = () => {
    const explicativoTocando = destaque && !destaque.paused && !destaque.ended;
    cards.forEach((c) => {
      const v = c.querySelector("video");
      if (naTela.get(c) && !semMovimento && !explicativoTocando) {
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  };

  const vigiar = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((e) => naTela.set(e.target, e.isIntersecting));
      atualizar();
    },
    { threshold: 0.5 },
  );
  cards.forEach((c) => vigiar.observe(c));

  const silenciar = () =>
    cards.forEach((c) => {
      const b = c.querySelector(".vd-som");
      c.querySelector("video").muted = true;
      b.setAttribute("aria-pressed", "false");
      b.setAttribute("aria-label", "Ativar som");
    });

  cards.forEach((c) => {
    const v = c.querySelector("video");
    const b = c.querySelector(".vd-som");
    b.addEventListener("click", () => {
      const ligar = v.muted;
      silenciar();
      if (!ligar) return;
      if (destaque) destaque.pause();
      v.muted = false;
      b.setAttribute("aria-pressed", "true");
      b.setAttribute("aria-label", "Desativar som");
      v.play().catch(() => {});
    });
  });

  if (destaque) {
    destaque.addEventListener("play", () => {
      silenciar();
      atualizar();
    });
    destaque.addEventListener("pause", atualizar);
    destaque.addEventListener("ended", atualizar);
  }
})();

window.addEventListener("DOMContentLoaded", () => {
  if (!window.gsap) {
    console.warn("GSAP não carregou. Coloque gsap.min.js em assets/js/");
    return;
  }
  if (!window.ScrollTrigger) {
    console.warn("ScrollTrigger não carregou. Coloque ScrollTrigger.min.js em assets/js/");
    return;
  }

  gsap.registerPlugin(
    ...[window.ScrollTrigger, window.SplitText, window.ScrollSmoother].filter(
      Boolean,
    ),
  );

  const RESPEITAR_REDUCAO_DE_MOVIMENTO = false;
  if (
    RESPEITAR_REDUCAO_DE_MOVIMENTO &&
    matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    return;

  (document.fonts ? document.fonts.ready : Promise.resolve()).then(iniciar);

  function iniciar() {
    const D = { ease: "power3.out" };
    const subir = (extra = {}) => ({
      y: 0,
      autoAlpha: 1,
      duration: 0.7,
      ...extra,
    });

    if (window.ScrollSmoother && document.querySelector("#smooth-wrapper")) {
      ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.2,
        effects: true,
      });
    }

    const barra = document.createElement("div");
    Object.assign(barra.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "3px",
      background: "var(--ouro)",
      transformOrigin: "left center",
      transform: "scaleX(0)",
      zIndex: "9999",
      pointerEvents: "none",
    });
    document.body.appendChild(barra);
    gsap.to(barra, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
    });

    const texto = (
      sel,
      {
        unidade = "lines",
        stagger = 0.1,
        delay = 0,
        duration = 0.9,
        start = "top 85%",
        aoCarregar = false,
        from = {},
      } = {},
    ) => {
      gsap.utils.toArray(sel).forEach((el) => {
        const st = aoCarregar
          ? undefined
          : { trigger: el, start, once: true };

        if (!window.SplitText || el.querySelector(".ouro")) {
          gsap.from(el, {
            y: 30,
            autoAlpha: 0,
            duration: 0.8,
            delay,
            ease: "power3.out",
            scrollTrigger: st,
          });
          return;
        }

        const tipo =
          unidade === "lines"
            ? "lines"
            : unidade === "words"
              ? "lines,words"
              : "lines,words,chars";

        const montar = (self) =>
          gsap.from(self[unidade], {
            yPercent: 110,
            autoAlpha: 0,
            duration,
            stagger,
            delay,
            ease: "power4.out",
            ...from,
            scrollTrigger: st,
          });

        if (SplitText.create)
          SplitText.create(el, {
            type: tipo,
            mask: "lines",
            autoSplit: true,
            aria: "none",
            onSplit: montar,
          });
        else montar(new SplitText(el, { type: tipo }));
      });
    };

    gsap
      .timeline({ defaults: D })
      .fromTo(
        ".hero-forma",
        { xPercent: 100 },
        { xPercent: 0, duration: 1.1, ease: "power4.out" },
      )
      .fromTo(
        ".hero .btn",
        { y: 30, autoAlpha: 0, scale: 0.9 },
        { y: 0, autoAlpha: 1, scale: 1, duration: 0.8, ease: "back.out(1.8)" },
        1.7,
      );

    texto(".hero h1", {
      unidade: "chars",
      stagger: 0.025,
      delay: 0.4,
      duration: 0.9,
      aoCarregar: true,
    });
    texto(".hero h2", {
      unidade: "words",
      stagger: 0.08,
      delay: 0.9,
      aoCarregar: true,
    });
    texto(".hero p", { delay: 1.4, aoCarregar: true });

    gsap
      .timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      })
      .to(".hero-forma", { yPercent: 12 }, 0)
      .to(".hero-txt", { yPercent: -14, opacity: 0 }, 0);

    const hero = document.querySelector(".hero"),
      txt = document.querySelector(".hero-txt");
    if (hero && txt && matchMedia("(pointer: fine)").matches) {
      const cfg = { duration: 1.2, ease: "power3.out" };
      const tx = gsap.quickTo(txt, "x", cfg),
        ty = gsap.quickTo(txt, "y", cfg);
      hero.addEventListener("mousemove", (e) => {
        const px = e.clientX / innerWidth - 0.5,
          py = e.clientY / innerHeight - 0.5;
        tx(px * 12);
        ty(py * 12);
      });
      hero.addEventListener("mouseleave", () => {
        tx(0);
        ty(0);
      });
    }

    const quando = (sel, montar, start = "top 75%") => {
      const el = document.querySelector(sel);
      if (!el) return;
      const tl = montar(gsap.timeline({ paused: true, defaults: D }));
      ScrollTrigger.create({
        trigger: el,
        start,
        once: true,
        onEnter: () => tl.play(),
      });
    };

    texto(".servicos h2", { unidade: "words", stagger: 0.1 });
    texto(".servicos .wrap > .sub", { delay: 0.2 });

    quando(".servicos", (t) =>
      t
        .fromTo(
          ".serv",
          { x: -50, autoAlpha: 0 },
          { x: 0, autoAlpha: 1, stagger: 0.2, duration: 0.8 },
        )
        .fromTo(
          ".serv .linha",
          { scaleX: 0, transformOrigin: "left center" },
          { scaleX: 1, stagger: 0.2, duration: 0.9 },
          "<.3",
        )
        .fromTo(
          ".foco > *",
          { y: 30, autoAlpha: 0 },
          subir({ stagger: 0.1 }),
          "-=1",
        )
        .fromTo(
          ".folha",
          { xPercent: 40, autoAlpha: 0 },
          { xPercent: 0, autoAlpha: 1, duration: 1.2, ease: "power4.out" },
          "-=.9",
        )
        .call(() =>
          gsap.to(".foco .icone", {
            y: -8,
            duration: 1.6,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          }),
        ),
    );

    gsap.fromTo(
      ".folha",
      { yPercent: 8 },
      {
        yPercent: -18,
        ease: "none",
        scrollTrigger: {
          trigger: ".servicos",
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      },
    );

    texto(".bia-txt h2", { unidade: "words", stagger: 0.1 });
    texto(".bia-txt p", { stagger: 0.12 });

    quando(".bia", (t) =>
      t
        .fromTo(
          ".seta",
          { scaleX: 0, transformOrigin: "left center" },
          { scaleX: 1, duration: 1, ease: "power2.inOut" },
          0.5,
        )
        .fromTo(
          ".bia-foto",
          { y: 80, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 1.1 },
          0,
        ),
    );

    gsap.fromTo(
      ".bia-foto img",
      { y: 70 },
      {
        y: 0,
        ease: "none",
        scrollTrigger: {
          trigger: ".bia",
          start: "top bottom",
          end: "bottom bottom",
          scrub: 1,
        },
      },
    );

    texto(".protese h2", { unidade: "words", stagger: 0.1 });
    texto(".protese h2 + p", { delay: 0.2 });
    texto(".pr-txt h3", { unidade: "words", stagger: 0.08, start: "top 88%" });
    texto(".pr-txt p", { stagger: 0.08, start: "top 90%" });

    quando(".protese", (t) =>
      t
        .fromTo(
          ".antes-depois",
          { x: -60, autoAlpha: 0, clipPath: "inset(0% 100% 0% 0%)" },
          {
            x: 0,
            autoAlpha: 1,
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.1,
          },
          0.3,
        )
        .fromTo(
          ".pr-faixa",
          { scaleX: 0, transformOrigin: "left center" },
          { scaleX: 1, duration: 0.7 },
          "-=.4",
        )
        .fromTo(
          ".pr-fecho",
          { y: 20, autoAlpha: 0 },
          subir({ duration: 0.6 }),
          "-=.2",
        ),
    );

    texto(".gal-topo h2", { unidade: "words", stagger: 0.1 });
    texto(".gal-topo .sub", { delay: 0.2 });

    texto(".loc-txt h2, .loc-txt h3", {
      unidade: "words",
      stagger: 0.08,
      start: "top 88%",
    });
    texto(".loc-txt p, .loc-txt address", { stagger: 0.1, start: "top 90%" });

    quando(".local", (t) =>
      t
        .fromTo(
          ".divisor",
          { scaleX: 0, autoAlpha: 0 },
          { scaleX: 1, autoAlpha: 1, duration: 0.9 },
        )
        .fromTo(
          ".mapa",
          { y: 40, autoAlpha: 0, clipPath: "inset(0% 0% 100% 0%)" },
          subir({ clipPath: "inset(0% 0% 0% 0%)", duration: 1 }),
          "-=.4",
        )
        .fromTo(
          ".ver-mapa",
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.5 },
          "-=.2",
        ),
    );

    texto(".fw h2", { unidade: "words", stagger: 0.1 });

    quando(
      ".fw",
      (t) =>
        t
          .fromTo(
            ".fw-top",
            { y: 40, autoAlpha: 0, clipPath: "inset(0% 100% 0% 0%)" },
            subir({ clipPath: "inset(0% 0% 0% 0%)", duration: 1 }),
            0.2,
          )
          .fromTo(
            ".fw-stage",
            { y: 50, autoAlpha: 0 },
            subir({ duration: 0.9 }),
            "-=.5",
          ),
      "top 70%",
    );

    texto(".cta h2, .cta h3", { unidade: "words", stagger: 0.1 });
    texto(".cta p", { delay: 0.3 });

    quando(".cta", (t) =>
      t.fromTo(
        ".cta .btn",
        { y: 30, autoAlpha: 0, scale: 0.9 },
        { y: 0, autoAlpha: 1, scale: 1, duration: 0.8, ease: "back.out(1.8)" },
        0.5,
      ),
    );

    gsap.matchMedia().add("(min-width: 861px)", () => {
      document.querySelectorAll("[data-parallax]").forEach((el) => {
        const v = parseFloat(el.dataset.parallax) || 10;
        gsap.fromTo(
          el,
          { yPercent: v },
          {
            yPercent: -v,
            ease: "none",
            scrollTrigger: {
              trigger:
                el.closest("section, header, footer") || el.parentElement,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          },
        );
      });
    });

    document.querySelectorAll("[data-seta]").forEach((seta) => {
      const eixo = seta.dataset.seta,
        grande = seta.classList.contains("seta");
      const dist = grande ? 28 : 10,
        alvo = seta.closest("a, button") || seta;
      alvo.addEventListener("mouseenter", () =>
        gsap.to(seta, {
          [eixo]: dist,
          duration: 0.45,
          ease: "power3.out",
          overwrite: "auto",
        }),
      );
      alvo.addEventListener("mouseleave", () =>
        gsap.to(seta, {
          [eixo]: 0,
          duration: 0.45,
          ease: "power3.out",
          overwrite: "auto",
        }),
      );
      alvo.addEventListener("click", () =>
        gsap
          .timeline({ overwrite: "auto" })
          .to(seta, { [eixo]: dist * 2.5, duration: 0.25, ease: "power2.in" })
          .to(seta, { [eixo]: 0, duration: 0.9, ease: "elastic.out(1, .45)" }),
      );
    });

    document.querySelectorAll(".serv").forEach((item) => {
      const linha = item.querySelector(".linha"),
        ponto = linha.querySelector("i"),
        icone = item.querySelector(".icone"),
        titulo = item.querySelector("h3");
      let base = linha.offsetWidth;
      addEventListener("resize", () => {
        gsap.set(linha, { clearProps: "width" });
        base = linha.offsetWidth;
      });
      item.addEventListener("mouseenter", () => {
        gsap.to(linha, {
          width: Math.min(item.clientWidth, base * 1.35),
          duration: 0.7,
          ease: "power3.out",
          overwrite: "auto",
        });
        gsap.to(ponto, { scale: 2, duration: 0.5, ease: "back.out(3)" });
        gsap.to(icone, {
          scale: 1.12,
          rotation: -8,
          duration: 0.5,
          ease: "back.out(2)",
        });
        gsap.to(titulo, { x: 10, duration: 0.4 });
      });
      item.addEventListener("mouseleave", () => {
        gsap.to(linha, {
          width: base,
          duration: 0.7,
          ease: "power3.inOut",
          overwrite: "auto",
        });
        gsap.to(ponto, { scale: 1, duration: 0.4 });
        gsap.to(icone, {
          scale: 1,
          rotation: 0,
          duration: 0.5,
          ease: "power3.out",
        });
        gsap.to(titulo, { x: 0, duration: 0.4 });
      });
    });

    document.querySelectorAll(".btn").forEach((b) => {
      b.addEventListener("mouseenter", () =>
        gsap.to(b, { y: -4, scale: 1.04, duration: 0.3, ease: "power2.out" }),
      );
      b.addEventListener("mouseleave", () =>
        gsap.to(b, { y: 0, scale: 1, duration: 0.4, ease: "power2.out" }),
      );
      b.addEventListener("mousedown", () =>
        gsap.to(b, { scale: 0.97, duration: 0.1 }),
      );
    });

    document.querySelectorAll(".ft nav a").forEach((a) => {
      a.addEventListener("mouseenter", () =>
        gsap.to(a, { x: 8, duration: 0.3 }),
      );
      a.addEventListener("mouseleave", () =>
        gsap.to(a, { x: 0, duration: 0.3 }),
      );
    });

    addEventListener("load", () => ScrollTrigger.refresh());
  }
});
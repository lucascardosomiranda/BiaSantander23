(() => {
  const API = "https://featurable.com/api/v2/widgets/ecc09194-4dcc-4097-9685-436e67580e73";
  const track = document.getElementById("fwTrack");
  if (!track) return;

  const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6.2 6.6.8-4.9 4.6 1.3 6.6L12 17.4 6.1 20.7l1.3-6.6L2.5 9.5l6.6-.8z"/></svg>';
  const G = '<svg class="fw-g" viewBox="0 0 48 48" role="img" aria-label="Google"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/><path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>';
  const IMG = "assets/avaliacoes/";

  const FALLBACK = [
    { name: "Beatriz B.", photo: IMG + "beatriz.jpg", date: "14 dias atrás", n: 5, text: "Excelente profissional, se supera mais e mais a cada corte" },
    { name: "marcos M.", photo: IMG + "marcos.jpg", date: "15 dias atrás", n: 5, text: "Recomendo, a barbeira Bianca fera!!!" },
    { name: "Davi M.", photo: IMG + "davi.jpg", date: "15 dias atrás", n: 5, text: "Excelente profissional, educada, atenciosa, competente, e faz um corte preciso e muito bom." },
    { name: "Ayrton S.", photo: IMG + "ayrton.jpg", date: "14 dias atrás", n: 5, text: "Cortes sempre com excelência, na medida. Além de tudo, muito atenciosa e estudiosa!" },
    { name: "Claudio S.", photo: IMG + "claudio.jpg", date: "14 dias atrás", n: 5, text: "Ótima profissional desde o primeiro atendimento, gostei muito do trabalho da Bia. Recomendo, excelente!" },
    { name: "Luiz H.", photo: IMG + "luiz.jpg", date: "14 dias atrás", n: 5, text: "Maravilhosa! 😍" },
  ];

  const stars = (n) => Array.from({ length: 5 }, (_, i) => (i < n ? STAR : STAR.replace("<svg", '<svg class="off"'))).join("");
  const NUM = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

  function pick(o, keys) {
    for (const k of keys) {
      let v = o;
      for (const p of k.split(".")) { if (v == null) break; v = v[p]; }
      if (v != null && v !== "") return v;
    }
    return null;
  }
  const str = (v) => typeof v === "string" ? v : v && typeof v === "object" ? str(v.displayName || v.fullName || v.full || v.name || v.original || v.text) : v == null ? "" : String(v);
  const abreviar = (n) => { const p = n.trim().split(/\s+/); return p.length > 1 ? p[0] + " " + p[p.length - 1][0].toUpperCase() + "." : p[0] || ""; };
  const ts = (r) => new Date(pick(r, ["publishedAt", "createTime", "createdAt"])).getTime() || 0;
  const find = (o, n = 0) => Array.isArray(o) ? (o.length && typeof o[0] === "object" ? o : null) : o && typeof o === "object" && n < 4 ? Object.values(o).reduce((a, v) => a || find(v, n + 1), null) : null;

  function quando(s) {
    const d = new Date(s);
    if (!s || isNaN(d)) return "";
    const diff = (d - new Date()) / 1000, rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "always" });
    const u = [["year", 31536000], ["month", 2592000], ["day", 86400], ["hour", 3600], ["minute", 60]];
    for (let i = 0; i < u.length; i++) if (Math.abs(diff) >= u[i][1] || i === u.length - 1) return rtf.format(Math.round(diff / u[i][1]), u[i][0]);
  }

  function normalizar(r) {
    let n = pick(r, ["rating.value", "starRating", "rating", "stars"]);
    if (typeof n === "string") n = NUM[n.toUpperCase()] || parseFloat(n);
    return {
      name: abreviar(str(pick(r, ["author.name", "reviewer.displayName", "reviewer.name", "author", "name"]))) || "Cliente Google",
      photo: str(pick(r, ["author.avatarUrl", "reviewer.profilePhotoUrl", "photoUrl"])).replace(/^(?!https?:|assets\/).*$/, ""),
      text: str(pick(r, ["originalText", "comment", "text", "content"])),
      date: quando(pick(r, ["publishedAt", "createTime", "createdAt"])),
      n: Math.max(0, Math.min(5, Math.round(n == null || isNaN(n) ? 5 : n))),
    };
  }

  function card(r) {
    const a = document.createElement("article");
    a.className = "fw-card";
    const head = document.createElement("header");
    const ini = () => { const d = document.createElement("div"); d.className = "fw-ini"; d.textContent = r.name.charAt(0).toUpperCase(); return d; };
    let pic;
    if (r.photo) {
      pic = new Image();
      pic.src = r.photo;
      pic.alt = "Foto de " + r.name;
      pic.width = 40;
      pic.height = 40;
      pic.referrerPolicy = "no-referrer";
      pic.loading = "lazy";
      pic.onerror = () => pic.replaceWith(ini());
    } else pic = ini();
    const w = document.createElement("div"), s1 = document.createElement("strong"), s2 = document.createElement("span");
    s1.textContent = r.name;
    s2.textContent = r.date;
    w.append(s1, s2);
    head.append(pic, w);
    a.append(head);
    if (r.text) { const p = document.createElement("p"); p.textContent = r.text; a.append(p); }
    const ft = document.createElement("footer"), st = document.createElement("span");
    st.className = "fw-stars";
    st.setAttribute("role", "img");
    st.setAttribute("aria-label", r.n + " estrelas");
    st.innerHTML = stars(r.n);
    ft.append(st);
    ft.insertAdjacentHTML("beforeend", G);
    a.append(ft);
    return a;
  }

  const render = (lista) => { track.replaceChildren(...lista.map(card)); track.scrollLeft = 0; };

  const preencherResumo = (nota) => {
    document.querySelectorAll(".fw-top .fw-stars").forEach((el) => {
      el.setAttribute("aria-label", Math.round(nota) + " estrelas");
      el.innerHTML = stars(Math.round(nota));
    });
    const nEl = document.getElementById("fwAvg");
    if (nEl) nEl.textContent = nota.toFixed(1);
  };

  preencherResumo(5);
  render(FALLBACK);

  let run = 0;
  const ir = (to, ms) => {
    const from = track.scrollLeft, dist = to - from, id = ++run;
    let t0 = null;
    track.style.scrollSnapType = "none";
    track.style.scrollBehavior = "auto";
    const f = (n) => {
      if (id !== run) return;
      if (t0 === null) t0 = n;
      const p = Math.min((n - t0) / ms, 1), e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      track.scrollLeft = from + dist * e;
      if (p < 1) requestAnimationFrame(f);
      else { track.style.scrollSnapType = ""; track.style.scrollBehavior = ""; }
    };
    requestAnimationFrame(f);
  };
  const passo = (d) => {
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = track.firstElementChild.offsetWidth + gap;
    const max = track.scrollWidth - track.clientWidth;
    let to = track.scrollLeft + d * step;
    if (d > 0 && track.scrollLeft >= max - 4) to = 0;
    else if (d < 0 && track.scrollLeft <= 4) to = max;
    ir(Math.max(0, Math.min(to, max)), 700);
  };
  document.querySelector(".fw-prev")?.addEventListener("click", () => passo(-1));
  document.querySelector(".fw-next")?.addEventListener("click", () => passo(1));

  const btn = document.querySelector(".fw-btn");
  if (btn) {
    btn.addEventListener("click", (e) => {
      const r = btn.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2, s = document.createElement("span");
      s.className = "fw-ripple";
      s.style.cssText = "width:" + d + "px;height:" + d + "px;left:" + (e.clientX - r.left - d / 2) + "px;top:" + (e.clientY - r.top - d / 2) + "px";
      btn.appendChild(s);
      setTimeout(() => s.remove(), 600);
    });
  }

  fetch(API).then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); }).then((d) => {
    let list = Array.isArray(d) ? d : pick(d, ["reviews", "data.reviews", "result.reviews", "profile.reviews"]);
    if (!list || !list.length) list = find(d);
    if (!list || !list.length) throw new Error("Sem avaliações na resposta");
    list = list.slice().sort((a, b) => ts(b) - ts(a));
    render(list.map(normalizar));
    let nota = pick(d, ["profile.averageRating", "averageRating", "profile.rating", "rating"]);
    if (typeof nota !== "number") nota = list.reduce((s, r) => s + normalizar(r).n, 0) / list.length;
    preencherResumo(nota);
    const tot = pick(d, ["profile.totalReviewCount", "totalReviewCount", "profile.reviewCount", "reviewCount", "totalReviews", "total"]);
    const tEl = document.getElementById("fwTotal");
    if (tEl && (typeof tot === "number" || typeof tot === "string")) tEl.textContent = tot + " avaliações";
  }).catch((e) => console.warn("Avaliações: usando cópia fixa.", e));
})();
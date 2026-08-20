/* Cimiento — animación del sitio. GSAP + ScrollTrigger, servidos desde vendor/. */

if ("scrollRestoration" in history) history.scrollRestoration = "manual";

var quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!quieto && window.gsap) {
  gsap.registerPlugin(ScrollTrigger);

  // 1 · Entrada: la marca se revela y el resto la sigue.
  var intro = gsap.timeline({ defaults: { ease: "power3.out" } });
  intro
    .from("#marcaHero", { opacity: 0, y: 34, duration: .95 })
    .from("#tituloHero", { opacity: 0, y: 34, duration: .9 }, "-=.6")
    .to(".portada .revelar", { opacity: 1, y: 0, duration: .7, stagger: .1 }, "-=.5");

  // 2 · Al bajar, la marca del hero se encoge y entrega la posta a la de la barra.
  // Con .to(), esta línea de tiempo capturaba como estado de reposo lo que veía al
  // crearse: la portada a mitad de su entrada, o sea invisible. Al volver arriba
  // restauraba eso y la marca desaparecía. Con .fromTo() el reposo queda declarado,
  // e immediateRender:false evita que pise la animación de entrada.
  gsap.timeline({
    scrollTrigger: { trigger: ".portada", start: "top top", end: "bottom 55%", scrub: .6, invalidateOnRefresh: true }
  })
    .fromTo("#marcaHero", { scale: 1, y: 0, opacity: 1 },
            { scale: .34, y: -60, opacity: 0, ease: "none", immediateRender: false }, 0)
    .fromTo("#tituloHero", { y: 0, opacity: 1 },
            { y: -40, opacity: 0, ease: "none", immediateRender: false }, 0)
    .fromTo("#barraMarca", { opacity: 0 },
            { opacity: 1, ease: "none", immediateRender: false }, .35);

  // 3 · Parallax de las fotos: el fondo se mueve menos que el texto. Solo en
  //     pantallas grandes: mover seis capas a pantalla completa mientras se hace
  //     scroll es justo lo que traba un celular de gama media.
  var ancha = window.matchMedia("(min-width: 860px)").matches;
  gsap.utils.toArray(ancha ? "[data-parallax]" : []).forEach(function (capa) {
    gsap.fromTo(capa, { yPercent: -8 }, {
      yPercent: 8,
      ease: "none",
      scrollTrigger: { trigger: capa.parentElement, start: "top bottom", end: "bottom top", scrub: true }
    });
  });

  // 4 · Cada bloque aparece cuando entra en pantalla.
  gsap.utils.toArray("main .revelar").forEach(function (el) {
    if (el.closest(".portada")) return;          // esos los maneja la intro
    gsap.to(el, {
      opacity: 1, y: 0, duration: .75, ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 88%" }
    });
  });

  // 5 · Los números cuentan hacia arriba al aparecer.
  gsap.utils.toArray("[data-conteo]").forEach(function (el) {
    var meta = +el.dataset.conteo;
    var obj = { v: 0 };
    gsap.to(obj, {
      v: meta, duration: 1.4, ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
      onUpdate: function () { el.firstChild.nodeValue = Math.round(obj.v); }
    });
  });

  // 6 · Barra de progreso de lectura.
  gsap.to("#progreso", {
    scaleX: 1, ease: "none",
    scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: .3 }
  });
} else {
  // Sin animación: todo visible y los contadores en su valor final.
  document.querySelectorAll(".revelar").forEach(function (el) {
    el.style.opacity = 1;
    el.style.transform = "none";
  });
  document.querySelectorAll("[data-conteo]").forEach(function (el) {
    el.firstChild.nodeValue = el.dataset.conteo;
  });
  var marca = document.getElementById("barraMarca");
  if (marca) marca.style.opacity = 1;
}

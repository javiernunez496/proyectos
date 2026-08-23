/* =========================================================
   Colegio San Martín — JavaScript principal
   Todo el archivo va dentro de un IIFE (función que se ejecuta
   sola) para no dejar variables sueltas en el navegador.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- 1. MENÚ MÓVIL ---------- */
  const toggle = document.getElementById("nav-toggle");
  const menu = document.getElementById("nav-menu");

  toggle.addEventListener("click", function () {
    const abierto = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(abierto));
  });

  // Al hacer clic en un enlace, cerramos el menú (útil en móvil)
  menu.addEventListener("click", function (evento) {
    if (evento.target.classList.contains("nav__link")) {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- 2. CONTADOR ANIMADO DE ESTADÍSTICAS ----------
     IntersectionObserver avisa cuando un elemento entra en pantalla,
     así la animación arranca al llegar el usuario, no al cargar. */
  const numeros = document.querySelectorAll(".stat__number");

  function animarNumero(elemento) {
    const objetivo = Number(elemento.dataset.target);
    const sufijo = elemento.dataset.suffix || "";
    const duracion = 1500; // milisegundos
    const inicio = performance.now();

    function paso(ahora) {
      const avance = Math.min((ahora - inicio) / duracion, 1);
      // easing: empieza rápido y frena al final
      const suave = 1 - Math.pow(1 - avance, 3);
      elemento.textContent = Math.round(objetivo * suave).toLocaleString("es-PE") + sufijo;
      if (avance < 1) requestAnimationFrame(paso);
    }

    requestAnimationFrame(paso);
  }

  const observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (entrada.isIntersecting) {
        animarNumero(entrada.target);
        observador.unobserve(entrada.target); // solo una vez
      }
    });
  }, { threshold: 0.5 });

  numeros.forEach(function (n) { observador.observe(n); });

  /* ---------- 3. VALIDACIÓN DEL FORMULARIO ----------
     Nota: aquí NO se envía nada a un servidor todavía.
     Cuando tengas backend (por ejemplo Spring Boot), reemplaza
     el bloque "éxito" por un fetch() al endpoint correspondiente. */
  const formulario = document.getElementById("contact-form");
  const estado = document.getElementById("form-status");

  function esEmailValido(valor) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor);
  }

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault(); // evita que la página se recargue

    const nombre = formulario.nombre;
    const email = formulario.email;
    const errores = [];

    [nombre, email].forEach(function (campo) { campo.classList.remove("is-error"); });

    if (nombre.value.trim().length < 3) {
      nombre.classList.add("is-error");
      errores.push("Escribe tu nombre completo.");
    }

    if (!esEmailValido(email.value.trim())) {
      email.classList.add("is-error");
      errores.push("Escribe un correo válido.");
    }

    if (errores.length > 0) {
      estado.textContent = errores[0];
      estado.className = "form__status is-bad";
      return;
    }

    // Éxito (simulado por ahora)
    estado.textContent = "¡Gracias! Recibimos tu mensaje y te contactaremos pronto.";
    estado.className = "form__status is-ok";
    formulario.reset();
  });

  /* ---------- 4. AÑO ACTUAL EN EL PIE ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();

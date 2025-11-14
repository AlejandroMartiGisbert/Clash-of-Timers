// --- Inicialización ---
document.addEventListener("DOMContentLoaded", () => {
  const tiles = document.querySelector(".tiles");
  const btnCrear = document.querySelector(".button.primary");

  // Cargar temporizadores guardados
  const savedTimers = JSON.parse(localStorage.getItem("timers")) || [];
  savedTimers.forEach(t => createTimer(t));

  // Botón para crear nuevo temporizador
  btnCrear.addEventListener("click", (e) => {
    e.preventDefault();
    const name = prompt("Introduce un nombre para el temporizador:");
    const durationStr = prompt("Introduce duración (ej: 1d 2h 30m 20s):");
    if (!durationStr) return;

    const durationMs = parseDuration(durationStr);
    if (!durationMs) return alert("Formato inválido");

    const endTime = Date.now() + durationMs;
    const timerData = { id: Date.now(), endTime, name, finished: false };

    createTimer(timerData);
    saveTimer(timerData);
  });
});

// --- Crear temporizador en el DOM ---
function createTimer(timerData) {
  const tiles = document.querySelector(".tiles");
  const article = document.createElement("article");
  article.classList.add("style2");
  article.dataset.id = timerData.id;

  article.innerHTML = `
    <span class="image">
      <img src="images/pic01.jpg" alt="" />
      <button class="delete-btn">❌</button>
    </span>
    <div class="timer-body">
      <h2></h2>
      <div class="content" style="opacity:0;">
        <p>${timerData.name || "Sin nombre"}</p>
        <button class="button primary timebutton modify">Modificar</button>
      </div>
    </div>
  `;

  tiles.appendChild(article);

  const h2 = article.querySelector("h2");
  const content = article.querySelector(".content");

  // --- comprobar estado al cargar ---
  const remaining = timerData.endTime - Date.now();
  if (remaining <= 0 || timerData.finished) {
    h2.textContent = "¡Finalizado!";
    content.style.opacity = 0;
    article.className = "style1";
    timerData.finished = true;
    saveTimer(timerData);
  } else {
    // --- Actualizar cuenta atrás ---
    function update() {
      const remaining = timerData.endTime - Date.now();
      if (remaining <= 0) {
        clearInterval(article.dataset.intervalId);
        h2.textContent = "¡Finalizado!";
        //content.style.opacity = 0;
        notify(`El temporizador "${timerData.name}" ha terminado 🎉`);
        timerData.finished = true;
        saveTimer(timerData);
        article.className = "style1";
      } else {
        h2.textContent = formatTime(remaining);
        content.style.opacity = 1;
        updateColor(article, remaining);
      }
    }

    const interval = setInterval(update, 1000);
    article.dataset.intervalId = interval;
    update();
  }

  // --- Modificar temporizador ---
  article.querySelector(".modify").addEventListener("click", () => {
    const newDurationStr = prompt("Nueva duración (ej: 2h 15m):");
    if (!newDurationStr) return;
    const newDurationMs = parseDuration(newDurationStr);
    if (!newDurationMs) return alert("Formato inválido");

    if (article.dataset.intervalId) clearInterval(article.dataset.intervalId);

    timerData.endTime = Date.now() + newDurationMs;
    timerData.finished = false; // reset estado
    saveTimer(timerData);

    function update() {
      const remaining = timerData.endTime - Date.now();
      if (remaining <= 0) {
        clearInterval(article.dataset.intervalId);
        h2.textContent = "¡Finalizado!";
        content.style.opacity = 0;
        notify(`El temporizador "${timerData.name}" ha terminado 🎉`);
        timerData.finished = true;
        saveTimer(timerData);
        article.className = "style1";
      } else {
        h2.textContent = formatTime(remaining);
        content.style.opacity = 1;
        updateColor(article, remaining);
      }
    }

    const newInterval = setInterval(update, 1000);
    article.dataset.intervalId = newInterval;
    update();
  });

  // --- Borrar temporizador ---
  article.querySelector(".delete-btn").addEventListener("click", e => {
    e.stopPropagation();
    e.preventDefault();
    if (confirm(`¿Seguro que quieres borrar el temporizador "${timerData.name}"?`)) {
      if (article.dataset.intervalId) clearInterval(article.dataset.intervalId);
      article.remove();
      removeTimer(timerData.id);
    }
  });
}

// --- Guardar temporizadores ---
function saveTimer(timerData) {
  let timers = JSON.parse(localStorage.getItem("timers")) || [];
  timers = timers.filter(t => t.id !== timerData.id);
  timers.push(timerData);
  localStorage.setItem("timers", JSON.stringify(timers));
}

// --- Eliminar temporizador ---
function removeTimer(id) {
  let timers = JSON.parse(localStorage.getItem("timers")) || [];
  timers = timers.filter(t => t.id !== id);
  localStorage.setItem("timers", JSON.stringify(timers));
}

// --- Parsear duración tipo "1d 2h 30m 20s" ---
function parseDuration(str) {
  let ms = 0;
  str.split(" ").forEach(part => {
    if (part.endsWith("d")) ms += parseInt(part) * 86400000;
    else if (part.endsWith("h")) ms += parseInt(part) * 3600000;
    else if (part.endsWith("m")) ms += parseInt(part) * 60000;
    else if (part.endsWith("s")) ms += parseInt(part) * 1000;
  });
  return ms;
}

// --- Formatear tiempo ---
function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h:${minutes}m`;
  if (minutes > 0) return `${minutes}m:${seconds}s`;
  return `${seconds}s`;
}

// --- Cambiar color según tiempo ---
function updateColor(article, remaining) {
  const totalSeconds = remaining / 1000;
  if (totalSeconds > 3600 * 12) { // más de 12h
    article.className = "style3"; // verde
  } else if (totalSeconds > 3600) { // más de 1h
    article.className = "style5"; // violeta
  } else if (totalSeconds > 300) { // más de 5min
    article.className = "style6"; // azul
  } else {
    article.className = "style1"; // rojo
  }
}

// --- Notificaciones ---
function notify(msg) {
  if (Notification.permission === "granted") {
    new Notification(msg);
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification(msg);
      }
    });
  }
}
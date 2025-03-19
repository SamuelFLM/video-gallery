// Elementos DOM
const videoList = document.getElementById("videoList");
const mainPlayer = document.getElementById("mainPlayer");
const mainVideo = document.getElementById("mainVideo");
const videoTitle = document.getElementById("videoTitle");
const resolutionSelector = document.getElementById("resolutionSelector");
const floatingPlayer = document.getElementById("floatingPlayer");
const floatingVideo = document.getElementById("floatingVideo");
const closeFloating = document.getElementById("closeFloating");
const minimizeFloating = document.getElementById("minimizeFloating");
const maximizeFloating = document.getElementById("maximizeFloating");
const resizeHandle = document.getElementById("resizeHandle");

// Variáveis de estado
let currentVideo = null;
let currentResolution = "720";
let isFloatingMinimized = false;
let originalFloatingWidth = 320;
let isResizing = false;
let isDragging = false;
let dragOffsetX, dragOffsetY;

// Renderizar a lista de vídeos
function renderVideoList() {
  if (!videoList) return;

  videoList.innerHTML = "";

  // Verificar se videos existe e tem itens
  if (!videos || videos.length === 0) {
    videoList.innerHTML =
      '<div class="no-videos">Nenhum vídeo disponível</div>';
    return;
  }

  let videosOrderBy = videos.sort(
    (a, b) => new Date(a.vdatime) - new Date(b.vdatime)
  );

  videosOrderBy.forEach((video) => {
    const videoItem = document.createElement("div");
    videoItem.className = "video-item";
    videoItem.innerHTML = `
            <img class="video-thumbnail" src="${video.thumbnail}" alt="${video.title}">
            <div class="video-info">
                <div class="video-title">${video.title}</div>
                <div class="video-description">${video.description}</div>
            </div>
        `;
    videoItem.addEventListener("click", () => playVideo(video));
    videoList.appendChild(videoItem);
  });
}

// Tornar a função renderVideoList disponível globalmente
window.renderVideoList = renderVideoList;

// Reproduzir um vídeo no player principal
function playVideo(video) {
  const titleItem = document.getElementsByClassName("header")[0];
  if (titleItem) {
    titleItem.innerHTML = `
          <h1>${video.title}</h1>
      `;
  }

  currentVideo = video;
  mainPlayer.style.display = "block";

  // Determinar qual fonte usar para o vídeo
  const videoSource = video.sources
    ? video.sources[currentResolution]
    : video.file;
  mainVideo.src = videoSource;

  videoTitle.textContent = video.title;
  mainVideo.play();

  // Rolar para o topo para ver o player principal
  window.scrollTo({ top: 0, behavior: "smooth" });

  // Se houver um vídeo flutuante, sincronizá-lo
  if (floatingPlayer.style.display === "block") {
    floatingVideo.src = videoSource;
    floatingVideo.currentTime = mainVideo.currentTime;
    floatingVideo.play();
  }
}

// Alternar para o modo flutuante
function toggleFloatingMode() {
  if (!currentVideo) return;

  if (floatingPlayer.style.display !== "block") {
    floatingPlayer.style.display = "block";
    const videoSource = currentVideo.sources
      ? currentVideo.sources[currentResolution]
      : currentVideo.file;
    floatingVideo.src = videoSource;
    floatingVideo.currentTime = mainVideo.currentTime;
    floatingVideo.play();
  } else {
    floatingPlayer.style.display = "none";
  }
}

// ---- Event Listeners ----

// Controles do player flutuante
closeFloating.addEventListener("click", () => {
  floatingPlayer.style.display = "none";
});

minimizeFloating.addEventListener("click", () => {
  if (isFloatingMinimized) {
    floatingPlayer.style.width = originalFloatingWidth + "px";
    isFloatingMinimized = false;
  } else {
    originalFloatingWidth = floatingPlayer.offsetWidth;
    floatingPlayer.style.width = "160px";
    isFloatingMinimized = true;
  }
});

maximizeFloating.addEventListener("click", () => {
  floatingPlayer.style.display = "none";
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Funcionalidade de redimensionamento
resizeHandle.addEventListener("mousedown", (e) => {
  isResizing = true;
  e.preventDefault();
});

document.addEventListener("mousemove", (e) => {
  if (!isResizing) return;

  const width = e.clientX - floatingPlayer.getBoundingClientRect().left;
  floatingPlayer.style.width = Math.max(160, width) + "px";
});

document.addEventListener("mouseup", () => {
  isResizing = false;
});

// Funcionalidade de arrastar
floatingPlayer.addEventListener("mousedown", (e) => {
  // Não iniciar arrasto ao clicar nos controles ou na alça de redimensionamento
  if (
    e.target.classList.contains("control-button") ||
    e.target === resizeHandle
  ) {
    return;
  }

  isDragging = true;
  dragOffsetX = e.clientX - floatingPlayer.getBoundingClientRect().left;
  dragOffsetY = e.clientY - floatingPlayer.getBoundingClientRect().top;
  floatingPlayer.style.cursor = "grabbing";
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  const left = e.clientX - dragOffsetX;
  const top = e.clientY - dragOffsetY;

  // Limitar a posição às bordas da janela
  const maxX = window.innerWidth - floatingPlayer.offsetWidth;
  const maxY = window.innerHeight - floatingPlayer.offsetHeight;

  floatingPlayer.style.left = Math.max(0, Math.min(left, maxX)) + "px";
  floatingPlayer.style.top = Math.max(0, Math.min(top, maxY)) + "px";
  floatingPlayer.style.right = "auto";
  floatingPlayer.style.bottom = "auto";
});

document.addEventListener("mouseup", () => {
  if (isDragging) {
    isDragging = false;
    floatingPlayer.style.cursor = "default";
  }
});

// Alternar para o modo flutuante ao rolar para baixo
window.addEventListener("scroll", () => {
  if (!currentVideo) return;

  const mainPlayerRect = mainPlayer.getBoundingClientRect();

  // Se o player principal não estiver visível e o vídeo estiver sendo reproduzido
  if (mainPlayerRect.bottom < 0 && !mainVideo.paused) {
    if (floatingPlayer.style.display !== "block") {
      toggleFloatingMode();
    }
  }
});

// Mudar resolução
resolutionSelector.addEventListener("change", () => {
  if (!currentVideo) return;

  currentResolution = resolutionSelector.value;
  const currentTime = mainVideo.currentTime;

  // Determinar qual fonte usar para o vídeo
  const videoSource = currentVideo.sources
    ? currentVideo.sources[currentResolution]
    : currentVideo.file;
  mainVideo.src = videoSource;
  mainVideo.currentTime = currentTime;
  mainVideo.play();

  if (floatingPlayer.style.display === "block") {
    floatingVideo.src = videoSource;
    floatingVideo.currentTime = currentTime;
    floatingVideo.play();
  }
});

// Evento quando o vídeo termina
mainVideo.addEventListener("ended", () => {
  // Verificar se há vídeos suficientes para continuar
  if (!videos || videos.length <= 1) return;

  // Reproduzir próximo vídeo automaticamente
  const currentIndex = videos.findIndex((v) => v.id === currentVideo.id);
  const nextIndex = (currentIndex + 1) % videos.length;
  playVideo(videos[nextIndex]);
});

// Não inicializar a interface imediatamente, pois os vídeos serão carregados assincronamente
// O renderVideoList será chamado após os vídeos serem carregados (em data.js)

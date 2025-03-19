// Inicialização de variável global para armazenar dados dos vídeos
let videos = [];

// Função para buscar vídeos do servidor
async function fetchVideos() {
  try {
    const response = await fetch("/api/videos");
    if (!response.ok) {
      throw new Error("Erro ao buscar vídeos");
    }

    const data = await response.json();
    videos = data.videos;

    // Se não houver vídeos, mostrar mensagem
    if (videos.length === 0) {
      const videoList = document.getElementById("videoList");
      videoList.innerHTML = `
                <div class="no-videos">
                    <h3>Nenhum vídeo encontrado</h3>
                    <p>Adicione arquivos de vídeo à pasta "videos" e reinicie o servidor.</p>
                </div>
            `;
    } else {
      // Renderizar a lista de vídeos, se o elemento existir
      const renderVideoList = window.renderVideoList;
      if (typeof renderVideoList === "function") {
        renderVideoList();
      }
    }

    return videos;
  } catch (error) {
    console.error("Falha ao carregar vídeos:", error);
    alert(
      "Não foi possível carregar a lista de vídeos. Verifique se o servidor está rodando."
    );
    return [];
  }
}

// Carregar vídeos quando o script for carregado
document.addEventListener("DOMContentLoaded", fetchVideos);

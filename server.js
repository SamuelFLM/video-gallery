const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const port = 3000;

// Pasta onde os vídeos estarão armazenados
const VIDEOS_FOLDER = path.join(__dirname, "Figma");

// Servir arquivos estáticos da pasta atual
app.use(express.static(__dirname));
// Servir arquivos de vídeo da pasta 'videos'
app.use("/videos", express.static(path.join(__dirname, "Figma")));

// Endpoint para obter a lista de vídeos
app.get("/api/videos", (req, res) => {
  try {
    // Verificar se a pasta existe
    if (!fs.existsSync(VIDEOS_FOLDER)) {
      fs.mkdirSync(VIDEOS_FOLDER);
      return res.json({ videos: [] });
    }

    // Ler arquivos na pasta
    const files = fs.readdirSync(VIDEOS_FOLDER);

    // Filtrar apenas arquivos de vídeo (extensões comuns)
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".mkv"];
    const videoFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return videoExtensions.includes(ext);
    });

    // Criar array de objetos de vídeo
    const videos = videoFiles.map((file, index) => {
      const filePath = path.join(VIDEOS_FOLDER, file);
      const stats = fs.statSync(filePath);
      // Nome do arquivo sem extensão para usar como título
      const title = path
        .basename(file, path.extname(file))
        .replace(/[_-]/g, " ") // Substituir underscores e hífens por espaços
        // .replace(/\b\w/g, (l) => l.toUpperCase()) // Capitalizar primeira letra de cada palavra
        .normalize("NFD");

      return {
        id: index + 1,
        title: title,
        vdatime: stats.birthtime,
        description: `Tamanho: ${
          Math.round((stats.size / 1024 / 1024) * 10) / 10
        } MB`,
        thumbnail: `images.png`, // Endpoint para gerar thumbnails (a ser implementado)
        file: `/videos/${file}`,
        sources: {
          360: `/videos/${file}`,
          480: `/videos/${file}`,
          720: `/videos/${file}`,
          1080: `/videos/${file}`,
        },
      };
    });
    res.json({ videos });
  } catch (error) {
    console.error("Erro ao ler diretório de vídeos:", error);
    res.status(500).json({ error: "Erro ao ler diretório de vídeos" });
  }
});

// Rota básica para thumbnails (placeholder)
// Em produção, você pode gerar thumbnails reais dos vídeos
app.get("/api/thumbnail/:filename", (req, res) => {
  res.redirect(
    `https://via.placeholder.com/320x180?text=${encodeURIComponent(
      req.params.filename
    )}`
  );
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  console.log(`Coloque seus vídeos na pasta: ${VIDEOS_FOLDER}`);
});

// Selecionando os elementos HTML necessários
const alphabetContainer = document.querySelector('.alphabet-container'); // Contêiner onde os quadrados de letras serão adicionados
const modal = document.getElementById('nameModal'); // Modal onde os nomes serão listados
const cameraModal = document.getElementById('cameraModal'); // Modal da câmera para capturar foto
const closeModal = document.getElementById('closeModal'); // Botão para fechar o modal de nomes
const closeCamera = document.getElementById('closeCamera'); // Botão para fechar o modal da câmera
const nameList = document.getElementById('nameList'); // Lista de nomes dentro do modal
const video = document.getElementById('video'); // Elemento de vídeo para mostrar a imagem da câmera
const canvas = document.getElementById('canvas'); // Elemento de canvas para capturar a imagem da câmera
const captureBtn = document.getElementById('captureBtn'); // Botão para capturar a foto
const generateReportBtn = document.getElementById('generateReportBtn'); // Botão para gerar o relatório XLSX

// Lista de nomes por letra do alfabeto
const namesByLetter = {
  A: ['Alice', 'Arthur', 'Amanda'],
  B: ['Bruno', 'Beatriz', 'Bárbara'],
  C: ['Carlos', 'Camila', 'Catarina'],
  // Adicione mais letras e nomes aqui conforme necessário
};

// Array para armazenar os dados dos colaboradores
let colaboradores = []; // Array de colaboradores que contém os dados capturados
let selectedName = ""; // Variável para armazenar o nome selecionado pelo usuário

// Gerar quadrados com as letras do alfabeto
for (let i = 65; i <= 90; i++) { // Loop para gerar letras de A a Z (ASCII 65 a 90)
  const letter = String.fromCharCode(i); // Converte o código ASCII para a letra correspondente
  const div = document.createElement('div'); // Cria um elemento div para cada letra
  div.textContent = letter; // Define a letra dentro do quadrado
  div.addEventListener('click', () => showNames(letter)); // Adiciona um evento de clique para mostrar os nomes da letra
  alphabetContainer.appendChild(div); // Adiciona o quadrado ao contêiner
}

// Função para exibir os nomes de acordo com a letra selecionada
function showNames(letter) {
  const names = namesByLetter[letter] || []; // Obtém a lista de nomes da letra selecionada
  nameList.innerHTML = ''; // Limpa a lista de nomes do modal
  names.forEach(name => { // Itera sobre a lista de nomes
    const li = document.createElement('li'); // Cria um item de lista para cada nome
    li.textContent = name; // Define o nome dentro do item
    li.addEventListener('click', () => { // Evento de clique no nome
      selectedName = name; // Armazena o nome selecionado
      openCameraModal(); // Abre o modal da câmera
    });
    nameList.appendChild(li); // Adiciona o item à lista
  });
  modal.style.display = 'flex'; // Exibe o modal de nomes
}

// Função para fechar o modal de nomes
closeModal.addEventListener('click', () => modal.style.display = 'none'); // Fecha o modal quando o botão de fechar for clicado

// Função para abrir o modal da câmera
function openCameraModal() {
  modal.style.display = 'none'; // Fecha o modal de nomes
  cameraModal.style.display = 'flex'; // Abre o modal da câmera
  startCamera(); // Inicia a câmera
}

// Função para fechar o modal da câmera
closeCamera.addEventListener('click', () => cameraModal.style.display = 'none'); // Fecha o modal da câmera quando o botão de fechar for clicado

// Função para iniciar a câmera
function startCamera() {
  navigator.mediaDevices.getUserMedia({ video: true }) // Solicita permissão para acessar a câmera
    .then(stream => {
      video.srcObject = stream; // Define o fluxo da câmera no elemento de vídeo
    })
    .catch(error => {
      console.error('Erro ao acessar a câmera: ', error); // Exibe um erro se não for possível acessar a câmera
    });
}

// Função para capturar a foto
captureBtn.addEventListener('click', () => {
  // Obter a data e hora atual
  const now = new Date();
  const date = now.toLocaleDateString(); // Data no formato local
  const time = now.toLocaleTimeString(); // Hora no formato local

  // Obter a localização do usuário
  navigator.geolocation.getCurrentPosition(position => {
    const location = `Latitude: ${position.coords.latitude}, Longitude: ${position.coords.longitude}`; // Latitude e longitude

    // Captura a imagem da câmera no canvas
    canvas.style.display = 'block'; // Exibe o canvas
    const context = canvas.getContext('2d'); // Obtém o contexto de desenho do canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height); // Desenha o vídeo no canvas
    const photoDataUrl = canvas.toDataURL(); // Obtém a imagem como URL de dados (base64)

    // Salvar os dados no array de colaboradores
    colaboradores.push({
      name: selectedName, // Nome selecionado
      date: date, // Data de captura
      time: time, // Hora de captura
      location: location, // Localização do usuário
      photo: photoDataUrl // Foto capturada em formato base64
    });

    // Parar o fluxo de vídeo e fechar o modal
    video.srcObject.getTracks().forEach(track => track.stop()); // Para o vídeo
    cameraModal.style.display = 'none'; // Fecha o modal da câmera após captura
  });
});

// Gerar relatório em formato XLSX
generateReportBtn.addEventListener('click', () => {
  const wb = XLSX.utils.book_new(); // Cria um novo livro de trabalho
  const ws = XLSX.utils.json_to_sheet(colaboradores, { // Converte os dados dos colaboradores para uma planilha
    header: ['name', 'date', 'time', 'location', 'photo'], // Define os cabeçalhos das colunas
    cellDates: true, // Formata as células de data corretamente
  });

  // Adiciona a planilha ao livro de trabalho
  XLSX.utils.book_append_sheet(wb, ws, 'Relatório'); // Adiciona a planilha com os dados ao livro

  // Gera o arquivo XLSX e o baixa
  XLSX.writeFile(wb, 'relatorio.xlsx'); // Gera o arquivo e o nomeia como 'relatorio.xlsx'
});

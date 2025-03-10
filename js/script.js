let audioContext;
let analyser;
let microphone;
let dataArray;
let running = false;

const vibrationPatterns = {
  low: [200], // Som rápido
  medium: [200, 100, 200], // Som médio
  high: [400, 100, 400], // Som alto contínuo
  intense: [300, 100, 300, 100, 300], // Barulhos constantes
  extreme: [1000], // Ruído intenso e perigoso
};

// Iniciar detecção
async function startDetection() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Seu navegador não suporta captura de áudio.");
    return;
  }

  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    dataArray = new Uint8Array(analyser.frequencyBinCount);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    microphone = audioContext.createMediaStreamSource(stream);
    microphone.connect(analyser);
    running = true;
    detectSound();

    document.getElementById("start").style.display = "none";
    document.getElementById("stop").style.display = "block";
  } catch (error) {
    alert("Erro ao acessar o microfone: " + error.message);
  }
}

// Detectar som e acionar vibração
function detectSound() {
  if (!running) return;
  analyser.getByteFrequencyData(dataArray);
  let average = dataArray.reduce((a, b) => a + b) / dataArray.length;

  let status = "Nenhum som alto detectado.";
  let vibrationPattern = null;

  if (average > 80) {
    status = "Ruído extremo detectado!";
    vibrationPattern = vibrationPatterns.extreme;
  } else if (average > 60) {
    status = "Barulhos constantes ao redor.";
    vibrationPattern = vibrationPatterns.intense;
  } else if (average > 40) {
    status = "Som alto contínuo detectado.";
    vibrationPattern = vibrationPatterns.high;
  } else if (average > 20) {
    status = "Som médio identificado.";
    vibrationPattern = vibrationPatterns.medium;
  } else if (average > 10) {
    status = "Som rápido identificado.";
    vibrationPattern = vibrationPatterns.low;
  }

  document.getElementById("status").innerText = status;
  if (vibrationPattern) navigator.vibrate(vibrationPattern);

  requestAnimationFrame(detectSound);
}

// Parar detecção
function stopDetection() {
  running = false;
  audioContext.close();
  document.getElementById("start").style.display = "block";
  document.getElementById("stop").style.display = "none";
  document.getElementById("status").innerText = "Detector desligado.";
}

// Modal de instruções
const modal = document.getElementById("instruction-modal");
document
  .getElementById("instructions")
  .addEventListener("click", () => (modal.style.display = "flex"));
document
  .getElementById("close-modal")
  .addEventListener("click", () => (modal.style.display = "none"));

document.getElementById("start").addEventListener("click", startDetection);
document.getElementById("stop").addEventListener("click", stopDetection);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.js")
    .then(() => console.log("Service Worker registrado!"))
    .catch((error) => console.log("Falha ao registrar Service Worker:", error));
}

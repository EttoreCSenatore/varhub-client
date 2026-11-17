---
id: ar-e-qr
title: AR e QR Code
sidebar_position: 2
---

# AR e QR Code

## Leitura do QR Code

O componente `QRScanner` pede acesso à câmera e tenta primeiro a biblioteca `html5-qrcode`. Se ela não iniciar, cai para uma leitura manual: cada quadro do vídeo é desenhado num `canvas` e decodificado com `jsQR`.

O conteúdo do QR Code é tratado como texto e depois como URL:

| Conteúdo detectado | O que acontece |
|---|---|
| URL de vídeo (`.mp4`, `.webm`, `.ogg`, `.mov`, `.avi`, YouTube, Vimeo e similares) | Abre no reprodutor `react-player`, com a opção de visor 360° (`a-videosphere` do A-Frame). |
| Qualquer outra URL | Mostra o endereço e oferece abrir em outra aba (`noopener,noreferrer`). |
| Texto que não é URL | Mostra o texto lido. |

## Vídeos 360° e CORS

Os vídeos 360° ficam no **AWS S3**. Para o navegador poder usá-los como textura WebGL, o bucket precisa enviar cabeçalhos CORS. Como a configuração do bucket não estava disponível, o cliente usa proxies CORS públicos (`src/utils/cors-proxy.js`) para URLs do S3, tentando o próximo da lista quando um falha.

:::warning
Proxies públicos veem a URL do vídeo e podem cair a qualquer momento. A solução definitiva é configurar o CORS no bucket (ver [Roadmap](../roadmap)).
:::

## Visualizador de modelos 3D

O componente `ARViewer` carrega um modelo `.glb` com o `GLTFLoader` do Three.js, centraliza e ajusta a escala, e, em dispositivos com WebXR, usa uma sessão de AR com **hit-test** e um retículo para posicionar o modelo no ambiente. A página de projetos navega para `/ar-viewer?model=...`, mas essa rota ainda não está registrada (ver [Roadmap](../roadmap)).

## Experiências WebXR

A página de projetos lista demonstrações que apontam para os exemplos oficiais do [WebXR Samples](https://immersive-web.github.io/webxr-samples/): AR imersivo, VR, rastreamento de entrada, hit-test, âncoras, mãos, fotos 360° e vídeo estéreo. Elas exigem um navegador e um dispositivo com WebXR (por exemplo Chrome no Android para AR).

O pacote `webxr-polyfill` cobre navegadores sem suporte nativo, com recursos limitados.

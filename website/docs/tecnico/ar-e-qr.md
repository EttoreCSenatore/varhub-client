---
id: ar-e-qr
title: AR e QR Code
sidebar_position: 2
---

# AR e QR Code

## O QR Code do projeto

No painel, cada projeto tem um botão **QR** que baixa um PNG com o endereço `https://<site>/projects/<id>?src=qr`. Escanear esse código com **qualquer** leitor (inclusive a câmera nativa do celular) abre a página do projeto, e o parâmetro `src=qr` faz o servidor contar um escaneamento.

## Leitor dentro do app

A página **Scan** abre a câmera traseira e decodifica quadros reduzidos (até 640 px de largura) com `jsQR`, cerca de oito vezes por segundo. Se a câmera for negada ou não existir, o visitante pode **escolher uma foto** do QR Code.

O que acontece depois da leitura:

| Conteúdo | Resultado |
|---|---|
| Link `/projects/<id>` deste app | Abre o projeto e conta um escaneamento. |
| Outro endereço `http(s)` | Mostra o endereço completo e só abre com um toque, avisando que o VARHub não criou o link. |
| Qualquer outro texto (inclusive `javascript:` e `tel:`) | Mostra o texto; nunca vira link. |

## Modelos 3D e AR

Projetos do tipo **3D / AR** usam o componente `<model-viewer>` do Google:

- Em todos os navegadores: girar, ampliar e ver o modelo (`.glb`).
- Android: botão **View in your space (AR)** com WebXR ou Scene Viewer.
- iPhone: Quick Look. Se não houver arquivo `.usdz`, o `<model-viewer>` gera um a partir do `.glb`.

O evento `ar_launch` é registrado quando a sessão de AR começa.

## Vídeo 360°

Projetos **360° video** usam um visualizador próprio com Three.js: o vídeo equirretangular é aplicado ao interior de uma esfera. Arraste para olhar ao redor, use a roda do mouse para zoom ou, no celular, o botão **Use phone motion** para girar com o aparelho (no iPhone o sistema pede permissão de movimento).

:::warning
O arquivo de vídeo precisa ser servido com cabeçalhos **CORS** (`Access-Control-Allow-Origin`), senão o navegador não deixa usá-lo como textura. No S3, configure o CORS do bucket para a origem do app.
:::

## Demonstrações WebXR

Projetos do tipo **WebXR demo** abrem uma página externa (por exemplo os exemplos oficiais do [WebXR Samples](https://immersive-web.github.io/webxr-samples/)). Elas exigem Chrome em um Android com ARCore; o app avisa quando o aparelho não é compatível.

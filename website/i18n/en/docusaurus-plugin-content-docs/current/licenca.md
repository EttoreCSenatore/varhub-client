---
id: licenca
title: License
sidebar_position: 2
---

# License

VARHub is **free and open-source software**, with network copyleft.

| Part | License |
|---|---|
| Client and server code | [GNU AGPL-3.0-or-later](https://www.gnu.org/licenses/agpl-3.0.html) (`LICENSE` in each repository) |
| Documentation and demo images | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.en) (`LICENSE-DOCS.md`) |

## What it allows

The AGPL is approved by the **Open Source Initiative** and is a free-software license of the **Free Software Foundation**. You may **use, study, modify and distribute** VARHub, including in commercial products and for any company or school.

## What it requires

- When you **distribute** VARHub or a modified version, keep the license and copyright notice and provide the source code under the same license.
- Because VARHub is a **network service**, the AGPL goes further: if you **host a modified version** for other people to use, you must **offer that version's source code** to its users (section 13). In practice, keep the footer's **Source** link pointing to your repository.
- Using VARHub **without modifying it** requires publishing nothing beyond the license itself.

This page is a summary, not legal advice; the license text is what counts.

## Trademarks and third-party material

- **VARLab** and **Conestoga College**, their names and logos, belong to their owners and are **not** covered by the license. When you adapt the project, use your own name and logo (see [Adapt it to your business](adaptar)).
- The demo data (`db/seed.sql`) points to public third-party files, such as the astronaut model from the `<model-viewer>` project and the official WebXR samples. They follow their authors' licenses and are not part of VARHub.
- The libraries used (React, Three.js, `<model-viewer>`, Express and others) have open-source licenses compatible with the AGPL, checked by `scripts/auditar-licencas.py` in CI.

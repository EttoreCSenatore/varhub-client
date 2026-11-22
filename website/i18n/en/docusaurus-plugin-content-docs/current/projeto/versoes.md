---
id: versoes
title: Versions and releases
sidebar_position: 2
---

# Versions and releases

## Version number: `MAJOR.MINOR.PATCH`

We follow [Semantic Versioning](https://semver.org/):

| Part | When it goes up | Example |
|---|---|---|
| **MAJOR** | A big change that breaks compatibility (for example, the old client stops working with the new API) | 2.1.0 → **3.0.0** |
| **MINOR** | A **new feature** or a relevant compatible improvement | 2.1.0 → **2.2.0** |
| **PATCH** | A bug fix or a small adjustment | 2.1.0 → **2.1.1** |

The client and the server have their own numbering, each in its own `package.json`. The site footer shows both.

## Where the notes live: `releases.yaml`

Each repository's `releases.yaml` is the **single source** of the history. It feeds:

- the app's **What's new** page (`/whats-new`);
- the **GitHub Release**, in English;
- the CI check: the first entry must equal the `package.json` version.

```yaml
- version: 2.2.0
  date: 2026-12-01
  title:
    en: Per-location QR codes
    pt-br: QR Codes por local
  items:
    - kind: new            # new | improvement | fix | security
      text:
        en: Each QR code can carry a location, shown on the dashboard.
        pt-br: Cada QR Code pode levar um local, mostrado no painel.
```

## How to publish a version

1. Write the entry at the top of `releases.yaml` (English and Portuguese) and raise the version in `package.json` and `package-lock.json`.
2. Open the PR; CI checks the format and that the versions match.
3. When it merges into `main`, CI publishes the Docker image and creates the **`vX.Y.Z` tag** and the **GitHub Release**, if they do not exist yet. Nobody has to remember.

The version tag points to the first image of that version and is never moved.

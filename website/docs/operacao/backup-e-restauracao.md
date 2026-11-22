---
id: backup-e-restauracao
title: Backup e restauração
sidebar_position: 2
---

# Backup e restauração

O banco é a única coisa que importa guardar: os arquivos de mídia ficam no armazenamento que você escolheu, e o código vem das imagens.

## Backup diário

`deploy/backup.sh` faz um `pg_dump` em formato custom, **confere que o arquivo pode ser lido** e só então o guarda em `/var/backups/varhub` (pasta com permissão 700, arquivos 600). Backups com mais de 30 dias são apagados. Se `MONITOR_BACKUP_URL` estiver definido, o script avisa o monitor ao terminar, ou avisa a falha.

```bash
sudo cp deploy/systemd/varhub-backup.* /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now varhub-backup.timer
```

O timer roda todos os dias às 03:15. Para fazer um backup agora: `deploy/backup.sh`. Ajuste o caminho em `varhub-backup.service` se o `deploy/` não estiver em `/opt/varhub`.

:::warning
Um backup que só existe no mesmo servidor não protege contra a perda do servidor. Copie a pasta de backups para outro lugar (outro servidor, armazenamento de objetos) com `rclone`, `rsync` ou o recurso de snapshot do seu provedor.
:::

## Restaurar

Substitui o banco **atual** pelo conteúdo do backup. A API é parada durante a restauração e iniciada de novo.

```bash
deploy/restore.sh /var/backups/varhub/varhub-20261122-031500.dump --yes
```

Sem `--yes` o script não faz nada.

## Teste automático

`deploy/test_backup.sh` prova que os backups funcionam: cria um banco descartável com dados, faz o backup com `backup.sh`, restaura em um segundo banco descartável com `restore.sh` e compara as contagens de linhas. Ele roda em todo PR no CI e não toca em mais nada.

```bash
deploy/test_backup.sh                          # usa a imagem publicada da API
deploy/test_backup.sh --server-dir ../varhub-server   # constrói a API a partir do código
```

Teste também uma restauração **real** de vez em quando, em uma máquina separada: o teste do CI prova o mecanismo, não o seu servidor.

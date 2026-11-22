---
id: backup-e-restauracao
title: Backup and restore
sidebar_position: 2
---

# Backup and restore

The database is the only thing worth backing up: media files live on the storage you chose, and the code comes from the images.

## Daily backup

`deploy/backup.sh` runs a `pg_dump` in custom format, **checks that the file can be read**, and only then keeps it in `/var/backups/varhub` (folder mode 700, files 600). Backups older than 30 days are deleted. If `MONITOR_BACKUP_URL` is set, the script pings the monitor when it finishes, or reports the failure.

```bash
sudo cp deploy/systemd/varhub-backup.* /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now varhub-backup.timer
```

The timer runs every day at 03:15. To take a backup now: `deploy/backup.sh`. Adjust the path in `varhub-backup.service` if `deploy/` is not in `/opt/varhub`.

:::warning
A backup that only exists on the same server does not protect you from losing the server. Copy the backup folder somewhere else (another server, object storage) with `rclone`, `rsync` or your provider's snapshot feature.
:::

## Restore

Replaces the **current** database with the backup's contents. The API is stopped during the restore and started again.

```bash
deploy/restore.sh /var/backups/varhub/varhub-20261122-031500.dump --yes
```

Without `--yes` the script does nothing.

## Automated test

`deploy/test_backup.sh` proves that backups work: it creates a throwaway database with data, backs it up with `backup.sh`, restores into a second throwaway database with `restore.sh` and compares row counts. It runs on every PR in CI and touches nothing else.

```bash
deploy/test_backup.sh                          # uses the published API image
deploy/test_backup.sh --server-dir ../varhub-server   # builds the API from source
```

Also test a **real** restore once in a while, on a separate machine: the CI test proves the mechanism, not your server.

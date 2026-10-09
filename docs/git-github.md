# Git y GitHub

Cómo versionar el proyecto y publicarlo en GitHub (paso previo al [despliegue en Vercel](deployment-vercel.md)).

## Qué no se sube

`.gitignore` ya excluye: `node_modules/`, `dist/`, `.env` (se permite `.env.example`), `.vercel/`, logs (`*.log`, `logs/`) y `coverage/`.
Antes del primer commit, revisa con `git status` que ninguno de ellos aparezca.

## Primera publicación

```bash
git init                                  # crea el repositorio local (solo la primera vez)
git add .                                 # prepara todos los archivos no ignorados
git commit -m "feat: initial version of Mi Ruta"
git branch -M main                        # nombra la rama principal "main"
git remote add origin https://github.com/<usuario>/<repositorio>.git
git push -u origin main                   # sube la rama y la deja vinculada
```

El repositorio en GitHub debe crearse antes (vacío, sin README ni `.gitignore`, para evitar conflictos en el primer `push`).

## Trabajo diario

```bash
git status                                # qué cambió
git add <archivos>                        # o "git add ." para todo
git commit -m "fix: describe the change"
git push                                  # Vercel despliega automáticamente cada push a main
```

## Comandos de consulta

| Comando | Para qué |
|---|---|
| `git branch` | Lista las ramas locales (la actual con `*`) |
| `git branch <nombre>` / `git switch <nombre>` | Crea una rama / cambia a ella |
| `git remote -v` | Muestra el repositorio remoto configurado |
| `git log --oneline` | Historial resumido de commits |

Si el proyecto está conectado a Vercel, cada rama distinta de `main` genera un despliegue de vista previa con su propia URL.

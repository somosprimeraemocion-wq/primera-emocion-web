# Subir el sitio a GitHub y publicarlo en Vercel

El repositorio ya está creado y con el primer commit hecho. Solo falta conectarlo a tu cuenta de GitHub.

Todos los comandos se ejecutan en **Terminal** (búscalo con Cmd+Espacio).

---

## Paso 0 — Situarte en la carpeta

Copia y pega esta línea. La necesitarás antes de cualquier otro comando:

```bash
cd "/Users/cristhianvelascolopez/Documents/primera-emocion/06-sitio-web/home"
```

Luego confirma el último cambio que quedó pendiente:

```bash
git commit -m "Ignorar mockup de referencia"
```

---

## Camino A — GitHub CLI (recomendado)

Es el más limpio: la autenticación se hace por OAuth en tu navegador, sin contraseñas ni tokens escritos en ninguna parte.

### 1. Instalar la herramienta

```bash
brew install gh
```

Si responde `command not found: brew`, instala primero Homebrew con la línea que aparece en [brew.sh](https://brew.sh), y vuelve a intentar.

### 2. Iniciar sesión

```bash
gh auth login
```

Responde en orden: **GitHub.com** → **HTTPS** → **Yes** (autenticar Git) → **Login with a web browser**. Copia el código de 8 caracteres que aparece, presiona Enter y pégalo en el navegador.

### 3. Crear el repositorio y subir todo

```bash
gh repo create primera-emocion-web --private --source=. --remote=origin --push
```

Listo. Eso crea el repositorio en tu cuenta y sube los archivos en un solo paso.

> Se crea **privado**. Si prefieres que sea público, cambia `--private` por `--public`. El repositorio puede ser privado y aun así publicarse en Vercel sin problema.

---

## Camino B — Sin Terminal (GitHub Desktop)

Si prefieres no usar comandos:

1. Descarga [GitHub Desktop](https://desktop.github.com) e inicia sesión (también es OAuth en el navegador).
2. Menú **File → Add Local Repository**.
3. Selecciona la carpeta `primera-emocion/06-sitio-web/home`.
4. Botón **Publish repository**. Deja marcado "Keep this code private" si así lo quieres.

---

## Paso final — Publicar en Vercel

1. Entra a [vercel.com](https://vercel.com) e inicia sesión **con GitHub**.
2. **Add New → Project** e importa `primera-emocion-web`.
3. Framework Preset: **Other**. No toques nada más, no hay build command.
4. **Deploy**.

En menos de un minuto tendrás una URL tipo `primera-emocion-web.vercel.app`.

Cuando compres `primeraemocion.com`, agrégalo en **Settings → Domains** del proyecto.

---

## Cómo actualizar el sitio después

Cada vez que edites `index.html`, desde la misma carpeta:

```bash
git add .
git commit -m "Describe aquí el cambio"
git push
```

Vercel detecta el push y republica automáticamente en segundos.

---

## Recordatorio importante

Antes de compartir la URL con clientes, abre `index.html` y reemplaza `WHATSAPP_NUMERO` por tu número real. Sin eso, ningún botón de WhatsApp funcionará.

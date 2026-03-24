# B&J Garage — Página Web

Sitio web para **B&J Garage** — Importación de autos a escala.

---

## 📁 Estructura de archivos

```
bj-garage/
├── index.html          ← Página principal
├── style.css           ← Estilos (tema negro/dorado)
├── main.js             ← JavaScript (carga productos, videos, animaciones)
├── netlify.toml        ← Configuración de Netlify
│
├── data/
│   ├── products.json   ← Lista de productos (editada desde el CMS)
│   └── videos.json     ← Links de videos TikTok (editados desde el CMS)
│
├── assets/
│   └── logo.png        ← ⚠️ COLOCAR EL LOGO AQUÍ (imagen .png con fondo transparente)
│
├── uploads/            ← Las fotos de productos se guardan acá automáticamente
│
└── admin/
    ├── index.html      ← Panel de administración (Decap CMS)
    └── config.yml      ← Configuración del CMS
```

---

## 🚀 Cómo subir a Netlify

### 1. Subir el proyecto a GitHub
1. Crear un repositorio en GitHub (puede ser privado)
2. Subir todos estos archivos al repositorio

### 2. Conectar con Netlify
1. Ir a [netlify.com](https://netlify.com) y crear cuenta (gratis)
2. Clic en **"Add new site" → "Import an existing project"**
3. Conectar con tu cuenta de GitHub y seleccionar el repositorio
4. Dejar la configuración de build como está (Netlify la detecta sola)
5. Clic en **"Deploy site"**

### 3. Activar Netlify Identity (para el CMS)
1. En tu panel de Netlify → **"Identity"** → **"Enable Identity"**
2. Ir a **"Settings" → "Identity" → "Services" → "Git Gateway"** → activar
3. Invitar al cliente: **"Identity" → "Invite users"** → ingresar su email

### 4. Primer acceso al CMS
1. El cliente recibirá un email de invitación
2. Entrará a `tu-sitio.netlify.app/admin`
3. Podrá agregar productos, fotos y videos desde ahí

---

## ✏️ Cómo edita el cliente

### Agregar productos:
1. Ir a `/admin` → **"🚗 Productos"**
2. Clic en **"Lista de Productos"**
3. Agregar nombre, marca, escala, precio, foto y descripción
4. Clic en **"Publish"** — el sitio se actualiza automáticamente

### Agregar videos de TikTok:
1. Ir a `/admin` → **"🎬 Videos TikTok"**
2. Copiar el link del video de TikTok (desde el botón "Compartir → Copiar link")
3. Pegarlo en el campo URL
4. Publicar

---

## 🖼️ Logo

Colocar el archivo del logo en `assets/logo.png`.
- Formato recomendado: PNG con fondo transparente
- Tamaño: mínimo 400×400 px

Si no hay logo, la página muestra "B&J" en texto automáticamente.

---

## 🧪 Probar en local

Para probar en tu computadora, necesitás un servidor local (el navegador no puede hacer `fetch` a archivos directos).

Opciones rápidas:
- **VS Code** → instalar extensión "Live Server" → clic derecho en `index.html` → "Open with Live Server"
- **Python** → en la carpeta del proyecto: `python -m http.server 8080` → abrir `http://localhost:8080`
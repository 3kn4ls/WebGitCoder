# ⚡ WebGitCoder

Cliente de programación web completo con soporte Git, desarrollado en Angular. Proporciona una experiencia similar a Visual Studio Code directamente en el navegador.

![WebGitCoder](https://img.shields.io/badge/Angular-17-red)
![Monaco Editor](https://img.shields.io/badge/Monaco-0.45-blue)
![Git Support](https://img.shields.io/badge/Git-Enabled-green)

## 🚀 Características

### Editor de Código
- **Monaco Editor**: El mismo editor de código que usa Visual Studio Code
- **Resaltado de sintaxis**: Soporte para múltiples lenguajes de programación
- **Autocompletado**: Sugerencias inteligentes de código
- **Temas**: Tema oscuro similar a VS Code
- **Múltiples archivos**: Sistema de pestañas para editar varios archivos simultáneamente
- **Indicadores visuales**: Muestra archivos modificados sin guardar

### Sistema de Archivos Virtual
- **LightningFS**: Sistema de archivos virtual en el navegador
- **Persistencia**: Los archivos se mantienen entre sesiones
- **Operaciones completas**: Crear, leer, actualizar, eliminar y renombrar archivos y carpetas
- **Explorador de archivos**: Árbol jerárquico de archivos y carpetas con iconos

### Control de Versiones Git
- **Isomorphic-git**: Implementación completa de Git en JavaScript
- **Operaciones Git**:
  - 📥 Clone: Clonar repositorios remotos
  - 💾 Commit: Crear commits con mensaje y autor
  - ⬆️ Push: Enviar cambios al repositorio remoto
  - ⬇️ Pull: Obtener cambios desde el repositorio remoto
  - 🌿 Branches: Ver rama actual y cambiar entre ramas
- **Panel de control**: Visualiza cambios, archivos modificados, agregados y eliminados
- **Historial de commits**: Ver el historial de commits con autor y fecha
- **Autenticación**: Soporte para autenticación con usuario y token/contraseña

### Interfaz Similar a VS Code
- **Diseño familiar**: Barra lateral, editor central y barra de estado
- **Sidebar redimensionable**: Ajusta el ancho de la barra lateral
- **Tabs de navegación**: Alterna entre explorador de archivos y panel Git
- **Barra de herramientas**: Acceso rápido a operaciones comunes
- **Tema oscuro**: Colores y estilos inspirados en Visual Studio Code

## 📋 Requisitos

- Node.js 18 o superior
- npm o yarn

## 🛠️ Instalación

### Desarrollo Local

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/usuario/WebGitCoder.git
   cd WebGitCoder
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo**:
   ```bash
   npm start
   ```

4. **Abrir en el navegador**:
   Navega a `http://localhost:4200`

### Despliegue en Producción (k3s Raspberry Pi 5)

Para desplegar en un clúster k3s en Raspberry Pi 5:

```bash
# Despliegue automatizado
./deploy.sh

# Ver documentación completa de despliegue
cat DEPLOY.md
```

Ver [DEPLOY.md](DEPLOY.md) para instrucciones detalladas de despliegue en k3s.

## 📖 Guía de Uso

### Clonar un Repositorio

1. Haz clic en el botón **"Clonar"** en la barra superior
2. Ingresa la URL del repositorio (ej: `https://github.com/usuario/repo.git`)
3. Si el repositorio es privado, proporciona usuario y token/contraseña
4. Haz clic en **"Clonar"**

### Crear y Editar Archivos

1. En el **Explorador de archivos** (icono 📁), haz clic en los botones de la cabecera:
   - 📄 para crear un nuevo archivo
   - 📁 para crear una nueva carpeta
2. Ingresa el nombre del archivo o carpeta
3. Haz clic en un archivo para abrirlo en el editor
4. Edita el código con resaltado de sintaxis
5. Los cambios se marcan con un punto (●) en la pestaña
6. Guarda con **Ctrl+S** o el botón **"Guardar Todo"**

### Gestionar Cambios con Git

1. Ve al panel **Control de Código Fuente** (icono 🌿)
2. Verás todos los archivos modificados, agregados o eliminados
3. Haz clic en **➕** junto a un archivo para agregarlo al stage
4. O usa el botón **➕** en la cabecera para agregar todos los cambios
5. Haz clic en **✅** para crear un commit
6. Ingresa el mensaje del commit y los datos del autor
7. Usa **Push** en la barra superior para enviar al repositorio remoto

### Sincronizar Cambios

- **Pull**: Descarga cambios desde el repositorio remoto
- **Push**: Envía tus commits al repositorio remoto
- Ambas operaciones solicitan credenciales si son necesarias

## 🎨 Estructura del Proyecto

```
WebGitCoder/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── editor/           # Componente del editor Monaco
│   │   │   ├── file-explorer/    # Explorador de archivos
│   │   │   ├── git-panel/        # Panel de control Git
│   │   │   ├── sidebar/          # Barra lateral
│   │   │   └── toolbar/          # Barra de herramientas
│   │   ├── services/
│   │   │   ├── editor.service.ts      # Gestión de archivos abiertos
│   │   │   ├── file-system.service.ts # Sistema de archivos virtual
│   │   │   └── git.service.ts         # Operaciones Git
│   │   ├── models/
│   │   │   └── file-node.model.ts     # Modelos de datos
│   │   ├── app.component.ts
│   │   ├── app.module.ts
│   │   └── ...
│   ├── assets/
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── angular.json
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Tecnologías Utilizadas

- **Angular 17**: Framework principal
- **Monaco Editor**: Editor de código (usado por VS Code)
- **ngx-monaco-editor-v2**: Integración de Monaco con Angular
- **isomorphic-git**: Implementación de Git para el navegador
- **LightningFS**: Sistema de archivos virtual IndexedDB
- **RxJS**: Programación reactiva
- **TypeScript**: Lenguaje de programación

## ⌨️ Atajos de Teclado

Los atajos de teclado de Monaco Editor están habilitados por defecto:

- **Ctrl+S**: Guardar archivo actual
- **Ctrl+F**: Buscar en el archivo
- **Ctrl+H**: Reemplazar
- **Ctrl+G**: Ir a línea
- **Ctrl+/**: Comentar/descomentar línea
- **Alt+↑/↓**: Mover línea arriba/abajo
- **Ctrl+D**: Selección múltiple
- **F2**: Renombrar símbolo

## 🌐 CORS y Repositorios Remotos

Para clonar repositorios desde GitHub u otros servicios, este proyecto usa un proxy CORS (`https://cors.isomorphic-git.org`).

Para repositorios privados, necesitarás:
- **Usuario**: Tu nombre de usuario de GitHub
- **Token**: Un Personal Access Token (no uses tu contraseña)

### Crear un Personal Access Token en GitHub:
1. Ve a Settings → Developer settings → Personal access tokens
2. Genera un nuevo token con permisos de `repo`
3. Usa ese token como contraseña al clonar

## 🚧 Limitaciones

- **Tamaño de repositorios**: Los repositorios muy grandes pueden tardar en clonar
- **Operaciones Git**: Algunas operaciones avanzadas de Git no están implementadas
- **Navegadores**: Funciona mejor en Chrome, Firefox y Edge modernos
- **Storage**: Limitado por el almacenamiento del navegador (IndexedDB)

## 📝 Futuras Mejoras

- [ ] Terminal integrado
- [ ] Búsqueda global en archivos
- [ ] Soporte para extensiones
- [ ] Themes personalizables
- [ ] Diff viewer para comparar cambios
- [ ] Merge conflict resolver
- [ ] Integración con GitHub API
- [ ] Colaboración en tiempo real

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

Desarrollado con ❤️ usando Angular y Monaco Editor.

## 🙏 Agradecimientos

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - El editor de código
- [isomorphic-git](https://isomorphic-git.org/) - Git para JavaScript
- [Visual Studio Code](https://code.visualstudio.com/) - Inspiración del diseño
- [Angular](https://angular.io/) - Framework de desarrollo

---

**WebGitCoder** - Programa desde cualquier lugar, directamente en tu navegador 🚀

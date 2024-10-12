# Script de Organización de Archivos de Fotos y Videos

Este proyecto es un script en **Node.js** que permite organizar automáticamente fotos y videos en carpetas por año y mes según la fecha de modificación del archivo. También mueve los archivos con extensiones no reconocidas a una carpeta especial y elimina carpetas vacías de forma automática.

## Características

- **Organización automática**: El script organiza fotos y videos en carpetas con estructura `Año/Mes` basándose en la fecha de modificación de los archivos.
- **Extensiones soportadas**:
  - Fotos: `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.tiff`, `.webp`, `.heic`, `.raw`, `.svg`, `.thm`
  - Videos: `.mp4`, `.mov`, `.avi`, `.mkv`, `.flv`, `.wmv`, `.mpeg`, `.mpg`, `.3gp`, `.webm`
- **Archivos no reconocidos**: Los archivos que no son ni fotos ni videos se mueven a una carpeta llamada `no_reconocidos`.
- **Limpieza de directorios**: Elimina archivos procesados y carpetas vacías dentro del directorio, excepto las carpetas `procesados` y `no_reconocidos`.

## Requisitos

- **Node.js**: Debes tener instalado Node.js para ejecutar el script.
- **Librerías utilizadas**:
  - `fs` (File System): Para manejar archivos y directorios.
  - `path`: Para manipular rutas de archivos.

## Instalación

1. Clona el repositorio a tu máquina local:

   ```bash
   git clone <URL-del-repositorio>
   ```

import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";
// Cargar las variables de entorno
dotenv.config();

const EXTENSIONES_FOTOS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".bmp",
  ".tiff",
  ".webp",
  ".heic",
  ".raw",
  ".svg",
  ".thm",
];

const EXTENSIONES_VIDEOS = [
  ".mp4",
  ".mov",
  ".avi",
  ".mkv",
  ".flv",
  ".wmv",
  ".mpeg",
  ".mpg",
  ".3gp",
  ".webm",
];

let archivosCopiados: string[] = [];
let archivosConError: string[] = [];
let totalArchivos = 0;
let extensionesNoReconocidas: string[] = [];

function contarArchivos(directorioBase: string): number {
  let contador = 0;

  const listaArchivos = fs.readdirSync(directorioBase);
  listaArchivos.forEach((nombreArchivo) => {
    const rutaArchivo = path.join(directorioBase, nombreArchivo);

    if (fs.lstatSync(rutaArchivo).isDirectory()) {
      contador += contarArchivos(rutaArchivo); // Recursión para subdirectorios
    } else {
      contador++;
    }
  });

  return contador;
}

// Función para mostrar el loading en consola
//function mostrarLoading(mensaje: string, duracion: number) {
function mostrarLoading(mensaje: string, i: number) {
  const simbolos = ["|", "/", "-", "\\"];
  //let i = 0;
  process.stdout.write(`\r${mensaje} ${simbolos[(i + 1) % simbolos.length]}`);

  /* const loadingInterval = setInterval(() => {
    process.stdout.write(`\r${mensaje} ${simbolos[i]}`);
    i = (i + 1) % simbolos.length;
  }, 200);

  setTimeout(() => {
    clearInterval(loadingInterval);
    console.log(`\r${mensaje} completado!`);
  }, duracion); */
}
function copiarArchivo(archivo: string, rutaDestino: string): boolean {
  if (!fs.existsSync(rutaDestino)) {
    fs.mkdirSync(rutaDestino, { recursive: true }); // Crear la carpeta si no existe
  }

  try {
    fs.copyFileSync(archivo, path.join(rutaDestino, path.basename(archivo))); // Copiar el archivo
    //console.log(`Copiando: ${archivo} a ${rutaDestino}`);
    archivosCopiados.push(archivo);
    totalArchivos += 1;
    return true;
  } catch (error) {
    console.error(`Error al copiar ${archivo}: ${error}`);
    archivosConError.push(archivo);
    return false;
  }
}

function organizarArchivoPorFecha(archivo: string, ruta: string): boolean {
  const stats = fs.statSync(archivo);
  const fechaModificacion = new Date(stats.mtime);
  const anio = fechaModificacion.getFullYear();
  const mes = fechaModificacion.getMonth() + 1; // Los meses empiezan en 0

  const rutaDestino = path.join(ruta, anio.toString(), mes.toString());
  return copiarArchivo(archivo, rutaDestino);
}

function obtenerExtension(archivo: string): string {
  return path.extname(archivo).toLowerCase();
}

function esFotoOVideo(archivo: string): boolean {
  const extension = obtenerExtension(archivo);
  return (
    EXTENSIONES_FOTOS.includes(extension) ||
    EXTENSIONES_VIDEOS.includes(extension)
  );
}

function moverANoReconocidos(archivo: string, rutaNoReconocidos: string) {
  if (!fs.existsSync(rutaNoReconocidos)) {
    fs.mkdirSync(rutaNoReconocidos, { recursive: true });
  }

  try {
    copiarArchivo(archivo, rutaNoReconocidos);
    //console.log(`Archivo no reconocido movido: ${archivo}`);
  } catch (error) {
    console.error(`Error al mover ${archivo} a no reconocidos: ${error}`);
  }
}

function procesarDirectorio(
  directorioBase: string,
  rutaProcesados: string,
  rutaNoReconocidos: string
) {
  const listaArchivos = fs.readdirSync(directorioBase);

  listaArchivos.forEach((nombreArchivo, index) => {
    mostrarLoading("Procesando archivos", index);
    if (nombreArchivo.startsWith(".")) return; // Ignorar archivos ocultos

    const rutaArchivo = path.join(directorioBase, nombreArchivo);

    if (fs.lstatSync(rutaArchivo).isDirectory()) {
      procesarDirectorio(rutaArchivo, rutaProcesados, rutaNoReconocidos);
    } else {
      if (esFotoOVideo(rutaArchivo)) {
        organizarArchivoPorFecha(rutaArchivo, rutaProcesados);
      } else {
        extensionesNoReconocidas.push(obtenerExtension(nombreArchivo));
        moverANoReconocidos(rutaArchivo, rutaNoReconocidos);
      }
    }
  });
  process.stdout.write("\r");
}

// Verifica si el directorio dado está vacío
function carpetaVacia(directorio: string): boolean {
  return fs.readdirSync(directorio).length === 0;
}

// Elimina la carpeta si está vacía
function eliminarCarpeta(dirPath: string): void {
  if (carpetaVacia(dirPath)) {
    try {
      fs.rmdirSync(dirPath);
      //console.log(`Carpeta eliminada: ${dirPath}`);
    } catch (error) {
      console.error(`Error eliminando la carpeta ${dirPath}: ${error}`);
    }
  }
}

// Elimina los archivos copiados
function eliminarArchivosProcesados(archivosCopiados: string[]): void {
  archivosCopiados.forEach((archivo) => {
    const rutaDirectorio = path.dirname(archivo); // Obtiene el directorio del archivo
    // Verifica si el archivo está dentro de las carpetas "procesados" o "no_reconocidos"
    if (
      !rutaDirectorio.includes("procesados") &&
      !rutaDirectorio.includes("no_reconocidos")
    ) {
      try {
        fs.unlinkSync(archivo);
        console.log(`Archivo eliminado: ${archivo}`);
      } catch (error) {
        console.error(`Error al eliminar ${archivo}: ${error}`);
      }
    } else {
      /* console.log(
        `Archivo ${archivo} no eliminado, está en una carpeta protegida.`
      ); */
    }
  });
}

// Elimina carpetas vacías dentro de un directorio, excepto las carpetas "procesados" o "no_reconocidos"
function eliminarCarpetasVacias(directorio: string): void {
  const archivos = fs.readdirSync(directorio, { withFileTypes: true });

  archivos.forEach((archivo) => {
    const rutaArchivo = path.join(directorio, archivo.name);

    if (archivo.isDirectory()) {
      eliminarCarpetasVacias(rutaArchivo); // Llamada recursiva

      if (
        archivo.name !== "procesados" &&
        archivo.name !== "no_reconocidos" &&
        carpetaVacia(rutaArchivo)
      ) {
        eliminarCarpeta(rutaArchivo);
      }
    }
  });
}
function main(directorioBase: string) {
  const directorio = directorioBase ?? process.env.DIRECTORIO_BASE;
  const rutaProcesados = path.join(directorio, "procesados");
  const rutaNoReconocidos = path.join(directorio, "no_reconocidos");

  console.log(directorio);
  try {
    if (!fs.existsSync(rutaProcesados)) {
      fs.mkdirSync(rutaProcesados);
    }

    if (!fs.existsSync(rutaNoReconocidos)) {
      fs.mkdirSync(rutaNoReconocidos);
    }
    // Contar el número de archivos antes de procesar
    const totalArchivosAProcesar = contarArchivos(directorio);
    console.log(`Total de archivos encontrados: ${totalArchivosAProcesar}`);

    // Establecer duración del loading en función del número de archivos
    const duracionPorArchivo = 10; // Duración en milisegundos por archivo (ajústalo como prefieras)
    const duracionTotal = totalArchivosAProcesar * duracionPorArchivo;

    // Mostrar loading mientras se procesan los archivos
    console.log("Iniciando el procesamiento de archivos...");

    // Llamada a la eliminación de carpetas vacías
    procesarDirectorio(directorio, rutaProcesados, rutaNoReconocidos);
    // llamada a la elimnacion de los archivos procesados
    eliminarArchivosProcesados(archivosCopiados);
    eliminarCarpetasVacias(directorio);

    console.log("\n--- Resumen del procesamiento ---");
    console.log(`Archivos copiados: ${archivosCopiados.length}`);
    console.log(`Archivos con error: ${archivosConError.length}`);
    console.log(
      `Extensiones no reconocidas: ${[
        ...new Set<string>(extensionesNoReconocidas),
      ]}`
    );
  } catch (e) {
    console.error(e);
  }
}

// Ejecutar el script
const directorioBase = process.argv[2]; // Toma la ruta del directorio como argumento
main(directorioBase);

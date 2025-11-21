<?php
/**
 * api/index.php
 * Punto de entrada principal de la aplicación.
 * 
 * @package GestorTareas
 */

require_once __DIR__ . '/../php/funciones_tareas.php';
require_once __DIR__ . '/../php/utils/response_handler.php';
require_once __DIR__ . '/../php/utils/validator.php';

// Variables para mensajes y datos
$mensaje = "";
$tarea_a_editar = null;

// --- LÓGICA DE PROCESAMIENTO DE ACCIONES (POST) ---
/**
 * Procesar las acciones de formulario enviadas mediante POST
 * Maneja la creación, actualización y eliminación de tareas
 */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Acción para agregar o actualizar una tarea
    if (isset($_POST['accion']) && ($_POST['accion'] === 'agregar' || $_POST['accion'] === 'editar')) {
        $titulo = trim($_POST['titulo']);
        $descripcion = trim($_POST['descripcion']);
        $fecha_limite = trim($_POST['fecha_limite']);

        if ($_POST['accion'] === 'agregar') {
            if (agregarTarea($titulo, $descripcion, $fecha_limite)) {
                redirectWithMessage("¡Tarea agregada exitosamente!");
            } else {
                // Verificar si el error es por título duplicado
                if (existeTituloTarea($titulo)) {
                    redirectWithMessage("Error: El título '$titulo' ya está en uso. Por favor, elige otro título.", "index.html");
                } else {
                    redirectWithMessage("Error al agregar la tarea. Por favor, inténtelo de nuevo.", "index.html");
                }
            }
        } elseif ($_POST['accion'] === 'editar') {
            // Validar que el ID sea un número entero
            $id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
            $idValidation = validateInteger($id, 'ID de tarea');
            if (!$idValidation['valid']) {
                redirectWithMessage($idValidation['message'], "index.html");
            } else {
                if (actualizarTarea($id, $titulo, $descripcion, $fecha_limite)) {
                    redirectWithMessage("¡Tarea actualizada exitosamente!");
                } else {
                    // Verificar si el error es por título duplicado
                    if (existeTituloTareaExcluyendoId($titulo, $id)) {
                        redirectWithMessage("Error: El título '$titulo' ya está en uso. Por favor, elige otro título.", "index.html");
                    } else {
                        redirectWithMessage("Error al actualizar la tarea. Por favor, inténtelo de nuevo.", "index.html");
                    }
                }
            }
        }
    }
    // Acción para eliminar una tarea
    elseif (isset($_POST['accion']) && $_POST['accion'] === 'eliminar') {
        // Validar que el ID sea un número entero
        $id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
        $idValidation = validateInteger($id, 'ID de tarea');
        if (!$idValidation['valid']) {
            redirectWithMessage($idValidation['message'], "index.html");
        } else {
            if (eliminarTarea($id)) {
                redirectWithMessage("¡Tarea eliminada exitosamente!");
            } else {
                redirectWithMessage("Error al eliminar la tarea. Por favor, inténtelo de nuevo.", "index.html");
            }
        }
    }
}

// --- LÓGICA PARA CARGAR DATOS (GET) ---
/**
 * Procesar las solicitudes GET para cargar datos
 * Maneja la edición de tareas existentes
 */
if (isset($_GET['accion']) && $_GET['accion'] === 'editar' && isset($_GET['id'])) {
    // Validar que el ID sea un número entero
    $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
    $idValidation = validateInteger($id, 'ID de tarea');
    if (!$idValidation['valid']) {
        redirectWithMessage($idValidation['message'], "index.html");
    } else {
        $tarea_a_editar = obtenerTareaPorId($id);
        if (!$tarea_a_editar) {
            redirectWithMessage("No se encontró la tarea.", "index.html");
        }
    }
}

// Obtener el mensaje de la URL si existe
if (isset($_GET['mensaje'])) {
    $mensaje = htmlspecialchars($_GET['mensaje']);
}

// Obtener todas las tareas para mostrarlas
$lista_tareas = obtenerTareas();
if ($lista_tareas === false) {
    $lista_tareas = []; // Asegurar que sea un array vacío si hay error
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestor de Tareas Web</title>
    <link rel="stylesheet" href="/css/styles.css">
    <link rel="icon" href="/assets/favicon.svg">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="contenedor-principal">
        <header>
            <div class="header-content">
                <h1>Gestor de Tareas</h1>
            </div>
        </header>
        <main>
            <section class="formulario-seccion">
                <h2><?php echo $tarea_a_editar ? 'Editar Tarea' : 'Añadir Nueva Tarea'; ?></h2>
                
                <?php if (!empty($mensaje)): ?>
                    <!-- El mensaje se muestra como un mensaje flotante mediante JavaScript -->
                <?php endif; ?>

                <form id="formulario-tareas" action="<?php echo $_SERVER['PHP_SELF']; ?>" method="POST">
                    <input type="hidden" name="accion" value="<?php echo $tarea_a_editar ? 'editar' : 'agregar'; ?>">
                    <?php if ($tarea_a_editar): ?>
                        <input type="hidden" name="id" value="<?php echo $tarea_a_editar['id']; ?>">
                    <?php endif; ?>

                    <div class="form-group">
                        <label for="titulo">Título de la Tarea*</label>
                        <input type="text" id="titulo" name="titulo" value="<?php echo $tarea_a_editar['titulo'] ?? ''; ?>" required>
                    </div>
                    <div class="form-group">
                        <label for="descripcion">Descripción</label>
                        <textarea id="descripcion" name="descripcion" rows="4"><?php echo !empty($tarea_a_editar['descripcion']) ? htmlspecialchars($tarea_a_editar['descripcion']) : ''; ?></textarea>
                    </div>
                    <div class="form-group">
                        <label for="fecha_limite">Fecha Límite*</label>
                        <input type="date" id="fecha_limite" name="fecha_limite" value="<?php echo $tarea_a_editar['fecha_limite'] ?? ''; ?>" required>
                    </div>
                    <div class="form-botones">
                        <button type="submit" class="btn btn-primary" title="<?php echo $tarea_a_editar ? 'Actualizar Tarea' : 'Guardar Tarea'; ?>">
                            <?php if ($tarea_a_editar): ?>
                                <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5L13.5 4.793 5.793 12.5H4.5v-1.293L12.207 2.5z"/>
                                </svg>
                            <?php else: ?>
                                <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                                </svg>
                            <?php endif; ?>
                            <span><?php echo $tarea_a_editar ? 'Actualizar' : 'Guardar'; ?></span>
                        </button>
                        <?php if ($tarea_a_editar): ?>
                            <a href="index.html" class="btn btn-secondary" title="Cancelar">
                                <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                </svg>
                                <span>Cancelar</span>
                            </a>
                        <?php endif; ?>
                    </div>
                </form>
            </section>

            <section class="lista-tareas-seccion">
                <h2>Lista de Tareas</h2>
                <?php if (empty($lista_tareas)): ?>
                    <p>No hay tareas registradas. ¡Añade una!</p>
                <?php else: ?>
                    <div class="tabla-contenedor">
                        <table>
                            <thead>
                                <tr>
                                    <th>Título</th>
                                    <th>Descripción</th>
                                    <th>Fecha Límite</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($lista_tareas as $tarea): ?>
                                    <tr>
                                        <td class="titulo-tarea"><?php echo htmlspecialchars($tarea['titulo']); ?></td>
                                        <td><?php echo !empty($tarea['descripcion']) ? htmlspecialchars($tarea['descripcion']) : 'sin descripcion'; ?></td>
                                        <td class="fecha-tarea"><?php echo date('d/m/Y', strtotime($tarea['fecha_limite'])); ?></td>
                                        <td class="acciones">
                                            <a href="?accion=editar&id=<?php echo $tarea['id']; ?>" class="btn-editar" title="Editar tarea">
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5L13.5 4.793 5.793 12.5H4.5v-1.293L12.207 2.5z"/>
                                                </svg>
                                            </a>
                                            <button type="button" class="btn-eliminar" onclick="mostrarModalEliminacion(<?php echo $tarea['id']; ?>)" title="Eliminar tarea">
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                                    <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                <?php endif; ?>
            </section>
        </main>
        
        <!-- Modal de confirmación de eliminación -->
        <div id="modal-eliminacion" class="modal">
            <div class="modal-contenido">
                <div class="modal-cabecera">
                    <h3>Confirmar Eliminación</h3>
                    <button type="button" class="btn-cerrar" id="cerrar-modal" title="Cerrar">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                        </svg>
                    </button>
                </div>
                <div class="modal-cuerpo">
                    <p>¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.</p>
                </div>
                <div class="modal-pie">
                    <button type="button" class="btn btn-secondary" id="cancelar-eliminacion" title="Cancelar">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                        </svg>
                    </button>
                    <button type="button" class="btn btn-eliminar" id="confirmar-eliminacion" title="Eliminar">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                            <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        
        <script type="module" src="/js/app.js"></script>
    </body>
</html>
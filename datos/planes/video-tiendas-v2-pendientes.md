# Video tiendas v2 — hallazgos y pendientes (16-nov-2026, noche)

Feedback de Elías al v1: (1) quitar «desarmadurías» (salió de `conocimiento/producto.md` línea 5 y del guion G3; no es público objetivo del video), (2) pantalla en blanco desde el seg 17 (el Mercado se desplazó a una zona sin contenido; además no se abrió la lista de resultados), (3) diapositivas de beneficios desfasadas del audio, (4) en «3 formas de cargar» el resalte no coincide con lo que dice el audio, (5) decir que se puede asociar la foto al producto antes de publicar (no hablar de «código»), (6) mostrar el paso 4 (cómo quedan los repuestos) y la asociación de fotos, (7) agregar: aceptar y avanzar una venta con la boleta, solicitud de retiro, responder preguntas y ofertar en un encargo.

## Entorno dev (cuentas en `C:/ProyectoRepuestop/repuestop/docs/pruebas/cuentas_prueba_fallas_local.md`, sección Dev)
- Panel inventario: https://dev-inventario.repuestop.cl/ (vendedor1). Login directo en la página; la sesión no se conserva con storageState: iniciar sesión en cada script.
- Mercado/panel de vendedor: https://dev-repuestop.repuestop.cl/ → «Iniciar sesión» → pestaña «Iniciar manualmente». Tras entrar aparece un aviso «Estás perdiendo clientes»: se cierra con el enlace azul «Salir» del aviso (coordenada 800,746 a 1600x900; ojo: el «Salir» de la barra superior cierra sesión).
- Secciones del vendedor (rutas): `/perfil/resumen`, `/perfil/pedidos`, `/perfil/preguntas_productos`, `/perfil/gestion_subastas` (Mis ofertas), `/perfil/retiros`, `/perfil/cotizaciones`; encargos públicos en `/subastas` («Mural público (0)»: hoy no hay encargos abiertos; hay que crear uno con la cuenta compradora).

## Flujos confirmados
- **Pedidos:** tarjeta «Pagado» + «Boleta de venta pendiente» → botón «Confirmar pedido» abre un asistente de 3 pasos: 1 Stock y entrega (casilla «Tengo el stock y puedo cumplir la entrega»), 2 Compatibilidad (casilla «Revisé que estos repuestos son compatibles»; muestra el vehículo del comprador), 3 Boleta o factura (solo acepta PDF; botón «Adjunta la boleta para confirmar»). Luego el pedido queda «En preparación · Boleta cargada» con botón «Listo para retirar»; se finaliza después con el retiro del comprador.
- **Retiro de dinero:** `/perfil/retiros` muestra «Retirar ahora $…» y por cada venta lista «Solicitar retiro»; hay «Datos bancarios». No enviar solicitudes en la grabación (parar antes de confirmar).
- **Preguntas:** `/perfil/preguntas_productos`, filtro «Pendientes», cuadro «Escribe la respuesta pública para el comprador…» y botón «Responder» (hoy hay 1 pendiente).
- **Panel inventario:** wizard Excel de 4 pasos; en el paso 3 («Completa») hay celdas amarillas y «Completar todas»; el paso 4 se abre con «Siguiente: ver cómo quedará publicado». La columna Fotos permite elegir la foto de cada repuesto. Cargar borrador: usar «Descartar todo» al final.

## Cambios que ya quedaron en dev por las pruebas
- Pedido **9881 0146 18**: confirmado con boleta demostrativa (`capturas-tmp/panel/boleta_demo.pdf`), ahora «En preparación». Para el video usar otro pedido en estado «Pagado» (ej. 2587 9683 28).

## Herramientas listas
`scripts/grabar-panel.mjs` (grabación con cursor, aro y registro de clics), `scripts/slides-video-tiendas.mjs`, `scripts/montar-video-tiendas.py` (montaje con clics sonoros). Audio v1: `capturas-tmp/video/narracion.mp3` (voz Ignacio; Fer exige plan de pago en esta cuenta). Créditos ElevenLabs al cierre: ~3.700.

## Pasos que faltan
1. Reescribir la narración (sin «desarmadurías»; fotos «asociar al producto antes de publicar»; paso 4; ventas con boleta; retiro; preguntas; encargos) y regenerar solo las secciones nuevas (cortar por silencios).
2. Crear un encargo con la cuenta compradora de dev y grabar la oferta del vendedor.
3. Regrabar con tiempos tomados del audio (resalte de las 3 formas de cargar, Mercado con lista de resultados sin zona en blanco, paso 3 con «Completar todas», paso 4 con fotos).
4. Sincronizar las diapositivas de beneficios con las frases del audio (silencios cortos).
5. Montar v2 y revisar fotograma a fotograma.

## Estado al cerrar la noche del 16 al 17-nov
Hecho: audio nuevo generado (`capturas-tmp/video/narr_A.mp3` = intro nueva 22 s; `narr_B.mp3` = pasos Excel, venta, retiro, preguntas, encargos y cierre, 145 s; para beneficios, costos, panel y 3 formas se reutiliza `narracion.mp3` v1 cortando 25,94–144,31 s). Tiempos de cada frase en este archivo más arriba y en el script `scripts/grabar-video-tiendas.mjs` (escenas con duración igual al audio). Encargo de prueba creado (+2 de repuesto) y 2 preguntas pendientes creadas con la cuenta compradora.
Falta:
1. Panel: en `scripts/grabar-video-tiendas.mjs` el paso «Garantía» (Completar todas con chip «6 meses») no queda aplicado y por eso fallan las fotos del paso 4. Ejecutar `SOLO=panel` hasta que `fallas.json` salga limpio (antes: `node` de limpieza del borrador).
2. Mercado/vendedor: ejecutar `SOLO=market` (ventas con boleta, retiro, preguntas, encargos). Consume un pedido «Pagado» y una oferta por ejecución.
3. Rehacer el montaje (`scripts/montar-video-tiendas.py`) con: audio = A + (v1 25,94–144,31 con pausas de 1,5 s) + B; diapositivas de beneficios sincronizadas (cambios en 29,96 / 38,56 / 55,26 / 63,26 / 67,96 s de la línea nueva); resalte de «3 formas» por frase; difuminar correo del panel y del encabezado del vendedor; clics con sonido; cierre.
4. Revisar fotogramas y entregar en Drive (`contenido/2026-11-16-video-tiendas/final/`).

## v4 (17-nov): voz femenina, música, clic realista y soporte — estado
Hecho: escena de soporte grabada (`SOLO` aparte: `scripts/grabar-soporte.mjs` → `capturas-tmp/panel6`); clic nuevo y música sintetizados sin descargar nada (`scripts/sintetizar-audio.py` → `capturas-tmp/video/clic2.wav`, `musica_fondo.wav`, 7 min); textos de las 2 generaciones de voz listos en `capturas-tmp/video/guion_v4.json` (campos `G1` y `G2`, con pausas `<break>`); montaje v4 listo: `scripts/montar-video-tiendas-v4.py` (mide cada grupo de la narración y estira las escenas por tramos; música con ducking).
Falta: generar con ElevenLabs (cuenta de repuestop, voz femenina en español) `narr4_G1.mp3` (campo G1) y `narr4_G2.mp3` (campo G2) y guardarlos en `capturas-tmp/video/`; luego `python -I scripts/montar-video-tiendas-v4.py`. Si el script dice «DISTINTO», ajustar los grupos detectados. Claude in Chrome estaba desconectado al cerrar.

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

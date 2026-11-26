# Anuncios en Meta — Real Repuestos y MAVE (preparado el 25-nov-2026)

Estado: **BORRADOR. Nada creado en Meta ni gastado.** Falta definir presupuesto y dar el «sí».
Aprobación de las tiendas: REAL REPUESTOS y MAVE (informada por Elías el 25-nov).
MAVE debe ver las imágenes nuevas: cambiaron los productos (radiador en vez de aceite y filtro).

Imágenes: Drive `RepuesTop Marketing/contenido/2026-11-25-anuncios-meta/` (una carpeta por anuncio).
Se rehacen con `.claude/skills/publicidad-repuestop/scripts/anuncio.py <ficha> --out <carpeta>`.

## Campaña recomendada
- Objetivo: **Tráfico** (llevar gente a la web), optimizar por «clics en el enlace».
- Presupuesto sugerido (decide el equipo): **$5.000 al día por 7 días = $35.000**. Meta puede sumar IVA.
  Conjunto Spark $2.500 y conjunto MAVE $2.500. Corsa queda de reserva (del kit quedan 3 unidades).
- Fecha: partir el **martes 1-dic**, pasado Black Friday (en esos días los anuncios suelen salir más caros).
- Ubicaciones: automáticas. Subir el 4:5 para muro y el 9:16 para historias y reels («editar por ubicación»).
- **Apagar las mejoras automáticas** de Meta (recortes, música, textos): pueden alterar precios.
- En carrusel: apagar «mostrar primero las tarjetas con mejor rendimiento» y la tarjeta final automática.
- Cada conjunto lleva 2 anuncios: imagen y carrusel.

| Conjunto | Lugar | Edad | Intereses sugeridos |
|---|---|---|---|
| Spark | Región Metropolitana | 22 a 60 | Chevrolet, mecánica automotriz |
| MAVE | Ñuble y Biobío | 22 a 65 | Peugeot, Citroën |
| Corsa (reserva) | Región Metropolitana | 25 a 65 | Chevrolet, mecánica automotriz |

## Textos
Base de enlaces: `https://repuestop.cl` + ruta + `?utm_source=meta&utm_medium=paid_social&utm_campaign=<conjunto>&utm_content=<anuncio>`

### Spark (carpeta real-spark)
- Texto: ¿Tienes un Chevrolet Spark? 🚗 Repuestos desde $19.021: amortiguadores traseros, cazoletas y empaquetaduras de motor. Vende REAL REPUESTOS. Revisa que le sirvan a tu auto y paga seguro con Flow.
- Título: Repuestos para tu Spark
- Descripción: Precios publicados
- Botón: Comprar
- Enlace de la imagen: `/tiendas/3-real-repuestos`

| Tarjeta | Título | Enlace |
|---|---|---|
| 1 | Amortiguadores traseros $19.021 | /repuestos/88 |
| 2 | Cazoletas delanteras $19.990 | /repuestos/87 |
| 3 | Empaquetaduras de motor $19.604 | /repuestos/90 |
| 4 | Mira la tienda en RepuesTop | /tiendas/3-real-repuestos |

### Peugeot y Citroën (carpeta mave-cotiza)
- Texto: ¿Manejas un Peugeot o un Citroën? 🔧 Radiador para Peugeot 206 y amortiguadores delanteros para C-Elysée y 301. Cotiza directo con MAVE REPUESTOS Y ACC en RepuesTop.
- Título: Cotiza tu repuesto en línea
- Descripción: Pago seguro con Flow
- Botón: Obtener cotización (o «Más información» si no aparece)
- Enlace de la imagen: `/tiendas/6-mave-repuestos-y-acc`

| Tarjeta | Título | Enlace |
|---|---|---|
| 1 | Radiador Peugeot 206 | /repuestos/49 |
| 2 | Amortiguadores delanteros | /repuestos/50 |
| 3 | Cotiza con la tienda | /tiendas/6-mave-repuestos-y-acc |

### Corsa (carpeta real-corsa, reserva)
- Texto: ¿Tienes un Chevrolet Corsa? 🚗 Kit de distribución con bomba de agua a $32.000 y empaquetaduras con retenes a $19.733. Vende REAL REPUESTOS. Revisa la compatibilidad y paga seguro con Flow.
- Título: Repuestos para tu Corsa
- Descripción: Precios publicados
- Botón: Comprar
- Enlace de la imagen: `/tiendas/3-real-repuestos`

| Tarjeta | Título | Enlace |
|---|---|---|
| 1 | Kit de distribución $32.000 | /repuestos/89 |
| 2 | Empaquetaduras de motor $19.733 | /repuestos/86 |
| 3 | Mira la tienda en RepuesTop | /tiendas/3-real-repuestos |

## El día del lanzamiento
1. Revisar precio y stock, y cambiar la fecha «Precios al 25-nov» en las imágenes.
2. Poner un medio de pago en Meta (lo hace el equipo; el agente no escribe datos de pago).
3. Pausar el anuncio si un producto se agota o cambia de precio.

## Cómo medir
- La web dice que no usa rastreadores de publicidad, así que **Meta mostrará clics, no ventas**.
- A los 7 días: clics, costo por clic y preguntar a cada tienda cuántas cotizaciones o ventas recibió.
- Más adelante, pedir a desarrollo medir ventas desde anuncios (implica avisar en la política de cookies).

## Para pedir a las tiendas
- MAVE: el aceite ECS (producto 53) dice 5 litros y la foto muestra 4 L; fotos más grandes de filtros y de
  ese aceite; la foto del filtro de aire (48) tiene texto encima con lo que parece un RUT; confirmar que el
  radiador (49, marca Reptech) es «Original»; el aceite RCP (54) tiene 1 unidad.
- REAL: amortiguadores (88) dicen 2004–2016 en el título y 2006–2016 en compatibilidad.

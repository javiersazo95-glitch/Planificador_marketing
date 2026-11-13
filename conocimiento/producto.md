# RepuesTop — ficha viva del producto (para marketing)
Última actualización: 2026-11-13 · fuente: lectura de los 3 repos (solo lectura)

**Qué es:** el marketplace de repuestos de auto de Chile. Junta compradores (conductores y mecánicos),
tiendas de repuestos, desarmadurías y talleres en un solo lugar. Web: repuestop.cl · App: Play Store
(`cl.repuestop.app`, versión 6 publicada el 11-nov) · Panel de tiendas: inventario.repuestop.cl.
Empresa: COREBIT SpA. Contacto: contacto@repuestop.cl.

## Lo que más se puede mostrar (de mayor a menor atractivo)
| # | Función | Frase de venta en 1 línea | Para quién |
|---|---|---|---|
| 1 | **Búsqueda por patente** | "Pon tu patente y mira solo lo que le sirve a tu auto." | Compradores |
| 2 | **Repuestín (asistente)** | "¿No encuentras tu repuesto? Pregúntale a Repuestín: te busca tiendas y avisa por ti." Entiende lo que escribes como a un vendedor; si el repuesto no existe, avisa a soporte. *Nuevo (12-nov).* | Compradores y tiendas |
| 3 | **Comparar precios** | "Todas las tiendas de Chile en un solo lugar." | Compradores |
| 4 | **Encargos** | "Publica lo que buscas y deja que las tiendas te hagan ofertas." | Compradores |
| 5 | **Cotización por chat** | "Pregunta, cotiza y paga en el mismo chat; comparte la cotización en PDF." | Ambos |
| 6 | **Compra protegida** | "Pagas seguro (Webpay/tarjetas vía Flow), retiro con PIN de 6 dígitos y mediación si algo sale mal." | Compradores |
| 7 | **Fallas y talleres** | "Cuenta qué le pasa a tu auto y los talleres te responden; agenda tu hora." | Compradores y talleres |
| 8 | **Tiendas cerca** | "Encuentra casas de repuestos cerca de ti." | Compradores |

## Para tiendas (captar vendedores)
- **Programa Fundador:** 0% de comisión de RepuesTop por tiempo limitado (solo pagan el costo de pago Flow
  2,89% + IVA), insignia "Fundador", cupo de las primeras 100 tiendas aprobadas. **Vigencia:** 2 meses para
  quien postuló hasta el 10-nov; **1 mes** para quien postula desde el 11-nov. Después: 7% + IVA por venta.
  ⚠ Verificar vigencia con el equipo antes de cada publicación.
- **Carga masiva por Excel:** sube todo tu catálogo (hasta 5.000 filas) desde tu propio Excel; el sistema
  ordena las columnas. Modo rápido solo para precios y stock.
- **Clientes llegan con patente y compatibilidad:** "te encuentran por lo que tu repuesto le sirve".
- **Asistente para tiendas:** ranking semanal, "búsquedas que perdiste", chat de disponibilidad.
- **Moneda RepuesTop y Top Ventas:** destacar productos (1 moneda = $50 CLP; las 2 primeras activaciones gratis).
- **Contrato digital, video tutorial, simulador de precio**, chat de soporte.
- Cobro estándar: 7% + IVA por venta (comprador no paga comisión).

## Lo nuevo (últimos 30 días, ya en producción)
- 12-nov: **Repuestín en web y app** + botón destacado «¿No encuentras tu repuesto?» en el catálogo.
- 11-nov: app versión 6 en Play; contador de preguntas de disponibilidad para tiendas.
- 10-nov: catálogo abierto a Google (más visitas gratis desde buscadores); Fundador pasa a 1 mes.
- 06 al 09-nov: Fallas y agenda con talleres rediseñadas (ubicación, atención a domicilio, cita en un paso).
- 06 al 08-nov: Repuestín en chats: la tienda ofrece repuestos y el comprador ve su perfil.

## Marca
Colores: azul #0056BF, marino #0A2149, celeste #38bdf8, fondo #F8FAFC. Fuentes: Outfit (títulos) y Plus
Jakarta Sans. Mascota: Repuestín. Tono: cercano, chileno, simple. Detalles en `config/marca.json`.

## Reglas al comunicar
- No publicar cantidad de tiendas ni de usuarios (el sistema dejó de mostrarla a propósito).
- No prometer despacho en X días ni descuentos que no existan.
- La marca está en trámite de registro en INAPI: usar "RepuesTop" sin ®.
- Redes oficiales: Instagram @repuestop_oficial, Facebook RepuesTop, TikTok y YouTube (handles por confirmar).

## Brechas que debe resolver el equipo de desarrollo (reportar en el panel)
1. No hay medición instalada en repuestop.cl (ni Google Analytics ni píxel de Meta/TikTok): sin esto no se
   puede saber cuánta gente llega desde cada red.
2. `founderConfig.ts` (Market) tiene Instagram mal escrito (`repuestop.cl`) y un WhatsApp de relleno.
3. TikTok y YouTube no aparecen en el pie de la web.
4. La ficha de Play Store tiene solo 2 capturas (conviene 4 o más).

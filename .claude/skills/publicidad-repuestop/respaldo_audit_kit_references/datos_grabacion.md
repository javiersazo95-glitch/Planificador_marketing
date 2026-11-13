# Datos de grabación: que todo lo que se vea en pantalla parezca real

Regla del usuario (11-nov-2026): en las grabaciones de la app **cada texto, imagen y número debe verse como el de una tienda real**. Un SKU «V2-DEMO-1», una descripción «producto de prueba» o un nombre «Repuestos Segundo» le quitan confianza al reel aunque nadie lo lea entero. Se revisa **antes de grabar**, no después.

## Checklist antes de grabar
| Elemento | Bien | Mal |
|---|---|---|
| Nombre de la tienda | Inventado pero creíble y con sentido local: «Repuestos Los Pellines» (Temuco). Buscar en la web que no exista una tienda real con ese nombre. | «Repuestos Segundo», «Tienda Demo», «Vendedor 1», nombres de tiendas reales. |
| Logo de la tienda | Logo propio simple (HTML → PNG con Chrome), subido como foto del perfil. | Iniciales por defecto («RS») o logos de marcas reales. |
| Portada | Una de las plantillas oficiales de la app que calce con el rubro (p. ej. «Mostrador técnico»). | La portada por defecto. |
| Personas | Nombre y apellido chilenos comunes: «Patricio Fuentes», «Valentina Rojas». | «Comprador 1», «Don Vendedor Dos», «Tomás Prueba Taller». |
| Nombre del producto | Pieza + marca y modelo del vehículo + años: «Pastillas de freno delanteras Toyota Yaris 2014-2019». | «Pastillas Yaris», nombres en mayúsculas o con códigos. |
| SKU de la tienda | Formato corto de tienda real: familia + número (`FRE-0412`, `FIL-0127`). | `V2-DEMO-1`, `TEST-001`, `PROV-2-…`, `xxx`. |
| Código OEM | Solo si se verificó en un catálogo (Toyota 17801-0T030). Si no se pudo confirmar, **vacío**. | Inventado o de otra generación del auto. |
| Precio y stock | Precios del mercado chileno y stock razonable (1–40). | 1, 99999 o precios redondos raros. |
| Descripción | Lo que diría la tienda: material, qué incluye, cuándo cambiarlo. | «Producto de prueba local», «carga masiva 2», lorem ipsum. |
| Fotos de producto | Foto de vitrina: pieza **nueva**, fondo blanco, luz de estudio, sin marcas ni texto. Decisión del usuario (11-nov): se pueden generar con Gemini desde Brave (prompt en `repuestop/docs/publicidad/redes/datos_prueba/README.md`), revisando los detalles técnicos (p. ej. el disco del Corolla lleva 5 pernos: si la IA no acierta, usar un ángulo que no los muestre). Bajar con la pestaña de la imagen + captura ampliada (el botón de descarga de Gemini no funciona desde Brave). | Imágenes rotas, de otra pieza (filtro de aceite por filtro de aire), piezas usadas u oxidadas, marcas de agua, fotos de Google retocadas (tienen dueño). |
| Preguntas, chats y cotizaciones | Como las escribe un cliente real («¿El precio es por un disco o por el par?»). | «prueba», «asdf», «hola test». |

## Cómo revisarlo
1. Recorrer en la app local cada pantalla que saldrá en el guion y leer **todo** el texto visible (incluido lo chico: SKU, códigos, subtítulos de tarjetas, nombres en chats).
2. Buscar en la BD local los textos delatores: `~* 'prueba|demo|test|v2-|lorem|xxx'` en nombres de usuario, tiendas, productos y descripciones.
3. Corregir en la BD **local** (nunca dev ni prod) o por la API local, y anotar los cambios en `repuestop/docs/publicidad/redes/datos_prueba/README.md`.
4. Después de grabar, revisar la hoja de contacto buscando cualquier texto que se haya escapado.

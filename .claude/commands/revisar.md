---
description: Revisa si este computador está listo para trabajar con el agente de marketing y guía para instalar o configurar lo que falte
---

1. Ejecuta `node scripts/revisar-equipo.mjs` (revisión completa).
2. Revisa también si el conector **Metricool** está disponible en esta sesión (búscalo con ToolSearch: "metricool"). Si no está, explica que sin él el agente prepara las publicaciones pero no puede programarlas ni leer los números, y cómo conectarlo (claude.ai → Conectores → Metricool; el inicio de sesión lo hace el usuario).
3. Explícale al usuario, en lenguaje simple y en orden de importancia:
   - qué está listo (en una línea),
   - qué falta, para qué sirve cada cosa y cómo arreglarla paso a paso.
4. Ofrece hacer tú lo que se puede hacer desde aquí, siempre con su permiso: `npm install`, `npm --prefix estudio install`, configurar su nombre en git (con los datos que te dé), `node scripts/configurar-drive.mjs` («configura Drive»).
5. Lo que solo puede hacer la persona (instalar programas, iniciar sesión en GitHub o Google, pedir acceso a carpetas o repos): explícalo con pasos cortos y quién se lo puede dar.
6. Al terminar, vuelve a ejecutar la revisión y confirma qué quedó listo.

Pedido adicional: $ARGUMENTS

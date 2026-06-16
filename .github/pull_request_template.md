## Descripción

Proporciona una descripción clara y concisa de los cambios que realiza este PR.

Cierra #(número de issue si aplica)

---

## Tipo de Cambio

Marca el tipo de cambio relevante:

- [ ] Nueva funcionalidad (feat)
- [ ] Corrección de bug (fix)
- [ ] Cambio que rompe compatibilidad (BREAKING CHANGE)
- [ ] Cambios de documentación (docs)
- [ ] Refactorización (refactor)
- [ ] Mejora de rendimiento (perf)

---

## Cómo fue testeado

Describe las pruebas que realizaste para verificar los cambios:

- [ ] Tests unitarios agregados
- [ ] Tests de integración ejecutados
- [ ] Testeo manual en ambiente local

**Detalles:**

```bash
# Ejemplo
dotnet test
dotnet test tests/Gamification.Domain.Tests
```

---

## Checklist

Asegúrate de que hayas completado los siguientes items:

- [ ] Mi código sigue los estándares de codificación del proyecto
- [ ] He realizado una autoevaluación de mi propio código
- [ ] He actualizado la documentación relevante (README, docs/)
- [ ] Mis cambios no generan nuevas advertencias (warnings)
- [ ] He agregado tests unitarios para nueva funcionalidad
- [ ] Los tests existentes siguen pasando
- [ ] Mis commits siguen las convenciones de [Conventional Commits](../CONTRIBUTING.md#convenciones-de-commits)
- [ ] He incluido mensajes de commit claros y descriptivos
- [ ] He revisado que no commiteo secretos (.env, API keys, etc.)

---

## Capturas de Pantalla (si aplica)

Agrega capturas de pantalla o GIFs si los cambios incluyen cambios visuales:

<!-- Insertar imágenes aquí -->

---

## Notas Adicionales

Agrega cualquier información adicional que sea relevante:

- Dependencias nuevas agregadas
- Cambios en comportamiento existente
- Migraciones de base de datos
- Configuración adicional requerida

---

## Cambios de Breaking

Si este PR incluye cambios que rompen compatibilidad, describe:

- Qué cambió
- Por qué era necesario
- Cómo migrar (si aplica)

---

📖 Ver [CONTRIBUTING.md](../CONTRIBUTING.md) para más detalles sobre el proceso de contribución.

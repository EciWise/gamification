const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType,
        HeadingLevel, WidthType, BorderStyle, ShadingType, PageBreak } = require('docx');
const fs = require('fs');

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Arial", size: 22 }
      }
    },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: "1F4E78" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 }
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: "2E75B6" },
        paragraph: { spacing: { before: 180, after: 100 }, outlineLevel: 1 }
      }
    ]
  },
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          {
            level: 0,
            format: "bullet",
            text: "•",
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: {
                indent: { left: 720, hanging: 360 }
              }
            }
          }
        ]
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    children: [
      // Portada
      new Paragraph({
        spacing: { before: 1000, after: 400 },
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "REPORTE DE DESARROLLO", size: 48, bold: true, color: "1F4E78" })]
      }),
      new Paragraph({
        spacing: { after: 200 },
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Gamification Microservice", size: 36, color: "2E75B6" })]
      }),
      new Paragraph({
        spacing: { after: 800 },
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "EciWise Platform", size: 24, italic: true })]
      }),
      new Paragraph({ text: "" }),
      new Paragraph({
        spacing: { before: 400, after: 100 },
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Período: 9 de Junio - 16 de Junio de 2026", size: 22 })]
      }),
      new Paragraph({
        spacing: { after: 400 },
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Desarrollado por: Anderson Fabian Garcia Nieto", size: 22 })]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // Resumen Ejecutivo
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("RESUMEN EJECUTIVO")]
      }),
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun("Se completó la implementación del Microservicio de Gamificación para la plataforma EciWise con arquitectura hexagonal (Ports & Adapters) siguiendo principios de Domain-Driven Design (DDD) y CQRS.")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Logros Principales")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Implementación completa de microservicio con arquitectura limpia y escalable")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Validación de seguridad mediante JWT (HMAC-SHA256) en RabbitMQ")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Integración de 5 tipos de eventos de múltiples servicios")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Documentación profesional y políticas de proyecto")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 200 },
        children: [new TextRun("Configuración de CI/CD con GitHub Actions")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Estadísticas")]
      }),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [4680, 4680],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 4680, type: WidthType.DXA },
                shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Métrica", bold: true })] })]
              }),
              new TableCell({
                borders,
                width: { size: 4680, type: WidthType.DXA },
                shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Valor", bold: true })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph("Total de Commits")] }),
              new TableCell({ borders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph("10")] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph("Ramas Activas")] }),
              new TableCell({ borders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph("2 (scaffolding, develop)")] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph("Eventos Procesados")] }),
              new TableCell({ borders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph("5 tipos")] })
            ]
          })
        ]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // Historial de Commits
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("HISTORIAL DE COMMITS (10 total)")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Commit 1: Refactor (2144623) - 2026-06-16")]
      }),
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun("Extracción de campos específicos de eventos RabbitMQ. Cada tipo de evento ahora procesa su payload específico manteniendo envelope común.")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Commit 2: Feature (831908c) - 2026-06-16")]
      }),
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun("Expansión de RabbitMQ para soportar 5 tipos de eventos con asignación de puntos (5-25 puntos).")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Commit 3: Documentation (3ae094a) - 2026-06-16")]
      }),
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun("Documentación profesional: README, Code of Conduct, Contributing, Security, License, GitHub templates.")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Commit 4: Security (28f04c8) - 2026-06-16")]
      }),
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun("Validación JWT HMAC-SHA256 para autenticación de mensajes RabbitMQ.")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Commit 5: Fix (d0574b0) - 2026-06-12")]
      }),
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun("Resolución de conflictos de versiones y configuración de docker-compose.")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Commit 6-10: Implementación Inicial")]
      }),
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun("Commits 6-10 (fechas 2026-06-09 a 2026-06-12): Inicialización de arquitectura hexagonal, DDD, CQRS, Entity Framework, RabbitMQ, Redis, y CI/CD.")]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("CARACTERÍSTICAS IMPLEMENTADAS")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("1. Gestión de Puntos")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Asignación automática basada en acciones de usuarios")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 200 },
        children: [new TextRun("Auditoría completa de transacciones")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("2. Sistema de Logros")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Desbloqueo de insignias basado en hitos")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 200 },
        children: [new TextRun("Estrategias plugeables (Strategy Pattern)")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("3. Rankings Dinámicos")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Cálculo y caché con Redis")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 200 },
        children: [new TextRun("Rankings globales, por materia y mensuales")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("4. Seguridad")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("JWT HMAC-SHA256 para cada mensaje")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 200 },
        children: [new TextRun("Validación de issuer y audience")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("5. Integración de Eventos")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("5 tipos de eventos soportados")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Idempotencia mediante processed_events")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 200 },
        children: [new TextRun("Outbox Pattern para entrega garantizada")]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("TECNOLOGÍAS UTILIZADAS")]
      }),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [4680, 4680],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 4680, type: WidthType.DXA },
                shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Categoría", bold: true })] })]
              }),
              new TableCell({
                borders,
                width: { size: 4680, type: WidthType.DXA },
                shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Tecnología", bold: true })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph("Lenguaje")] }),
              new TableCell({ borders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph(".NET 10 / C#")] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph("Base de Datos")] }),
              new TableCell({ borders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph("PostgreSQL 16")] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph("Message Broker")] }),
              new TableCell({ borders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph("RabbitMQ 3.12")] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph("Caché")] }),
              new TableCell({ borders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph("Redis 7")] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph("ORM")] }),
              new TableCell({ borders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph("Entity Framework Core 10")] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph("Patrón CQRS")] }),
              new TableCell({ borders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph("MediatR 12")] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph("Autenticación")] }),
              new TableCell({ borders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph("JWT (HMAC-SHA256)")] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph("CI/CD")] }),
              new TableCell({ borders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph("GitHub Actions")] })
            ]
          })
        ]
      }),

      new Paragraph({
        spacing: { before: 400 },
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("EVENTOS PROCESADOS")]
      }),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1872, 1872, 1872, 1872, 1872],
        rows: [
          new TableRow({
            children: [
              new TableCell({ borders, width: { size: 1872, type: WidthType.DXA }, shading: { fill: "D5E8F0", type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Evento", bold: true, size: 18 })] })] }),
              new TableCell({ borders, width: { size: 1872, type: WidthType.DXA }, shading: { fill: "D5E8F0", type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Puntos", bold: true, size: 18 })] })] }),
              new TableCell({ borders, width: { size: 1872, type: WidthType.DXA }, shading: { fill: "D5E8F0", type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Tipo", bold: true, size: 18 })] })] }),
              new TableCell({ borders, width: { size: 1872, type: WidthType.DXA }, shading: { fill: "D5E8F0", type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Servicio", bold: true, size: 18 })] })] }),
              new TableCell({ borders, width: { size: 1872, type: WidthType.DXA }, shading: { fill: "D5E8F0", type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Descripción", bold: true, size: 18 })] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders, width: { size: 1872, type: WidthType.DXA }, children: [new Paragraph("LessonCompleted", { size: 18 })] }),
              new TableCell({ borders, width: { size: 1872, type: WidthType.DXA }, children: [new Paragraph("10")] }),
              new TableCell({ borders, width: { size: 1872, type: WidthType.DXA }, children: [new Paragraph("Completada")] }),
              new TableCell({ borders, width: { size: 1872, type: WidthType.DXA }, children: [new Paragraph("Study")] }),
              new TableCell({ borders, width: { size: 1872, type: WidthType.DXA }, children: [new Paragraph("Lección")] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders, width: { size: 1872, type: WidthType.DXA }, children: [new Paragraph("TutorshipDictated")] }),
              new TableCell({ borders, width: { size: 1872, type: WidthType.DXA }, children: [new Paragraph("15")] }),
              new TableCell({ borders, width: { size: 1872, type: WidthType.DXA }, children: [new Paragraph("Dictada")] }),
              new TableCell({ borders, width: { size: 1872, type: WidthType.DXA }, children: [new Paragraph("Tutoring")] }),
              new TableCell({ borders, width: { size: 1872, type: WidthType.DXA }, children: [new Paragraph("Tutoría")] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders, width: { size: 1872, type: WidthType.DXA }, children: [new Paragraph("QuizPassed")] }),
              new TableCell({ borders, width: { size: 1872, type: WidthType.DXA }, children: [new Paragraph("20")] }),
              new TableCell({ borders, width: { size: 1872, type: WidthType.DXA }, children: [new Paragraph("Aprobado")] }),
              new TableCell({ borders, width: { size: 1872, type: WidthType.DXA }, children: [new Paragraph("Assessment")] }),
              new TableCell({ borders, width: { size: 1872, type: WidthType.DXA }, children: [new Paragraph("Quiz")] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders, width: { size: 1872, type: WidthType.DXA }, children: [new Paragraph("TutorshipRated")] }),
              new TableCell({ borders, width: { size: 1872, type: WidthType.DXA }, children: [new Paragraph("10-25")] }),
              new TableCell({ borders, width: { size: 1872, type: WidthType.DXA }, children: [new Paragraph("Calificada")] }),
              new TableCell({ borders, width: { size: 1872, type: WidthType.DXA }, children: [new Paragraph("Tutoring")] }),
              new TableCell({ borders, width: { size: 1872, type: WidthType.DXA }, children: [new Paragraph("Rating")] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders, width: { size: 1872, type: WidthType.DXA }, children: [new Paragraph("ForumPostCreated")] }),
              new TableCell({ borders, width: { size: 1872, type: WidthType.DXA }, children: [new Paragraph("5")] }),
              new TableCell({ borders, width: { size: 1872, type: WidthType.DXA }, children: [new Paragraph("Publicado")] }),
              new TableCell({ borders, width: { size: 1872, type: WidthType.DXA }, children: [new Paragraph("Forum")] }),
              new TableCell({ borders, width: { size: 1872, type: WidthType.DXA }, children: [new Paragraph("Post")] })
            ]
          })
        ]
      }),

      new Paragraph({
        spacing: { before: 400 },
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("CONCLUSIONES")]
      }),

      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun("Implementación completa y exitosa del Microservicio de Gamificación con arquitectura robusta, segura y escalable. El servicio está listo para integración y puede procesar múltiples tipos de eventos manteniendo idempotencia y seguridad.")]
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("Reporte_Gamification_Service.docx", buffer);
  console.log("Documento creado: Reporte_Gamification_Service.docx");
});

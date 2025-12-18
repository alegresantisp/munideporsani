## Reglas de seguridad Firestore · Secretaría de Deportes San Isidro

Este documento define un conjunto de reglas de seguridad para Firestore alineadas con la arquitectura del CMS de la Secretaría de Deportes (Noticias, Actividades, Torneos) usando Firebase Auth con custom claims (`admin_deportes`).

> **Importante**:  
> - Todas las escrituras de contenido deberían realizarse **desde el backend** (Next.js con Admin SDK).  
> - El cliente solo debería usar el SDK de Firestore para **lecturas públicas** (cuando sea necesario).  
> - Las reglas asumen que los usuarios del staff tienen el claim `admin_deportes: true` en su `IdToken`.

### Principios generales

- **Lectura pública controlada**:  
  - Noticias: solo noticias publicadas.  
  - Actividades: solo actividades activas.  
  - Torneos: solo torneos visibles (opcionalmente filtrados por estado).
- **Escrituras restringidas**:
  - Solo usuarios autenticados con `request.auth.token.admin_deportes == true`.
  - Validación estricta de campos (tipos, longitudes, flags).
- **Integridad temporal**:
  - `createdAt` solo puede setearse en creación.  
  - `updatedAt` se actualiza en cada modificación.

---

## Reglas de ejemplo para `firestore.rules`

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    function isAdminDeportes() {
      return isSignedIn() &&
        (request.auth.token.admin_deportes == true ||
         request.auth.token.role == "admin_deportes");
    }

    ///
    ///  Colección: noticias
    ///  Modelo: ver services/noticias/noticias.types.ts
    ///
    match /noticias/{id} {

      // Lectura pública solo de noticias ya publicadas.
      allow get, list: if resource.data != null
        && resource.data.fechaPublicacion is string;

      // Escritura solo para admin_deportes con validaciones fuertes.
      allow create: if isAdminDeportes() && isValidNoticiaCreate();
      allow update: if isAdminDeportes() && isValidNoticiaUpdate();
      allow delete: if isAdminDeportes();
    }

    ///
    ///  Colección: actividades
    ///  Modelo: ver services/actividades/actividades.types.ts
    ///
    match /actividades/{id} {
      // Lectura pública solo de actividades activas.
      allow get, list: if resource.data.activa == true;

      allow create: if isAdminDeportes() && isValidActividadCreate();
      allow update: if isAdminDeportes() && isValidActividadUpdate();
      allow delete: if isAdminDeportes();
    }

    ///
    ///  Colección: torneos
    ///  Modelo: ver services/torneos/torneos.types.ts
    ///
    match /torneos/{id} {
      // Lectura pública de todos los torneos; se puede acotar por estado si se desea.
      allow get, list: if true;

      allow create: if isAdminDeportes() && isValidTorneoCreate();
      allow update: if isAdminDeportes() && isValidTorneoUpdate();
      allow delete: if isAdminDeportes();
    }

    // ============================
    // Validaciones de documentos
    // ============================

    function isValidTimestampFields(isCreate) {
      // createdAt/updatedAt deben ser strings ISO, controlados por backend.
      return (request.resource.data.createdAt is string) &&
             (request.resource.data.updatedAt is string) &&
             (!isCreate => request.resource.data.createdAt == resource.data.createdAt);
    }

    // --------- Noticias ----------
    function isValidNoticiaBaseFields() {
      return request.resource.data.titulo is string &&
             request.resource.data.slug is string &&
             request.resource.data.cuerpo is string &&
             request.resource.data.resumen is string &&
             request.resource.data.categoria is string &&
             request.resource.data.fechaPublicacion is string &&
             request.resource.data.destacado is bool &&
             request.resource.data.titulo.size() > 0 &&
             request.resource.data.titulo.size() <= 200 &&
             request.resource.data.resumen.size() <= 500;
    }

    function isValidNoticiaCreate() {
      return isValidNoticiaBaseFields() &&
             isValidTimestampFields(true);
    }

    function isValidNoticiaUpdate() {
      return isValidNoticiaBaseFields() &&
             isValidTimestampFields(false);
    }

    // --------- Actividades ----------
    function isValidActividadBaseFields() {
      return request.resource.data.titulo is string &&
             request.resource.data.descripcionCorta is string &&
             request.resource.data.disciplina is string &&
             request.resource.data.tipo is string &&
             request.resource.data.nivel is string &&
             request.resource.data.sedeNombre is string &&
             request.resource.data.activa is bool &&
             request.resource.data.horarios is list &&
             request.resource.data.titulo.size() > 0 &&
             request.resource.data.descripcionCorta.size() <= 500 &&
             request.resource.data.horarios.size() > 0;
    }

    function isValidActividadCreate() {
      return isValidActividadBaseFields() &&
             isValidTimestampFields(true);
    }

    function isValidActividadUpdate() {
      return isValidActividadBaseFields() &&
             isValidTimestampFields(false);
    }

    // --------- Torneos ----------
    function isValidTorneoBaseFields() {
      return request.resource.data.titulo is string &&
             request.resource.data.slug is string &&
             request.resource.data.descripcionCorta is string &&
             request.resource.data.disciplina is string &&
             request.resource.data.sedeNombre is string &&
             request.resource.data.fechaInicio is string &&
             request.resource.data.estado is string &&
             request.resource.data.categorias is list &&
             request.resource.data.destacado is bool &&
             request.resource.data.titulo.size() > 0 &&
             request.resource.data.descripcionCorta.size() <= 500;
    }

    function isValidTorneoCreate() {
      return isValidTorneoBaseFields() &&
             isValidTimestampFields(true);
    }

    function isValidTorneoUpdate() {
      return isValidTorneoBaseFields() &&
             isValidTimestampFields(false);
    }
  }
}
```

### Cómo usar estas reglas

1. Abrí la consola de Firebase → **Firestore Database → Rules**.  
2. Reemplazá el contenido por las reglas anteriores (ajustando lo que necesites).  
3. Deploy de reglas y probá:
   - Lectura pública de noticias/actividades/torneos desde la web.  
   - Escrituras solo desde un usuario con claim `admin_deportes`.

Estas reglas están pensadas para acompañar la lógica actual del proyecto (Admin SDK desde el backend y claims de rol en Firebase Auth) y minimizar superficie de ataque desde el cliente.+



## Cambios realizados con CURSOR ##

### 1. Colores de prioridad unificados ###

- **Objetivo**: Hacer que los colores visuales coincidan con la configuración personalizada de Tailwind.
- **Qué se hizo**:  
  Ahora el objeto `badgeColors` usa las clases:
  - `bg-high`  
  - `bg-medium`  
  - `bg-low`  
  Estas clases coinciden con los colores personalizados que definiste en la configuración de Tailwind.

### 2. Modo oscuro persistente ###

- **Objetivo**: Mantener el modo (claro/oscuro) al recargar la página.
- **Qué se hizo**:
  - Al cargar la página, se lee `localStorage.getItem("theme")`.  
  - Si el valor es `"dark"`, se aplica la clase `dark` al `document.documentElement`.  
  - Al pulsar el botón de modo oscuro, se alterna la clase `dark` y se guarda `"dark"` o `"light"` en `localStorage`, de modo que la preferencia se mantiene al recargar.


## Atajos de teclado que mas he usado ##

    - Ctrl + Z / Ctrl + Y: Deshacer / rehacer.
    - Ctrl + Shift + P: Paleta de comandos (todas las acciones).
    - Ctrl + F: Buscar en el archivo actual.
    - Ctrl + Shift + F: Buscar en todo el proyecto. 

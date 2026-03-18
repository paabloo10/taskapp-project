## Comparación de respuestas de IA ##

---ChatGPT---

#### PowerShell ####

PowerShell es una **herramienta de línea de comandos** y **lenguaje de automatización** creada por Microsoft.

Sirve para **administrar sistemas** y **automatizar tareas** en computadoras, especialmente en sistemas como **Windows**.

**¿Qué puedes hacer con PowerShell?**

1. Administrar usuarios y permisos 👤  
2. Gestionar archivos y carpetas 📁  
3. Configurar redes 🌐  
4. Automatizar tareas con scripts  
5. Administrar servidores

**💡 En resumen**  
➡️ PowerShell es una **consola avanzada** para administrar sistemas con **comandos y scripts**.

#### Dynamic Host Configuration Protocol (DHCP) ####

DHCP es un **protocolo de red** que asigna automáticamente **direcciones IP** a los dispositivos cuando se conectan a una red.

**Cómo funciona**

Cuando conectas un dispositivo a una red:

1. El dispositivo pide una dirección IP.  
2. El servidor DHCP le asigna:
   - una IP  
   - la máscara de red  
   - la puerta de enlace  
   - los servidores DNS  

**Ejemplo práctico**

Cuando conectas tu móvil al WiFi de casa, el router actúa como **servidor DHCP** y te da una IP como:

`192.168.1.25`

**💡 En resumen**  
➡️ DHCP asigna automáticamente **direcciones IP** y otros datos de red a los dispositivos.

#### 🌍 Domain Name System (DNS) ####

DNS es el sistema que **traduce nombres de dominio en direcciones IP**.

Los humanos recordamos nombres como:

- `google.com`

Pero los computadores trabajan con direcciones IP como:

- `142.250.184.206`

El DNS hace la **traducción entre ambos**.

**Ejemplo de funcionamiento**

1. Escribes `google.com` en el navegador.  
2. El DNS busca la IP de ese dominio.  
3. Devuelve la IP al navegador.  
4. El navegador se conecta al servidor correspondiente.  

**💡 En resumen**  
➡️ DNS traduce **nombres de páginas web** a **direcciones IP**.

---

--- Claude ---

#### PowerShell ####

PowerShell es una **herramienta de línea de comandos** creada por Microsoft.  
Sirve para **administrar** y **automatizar tareas** en Windows (y también en otros sistemas hoy en día).

Permite ejecutar **comandos (cmdlets)** para controlar:

- el sistema operativo  
- servicios  
- usuarios  
- redes  
- archivos  

También se pueden programar **scripts (`.ps1`)** para realizar tareas repetitivas automáticamente.

**Ejemplo**: crear varios usuarios de forma automática en un dominio o reiniciar servicios en varios servidores.

#### DHCP (Dynamic Host Configuration Protocol) ####

Es un **protocolo de red** que se encarga de asignar **direcciones IP automáticamente** a los dispositivos cuando se conectan a una red.

Sin DHCP, tendrías que asignar las IP **manualmente** a cada computadora.  
Con DHCP, el servidor da una IP “prestada” a cada dispositivo por un tiempo (llamado **lease** o **concesión**).  
También puede configurar la **puerta de enlace** y el **DNS** automáticamente.

**Ejemplo**: cuando conectas tu laptop al Wi-Fi, no tienes que configurar nada; el router (que actúa como servidor DHCP) te da una IP.

#### DNS (Domain Name System) ####

Es un sistema que **traduce nombres de dominio en direcciones IP**.

Los humanos recuerdan nombres como `www.google.com`, pero las computadoras usan direcciones IP como `142.250.190.78`.  
El DNS hace esa **conversión de forma automática**.

También puede funcionar dentro de una **red local** (por ejemplo, para resolver el nombre de un servidor interno).

---

### Resumen comparativo

**ChatGPT** lo ha explicado de una forma **más clara y llamativa** para captar la atención y adaptarse a gente que **no es profesional**, usando ejemplos cotidianos y lenguaje sencillo.  
**Claude** ha profundizado más, ha dado **más datos técnicos** y se enfoca más en lo **profesional**, con un estilo algo más formal.

Los ejemplos de ChatGPT resultan más intuitivos y fáciles de entender, mientras que los de Claude aportan más detalle técnico.

---

### Errores detectados en ChatGPT ###

1. ```javascript
   function sumar(a, b) {
       return a - b;
   }
   ```
   - La función usa el operador **resta (`-`)** en lugar del operador **suma (`+`)**.  
   - La función se llama `sumar`, pero realmente **resta** los valores.  
   - Es un **error lógico**: el programa “funciona”, pero el resultado es incorrecto.

2. ```javascript
   function esPar(numero) {
       if (numero % 2 = 0) {
           return true;
       } else {
           return false;
       }
   }
   ```
   - Se usa `=` (asignación) en lugar de `===` o `==` (comparación).  
   - `=` asigna un valor.  
   - `==` o `===` comparan valores.  
   - Aquí queremos **comparar** si el resto es `0`, no asignarlo.

3. ```javascript
   function saludar(nombre) {
       console.log("Hola " + Name);
   }
   ```
   - La variable `Name` no existe.  
   - El parámetro de la función se llama `nombre`.  
   - JavaScript distingue entre variables definidas y no definidas.  
   - `Name` no está declarada, lo que provocará un **ReferenceError**.

---

### Errores detectados en Claude ###

## 1. Error logico (sumar(a, b)) ##
ERROR LÓGICO — el código ejecuta, pero hace lo contrario
El operador - resta en lugar de sumar. El programa no lanza ningún error ni aviso: arranca sin problemas, produce un número y lo devuelve. Por eso este tipo de bug es especialmente peligroso — el motor de JavaScript no puede saber que la intención era otra.

Se llama error lógico porque el fallo está en el razonamiento del programador, no en la sintaxis ni en los tipos. Solo se detecta comparando el resultado con el esperado.

// ✅ return a + b;

## 2. Error sintaxis esPar(numero) ##
CONFUSIÓN = vs === — uno de los errores más frecuentes en JS
En JavaScript hay tres operadores que parecen parecidos pero hacen cosas muy distintas:

=  → asignación: guarda un valor en una variable.
== → comparación laxa: compara con conversión de tipos.
=== → comparación estricta: compara valor y tipo, sin convertir.

Usar = dentro de un if intenta asignar, lo cual es inválido aquí y lanza un SyntaxError antes de que el programa llegue a ejecutarse.

// ✅ if (numero % 2 === 0)

## 3. ReferenceError saludar(nombre) ##
JavaScript es case-sensitive: nombre y Name son dos identificadores completamente distintos. El parámetro de la función se llama nombre (minúscula), pero dentro del cuerpo se usa Name (mayúscula), que no ha sido declarada en ningún lugar.

Cuando JavaScript intenta leer Name en tiempo de ejecución, busca esa variable en el ámbito actual, en el de la función y en el global — y no la encuentra en ninguno. El resultado es un ReferenceError: Name is not defined que detiene la ejecución en ese punto.

// ✅ console.log("Hola " + nombre);


Los tres errores pertenecen a categorías distintas, lo que los hace buenos ejemplos para aprender a distinguirlas:
Error 1 — Lógico: el más difícil de detectar. El código es sintácticamente perfecto, JavaScript lo ejecuta sin quejarse, pero el resultado es incorrecto. Solo se descubre probando con valores y comprobando la salida.
Error 2 — Sintaxis: el más inmediato. El motor lo detecta antes de ejecutar una sola línea. En este caso, usar = dentro de un if es inválido para el parser y lanza un SyntaxError en el momento de cargar el script.
Error 3 — ReferenceError: ocurre en tiempo de ejecución. La sintaxis es válida, el programa arranca, pero en cuanto llega a esa línea busca Name en memoria, no lo encuentra y se detiene. La causa es que JavaScript distingue mayúsculas de minúsculas: nombre y Name son variables completamente distintas.

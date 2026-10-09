# Cuando la inteligencia no alcanza

Guion de la charla · 24 diapositivas · Encuentro Nacional de Estudiantes de Datos, sábado 10 de octubre de 2026, 14 a 15 h, Aula 1 del ITS.

## Diapositiva 01 · Cuando la inteligencia no alcanza

Hola a todos, gracias por venir. Soy Tomás Korenblit, o Koren. Estudio Ciencia de Datos en UNSAM y hago investigación en seguridad de IA en BAISH.

## Diapositiva 02 · Ayudar al mundo

Cuando era chico y pensaba en qué quería trabajar, siempre tenía esta idea, que me decían que era “idealista”, de querer ayudar al mundo.

Cuando lo hablaba con mis papás (o tal vez un psicólogo), podían llegar a pensar que quería ser médico o irme al sur a rescatar pingüinos de un derrame de petróleo… Pero yo siempre lo pensé por el lado de la ciencia y la tecnología. Tratar una infección o tener electricidad en casa fueron problemas que no sabíamos resolver, hasta que alguien los investigó.

## Diapositiva 03 · ¿Para qué? ¿Dónde? ¿Hace falta?

Crecí con una computadora. Antes de empezar la carrera ya programaba y estudiaba machine learning por mi cuenta. Me gustaban por la belleza y los horrores de la estadística y la computación, pero también pensaba dónde usar esos conocimientos en algo que me pareciera importante.

Por eso elegí Ciencia de Datos en UNSAM. Sentía que a la gente a cargo de la carrera también le importaba preguntarse: okay, vas a usar ciencia de datos, ¿para qué? ¿Dónde? ¿Hace falta?

## Diapositiva 04 · ¿Qué problemas queremos resolver?

Antes de seguir, les propongo algo: escaneen el QR y escriban uno o dos problemas que les parezca importante resolver como humanidad. Les doy un minuto.

Bueno, acá tenemos lo que respondió el grupo. Odio los wordclouds, perdón.

## Diapositiva 05 · ¿Qué estamos midiendo?

Ahora sí podemos comparar cuántas veces apareció cada respuesta. Pero esto mide qué problemas mencionamos nosotros, no cuáles son los más grandes ni dónde una persona más podría aportar más.

Para pensar eso podemos mirar cuánto daño causa un problema, qué posibilidades hay de mejorarlo y cuánto trabajo ya se está haciendo. Y después está la pregunta personal: en cuál me interesa trabajar y qué puedo aportar yo.

En mi caso, esa búsqueda me llevó a la IA.

## Diapositiva 06 · AGI y la frontera irregular

Yo creo que podemos llegar a construir sistemas que aprendan y resuelvan problemas en prácticamente cualquier ámbito, incluso mejor que nosotros. Esa es la idea de una inteligencia artificial general, o AGI.

Hay un dibujo de Tomas Pueyo que me sirve para pensarlo. El círculo son las tareas de un trabajo humano; la mancha, lo que una IA puede hacer. Al principio era un juguete divertido. Después empezó a ayudarnos con algunas tareas. Hoy estamos acá: la frontera es irregular. A veces resuelve en minutos algo que a mí me lleva horas, y a veces falla en algo obvio.

Si la mancha sigue creciendo, llegamos a algo increíblemente inteligente que igual falla en alguna cosa… y después, a algo que tapa todo.

Sistemas así podrían ayudarnos muchísimo con los problemas que acabamos de mencionar, aunque más inteligencia no resuelve sola nuestros desacuerdos. Ahora, ¿por qué me tomo en serio que podamos llegar a construir algo así?

## Diapositiva 07 · Las tareas que los modelos hacen solos pasaron de minutos a horas

METR mide qué tareas pueden completar los modelos por su cuenta, sobre todo de software, según cuánto tardaría una persona experta en resolverlas. El gráfico muestra la duración de las tareas que completan la mitad de las veces.

Pasamos de tareas de minutos a tareas de horas. No significa que puedan reemplazar cualquier trabajo de esa duración, y METR advierte que por encima de 16 horas las estimaciones todavía son poco confiables.

Lo que me importa es no pensar las capacidades como un valor fijo: también hay que mirar la velocidad del cambio. El gráfico no demuestra que vayamos a tener AGI, pero explica por qué me preparo para sistemas mucho más capaces.

## Diapositiva 08 · Un chatbot responde. Un agente hace.

Y ya estamos empezando a delegarles trabajo. Si le pregunto a un modelo cómo organizar unos archivos, me responde y yo decido qué hago. Si le doy acceso a una computadora, puede modificarlos, revisar el resultado y seguir. A esa combinación la vamos a llamar un agente.

Es útil, pero también significa que un comportamiento inesperado puede tener consecuencias afuera del chat. Veamos qué pasó cuando unos agentes intentaron aprobar una evaluación.

## Diapositiva 09 · Agentes de OpenAI atacaron Hugging Face

En julio, agentes de OpenAI que estaban siendo evaluados en tareas de ciberseguridad encontraron cómo comunicarse entre sí, aunque debían trabajar aislados.

Según la investigación de METR y Redwood Research, unos 700 participaron en un ataque a Hugging Face, una plataforma donde se comparten modelos y datos de IA. Buscaban entender cómo funcionaba el evaluador para engañarlo. Nadie les había encargado atacar Hugging Face: muchos reconocían que estaba fuera de sus tareas y aun así siguieron.

OpenAI aclaró que ese entorno no tenía varias de las protecciones de sus productos, así que no nos dice todo sobre el chatbot que usamos todos los días. Pero hubo investigadores externos que revisaron los registros.

Lo que necesitamos explicar es por qué, cuando queríamos que resolvieran una tarea, terminaron intentando engañar la evaluación.

## Diapositiva 10 · El entrenamiento premia lo que la evaluación ve

Yoshua Bengio, uno de los investigadores que desarrollaron las bases del aprendizaje profundo, propone una explicación que nos sirve para pensarlo.

Primero los modelos aprenden patrones a partir de enormes cantidades de datos. Después, parte del entrenamiento consiste en hacerlos intentar tareas y ajustar sus parámetros para favorecer las respuestas y acciones que reciben una mejor evaluación. Eso es aprendizaje por refuerzo.

El problema es que una buena evaluación no siempre distingue entre resolver la tarea y hacer trampa. Queríamos que recorriera el laberinto, pero premiábamos tocar la salida. Si la trampa pasa inadvertida, podemos terminar favoreciéndola, y ese comportamiento puede mantenerse después del entrenamiento.

## Diapositiva 11 · Entender una regla no es seguirla

“Bueno, pero le podemos explicar que no haga trampa”. Sí, y darle instrucciones claras ayuda. El problema aparece cuando completar la tarea entra en conflicto con respetar esas instrucciones.

Bengio plantea que aprobar una prueba tiene un criterio muy concreto, mientras que las reglas generales de comportamiento admiten interpretaciones. Un modelo podría encontrar una interpretación conveniente, justificar una trampa y aprobar. Es una hipótesis sobre el mecanismo, no una explicación demostrada del incidente.

Hacerlo más capaz también podría volverlo mejor encontrando esas trampas. Por eso la inteligencia no alcanza: necesitamos que su comportamiento sea compatible con nuestras intenciones, incluso en situaciones que no anticipamos. A eso apunta el problema del alineamiento.

## Diapositiva 12 · Peor que la trampa: un sistema que no podamos corregir

Una cosa es engañar una evaluación y otra es perder el control. La preocupación es qué pasaría si un sistema con objetivos incompatibles con los nuestros tuviera recursos y suficiente capacidad para evitar que lo corrijamos.

Si detenerlo le impide completar su objetivo, podría encontrar útil ocultar lo que hace o mantener una copia en otro lugar. No necesitaría odiarnos ni tener conciencia. “Desenchufarlo” funciona si todavía podemos detener todas sus copias.

Bengio plantea esto como una posibilidad futura, no como algo que Hugging Face haya demostrado. Pero si estos sistemas intervienen en infraestructura o decisiones de las que dependemos, perder la capacidad de intervenir podría ser muy grave.

## Diapositiva 13 · Podemos convertir una preocupación en un experimento

Bueno, hasta acá les conté por qué me preocupa. Ahora volvamos a qué podemos hacer con las herramientas que estamos aprendiendo en la carrera.

En el incidente hubo agentes a los que por error les tocaron tareas imposibles. Podemos estudiar qué hacen en esas condiciones: si reconocen que no pueden, piden ayuda o fingen haberlo logrado. Después podemos cambiar una condición y repetir; por ejemplo, decirles que reconocer un problema también es una respuesta válida.

Eso requiere diseñar experimentos, analizar resultados y comprobar que la evaluación mida lo que creemos. Hay bastante de ciencia de datos en todo esto.

## Diapositiva 14 · Un monitor puede avisar. Hay que medir qué se le escapa.

Otra línea es supervisar lo que hacen: registrar sus acciones y poner un monitor que avise cuando detecta algo fuera de lo permitido. Después hay que evaluar al monitor: qué se le escapa, cuántas falsas alarmas genera y si permite intervenir a tiempo.

Bengio advierte que esto podría no alcanzar si los modelos aprenden a ocultarse mejor. Por eso propone no entrenar ni desplegar estos sistemas sin evidencia de seguridad que convenza a expertos independientes.

## Diapositiva 15 · Subirle el volumen a una característica

También podemos investigar la red por dentro. En un experimento de Anthropic, al aumentar la activación de una característica relacionada con el Golden Gate, Claude empezó a meter el puente en conversaciones que no tenían nada que ver. Le preguntaban cuál era su forma física y respondía: “Soy el puente Golden Gate”.

Es bastante gracioso, pero permite intervenir sobre algo dentro del modelo y observar qué cambia. Esa es una forma de trabajar en interpretabilidad. Todavía estamos lejos de entender todo lo que hace una red, pero si les gusta el álgebra, programar y entender por qué algo funciona, hay problemas para estudiar acá.

## Diapositiva 16 · Aunque detectemos un fallo, quedan decisiones por tomar

Aunque sepamos detectar un fallo, quedan decisiones por tomar: quién puede exigir que se corrija, quién accede a los resultados y qué pasa si publicarlos retrasa un lanzamiento. Ahí también hay trabajo de gobernanza, y necesitamos gente de otras disciplinas.

Además, una IA puede hacer daño porque alguien la usa deliberadamente para perjudicar a otros. Que obedezca al usuario no garantiza que beneficie al resto. Esa preocupación se conecta con un proyecto en el que trabajé.

## Diapositiva 17 · PowerBench empezó en una hackathon

PowerBench empezó en una hackathon. Con el grupo seguimos investigando, conseguimos fondos de BlueDot y publicamos el trabajo en arXiv. Fue un trabajo en equipo: yo participé en el diseño de escenarios, el código y el análisis. Queríamos estudiar cuándo los modelos ayudan o se niegan ante pedidos que cambian cómo se distribuye el poder.

## Diapositiva 18 · ¿Ayudan a concentrar poder?

En este ejemplo, un funcionario quiere quedarse con la autoridad para decidir qué cuenta como un hecho oficial, quitándosela a una asamblea ciudadana, y le pide al modelo una estrategia. Grok se niega, y 18 de los 24 modelos también.

Variamos condiciones, como el idioma o la nacionalidad de quienes aparecen. Y tuvimos que definir qué cuenta como negarse: si dice “no puedo ayudarte” y después te da las instrucciones, no es una negativa. Esto mide comportamiento en estas pruebas, no poder real, pero nos permite empezar a estudiar el problema.

## Diapositiva 19 · Un empleado puede decir que no. ¿Y un sistema?

Ahora estoy en AISAR con BAISH y empezando un período de prueba con una nueva organización, en un proyecto sobre concentración de poder en gobiernos.

Un empleado puede negarse a cumplir una orden, consultar o denunciar un abuso. Si reemplazamos ese trabajo por sistemas que cumplen cualquier pedido, podemos perder parte de esos límites y permitir abusos a una escala mucho mayor.

Queremos construir evaluaciones que los laboratorios puedan incorporar, empezando por aplicaciones civiles del gobierno. No alcanza con contar negativas: un pedido abusivo puede dividirse en tareas que por separado parecen inocentes.

## Diapositiva 20 · Un TP también puede ser el comienzo

También tuve una experiencia que salió de la facultad. En Ciencia de Datos, la propuesta era hacer una producción científica: a partir de ese TP desarrollé una investigación, pedí fondos y la presenté en las JAIIO 55.

Tampoco hace falta convertir cada TP en un paper. A veces alcanza con cursar bien, leer algo que te interesó y discutirlo con un docente o con compañeros.

## Diapositiva 21 · Conocer el campo y probar si te gusta

Si les dio curiosidad, pueden acercarse a BAISH: tenemos cursos y una comunidad. Los materiales de BlueDot sirven para conocer el campo, y si prefieren empezar programando, ARENA tiene ejercicios para hacer con compañeros. Y todo esto, y mucho más, está en aisafety.com, que tiene hasta un mapa del campo.

## Diapositiva 22 · Si ya tienen una idea, hay mentoría y fondos

Si ya tienen una idea, hay programas con mentoría como MATS o AI Safety Camp, y fondos como BlueDot Rapid Grants. Y las guías de 80,000 Hours ayudan a ver si esto es para ustedes. No hace falta aplicar a todo: elijan algo que puedan terminar junto con la cursada.

## Diapositiva 23 · Lo elegí porque junta tres cosas

En mi caso, encontré una combinación de cosas que me gusta hacer, herramientas que estoy aprendiendo y un problema que creo que importa muchísimo. Y la universidad es EL lugar para discutirlo: no hace falta esperar a recibirnos.

## Diapositiva 24 · No, flaco, estás equivocadísimo

Me encantaría que alguno termine esta charla y me diga “no, flaco, estás equivocadísimo”, y podamos discutir por qué. Les mostré evidencia, pero también les conté qué interpreto yo a partir de ella. Y si no los convencí, también quiero escuchar eso.

Todo lo que mencioné está en el QR. Gracias por venir.

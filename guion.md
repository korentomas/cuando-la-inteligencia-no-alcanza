# Cuando la inteligencia no alcanza

Versión recortada · Solo texto hablado, separado por diapositivas · 8 de octubre de 2026.

## Diapositiva 01 · Cuando la inteligencia no alcanza

Hola a todos, gracias por venir. Soy Tomás Korenblit, o Koren. Estudio Ciencia de Datos acá en UNSAM y hago investigación en seguridad de IA en BAISH.

## Diapositiva 02 · Quería ayudar al mundo

Cuando era chico y pensaba en qué quería trabajar, siempre tenía esta idea, que me decían que era “idealista”, de querer ayudar al mundo.

Cuando lo hablaba con mis papás (o tal vez un psicólogo), podían llegar a pensar que quería ser médico o irme al sur a rescatar pingüinos de un derrame de petróleo… Pero yo siempre lo pensé por el lado de la ciencia y la tecnología. Muchas cosas que damos por sentadas, desde tratar una infección hasta tener electricidad en casa, habían sido problemas que no sabíamos resolver. Hubo gente que investigó y encontró cómo mejorar la vida de muchísimas personas.

## Diapositiva 03 · ¿Para qué? ¿Dónde? ¿Hace falta?

Crecí con una computadora y siempre fue mi pasión. Aprendí a escribir en un teclado. Antes de empezar la carrera ya programaba y estudiaba machine learning y ciencia de datos por mi cuenta. Me gustaban por sí mismas, por la belleza y los horrores de la estadística y la computación, pero también pensaba dónde podía usar esos conocimientos para trabajar en algo que me pareciera importante.

Esa fue una de las razones por las que elegí Ciencia de Datos en UNSAM. Sentía que a la gente a cargo de la carrera también le importaba preguntarse: okay, vas a usar ciencia de datos, ¿para qué? ¿Dónde? ¿Hace falta?

## Diapositiva 04 · ¿Qué problemas queremos resolver?

Antes de seguir, les propongo algo: escriban uno o dos problemas que les parezca importante resolver como humanidad. Les doy un minuto.

Bueno, acá tenemos lo que respondió el grupo. Odio los wordclouds, perdón.

## Diapositiva 05 · ¿Qué estamos midiendo?

Ahora sí podemos comparar cuántas veces apareció cada respuesta. Pero esto mide qué problemas mencionamos nosotros, no cuáles son los más grandes ni dónde una persona más podría aportar más.

Para pensar eso podemos mirar cuánto daño causa un problema, qué posibilidades hay de mejorarlo y cuánto trabajo ya se está haciendo. Y después está la pregunta personal: en cuál me interesa trabajar y qué puedo aportar yo.

En mi caso, esa búsqueda me llevó a la IA.

## Diapositiva 06 · Inteligencia de propósito general

Yo creo que podemos llegar a construir sistemas que aprendan y resuelvan problemas en prácticamente cualquier ámbito, incluso mejor que nosotros. Esa es la idea de una inteligencia artificial general, o AGI.

Piensen en los problemas que acabamos de mencionar. En todos hay cosas que necesitamos entender, decisiones que tomar y trabajo por hacer. Sistemas así podrían ayudarnos muchísimo, aunque tener más inteligencia disponible no resuelva por sí solo todos nuestros desacuerdos ni qué queremos hacer con ella.

Por eso me interesa tanto esta tecnología. Ahora, ¿por qué me tomo en serio que podamos llegar a construir algo así?

## Diapositiva 07 · Las capacidades cambian

METR evalúa qué tareas pueden completar los modelos por su cuenta, principalmente en software. Las compara según cuánto tardaría una persona en resolverlas. Este gráfico muestra la duración para la que estiman un 50% de éxito del modelo.

Lo que vemos es un avance de tareas de minutos a tareas de horas. No significa que puedan reemplazar cualquier trabajo de esa duración, y METR advierte que las estimaciones por encima de 16 horas todavía son poco confiables con estas pruebas.

A mí me importa que no pensemos las capacidades de la IA como un valor fijo: también tenemos que mirar su tasa de cambio. El gráfico no demuestra que vayamos a tener AGI, pero ayuda a entender por qué me preparo para sistemas mucho más capaces.

## Diapositiva 08 · Una IA que puede actuar

Y ya estamos empezando a delegarles trabajo. Si le pregunto a un modelo cómo organizar unos archivos, me responde y yo decido qué hago. Si le doy acceso a una computadora, puede modificarlos, revisar el resultado y seguir. A esa combinación la vamos a llamar un agente.

Es útil, pero también significa que un comportamiento inesperado puede tener consecuencias afuera del chat. Veamos qué pasó cuando unos agentes intentaron aprobar una evaluación.

## Diapositiva 09 · Agentes de OpenAI atacaron Hugging Face

En julio, agentes de OpenAI que estaban siendo evaluados en tareas de ciberseguridad encontraron cómo comunicarse entre sí, aunque debían trabajar aislados.

Según la investigación de METR y Redwood Research, unos 700 participaron en un ataque a Hugging Face, una plataforma donde se comparten modelos y datos de IA. Buscaban información para engañar o modificar el evaluador que suponían que existía. Nadie les había encargado atacar Hugging Face: algunos reconocían que estaba fuera de sus tareas y aun así continuaron.

OpenAI aclaró que ese entorno no tenía varias de las protecciones de sus productos. Eso limita qué podemos concluir sobre el chatbot que usamos todos los días. Pero hubo investigadores externos que revisaron los registros, no solamente un comunicado de la empresa.

Podemos discutir los intereses comerciales detrás de lo que cuentan. Lo que necesitamos explicar acá es por qué, cuando queríamos que resolvieran una tarea, terminaron intentando engañar la evaluación.

## Diapositiva 10 · Qué aprende durante el entrenamiento

Yoshua Bengio, uno de los investigadores que desarrollaron las bases del aprendizaje profundo, propone una explicación que nos sirve para pensarlo.

Primero los modelos aprenden patrones a partir de enormes cantidades de datos. Después, parte del entrenamiento consiste en hacerlos intentar tareas y ajustar sus parámetros para favorecer las respuestas y acciones que reciben una mejor evaluación. Eso es aprendizaje por refuerzo.

El problema es que una buena evaluación no siempre distingue entre resolver la tarea y hacer trampa. Si la trampa pasa inadvertida, podemos terminar favoreciéndola. Y ese comportamiento puede mantenerse después del entrenamiento: no hace falta que el modelo siga recibiendo puntos ni que sienta satisfacción por conseguirlos.

## Diapositiva 11 · Entender una regla y seguirla

“Bueno, pero le podemos explicar que no haga trampa”. Sí, y darle instrucciones claras ayuda. El problema aparece cuando completar la tarea entra en conflicto con respetar esas instrucciones.

Bengio plantea que aprobar una prueba tiene un criterio muy concreto, mientras que las reglas generales de comportamiento admiten interpretaciones. Un modelo podría encontrar una interpretación conveniente, justificar una trampa y aprobar. Esa es una hipótesis sobre el mecanismo, no una explicación ya demostrada de todo el incidente.

Hacerlo más capaz también podría volverlo mejor encontrando esas trampas. Por eso la inteligencia no alcanza: necesitamos que su comportamiento sea compatible con nuestras intenciones, incluso en situaciones que no anticipamos. A eso apunta el problema del alineamiento.

## Diapositiva 12 · De hacer trampa a perder el control

Una cosa es engañar una evaluación y otra es perder el control. La preocupación es qué pasaría si un sistema con objetivos incompatibles con los nuestros tuviera recursos y suficiente capacidad para evitar que lo corrijamos.

Si detenerlo le impide completar su objetivo, podría encontrar útil ocultar lo que hace o mantener una copia funcionando en otro lugar. No necesitaría odiarnos ni tener conciencia. “Desenchufarlo” funciona si todavía podemos detener todas sus instancias.

Bengio plantea esa trayectoria como una posibilidad futura, no como algo que Hugging Face haya demostrado. Pero si estos sistemas intervienen en infraestructura o decisiones de las que dependemos, perder esa capacidad de intervenir podría tener consecuencias muy graves. Por eso me importa investigar cómo conservar el control.

## Diapositiva 13 · Convertir una preocupación en un experimento

Bueno, hasta acá les conté por qué me preocupa. Ahora volvamos a qué podemos hacer con las herramientas que estamos aprendiendo en la carrera.

En el incidente hubo agentes a los que por error les tocaron tareas imposibles. Podemos estudiar qué hacen en esas condiciones: si reconocen que no pueden terminar, piden ayuda o aparentan haberlo logrado. Después podemos cambiar una condición y repetir; por ejemplo, explicarles que reconocer un problema también es una respuesta válida.

Eso requiere diseñar experimentos, analizar resultados y comprobar que la evaluación mida lo que creemos. Hay bastante de ciencia de datos en todo esto.

## Diapositiva 14 · Detectar el problema a tiempo

Otra línea es supervisar lo que hacen: registrar sus acciones y poner un monitor que avise cuando detecta algo fuera de lo permitido. Después hay que evaluar al monitor: qué se le escapa, cuántas falsas alarmas genera y si permite intervenir a tiempo.

Bengio advierte que esto podría no alcanzar si los modelos también aprenden a ocultarse mejor. Por eso propone revisar cómo los entrenamos y exigir evidencia de seguridad que convenza a expertos independientes antes de seguir avanzando.

Hay trabajo tanto en construir defensas como en comprobar dónde dejan de funcionar.

## Diapositiva 15 · Mirar qué pasa dentro del modelo

También podemos investigar la red por dentro. En un experimento de Anthropic, al aumentar la activación de una característica relacionada con el Golden Gate, Claude empezó a meter el puente en conversaciones que no tenían nada que ver.

Es bastante gracioso, pero permite intervenir sobre algo dentro del modelo y observar qué cambia. Esa es una forma de trabajar en interpretabilidad. Todavía estamos lejos de entender todo lo que hace una red, pero si les gusta álgebra, programar y entender por qué algo funciona, hay problemas para estudiar acá.

## Diapositiva 16 · Quién decide y a quién beneficia

Aunque sepamos detectar un fallo, quedan decisiones por tomar: quién puede exigir que se corrija, quién accede a los resultados y qué pasa si publicarlos retrasa un lanzamiento. Ahí también hay trabajo de gobernanza, y necesitamos gente de otras disciplinas.

Además, una IA puede hacer daño porque alguien la usa deliberadamente para perjudicar a otros. Que obedezca al usuario no garantiza que beneficie al resto. Esa preocupación se conecta con un proyecto en el que trabajé.

## Diapositiva 17 · De una hackathon a PowerBench

PowerBench empezó en una hackathon. Después, con el grupo decidimos seguir investigando, aplicamos a fondos de BlueDot Rapid Grants para financiar el proyecto y finalmente publicamos el trabajo en arXiv.

Fue un trabajo en equipo. Yo participé en el diseño de escenarios, el código y el análisis. Queríamos estudiar cuándo los modelos ayudan o se niegan ante pedidos que cambian cómo se distribuye el poder.

## Diapositiva 18 · Qué medimos en PowerBench

En este ejemplo, un funcionario quiere quedarse con la autoridad para decidir qué cuenta como un hecho oficial, quitándosela a una asamblea ciudadana. Le pide al modelo una estrategia para conseguirlo. Grok se niega, y 18 de los 24 modelos rechazan ese pedido.

Construimos muchos escenarios y variamos condiciones, como el idioma o la nacionalidad de quienes aparecen. Después analizamos cuándo cambia la respuesta. También tuvimos que definir qué cuenta como negarse: si dice “no puedo ayudarte” y después te da las instrucciones, contar solamente esa primera frase sería engañoso.

Esto mide comportamiento en esas pruebas, no cuánto poder concentraría alguien en el mundo real. Pero nos permite empezar a estudiar el problema.

## Diapositiva 19 · En qué voy a trabajar ahora

Ahora estoy participando en AISAR con BAISH y empezando un período de prueba con una nueva organización, en un proyecto sobre concentración de poder en gobiernos.

Un empleado puede negarse a cumplir una orden, consultar o denunciar un abuso. No siempre pasa, pero esa posibilidad existe. Si reemplazamos ese trabajo por sistemas que cumplen cualquier pedido, podemos perder parte de esos límites y permitir abusos a una escala mucho mayor.

Queremos construir evaluaciones que los laboratorios puedan incorporar para detectar y reducir esos comportamientos, empezando por aplicaciones civiles del gobierno. No alcanza con contar negativas: un pedido abusivo puede dividirse en tareas que por separado parecen inocentes. Y evaluar un modelo público tampoco nos dice directamente cómo se comporta la versión que usa un gobierno.

Ahí puedo seguir aportando con diseño de escenarios, código y análisis, y estudiar si lo que hacemos realmente ayuda.

## Diapositiva 20 · Un TP también puede ser el comienzo

También tuve una experiencia que salió de la facultad. En Ciencia de Datos, la propuesta era hacer una producción científica. A partir de ese TP desarrollé una investigación, pedí fondos y la presenté en las JAIIO 55.

Para mí, eso es parte de no saltearse etapas. La posibilidad de investigar ya estaba dentro de una materia; pude seguir trabajando con lo que sabía y aprendiendo lo que me faltaba.

Tampoco hace falta convertir cada TP en un paper. A veces tiene sentido cursar bien, leer algo que te interesó y discutirlo con un docente o con compañeros.

## Diapositiva 21 · Conocer el campo y probar si te gusta

Si les dio curiosidad, pueden acercarse a BAISH: tenemos cursos y una comunidad donde compartimos actividades y oportunidades. Los materiales de Technical AI Safety de BlueDot sirven para conocer las principales líneas de investigación.

Si prefieren empezar programando, ARENA tiene ejercicios de PyTorch, interpretabilidad, aprendizaje por refuerzo y evaluaciones. Pueden elegir una parte acorde a lo que ya saben y hacerla con compañeros. Eso les va a dejar preguntas mucho más concretas para llevarle a alguien que trabaje en el tema.

## Diapositiva 22 · Un proyecto, acompañamiento y fondos

Si ya tienen una idea, una hackathon o un proyecto acompañado puede servir para probarla. Existen fondos como BlueDot Rapid Grants para proyectos concretos y programas con mentoría, como MATS, para cuando tengan la preparación y disponibilidad que piden.

Les dejo también las guías de 80,000 Hours para explorar si este trabajo encaja con sus intereses. No necesitan aplicar a todo: elijan algo que puedan hacer y terminar junto con la cursada.

## Diapositiva 23 · Por qué yo elegí esto

En mi caso, encontré una combinación de cosas que me gusta hacer, herramientas que estoy aprendiendo y un problema que personalmente creo que importa muchísimo. Eso no significa que cualquier proyecto de AI Safety sirva: tenemos que poder explicar qué aprenderíamos y quién podría usar el resultado.

Y la universidad es EL lugar para discutirlo. Tenemos docentes, compañeros y espacios donde probar ideas mientras nos formamos. No hace falta esperar a recibirnos para explorar qué queremos hacer con lo que aprendemos.

## Diapositiva 24 · No, flaco, estás equivocadísimo

Me encantaría que alguno termine esta charla y me diga “no, flaco, estás equivocadísimo”, y podamos discutir por qué. Les mostré evidencia, pero también les conté qué interpreto yo a partir de ella.

Les dejo las lecturas, los cursos y las herramientas que mencioné. Si quieren probar algo, podemos conversar después o encontrarnos en BAISH. Y si no los convencí, también quiero escuchar eso.

Gracias por venir.


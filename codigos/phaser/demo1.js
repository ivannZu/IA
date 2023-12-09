// declaramos las variables


var w=800;
var h=400;
var jugador;
var fondo;

// estas variables son las de las balas que salen de las naves (se crean 2 porque son 2 naves)
var bala, bala1 , balaD=false,balaD1= false, nave;

//variables para el salto, despliegue menu, movimiento izquierda y derecha del personaje
var salto;
var menu;
var izquierda;
var derecha;
var saltosonido;

var velocidadNave = 2; // La velocidad a la que se moverá la nave
var direccionNave = 1; // Dirección del movimiento de la nave (1 para derecha, -1 para izquierda)



var contadorMuertes = 0; // Contador de muertes
var textoContadorMuertes; // Texto en pantalla para el contador

// velocidad de la bala de la primer y segunda nave
var velocidadBala, velocidadBala1;
var despBala, despBala1;
var estatusAire;
var estatuSuelo;

//variables que utilizamos para el entrenamiento de la red neuronal
var nnNetwork , nnEntrenamiento, nnSalida, datosEntrenamiento=[];
var modoAuto = false, eCompleto=false;


//iniciamos el juego phaser con el tamaño de las variables indicadas arriba (800x400) y definimos las funciones que están dentro de los parentesis; preload, create, update, render)
var juego = new Phaser.Game(w, h, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render:render});

// esta función prácticamente es la encargada de cargar lo referente a las imagenes, el fondo, de lo que hay en el juego; la bala, la nave, etc

function preload() {
    juego.load.image('fondo', 'assets/game/fondo.jpg');
    juego.load.spritesheet('mono', 'assets/sprites/altair.png',32 ,48);
    juego.load.image('nave', 'assets/game/ufo.png');
    juego.load.image('bala', 'assets/sprites/purple_ball.png');
    juego.load.image('menu', 'assets/game/menu.png');
    juego.load.audio('saltosonido', 'assets/audio/jump.mp3');

}





//practicamente es para crear los objetos que van a estar dentro del juego
function create() {
    //***********************
    textoContadorMuertes = juego.add.text(10, 10, "Muertes: 0", { font: "20px Arial", fill: "#fff" });


    nave = juego.add.sprite(w-100, h-75, 'nave');

    juego.physics.startSystem(Phaser.Physics.ARCADE);
    juego.physics.arcade.gravity.y = 800;
    juego.time.desiredFps = 30;

    fondo = juego.add.tileSprite(0, 0, w, h, 'fondo');
    nave = juego.add.sprite(w-100, h-75, 'nave'); // la nave que dispara en horizontal
    nave1 = juego.add.sprite(w-790, h-390, 'nave'); //la nave que dispara en vertical, hacía abajo
    bala = juego.add.sprite(w-100, h, 'bala');
    bala1 = juego.add.sprite(w-750, h-350, 'bala'); //las balas de cada una de las naves
    jugador = juego.add.sprite(50, h, 'mono'); // el personaje

//encargado de la animación correr
    juego.physics.enable(jugador);
    jugador.body.collideWorldBounds = true;
    var corre = jugador.animations.add('corre',[8,9,10,11]);
    jugador.animations.play('corre', 10, true);

// aqui de la colisión o choque de la bala que es disparada horizontal
    juego.physics.enable(bala);
    bala.body.collideWorldBounds = true;

    // aqui de la colisión o choque de la bala que es disparada vertical
    juego.physics.enable(bala1);
    bala1.body.collideWorldBounds = true;

//practicamente el menú y lo que muestra ahí en la pantalla a la orilla
    pausaL = juego.add.text(w - 100, 20, 'Pausa', { font: '20px Arial', fill: '#fff' });
    pausaL.inputEnabled = true;
    pausaL.events.onInputUp.add(pausa, self);
    juego.input.onDown.add(mPausa, self);

// asignamos el salto, el movimiento a la izquierda y derecha a las teclas en nuestro teclado, las cuales son, el espacio, flecha izquierda y derecha
    salto = juego.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    izquierda = juego.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    derecha = juego.input.keyboard.addKey(Phaser.Keyboard.RIGHT);

// creamos la red neuronal y configuramos un poco los parametros de dicha red y luego las utilizaremos
    nnNetwork =  new synaptic.Architect.Perceptron(4, 4, 4, 2);
    nnEntrenamiento = new synaptic.Trainer(nnNetwork);

}

//esta función es la encargada para entrenar la red neuronal de los datos que proporcionaremos y luego la utilizaremos
function enRedNeural(){
    nnEntrenamiento.train(datosEntrenamiento, {rate: 0.003, iterations: 10000, shuffle: true});
}

// esta función es como la predicción que utilizando la red neuronal con los datos proporcionados y nos va a mostrar en consola los valores de entrada y el porcentaje
// como para las predicciones de aire y piso y al final nos retorna el valor booleano con la predicción de la red
function datosDeEntrenamiento(param_entrada){

    console.log("Entrada",param_entrada[0]+" "+param_entrada[1]);
    nnSalida = nnNetwork.activate(param_entrada);
    var aire=Math.round( nnSalida[0]*100 );
    var piso=Math.round( nnSalida[1]*100 );
    console.log("Valor ","En el Aire %: "+ aire + " En el suelo %: " + piso);
    return nnSalida[0]>=nnSalida[1];
}

//La función para pausar el juego y mostrar el menú de la pausa, detener el muñeco cuando se realiza esta acción y reposicionaremos al muñeco
function pausa(){
    juego.paused = true;
    menu = juego.add.sprite(w/2,h/2, 'menu');
    menu.anchor.setTo(0.5, 0.5);
    jugador.body.velocity.x=0;
    jugador.body.velocity.y=0;
    jugador.position.x=50;
}

//toda la logica cuando pausamos el juego, reestablecimiento de variables, iniciar nuevamente el entrenamiento, reanudación del juego practicamente
function mPausa(event){
    if(juego.paused){
        var menu_x1 = w/2 - 270/2, menu_x2 = w/2 + 270/2,
            menu_y1 = h/2 - 180/2, menu_y2 = h/2 + 180/2;

        var mouse_x = event.x  ,
            mouse_y = event.y  ;

        if(mouse_x > menu_x1 && mouse_x < menu_x2 && mouse_y > menu_y1 && mouse_y < menu_y2 ){
            if(mouse_x >=menu_x1 && mouse_x <=menu_x2 && mouse_y >=menu_y1 && mouse_y <=menu_y1+90){
                eCompleto=false;
                datosEntrenamiento = [];
                modoAuto = false;
            }else if (mouse_x >=menu_x1 && mouse_x <=menu_x2 && mouse_y >=menu_y1+90 && mouse_y <=menu_y2) {
                if(!eCompleto) {
                    console.log("","Entrenamiento "+ datosEntrenamiento.length +" valores" );
                    enRedNeural();
                    eCompleto=true;
                }
                modoAuto = true;
            }

            menu.destroy();
            resetVariables();
            resetVariables1();
            juego.paused = false;

        }
    }
}

//reestablecer el estado del muñeco, la bala en horizontal
function resetVariables(){
    jugador.body.velocity.x=0;
    jugador.body.velocity.y=0;
    bala.body.velocity.x = 0;
    bala.position.x = w-100;
    balaD=false;
}

//igualmente pero ahora con la bala en vertical, la nave
function resetVariables1(){
    jugador.body.velocity.x=0;
    jugador.body.velocity.y=0;
    bala1.body.velocity.y = 0;
    bala1.position.y = nave1.position.y;
    balaD1=false;
}

//aquí es la función que nos permite saltar y aparte agregamos la de la acción de cuando el muñeco se mueve a la izquierda y a la derecha, con el manejo del parametro
// velocity en el eje y puesto que el muñeco salta hacia arriba y los del movimiento en izquierda es negativo porque se mueve para atras y positivo para cuando se mueve hacia en frente

function saltar(){
    jugador.body.velocity.y = -320;
}
function movIzquierda(){
    jugador.body.velocity.x = -120;
}
function movDerecha(){
    jugador.body.velocity.x = 100;
}


//esta función es la encargada de las acciones cuando se realizan, por ejemplo cuando es la colisión de la bala con el muñeco/jugador comprueba que si se superponga la bala al cuerpo
// y se llama a la función colisionH que mas adelante vemos que pausa el juego y reinicia los valores para poder reestablecer todo y entrenar la red
function update() {
    if (jugador.position.x > w / 2) {
        jugador.position.x = w / 2;
    }

    if (jugador.position.x >= w - jugador.width) {
        // Ajusta esta velocidad para que sea más rápida que la velocidad normal
        jugador.body.velocity.x = -800; // Cambia a una velocidad negativa para moverse hacia la izquierda
    }

    nave.position.x += velocidadNave * direccionNave;
    if (nave.position.x <= 0 || nave.position.x >= w - nave.width) {
        direccionNave *= -1;
    }
    

    fondo.tilePosition.x -= 1; 

    juego.physics.arcade.collide(bala, jugador, colisionH, null, this);
    juego.physics.arcade.collide(bala1, jugador, colisionH, null, this);

    estatuSuelo = 1;
    estatusAire = 0;
    estatusMov = 0;

    //este pequeño pedazo verifica si el muñeco no está en el suelo y actualiza dichas variables
    if(!jugador.body.onFloor()) {
        estatuSuelo = 0;
        estatusAire = 1;
        estatusMov = 1;
    }

    if (!izquierda.isDown && !derecha.isDown && jugador.body.onFloor()) {
        jugador.body.velocity.x = -45; // Ajusta esta velocidad según lo que necesites
    }

	
    // aquí se calculan las distancias entre la posición horizontal del jugador y las posiciones horizontales de las balas.
    despBala = Math.floor( jugador.position.x - bala.position.x );
    despBala1 = Math.floor( jugador.position.x - bala1.position.x );
                                                                           
// Aqui es del modo Auto que es cuando le damos clic en el menú de pausa y vemos cuan entrenada está nuestra red llamando los datos que están almacenados para repetir lo que
// hemos hecho en el modo Manual
    if( modoAuto==false && salto.isDown &&  jugador.body.onFloor() ){
        saltar();
    }else if(modoAuto==false && izquierda.isDown &&  jugador.body.onFloor()){
        movIzquierda();
    }else if(modoAuto==false && derecha.isDown &&  jugador.body.onFloor()){
        movDerecha();
    }
    if( modoAuto == true  && bala.position.x>0 && bala1.position.x>0 && jugador.body.onFloor()) {

        if( datosDeEntrenamiento( [despBala , velocidadBala, despBala1,velocidadBala1] )  ){
            saltar();  
            movIzquierda();  
            movDerecha(); 
        }
    }

    if(balaD==false || balaD1==false){
        disparo(); 
        disparo1();
       
    }
    if(bala.position.x <= 0 || bala1.position.y <= 0 ){
        resetVariables();
        resetVariables1();
        
    }
    if( modoAuto ==false  && bala.position.x > 0 && bala1.position.x > 0){

        datosEntrenamiento.push({
                'input' :  [despBala, velocidadBala, despBala1, velocidadBala1],
                'output':  [estatusAire , estatuSuelo]  
        });
        console.log("Desplazamiento Bala, Velocidad ,Desplazamiento Bala 1, Velocidad 1, Estatus, Estatus: ",
            despBala + " " +velocidadBala + " "+ despBala1+" "+velocidadBala1+ " "+ estatusAire+" "+  estatuSuelo);
       
   }
}

// aquí la función del disparo que realiza la nave, movemos un poco los parametros para medir la velocidad con la que queremos que se mueva la bala y el reinicio de la misma
function disparo(){
    velocidadBala =  -1 * velocidadRandom(700,800);
    bala.body.velocity.y = 0 ;
    bala.body.velocity.x = velocidadBala ;
    balaD=true;
}

//lo mismo para la otra nave
function disparo1(){
    velocidadBala1 =  -0.1 * velocidadRandom(700,800);
    bala1.body.velocity.x = 0 ;
    bala1.body.velocity.y = velocidadBala1;
    balaD1=true;
}

//la función colisionh que es la que detiene todo y como vimos arriba y reestablece todo de nuevo
function colisionH(){
//***************** */
    contadorMuertes++;
    textoContadorMuertes.text = "Muertes: " + contadorMuertes;

    pausa();


}

function velocidadRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function render(){

}


export function crearTablero(tamano) {
  const tablero = [];

  for (let i = 1; i < tamano * tamano; i++) {
    tablero.push(i);
  }

  tablero.push(0);
  return tablero;
}

export function estaResuelto(tablero) {
  return tablero.every((valor, indice) => {
    if (indice === tablero.length - 1) {
      return valor === 0;
    }

    return valor === indice + 1;
  });
}

export function mover(tablero, indice, tamano) {
  const vacio = tablero.indexOf(0);

  if (
    indice < 0 ||
    indice >= tablero.length ||
    !Number.isInteger(indice) ||
    tablero.length !== tamano * tamano
  ) {
    return tablero;
  }

  const filaFicha = Math.floor(indice / tamano);
  const columnaFicha = indice % tamano;
  const filaVacia = Math.floor(vacio / tamano);
  const columnaVacia = vacio % tamano;

  const distancia =
    Math.abs(filaFicha - filaVacia) +
    Math.abs(columnaFicha - columnaVacia);

  if (distancia !== 1) {
    return tablero;
  }

  const nuevoTablero = [...tablero];

  nuevoTablero[vacio] = tablero[indice];
  nuevoTablero[indice] = 0;

  return nuevoTablero;
}

export function mezclar(tamano, movimientos = 30) {
  let tablero;

  do {
    tablero = crearTablero(tamano);
    let posicionAnterior = -1;

    for (let i = 0; i < movimientos; i++) {
      const vacio = tablero.indexOf(0);
      const opciones = [];

      for (let j = 0; j < tablero.length; j++) {
        if (
          j !== posicionAnterior &&
          mover(tablero, j, tamano) !== tablero
        ) {
          opciones.push(j);
        }
      }

      const indiceAleatorio = Math.floor(
        Math.random() * opciones.length
      );

      const posicionElegida = opciones[indiceAleatorio];

      posicionAnterior = vacio;
      tablero = mover(tablero, posicionElegida, tamano);
    }
  } while (estaResuelto(tablero));

  return tablero;
}

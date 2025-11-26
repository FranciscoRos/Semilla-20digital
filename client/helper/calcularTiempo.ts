/**
 * Calcula el tiempo transcurrido entre una fecha de inicio y la fecha actual.
 * @param fechaInicioStr La fecha de inicio como un string ISO (ej: "2023-10-27").
 * @returns Un objeto que contiene el tiempo transcurrido en diferentes unidades, o un mensaje de error.
 */
export function calcularTiempoTranscurrido(fechaInicioStr: string): { dias: number, horas: number, minutos: number } | string {
    if (!fechaInicioStr) {
        return 'Fecha de inicio no definida.';
    }

    const fechaInicio = new Date(fechaInicioStr);
    const ahora = new Date();

    // Validar que la fecha de inicio sea válida
    if (isNaN(fechaInicio.getTime())) {
        return 'Fecha de inicio no definida.';
    }

    const diferenciaMs = Math.abs(ahora.getTime() - fechaInicio.getTime());

    const MS_POR_MINUTO = 60 * 1000;
    const MS_POR_HORA = 60 * MS_POR_MINUTO;
    const MS_POR_DIA = 24 * MS_POR_HORA;


    const dias = diferenciaMs / MS_POR_DIA;
    
    const horas = diferenciaMs / MS_POR_HORA;
    
    const minutos = diferenciaMs / MS_POR_MINUTO;
    


    return {
        dias: Math.floor(dias),
        horas: Math.floor(horas),
        minutos: Math.floor(minutos)
    };
}
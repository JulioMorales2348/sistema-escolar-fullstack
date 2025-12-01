import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { FacadeService } from './facade.service';
import { ValidatorService } from './tools/validator.service';
import { ErrorsService } from './tools/errors.service';


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class EventosService {

  constructor(
    private http: HttpClient,
    private facadeService: FacadeService,
    private validatorService: ValidatorService,
    private errorService: ErrorsService
  ) { }

  // Estructura base del formulario
  public esquemaEvento(){
    return {
      'nombre_evento': '',
      'tipo_evento': '',
      'fecha_realizacion': '',
      'hora_inicio': '',
      'hora_fin': '',
      'lugar': '',
      'publico_objetivo': [],
      'programa_educativo': '',
      'responsable': '',
      'descripcion': '',
      'cupo_maximo': 0
    }
  }

  // VALIDACIÓN DEL EVENTO
  public validarEvento(data: any) {
    console.log("Validando evento... ", data);
    let error: any = {};

    // validación del nombre del evento
    if (!this.validatorService.required(data["nombre_evento"])) {
      error["nombre_evento"] = this.errorService.required;
    } else {
      // Solo letras con acentos, números y espacios sin caracteres especiales.
      const alphaNumericPattern = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚüÜ ]+$/;
      if (!alphaNumericPattern.test(data["nombre_evento"])) {
        alert("El nombre del evento solo puede contener letras, números y espacios.");
        error["nombre_evento"] = "Caracteres inválidos";
      }
    }

    // Tipo de Evento
    if (!this.validatorService.required(data["tipo_evento"])) {
      error["tipo_evento"] = this.errorService.required;
    }

    // Fecha de realización
    if (!this.validatorService.required(data["fecha_realizacion"])) {
      error["fecha_realizacion"] = this.errorService.required;
    } else {
      const fechaEvento = new Date(data["fecha_realizacion"]);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (fechaEvento < hoy) {
        error["fecha_realizacion"] = "La fecha no puede ser anterior a hoy";
      }
    }

    // Horarios (Inicio < Fin)
    if (!this.validatorService.required(data["hora_inicio"])) {
      error["hora_inicio"] = this.errorService.required;
    }
    if (!this.validatorService.required(data["hora_fin"])) {
      error["hora_fin"] = this.errorService.required;
    }

    if (data["hora_inicio"] && data["hora_fin"]) {
      // Convertimos a minutos para comparar correctamente
      const inicioMinutos = this.convertirHoraAMinutos(data["hora_inicio"]);
      const finMinutos = this.convertirHoraAMinutos(data["hora_fin"]);

      if (inicioMinutos >= finMinutos) {
        error["hora_fin"] = "La hora final debe ser mayor a la inicial";
      }
    }

    // Lugar del evento
    if (!this.validatorService.required(data["lugar"])) {
      error["lugar"] = this.errorService.required;
    } else {
      const lugarPattern = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚüÜ ]+$/;
      if (!lugarPattern.test(data["lugar"])) {
        error["lugar"] = "Solo caracteres alfanuméricos y espacios";
      }
    }

    // Público Objetivo, que hayamos seleccionado uno xd
    if (data["publico_objetivo"].length === 0) {
      error["publico_objetivo"] = "Selecciona al menos una opción";
    }

     // Programa educativo
    if (data["publico_objetivo"].includes('Estudiantes')) {
      if (!this.validatorService.required(data["programa_educativo"])) {
        error["programa_educativo"] = this.errorService.required;
      }
    }

    if (!this.validatorService.required(data["responsable"])) {
      error["responsable"] = this.errorService.required;
    }
    if (!this.validatorService.required(data["cupo_maximo"])) {
      error["cupo_maximo"] = this.errorService.required;
    }

    // Validación Responsable
    if (!this.validatorService.required(data["responsable"])) {
      error["responsable"] = this.errorService.required;
    }

    // Validación Descripción letras, números y puntuación básica
    if (!this.validatorService.required(data["descripcion"])) {
      error["descripcion"] = this.errorService.required;
    } else {
      // Permite letras, números, espacios y puntuación básica
      const descPattern = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚüÜ .,;:¡!¿?()\-_\s"']+$/;
      if (!descPattern.test(data["descripcion"])) {
        error["descripcion"] = "Caracteres inválidos. Solo letras, números y puntuación básica.";
      }
    }

    // Validación Cupo Máximo
    if (!this.validatorService.required(data["cupo_maximo"])) {
      error["cupo_maximo"] = this.errorService.required;
    } else {
      // Debe ser numérico
      if (!this.validatorService.numeric(data["cupo_maximo"])) {
        error["cupo_maximo"] = "Solo se permiten números";
      } else {
        const cupo = parseInt(data["cupo_maximo"]);
        // Entero positivo
        if (cupo <= 0) {
          error["cupo_maximo"] = "Debe ser mayor a 0";
        }
        // Máximo 3 dígitos
        if (data["cupo_maximo"].toString().length > 3) {
          error["cupo_maximo"] = "Máximo 3 dígitos (ej. 999)";
        }
      }
    }


    return error;
  }

  // Helper para convertir una hora a minutos del día
  private convertirHoraAMinutos(horaStr: string): number {
    // Soporta formato "HH:MM"
    const [hours, minutes] = horaStr.split(':').map(Number);
    return (hours * 60) + minutes;
  }

  // Servicio para registrar (POST)
  public registrarEvento(data: any): Observable<any>{
    const token = this.facadeService.getSessionToken();
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });

    return this.http.post<any>(`${environment.url_api}/eventos/`, data, { headers });
  }

  //Obtener lista de eventos
  public obtenerListaEventos(): Observable<any> {
    const token = this.facadeService.getSessionToken();
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    return this.http.get<any>(`${environment.url_api}/lista-eventos/`, { headers });
  }

  //Obtener un solo evento para editar
  public obtenerEventoPorID(id: number): Observable<any>{
    const token = this.facadeService.getSessionToken();
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    return this.http.get<any>(`${environment.url_api}/eventos/?id=${id}`, { headers });
  }

  //Actualizar evento
  public actualizarEvento(data: any): Observable<any>{
    const token = this.facadeService.getSessionToken();
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    return this.http.put<any>(`${environment.url_api}/eventos/`, data, { headers });
  }

  //Para obtener responsables
  public obtenerResponsables(): Observable<any> {
    const token = this.facadeService.getSessionToken();
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    return this.http.get<any>(`${environment.url_api}/lista-responsables/`, { headers });
  }

  //Eliminar evento
  public eliminarEvento(idEvento: number): Observable<any>{
    const token = this.facadeService.getSessionToken();
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    return this.http.delete<any>(`${environment.url_api}/eventos/?id=${idEvento}`, { headers });
  }

}

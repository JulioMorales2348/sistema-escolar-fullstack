// ... imports
// YA NO IMPORTAMOS EL COMPONENTE DEL MODAL NI MATDIALOG AQUI
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EventosService } from 'src/app/services/eventos.service';

@Component({
  selector: 'app-registro-eventos-screen',
  templateUrl: './registro-eventos-screen.component.html',
  styleUrls: ['./registro-eventos-screen.component.scss']
})
export class RegistroEventosScreenComponent implements OnInit {

  public evento: any = {};
  public errors: any = {};
  public minDate: Date = new Date();
  public lista_responsables: any[] = [];
  public editar: boolean = false;
  public idEvento: number = 0;

  constructor(
    private location: Location,
    private router: Router,
    public activatedRoute: ActivatedRoute,
    private eventosService: EventosService
  ) { }

  ngOnInit(): void {
    // Inicializar el formulario con la estructura base
    this.evento = this.eventosService.esquemaEvento();
    this.obtenerResponsables();
    // Verificar si es edición
    if(this.activatedRoute.snapshot.params['id'] != undefined){
      this.editar = true;
      this.idEvento = this.activatedRoute.snapshot.params['id'];
      this.eventosService.obtenerEventoPorID(this.idEvento).subscribe(
        (response)=>{
          this.evento = response;
          if(this.evento.publico_objetivo && typeof this.evento.publico_objetivo === 'string'){
            this.evento.publico_objetivo = this.evento.publico_objetivo.split(', ');
          }
        }, (error)=>{
          alert("No se pudo obtener el evento");
        }
      );
    }
  }

  public obtenerResponsables() {
    this.eventosService.obtenerResponsables().subscribe(
      (response) => { this.lista_responsables = response; },
      (error) => { console.error(error); }
    );
  }

  public goBack() {
    this.location.back();
  }

  public changeFecha(event: any) {
    if (event.value) {
      this.evento.fecha_realizacion = event.value.toISOString().split('T')[0];
    }
  }

  public checkboxChange(event: any){
    if(event.checked){
      this.evento.publico_objetivo.push(event.source.value);
    }else{
      this.evento.publico_objetivo.forEach((item: any, i: any) => {
        if(item == event.source.value){
          this.evento.publico_objetivo.splice(i,1);
        }
      });
    }
  }

  public isEstudianteSelected(): boolean {
    return this.evento.publico_objetivo && this.evento.publico_objetivo.includes('Estudiantes');
  }

  public registrar() {
    this.errors = {};
    this.errors = this.eventosService.validarEvento(this.evento);
    if (Object.keys(this.errors).length > 0) {
      let listaErrores = "";
      Object.values(this.errors).forEach(err => {
        listaErrores += `• ${err}\n`;
      });
      alert("No se puede registrar:\n" + listaErrores);
      return false;
    }
    const eventoAEnviar = { ...this.evento };
    if(Array.isArray(this.evento.publico_objetivo)){
        eventoAEnviar.publico_objetivo = this.evento.publico_objetivo.join(', ');
    }

    this.eventosService.registrarEvento(eventoAEnviar).subscribe(
      (response) => {
        alert("Evento registrado exitosamente");
        this.router.navigate(['/eventos-academicos']);
      },
      (error) => {
        alert("Error al registrar el evento");
      }
    );
  }

  public actualizar() {
    this.errors = {};
    this.errors = this.eventosService.validarEvento(this.evento);
    if (Object.keys(this.errors).length > 0) {
      let listaErrores = "";
      Object.values(this.errors).forEach(err => {
        listaErrores += `• ${err}\n`;
      });
      alert("No se puede actualizar:\n" + listaErrores);
      return false;
    }

    const eventoAEnviar = { ...this.evento };
    if(Array.isArray(this.evento.publico_objetivo)){
      eventoAEnviar.publico_objetivo = this.evento.publico_objetivo.join(', ');
    }

    this.eventosService.actualizarEvento(eventoAEnviar).subscribe(
      (response) => {
        alert("Evento actualizado correctamente");
        this.router.navigate(['/eventos-academicos']);
      },
      (error) => {
        alert("Error al actualizar el evento");
      }
    );
  }
}

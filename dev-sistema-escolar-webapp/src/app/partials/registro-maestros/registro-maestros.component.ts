import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { Location } from '@angular/common';
import { MaestrosService } from 'src/app/services/maestros.service';


@Component({
  selector: 'app-registro-maestros',
  templateUrl: './registro-maestros.component.html',
  styleUrls: ['./registro-maestros.component.scss']
})
export class RegistroMaestrosComponent implements OnInit {

  @Input() rol: string = "";
  @Input() datos_user: any = {};

  //Para contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  public maestro:any = {};
  public errors:any = {};
  public editar:boolean = false;
  public token: string = "";
  public idUser: Number = 0;

  //Para el select
  public areas: any[] = [
    {value: '1', viewValue: 'Desarrollo Web'},
    {value: '2', viewValue: 'Programación'},
    {value: '3', viewValue: 'Bases de datos'},
    {value: '4', viewValue: 'Redes'},
    {value: '5', viewValue: 'Matemáticas'},
  ];

  public materias:any[] = [
    {value: '1', nombre: 'Aplicaciones Web'},
    {value: '2', nombre: 'Programación 1'},
    {value: '3', nombre: 'Bases de datos'},
    {value: '4', nombre: 'Tecnologías Web'},
    {value: '5', nombre: 'Minería de datos'},
    {value: '6', nombre: 'Desarrollo móvil'},
    {value: '7', nombre: 'Estructuras de datos'},
    {value: '8', nombre: 'Administración de redes'},
    {value: '9', nombre: 'Ingeniería de Software'},
    {value: '10', nombre: 'Administración de S.O.'},
  ];
  constructor(
    private router: Router,
    private location : Location,
    public activatedRoute: ActivatedRoute,
    private facadeService: FacadeService,
    private maestrosService: MaestrosService,
   
  ) { }

  ngOnInit(): void {
    //el primer if valida si existe un parametro en la URL
    if(this.activatedRoute.snapshot.params['id'] != undefined){
      this.editar = true;
      //Asignamos a nuestra variable global el valor del ID que viene por la URL
      this.idUser = this.activatedRoute.snapshot.params['id'];
      console.log("ID User: ", this.idUser);
      //Al iniciar la vista asignamos los datos del user
      this.maestro = this.datos_user;
    }else{
      //VA a registrar un maestro por primera vez
      this.maestro = this.maestrosService.esquemaMaestro();
      this.maestro.rol = this.rol;
      this.token =this.facadeService.getSessionToken();
    }
    //Imprimir datos en la consola
    console.log('Maestro: ', this.maestro);
  }

  public regresar(){
    this.location.back();
  }

  // 🛠️ Función añadida para restringir la entrada solo a letras
  public soloLetras(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    // Permitir solo letras (mayúsculas y minúsculas), espacio, y caracteres de control (Backspace, Delete, etc.)
    // La comprobación de mayúsculas/minúsculas simple funciona para ASCII básico.
    // Para incluir acentos y ñ, se debería usar un regex, pero por simplicidad de keypress:
    // Permitir letras básicas [a-zA-Z], espacio, y caracteres de acento/ñ si son detectados.
    const pattern = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]$/;

    // Si la tecla presionada no coincide con el patrón Y no es una tecla de control (como Tab, Flechas)
    if (!pattern.test(event.key) && event.key.length === 1) {
        event.preventDefault();
    }
  }

  public registrar(){
    //Validamos si el formulario está lleno y correcto
    this.errors = {};
    this.errors = this.maestrosService.validarMaestro(this.maestro, this.editar);
    if(Object.keys(this.errors).length > 0){
      return false;
    }
    //Validar la contraseña
    if(this.maestro.password == this.maestro.confirmar_password){
      this.maestrosService.registrarMaestro(this.maestro).subscribe(
        (response) => {
          // Redirigir o mostrar mensaje de éxito
          alert("Maestro registrado exitosamente");
          console.log("Maestro registrado: ", response);
          if(this.token && this.token !== ""){
            this.router.navigate(["maestros"]);
          }else{
            this.router.navigate(["/"]);
          }
        },
        (error) => {
          // Manejar errores de la API
          alert("Error al registrar maestro");
          console.error("Error al registrar maestro: ", error);
        }
      );
    }else{
      alert("Las contraseñas no coinciden");
      this.maestro.password="";
      this.maestro.confirmar_password="";
    }

  }

  public actualizar(){
    // Validación de los datos
    this.errors = {};
    this.errors = this.maestrosService.validarMaestro(this.maestro, this.editar);
    if(Object.keys(this.errors).length > 0){
      return false;
    }

    // Ejecutar el servicio de actualización
    this.maestrosService.actualizarMaestro(this.maestro).subscribe(
      (response) => {
        // Redirigir o mostrar mensaje de éxito
        alert("maestro actualizado exitosamente");
        console.log("maestro actualizado: ", response);
        this.router.navigate(["maestro"]);
      },
      (error) => {
        // Manejar errores de la API
        alert("Error al actualizar maestro");
        console.error("Error al actualizar maestro: ", error);
      }
    );
  }

  //Funciones para password
  showPassword()
  {
    if(this.inputType_1 == 'password'){
      this.inputType_1 = 'text';
      this.hide_1 = true;
    }
    else{
      this.inputType_1 = 'password';
      this.hide_1 = false;
    }
  }

  showPwdConfirmar()
  {
    if(this.inputType_2 == 'password'){
      this.inputType_2 = 'text';
      this.hide_2 = true;
    }
    else{
      this.inputType_2 = 'password';
      this.hide_2 = false;
    }
  }

  //Función para detectar el cambio de fecha
  public changeFecha(event :any){
    console.log(event);
    console.log(event.value.toISOString());

    this.maestro.fecha_nacimiento = event.value.toISOString().split("T")[0];
    console.log("Fecha: ", this.maestro.fecha_nacimiento);
  }

  // Funciones para los checkbox
  public checkboxChange(event:any){
    console.log("Evento: ", event);
    if(event.checked){
      this.maestro.materias_json.push(event.source.value)
    }else{
      console.log(event.source.value);
      this.maestro.materias_json.forEach((materia, i) => {
        if(materia == event.source.value){
          this.maestro.materias_json.splice(i,1)
        }
      });
    }
    console.log("Array materias: ", this.maestro);
  }

  public revisarSeleccion(nombre: string){
    if(this.maestro.materias_json){
      var busqueda = this.maestro.materias_json.find((element)=>element==nombre);
      if(busqueda != undefined){
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
  }

}

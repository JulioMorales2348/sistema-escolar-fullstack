import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidatorService {

  constructor() { }

  /**Funciones para las validaciones de los formulario*/
  required(input:any){
    return (input != undefined && input != null && input != "" && input.toString().trim().length > 0);
  }

  max(input:any, size:any){
    return (input.length <= size);
  }

  min(input:any, size:any){
    return (input.length >= size);
  }

  email(input:any){
    var regEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return input.match(regEx); // Invalid format
  }

  date(input:any){
    var regEx = /^\d{4}-\d{2}-\d{2}$/;
    if(!input.match(regEx)) return false;  // Invalid format
    var d = new Date(input);
    if(Number.isNaN(d.getTime())) return false; // Invalid date
    return d.toISOString().slice(0,10) === input;
  }

  between(input:any, min:any, max:any){
    return (max >= input >= min);
  }

  numeric(input:any){
    // Asegura que solo sean números enteros o decimales (aunque tu uso solo chequea enteros)
    return (!isNaN(parseFloat(input)) && isFinite(input));
  }

  maxDecimals(input:any, size:any) {
    let decimals = 0;

    if (Math.floor(input) !== input && input.toString().split(".")[1]){
      decimals = input.toString().split(".")[1].length
    }

    return (decimals <= size);
  }

  minDecimals(input:any, size:any) {
    let decimals = 0;

    if (Math.floor(input) !== input && input.toString().split(".")[1]){
      decimals = input.toString().split(".")[1].length
    }

    return (decimals >= size);
  }

  dateBetween(input:any, min:any, max:any){

    input = new Date(input).getTime();
    min = new Date(min).getTime();
    max = new Date(max).getTime();

    return  (max >= input && input  >= min);

  }

 
  onlyLetters(input:any){
    let pat = new RegExp('^([A-Za-zÑñáéíóúÁÉÍÓÚ ]+)$');
    return pat.test(input);
  }

 
  alphanumeric(input:any){
    // Permite letras (mayúsculas/minúsculas) y números
    let pat = new RegExp('^([A-Za-z0-9]+)$');
    return pat.test(input);
  }

 
  words(input:any){
    return this.onlyLetters(input);
  }
}

import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-editar-evento-modal',
  templateUrl: './editar-evento-modal.component.html',
  styleUrls: ['./editar-evento-modal.component.scss']
})
export class EditarEventoModalComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<EditarEventoModalComponent>,
    @Inject (MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
  }

  public cerrar_modal(){
    // Retornamos false indicando cancelación
    this.dialogRef.close({isConfirmed: false});
  }

  public confirmarEdicion(){
    // Retornamos true indicando que SÍ quiere editar
    this.dialogRef.close({isConfirmed: true});
  }
}

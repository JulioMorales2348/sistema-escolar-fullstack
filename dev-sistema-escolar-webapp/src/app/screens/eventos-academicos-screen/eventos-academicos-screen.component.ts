import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { EventosService } from 'src/app/services/eventos.service';
import { MatDialog } from '@angular/material/dialog';
import { EliminarEventoModalComponent } from 'src/app/modals/eliminar-evento-modal/eliminar-evento-modal.component';
import { EditarEventoModalComponent } from 'src/app/modals/editar-evento-modal/editar-evento-modal.component';

@Component({
  selector: 'app-eventos-academicos-screen',
  templateUrl: './eventos-academicos-screen.component.html',
  styleUrls: ['./eventos-academicos-screen.component.scss']
})
export class EventosAcademicosScreenComponent implements OnInit, AfterViewInit {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_eventos: any[] = [];
  public isAdmin: boolean = false;

  displayedColumns: string[] = ['nombre_evento', 'tipo_evento', 'fecha', 'horario', 'lugar', 'responsable'];

  dataSource = new MatTableDataSource<DatosEvento>([]);

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  constructor(
    private facadeService: FacadeService,
    private eventosService: EventosService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // Obtener información del usuario
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    // Verificar si el usuario es administrador
    const rolLimpio = (this.rol || '').toLowerCase().trim();
    this.isAdmin = (rolLimpio === 'administrador');
    // Agregar columnas de edición y eliminación si es administrador
    if(this.isAdmin){
      this.displayedColumns.push('editar', 'eliminar');
    }
    // Verificar token
    this.token = this.facadeService.getSessionToken();
    if(this.token == ""){
      this.router.navigate(["/"]);
    }

    this.obtenerEventos();
  }

  // Asignar paginador y sort después de que la vista se haya inicializado
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  // Filtrar tabla
  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Obtener lista de eventos
  public obtenerEventos() {
    this.eventosService.obtenerListaEventos().subscribe(
      (response) => {
        this.lista_eventos = response;
        console.log("Eventos obtenidos:", this.lista_eventos);
        if (this.lista_eventos.length > 0) {
          this.dataSource = new MatTableDataSource<DatosEvento>(this.lista_eventos as DatosEvento[]);
          this.dataSource.sortingDataAccessor = (data: any, sortHeaderId: string) => {
            switch (sortHeaderId) {
              case 'fecha':
                return new Date(data.fecha_realizacion).getTime();
              case 'horario':
                return data.hora_inicio;
              case 'nombre_evento':
              case 'tipo_evento':
              case 'lugar':
              case 'responsable':
                const value = (data as any)[sortHeaderId];
                return (typeof value === 'string') ? value.toLowerCase() : value;
              default:
                return (data as any)[sortHeaderId];
            }
          };
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          });
        }
      },
      (error) => {
        alert("No se pudo obtener la lista de eventos");
      }
    );
  }

  public goEditar(id: number) {
    const dialogRef = this.dialog.open(EditarEventoModalComponent, {
      data: { id: id },
      height: '288px',
      width: '328px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result && result.isConfirmed){
        this.router.navigate(["registro-eventos/"+id]);
      }
    });
  }

  public delete(idEvento: number) {
    const dialogRef = this.dialog.open(EliminarEventoModalComponent, {
      data: { id: idEvento },
      height: '288px',
      width: '328px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result && result.isDeleted){
        alert("Evento eliminado correctamente");
        this.obtenerEventos();
      }
    });
  }
}

export interface DatosEvento {
  id: number;
  nombre_evento: string;
  tipo_evento: string;
  fecha_realizacion: string;
  hora_inicio: string;
  hora_fin: string;
  lugar: string;
  responsable: string;
}

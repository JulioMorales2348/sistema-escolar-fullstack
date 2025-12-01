import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { MatDialog } from '@angular/material/dialog';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';

@Component({
  selector: 'app-alumnos-screen',
  templateUrl: './alumnos-screen.component.html',
  styleUrls: ['./alumnos-screen.component.scss']
})
export class AlumnosScreenComponent implements OnInit, AfterViewInit {
  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_alumnos: any[] = [];
  public isAdmin: boolean = false;

  displayedColumns: string[] = ['matricula', 'nombre', 'email', 'fecha_nacimiento', 'telefono', 'rfc', 'curp'];

  dataSource = new MatTableDataSource<DatosUsuario>([]);

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  constructor(
    public facadeService: FacadeService,
    public alumnosService: AlumnosService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();

    this.rol = this.facadeService.getUserGroup();
    const rolLimpio = (this.rol || '').toLowerCase().trim();

    this.isAdmin = (rolLimpio === 'administrador');

    if(this.isAdmin){
      this.displayedColumns.push('editar', 'eliminar');
    }

    this.token = this.facadeService.getSessionToken();
    console.log("Token: ", this.token);
    if(this.token == ""){
      this.router.navigate(["/"]);
    }
    this.obtenerAlumnos();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.sortingDataAccessor = (data: any, sortHeaderId: string) => {
      if (sortHeaderId === 'nombre') {
        const fn = (data.first_name || '').toString().trim().toLowerCase();
        const ln = (data.last_name || '').toString().trim().toLowerCase();
        return `${fn} ${ln}`;
      }
      const value = (data as any)[sortHeaderId];
      return (typeof value === 'string') ? value.toLowerCase() : value;
    };

    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const term = (filter || '').trim().toLowerCase();
      const searchable = `${data.first_name || ''} ${data.last_name || ''} ${data.email || ''} ${data.matricula || ''}`.toLowerCase();
      return searchable.indexOf(term) !== -1;
    };
  }

  public applyFilter(filterValue: string) {
    filterValue = filterValue.trim().toLowerCase();
    this.dataSource.filter = filterValue;
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  public obtenerAlumnos() {
    this.alumnosService.obtenerListaAlumnos().subscribe(
      (response) => {
        this.lista_alumnos = response;
        console.log("Lista users: ", this.lista_alumnos);
        if (this.lista_alumnos.length > 0) {
          this.lista_alumnos.forEach(usuario => {
            usuario.first_name = usuario.user.first_name;
            usuario.last_name = usuario.user.last_name;
            usuario.email = usuario.user.email;
          });
          console.log("Alumnos: ", this.lista_alumnos);

          this.dataSource = new MatTableDataSource<DatosUsuario>(this.lista_alumnos as DatosUsuario[]);

          // Reasignar sort y paginator aquí también por si acaso la data llega después del viewInit
          this.dataSource.sortingDataAccessor = (data: any, sortHeaderId: string) => {
            if (sortHeaderId === 'nombre') {
              const fn = (data.first_name || '').toString().trim().toLowerCase();
              const ln = (data.last_name || '').toString().trim().toLowerCase();
              return `${fn} ${ln}`;
            }
            const value = (data as any)[sortHeaderId];
            return (typeof value === 'string') ? value.toLowerCase() : value;
          };
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }
      }, (error) => {
        console.error("Error al obtener la lista de alumnos: ", error);
        alert("No se pudo obtener la lista de alumnos");
      }
    );
  }

  public goEditar(idUser: number) {
    this.router.navigate(["registro-usuarios/alumnos/" + idUser]);
  }

  public delete(idUser: number) {
    // Validación adicional de seguridad (aunque el botón esté oculto)
    if (this.isAdmin) {
      const dialogRef = this.dialog.open(EliminarUserModalComponent, {
        data: { id: idUser, rol: 'alumno' },
        height: '288px',
        width: '328px',
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result && result.isDelete) {
          console.log("Alumno eliminado");
          alert("Alumno eliminado correctamente");
          // Recargar la lista en lugar de toda la página es más elegante
          this.obtenerAlumnos();
        }
      });
    } else {
      alert("No tienes permisos para eliminar alumnos.");
    }
  }
}

export interface DatosUsuario {
  id: number;
  matricula: number;
  first_name: string;
  last_name: string;
  email: string;
  fecha_nacimiento: string;
  telefono: string;
  rfc: string;
  curp: string;
}

import { Component, OnInit } from '@angular/core';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-graficas-screen',
  templateUrl: './graficas-screen.component.html',
  styleUrls: ['./graficas-screen.component.scss']
})
export class GraficasScreenComponent implements OnInit {

  public total_user: any = {};
  public labels_usuarios: string[] = ["Administradores", "Maestros", "Alumnos"];
  public colores_usuarios: string[] = ['#FCFF44', '#F1C8F2', '#31E731'];

  // Esto permite que la gráfica se estire o encoja según el contenedor
  public commonOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      datalabels: {
        color: '#000',
        font: { weight: 'bold' }
      }
    }
  };

  // Histograma
  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: this.labels_usuarios,
    datasets: [{ data: [], label: 'Registro (Línea)', backgroundColor: '#F88406', fill: true, tension: 0.5 }]
  };
  lineChartOption = this.commonOptions;
  lineChartPlugins = [ DatalabelsPlugin ];

  // Barras
  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: this.labels_usuarios,
    datasets: [{ data: [], label: 'Usuarios por Rol', backgroundColor: ['#F88406', '#FCFF44', '#82D3FB'] }]
  };
  barChartOption = this.commonOptions;
  barChartPlugins = [ DatalabelsPlugin ];

  // Circular
  pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: this.labels_usuarios,
    datasets: [{ data: [], backgroundColor: this.colores_usuarios }]
  };
  pieChartOption = this.commonOptions;
  pieChartPlugins = [ DatalabelsPlugin ];

  // Doughnut
  doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: this.labels_usuarios,
    datasets: [{ data: [], backgroundColor: this.colores_usuarios }]
  };
  doughnutChartOption = this.commonOptions;
  doughnutChartPlugins = [ DatalabelsPlugin ];

  constructor(private administradoresServices: AdministradoresService) { }

  ngOnInit(): void {
    this.obtenerTotalUsers();
  }

  public obtenerTotalUsers(){
    this.administradoresServices.getTotalUsuarios().subscribe(
      (response) => {
        this.total_user = response;
        // Extraer datos
        const lista_datos = [response.admins, response.maestros, response.alumnos];
        // Actualizar todas las gráficas
        this.lineChartData = { ...this.lineChartData, datasets: [{ ...this.lineChartData.datasets[0], data: lista_datos }] };
        this.barChartData = { ...this.barChartData, datasets: [{ ...this.barChartData.datasets[0], data: lista_datos }] };
        this.pieChartData = { ...this.pieChartData, datasets: [{ ...this.pieChartData.datasets[0], data: lista_datos }] };
        this.doughnutChartData = { ...this.doughnutChartData, datasets: [{ ...this.doughnutChartData.datasets[0], data: lista_datos }] };

      }, (error) => {
        alert("No se pudo obtener el total de usuarios");
      }
    );
  }
}

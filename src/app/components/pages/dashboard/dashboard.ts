import { Component, inject, signal, effect } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';



type ResumoConsultasPorMedico = {
  nomeMedico: string;
  quantidadeConsultas: number;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterOutlet,
    Navbar,
    RouterLink,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  idClinica = 1;

  // Totais (cards)
  totalRedes = signal<number>(0);
  totalEquipamentos = signal<number>(0);
  

  // Mensagens
  mensagemMedicos = signal<string>('');
  mensagemPacientes = signal<string>('');
  mensagemConsultasHoje = signal<string>('');
  mensagemConsultasMes = signal<string>('');

  // Datas
  hoje = new Date();
  dataHoje = `${this.hoje.getFullYear()}-${String(this.hoje.getMonth() + 1).padStart(2, '0')}-${String(this.hoje.getDate()).padStart(2, '0')}`;

  primeiroDia = `${this.hoje.getFullYear()}-${String(this.hoje.getMonth() + 1).padStart(2, '0')}-01`;
  ultimoDia = `${this.hoje.getFullYear()}-${String(this.hoje.getMonth() + 1).padStart(2, '0')}-${String(new Date(this.hoje.getFullYear(), this.hoje.getMonth() + 1, 0).getDate()).padStart(2, '0')}`;

  // Lista de médicos pro select
  medicos = signal<any[]>([]);

  // Lista de consultas do dia (abaixo do select)
  consultasHoje = signal<any[]>([]);

  // Form do filtro
  formFiltroConsultas = this.fb.group({
    idMedico: [''] // '' = todos
  });

  // Resumo p/ gráfico
  quantidadeConsultasPorMedicoMes = signal<ResumoConsultasPorMedico[]>([]);



  
  ngOnInit() {
    this.consultarRedes();
    this.consultarEquipamentos();
  }

  // =======================
  // CARDS
  // =======================

  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////ConsultarRedes///////////////////////////////////////////////
  consultarRedes(pagina = 0) {
      const url = `${environment.api.listarRedes}?page=${pagina}&size=1`;
  
      this.http.get<any>(url).subscribe({
        next: (page) => {
          this.totalRedes.set(page.totalElements);
          //this.paginaAtual.set(page.number);
        },
        error: (e) => console.log(e)
      });
    }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////ConsultarEquipamento///////////////////////////////////////////////

  consultarEquipamentos(pagina = 0) {
    const url = `${environment.api.listarEquipamentos}?page=${pagina}&size=1`;

    this.http.get<any>(url).subscribe({
      next: (page) => {
        this.totalEquipamentos.set(page.totalElements);
        
      },error: (e) => console.log(e)
    });
  }


  // =======================
  // SELECT 
  // =======================
  carregarRedes() {
    
  }

  // =======================
  // LISTA REDE
  // =======================
  

  // =======================
  // RESUMO DO GRÁFICO
  // =======================
 

  // =======================
  // FUNÇÕES PURAS DO GRÁFICO
  // =======================
  private buildChartData(resumo: ResumoConsultasPorMedico[]) {
    return {
      categories: resumo.map(r => r.nomeMedico ?? 'Sem nome'),
      data: resumo.map(r => Number(r.quantidadeConsultas ?? 0)),
    };
  }

  
}
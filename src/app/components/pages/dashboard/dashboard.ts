import { Component, inject, signal, effect } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';



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
  totalMedicos = signal<number>(0);
  totalPacientes = signal<number>(0);
  totalConsultasHoje = signal<number>(0);
  totalConsultasMes = signal<number>(0);

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
    this.carregarTotalMedicosCard();
    this.consultarPacientes();
    this.buscarConsultasHoje();
    this.buscarConsultasMes();

    this.carregarMedicosAtivosSelect();
    this.buscarListaConsultasDoDia();
    this.buscarQuantidadeConsultasPorMedicoMes();

    this.formFiltroConsultas.get('idMedico')?.valueChanges.subscribe(() => {
      this.buscarListaConsultasDoDia();
    });
  }

  // =======================
  // CARDS
  // =======================

  carregarTotalMedicosCard() {
   
  }

  private readonly endPointPacientes = ``;

  consultarPacientes() {
    
  }

  private endpointBaseConsultasHoje = ``;

  buscarConsultasHoje() {
    const url = `${this.endpointBaseConsultasHoje}/${this.dataHoje}/${this.dataHoje}?page=0&size=1`;
    this.http.get(url).subscribe({
      next: (response: any) => this.totalConsultasHoje.set(response.totalElements),
      error: (e: any) => this.mensagemConsultasHoje.set((e.error?.message ? e.error.message + ' para hoje.' : '') || 'erro 1.')
    });
  }

  private endpointBaseConsultasMes = ``;

  buscarConsultasMes() {
    const url = `${this.endpointBaseConsultasMes}/${this.primeiroDia}/${this.ultimoDia}?page=0&size=1`;
    this.http.get(url).subscribe({
      next: (response: any) => this.totalConsultasMes.set(response.totalElements),
      error: (e: any) => this.mensagemConsultasMes.set((e.error?.message ? e.error.message + ' para este mês.' : '') || 'erro 2.')
    });
  }

  // =======================
  // SELECT MÉDICOS
  // =======================
  carregarMedicosAtivosSelect() {
    
  }

  // =======================
  // LISTA CONSULTAS DO DIA
  // =======================
  buscarListaConsultasDoDia() {
    const idMedico = this.formFiltroConsultas.get('idMedico')?.value;
    const dataInicio = this.dataHoje;
    const dataFim = this.dataHoje;

    const urlData = ``;
    const urlDataMedico = ``;

    const url = (idMedico === '' || idMedico == null) ? urlData : urlDataMedico;

    this.http.get(url).subscribe({
      next: (response: any) => this.consultasHoje.set(response.content || response || []),
      error: () => this.consultasHoje.set([])
    });
  }

  // =======================
  // RESUMO DO GRÁFICO
  // =======================
  buscarQuantidadeConsultasPorMedicoMes() {
    const endpoint = ``;

    this.http.get(endpoint).subscribe({
      next: (response: any) => {
        const lista = (response?.content ?? response ?? []) as ResumoConsultasPorMedico[];
        this.quantidadeConsultasPorMedicoMes.set(Array.isArray(lista) ? lista : []);
      },
      error: () => this.quantidadeConsultasPorMedicoMes.set([])
    });
  }

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
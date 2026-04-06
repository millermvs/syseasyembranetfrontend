import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, Navbar, RouterLink, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private http = inject(HttpClient);

  // ===========================
  // Signals de Totais
  // ===========================
  totalRedes       = signal<number>(0);
  totalEquipamentos = signal<number>(0);

  totalRedesAP      = signal<number>(0);
  totalRedesStation = signal<number>(0);

  equipamentosAP      = signal<number>(0);
  equipamentosStation = signal<number>(0);

  equipamentosSucesso = signal<number>(0);
  equipamentosFalha   = signal<number>(0);

  sinalBom   = signal<number>(0);  // >= -60 dBm
  sinalMedio = signal<number>(0);  // -61 a -70 dBm
  sinalRuim  = signal<number>(0);  // < -70 dBm
  sinalSemDado = signal<number>(0); // sem dado de sinal

  // Lista com resumo das redes (para tabela do dashboard)
  redesResumo = signal<any[]>([]);

  // Mensagem de erro geral
  mensagemErro = signal<string>('');

  // ===========================
  ngOnInit() {
    this.carregarRedes();
    this.carregarEquipamentos();
  }

  // ===========================
  // Carregar Redes
  // ===========================
  carregarRedes() {
    const url = `${environment.api.listarRedes}?page=0&size=200`;
    this.http.get<any>(url).subscribe({
      next: (page) => {
        const lista: any[] = page.content ?? [];

        this.totalRedes.set(page.totalElements ?? lista.length);

        const ap      = lista.filter(r => r.modoWireless === 'AP').length;
        const station = lista.filter(r => r.modoWireless === 'STATION').length;
        this.totalRedesAP.set(ap);
        this.totalRedesStation.set(station);

        // Ordena pelo maior número de equipamentos (top 8)
        const ordenadas = [...lista].sort((a, b) => b.totalEquipamentos - a.totalEquipamentos).slice(0, 8);
        this.redesResumo.set(ordenadas);
      },
      error: (e) => {
        console.error('Erro ao carregar redes:', e);
        this.mensagemErro.set('Não foi possível carregar os dados de redes.');
      }
    });
  }

  // ===========================
  // Carregar Equipamentos
  // ===========================
  carregarEquipamentos() {
    const url = `${environment.api.listarEquipamentos}?page=0&size=200`;
    this.http.get<any>(url).subscribe({
      next: (page) => {
        const lista: any[] = page.content ?? [];

        this.totalEquipamentos.set(page.totalElements ?? lista.length);

        // Modo
        const ap      = lista.filter(e => e.modoWireless === 'AP').length;
        const station = lista.filter(e => e.modoWireless === 'STATION').length;
        this.equipamentosAP.set(ap);
        this.equipamentosStation.set(station);

        // Status SNMP
        const sucesso = lista.filter(e => e.Status === 'SUCESSO').length;
        this.equipamentosSucesso.set(sucesso);
        this.equipamentosFalha.set(lista.length - sucesso);

        // Distribuição de sinal
        let bom = 0, medio = 0, ruim = 0, semDado = 0;
        lista.forEach(e => {
          if (!e.nivelDeSinal) { semDado++; return; }
          const dbm = parseInt(e.nivelDeSinal, 10);
          if (isNaN(dbm))       { semDado++; }
          else if (dbm >= -60)  { bom++; }
          else if (dbm >= -70)  { medio++; }
          else                  { ruim++; }
        });
        this.sinalBom.set(bom);
        this.sinalMedio.set(medio);
        this.sinalRuim.set(ruim);
        this.sinalSemDado.set(semDado);
      },
      error: (e) => {
        console.error('Erro ao carregar equipamentos:', e);
        this.mensagemErro.set('Não foi possível carregar os dados de equipamentos.');
      }
    });
  }

  // ===========================
  // Helpers de cálculo
  // ===========================

  /** Percentual de falha SNMP em relação ao total de equipamentos */
  taxaFalhaSNMP(): number {
    const total = this.totalEquipamentos();
    if (total === 0) return 0;
    return Math.round((this.equipamentosFalha() / total) * 100);
  }

  /** Percentual de uma fatia de sinal em relação ao total */
  pctSinal(qtd: number): number {
    const total = this.equipamentosSucesso(); // só equipamentos com SNMP ok têm sinal
    if (total === 0) return 0;
    return Math.round((qtd / total) * 100);
  }

  /** Cor do badge de status de falha SNMP */
  corTaxaFalha(): string {
    const taxa = this.taxaFalhaSNMP();
    if (taxa === 0)    return 'text-success';
    if (taxa <= 15)    return 'text-warning';
    return 'text-danger';
  }

  /** Cor do badge do modo wireless */
  corModo(modo: string): string {
    return modo === 'AP' ? 'badge-ap' : 'badge-station';
  }
}

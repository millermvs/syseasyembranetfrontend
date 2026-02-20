import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-redes',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './redes.html',
  styleUrl: './redes.css',
})
export class Redes {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  mensagemPagPrincipal = signal<string>('');
  mensagemModal = signal<string>('');
  tipoMensagem = signal<string>('');
  paginaAtual = signal<number>(0);        // página começa em 0 (Spring padrão)
  totalPaginas = signal<number>(0);       // vem do backend
  pageSize = 20;              // itens por página
  redesPage = signal<any | null>(null);
  dispositivosEncontrados = signal<any[]>([]);
  @ViewChild('btnCloseAddRede')     // fechar modal
  btnCloseAddRede!: ElementRef<HTMLButtonElement>; // fechar modal




  ngOnInit() {
    this.consultarRedes(0);
  }

  formAddRede = this.fb.group({
    rede: [
      '',
      [
        Validators.required,
        Validators.pattern(/^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.0$/)
      ]
    ]
  });

  consultarRedes(pagina = 0) {
    const url = `http://localhost:8080/api/v1/redes/listar?page=${pagina}&size=${this.pageSize}`;

    this.http.get<any>(url).subscribe({
      next: (page) => {
        this.redesPage.set(page);
        this.paginaAtual.set(page.number);
      },
      error: (e) => console.log(e)
    });
  }

  irParaPagina(pagina: number) {
    if (!this.redesPage()) return;
    if (pagina < 0) return;
    if (pagina >= (this.redesPage()!.totalPages ?? 1)) return;

    this.consultarRedes(pagina);
  }

  trackByRede = (_: number, item: any) => item.rede;

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////Limpar input ao fechar modal//////////////////////////////////////////

  ngAfterViewInit() {
    const modalEl = document.getElementById('modalAddRede');

    if (modalEl) {
      modalEl.addEventListener('hidden.bs.modal', () => {
        this.formAddRede.reset();
        this.mensagemModal.set('');
      });
    }
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////MetodoAddRede//////////////////////////////////////////

  adcionarRede() {
    this.http.post(`http://localhost:8080/api/v1/redes/cadastrar`, this.formAddRede.value).subscribe({
      next: (response: any) => {
        this.mensagemPagPrincipal.set("Rede " + response.rede + " cadastrada com sucesso!");
        this.tipoMensagem.set("success");
        this.consultarRedes(0);
        this.btnCloseAddRede.nativeElement.click();
        this.formAddRede.reset();
        setTimeout(() => this.mensagemPagPrincipal.set(''), 4000);
      },
      error: (error: any) => {
        console.error("Erro ao cadastrar rede:", error.error.message);
        this.mensagemModal.set(error.error.message || "Erro ao cadastrar rede. Tente novamente em alguns minutos.");
        this.tipoMensagem.set("danger");
      }
    });
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////MetodoMapearRede////////////////////////////////////////

  redeSelecionadaParaMapear: any = null;

  selecionarRedeParaMapear(rede: any) {
    // se "clicou de novo, desmarca"
    if (this.redeSelecionadaParaMapear?.idRede === rede.idRede) {
      this.redeSelecionadaParaMapear = null;
      return;
    }
    this.redeSelecionadaParaMapear = rede;
  }

  mapearRede() {
    this.http.post<any[]>(`http://localhost:8080/api/v1/redes/mapear/${this.redeSelecionadaParaMapear.idRede}`, {})
      .subscribe(response => {
        this.dispositivosEncontrados.set(response);
        this.redeSelecionadaParaMapear = null; // limpa a seleção após o mapeamento
      });
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////MetodoDelete//////////////////////////////////////////

  redeSelecionadaParaExcluir: any = null;

  selecionarRedeParaExcluir(rede: any) {
    this.redeSelecionadaParaExcluir = rede;
  }

  excluirRede() {
    if (!this.redeSelecionadaParaExcluir) return;

    this.http.delete(`http://localhost:8080/api/v1/redes/excluir?id=${this.redeSelecionadaParaExcluir.idRede}`).subscribe({
      next: (response: any) => {
        this.mensagemPagPrincipal.set("Rede " + response.rede + " excluída com sucesso!");
        this.tipoMensagem.set("success");
        setTimeout(() => this.mensagemPagPrincipal.set(''), 4000);
        this.consultarRedes(this.paginaAtual());
      },
      error: (error: any) => {
        console.log(error.error.message);
        this.mensagemPagPrincipal.set(error.error.message || "Erro ao excluir rede. Tente novamente em alguns minutos.");
        this.tipoMensagem.set("danger");
        setTimeout(() => this.mensagemPagPrincipal.set(''), 4000);
      }
    });
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////MetodoAddDispositivo////////////////////////////////////////

  adicionarDispositivo(d: any) {
    console.log("Adicionar:", d);
    // aqui depois chama sua API de salvar
  }
}

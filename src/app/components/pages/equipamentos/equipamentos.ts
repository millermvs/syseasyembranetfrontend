import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-equipamentos',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './equipamentos.html',
  styleUrl: './equipamentos.css',
})
export class Equipamentos {

  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  mensagemPagPrincipal = signal<string>('');
  mensagemModal = signal<string>('');
  tipoMensagem = signal<string>('');
  paginaAtual = signal<number>(0);
  equipamentosPage = signal<any | null>(null);
  mapeandoEquipamento = signal(false);
  ativarBodyPesquisa = signal<boolean>(false);

  pageSize = 20;

  @ViewChild('btnCloseAddEquipamento')
  btnCloseAddEquipamento!: ElementRef<HTMLButtonElement>;

  ngOnInit() {
    this.consultarEquipamentos(0);

    this.formAddEquipamento.get('ip')?.valueChanges.subscribe((novoIp) => {

      // limpa tudo EXCETO o próprio IP
      this.formAddEquipamento.patchValue({
        mac: '',
        nomeRadio: '',
        ssid: '',
        nivelDeSinal: '',
        canalRadio: '',
        macDoAp: ''
      });

      // limpa mensagens do modal também
      this.mensagemModal.set('');
    });
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////FormilarioPesquisar/MetodosPesquisar//////////////////////////////////////

  formPesquisarEquipamento = this.fb.group({
    ipPesquisa: ['', [
      Validators.required,
      Validators.pattern(
        /^(?!0\.0\.0\.0$)(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(?:[2-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-4])$/
      )
    ]]
  });

  pesquisarEquipamento() {
    console.log("Pesquisar por IP:", this.formPesquisarEquipamento.value.ipPesquisa);
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////FormilarioAdd/MetodosAdd//////////////////////////////////////

  formAddEquipamento = this.fb.group({
    ip: ['', [
      Validators.required,
      Validators.pattern(
        /^(?!0\.0\.0\.0$)(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(?:[2-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-4])$/
      )
    ]],
    mac: [''],
    nomeRadio: [''],
    ssid: [''],
    nivelDeSinal: [''],
    canalRadio: [''],
    macDoAp: [''],
  });

  adicionarEquipamento() {
    this.http.post(`http://localhost:8080/api/v1/equipamentos/cadastrar`, this.formAddEquipamento.value)
      .subscribe({
        next: (response: any) => {
          this.mensagemPagPrincipal.set("Equipamento " + response.ip + " cadastrado com sucesso!");
          this.tipoMensagem.set("success");
          this.consultarEquipamentos(0);
          this.btnCloseAddEquipamento.nativeElement.click();
          this.formAddEquipamento.reset();
          setTimeout(() => this.mensagemPagPrincipal.set(''), 4000);
        },
        error: (error: any) => {
          this.mensagemModal.set(error.error.message || "Erro ao cadastrar equipamento.");
          this.tipoMensagem.set("danger");
        }
      });
  }

  addBuscarInfoViaSNMP() {
    const ip = this.formAddEquipamento.get('ip')?.value;
    if (!ip) return;

    this.mapeandoEquipamento.set(true); // começa o loading

    this.http.get<any>(`http://localhost:8080/api/v1/equipamentos/mapear/${ip}`).subscribe({
      next: (response: any) => {
        this.mapeandoEquipamento.set(false); // termina o loading
        // preenche o formulário com o que veio do backend
        this.formAddEquipamento.patchValue({
          ip: response.ip ?? ip,
          mac: response.mac ?? '',
          nomeRadio: response.nomeRadio ?? '',
          ssid: response.ssid ?? '',
          nivelDeSinal: response.nivelDeSinal ?? '',
          canalRadio: response.canalRadio ?? '',
          macDoAp: response.macDoAp ?? '',
        });

        // opcional: mensagens no modal
        this.mensagemModal.set('Informações SNMP carregadas com sucesso!');
        this.tipoMensagem.set('success');
      },
      error: (error: any) => {
        this.mapeandoEquipamento.set(false); // termina o loading mesmo se der erro
        const msg =
          error?.error?.message ||
          error?.message ||
          'Erro ao buscar informações via SNMP.';

        this.mensagemModal.set(msg);
        this.tipoMensagem.set('danger');
      }
    });
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////FormilarioEditar/MetodosEditar//////////////////////////////////////
  formEditEquipamento = this.fb.group({
    ip: [{ value: '', disabled: true }],
    mac: [''],
    nomeRadio: [''],
    ssid: [''],
    nivelDeSinal: [''],
    canalRadio: [''],
    macDoAp: [''],
  });

  equipamentoSelecionadoParaEditar: any = null;

  @ViewChild('btnCloseEditEquipamento')
  btnCloseEditEquipamento!: ElementRef<HTMLButtonElement>;

  abrirModalEditarEquipamento(equip: any) {
    this.equipamentoSelecionadoParaEditar = equip;

    this.formEditEquipamento.reset({
      ip: equip.ip,
      mac: equip.mac,
      nomeRadio: equip.nomeRadio,
      ssid: equip.ssid,
      nivelDeSinal: equip.nivelDeSinal,
      canalRadio: equip.canalRadio,
      macDoAp: equip.macDoAp,
    });

    // força o estado inicial como pristine
    this.formEditEquipamento.markAsPristine();
    this.formEditEquipamento.markAsUntouched();

    this.mensagemModal.set('');
  }

  editarEquipamento() {
    if (!this.equipamentoSelecionadoParaEditar) return;

    const ip = this.equipamentoSelecionadoParaEditar.ip;
    const id = this.equipamentoSelecionadoParaEditar.id;

    const payload = {
      ip: ip,
      mac: this.formEditEquipamento.get('mac')?.value,
      nomeRadio: this.formEditEquipamento.get('nomeRadio')?.value,
      ssid: this.formEditEquipamento.get('ssid')?.value,
      nivelDeSinal: this.formEditEquipamento.get('nivelDeSinal')?.value,
      canalRadio: this.formEditEquipamento.get('canalRadio')?.value,
      macDoAp: this.formEditEquipamento.get('macDoAp')?.value,
    };

    this.http.put(`http://localhost:8080/api/v1/equipamentos/editar?id=${id}`, payload).subscribe({
      next: () => {
        this.mensagemPagPrincipal.set("Equipamento " + ip + " editado com sucesso!");
        this.tipoMensagem.set("success");
        this.consultarEquipamentos(this.paginaAtual());
        this.btnCloseEditEquipamento.nativeElement.click();
        setTimeout(() => this.mensagemPagPrincipal.set(''), 4000);
        this.equipamentoSelecionadoParaEditar = null;
      },
      error: (error: any) => {
        this.mensagemModal.set(error?.error?.message || "Erro ao editar equipamento.");
        this.tipoMensagem.set("danger");
      }
    });
  }

  editBuscarInfoViaSNMP() {
    if (!confirm(`Ao consultar via SNMP os dados serão salvos automaticamente. Tem certeza que deseja buscar informações via SNMP para o equipamento?`)) {
      return;
    }
    const ip = this.formEditEquipamento.get('ip')?.value;
    if (!ip) return;

    this.mapeandoEquipamento.set(true); // começa o loading

    this.http.get<any>(`http://localhost:8080/api/v1/equipamentos/mapear/${ip}`).subscribe({
      next: (response: any) => {
        this.mapeandoEquipamento.set(false); // termina o loading
        // preenche o formulário com o que veio do backend
        this.formEditEquipamento.patchValue({
          ip: response.ip ?? ip,
          mac: response.mac ?? '',
          nomeRadio: response.nomeRadio ?? '',
          ssid: response.ssid ?? '',
          nivelDeSinal: response.nivelDeSinal ?? '',
          canalRadio: response.canalRadio ?? '',
          macDoAp: response.macDoAp ?? '',
        });

        // opcional: mensagens no modal
        this.mensagemModal.set('Informações SNMP carregadas e salvas com sucesso!');
        this.tipoMensagem.set('success');
        setTimeout(() => this.mensagemModal.set(''), 3000);
      },
      error: (error: any) => {
        this.mapeandoEquipamento.set(false); // termina o loading mesmo se der erro
        const msg =
          error?.error?.message ||
          error?.message ||
          'Erro ao buscar informações via SNMP.';

        this.mensagemModal.set(msg);
        this.tipoMensagem.set('danger');
      }
    });
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////ConsultarEquipamento///////////////////////////////////////////////

  consultarEquipamentos(pagina = 0) {
    const url = `http://localhost:8080/api/v1/equipamentos/listar?page=${pagina}&size=${this.pageSize}`;

    this.http.get<any>(url).subscribe({
      next: (page) => {
        this.equipamentosPage.set(page);
        this.paginaAtual.set(page.number);
      },
      error: (e) => {
        console.log(e)
        this.mensagemPagPrincipal.set("Erro ao carregar equipamentos.");
        this.tipoMensagem.set("danger");
        setTimeout(() => this.mensagemPagPrincipal.set(''), 4000);
      }
    });
  }

  irParaPagina(pagina: number) {
    if (!this.equipamentosPage()) return;
    if (pagina < 0) return;
    if (pagina >= (this.equipamentosPage()!.totalPages ?? 1)) return;

    this.consultarEquipamentos(pagina);
  }

  trackByEquipamento = (_: number, item: any) => item.ip;

  ngAfterViewInit() {
    const modalEl = document.getElementById('modalAddEquipamento');

    if (modalEl) {
      modalEl.addEventListener('hidden.bs.modal', () => {
        this.formAddEquipamento.reset();
        this.mensagemModal.set('');
      });
    }
  }






  deletarEquipamento(equipamento: any) {
    if (!confirm(`Tem certeza que deseja deletar o equipamento ${equipamento.ip}?`)) {
      return;
    }
    console.log("Deletar equipamento:", equipamento);
  }

}
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-redes',
  imports: [CommonModule],
  templateUrl: './redes.html',
  styleUrl: './redes.css',
})
export class Redes {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  idClinica: number = 1;
  mensagemPagPrincipal = signal<string>('');
  mensagemModal = signal<string>('');
  tipoMensagem = signal<string>('');
  paginaAtual = signal<number>(0);        // página começa em 0 (Spring padrão)
  totalPaginas = signal<number>(0);       // vem do backend
  dispositivosEncontrados = signal<any[]>([]);
  

  ngOnInit() {
    
  }

  

  mapearRede(id: number) {
    this.http.post<any[]>(`http://localhost:8080/api/v1/redes/mapear/${id}`, {})
      .subscribe(response => {
        this.dispositivosEncontrados.set(response);
      });
  }

  adicionarDispositivo(d: any) {
    console.log("Adicionar:", d);
    // aqui depois você chama sua API de salvar
  }

}

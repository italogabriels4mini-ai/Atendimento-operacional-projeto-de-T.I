export interface Usuario {
    id: number;
    nome: string;
    email: string;
    tipo?: string;
  }
  
  export interface Chamado {
    id: number;
    titulo: string;
    descricao: string;
    status: string;
  }
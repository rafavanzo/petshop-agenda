const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const CHAVE_TOKEN = 'patinha.token';

export class ErroApi extends Error {
  status: number;

  constructor(status: number, mensagem: string) {
    super(mensagem);
    this.status = status;
  }
}

export const tokenStorage = {
  obter: () => localStorage.getItem(CHAVE_TOKEN),
  salvar: (token: string) => localStorage.setItem(CHAVE_TOKEN, token),
  limpar: () => localStorage.removeItem(CHAVE_TOKEN),
};

// Função chamada quando a sessão expira (registrada pelo AuthProvider)
let aoExpirarSessao: (() => void) | null = null;
export function definirAoExpirarSessao(funcao: () => void) {
  aoExpirarSessao = funcao;
}

interface Opcoes {
  metodo?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  corpo?: unknown;
}

export async function api<T>(caminho: string, opcoes: Opcoes = {}): Promise<T> {
  const token = tokenStorage.obter();

  const headers: Record<string, string> = {};
  if (opcoes.corpo !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let resposta: Response;
  try {
    resposta = await fetch(`${BASE_URL}${caminho}`, {
      method: opcoes.metodo ?? 'GET',
      headers,
      body: opcoes.corpo !== undefined ? JSON.stringify(opcoes.corpo) : undefined,
    });
  } catch {
    throw new ErroApi(
      0,
      'Não foi possível conectar ao servidor. Verifique se o backend está rodando.',
    );
  }

  // Sessão expirou ou foi encerrada (ex.: gerente desativou o usuário)
  if (resposta.status === 401 && token && caminho !== '/auth/login') {
    aoExpirarSessao?.();
  }

  if (resposta.status === 204) return undefined as T;

  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    // O Nest devolve "message" como texto ou como lista (erros de validação)
    const mensagem = Array.isArray(dados?.message)
      ? dados.message.join('\n')
      : (dados?.message ?? 'Erro inesperado. Tente novamente.');
    throw new ErroApi(resposta.status, mensagem);
  }

  return dados as T;
}

// Transforma qualquer erro em uma mensagem para mostrar na tela
export function mensagemDeErro(erro: unknown) {
  return erro instanceof ErroApi ? erro.message : 'Erro inesperado. Tente novamente.';
}
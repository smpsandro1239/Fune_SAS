import axios from 'axios';
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  getAccessToken,
  getRefreshToken,
  storeTokens,
  clearTokens,
  resolveFileUrl,
  formatBytes,
  apiErrorMessage,
} from './api';

describe('api token helpers', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('getAccessToken/getRefreshToken devolvem null sem tokens', () => {
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it('storeTokens guarda ambos os tokens no localStorage', () => {
    storeTokens({
      accessToken: 'acc-1',
      refreshToken: 'ref-1',
      accessExpiresIn: '15m',
      refreshExpiresIn: '7d',
    });
    expect(window.localStorage.getItem(ACCESS_TOKEN_KEY)).toBe('acc-1');
    expect(window.localStorage.getItem(REFRESH_TOKEN_KEY)).toBe('ref-1');
  });

  it('clearTokens remove ambos os tokens', () => {
    storeTokens({
      accessToken: 'acc-1',
      refreshToken: 'ref-1',
      accessExpiresIn: '15m',
      refreshExpiresIn: '7d',
    });
    clearTokens();
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });
});

describe('resolveFileUrl', () => {
  it('devolve string vazia para valores vazios', () => {
    expect(resolveFileUrl(null)).toBe('');
    expect(resolveFileUrl(undefined)).toBe('');
    expect(resolveFileUrl('')).toBe('');
  });

  it('devolve URLs absolutos intactos', () => {
    expect(resolveFileUrl('https://cdn.example.com/a.png')).toBe(
      'https://cdn.example.com/a.png',
    );
  });

  it('mapeia /uploads/X para o endpoint autenticado de documentos', () => {
    const url = resolveFileUrl('/uploads/abc.png');
    expect(url).toBe(`${'http://localhost:4000'}/documents/file/abc.png`);
  });

  it('prefixa a origem para caminhos relativos', () => {
    expect(resolveFileUrl('/other/path')).toBe('http://localhost:4000/other/path');
  });
});

describe('formatBytes', () => {
  it('formata zero bytes', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(null as unknown as number)).toBe('0 B');
  });

  it('formata unidades SI', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(1048576)).toBe('1.0 MB');
  });
});

describe('apiErrorMessage', () => {
  it('devolve a mensagem do erro axios (string)', () => {
    const error = new axios.AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
      status: 400,
      data: { message: 'Email incorreto' },
    } as never);
    expect(apiErrorMessage(error)).toBe('Email incorreto');
  });

  it('devolve a primeira mensagem quando o backend devolve um array', () => {
    const error = new axios.AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
      status: 400,
      data: { message: ['Campo obrigatório', 'Outro erro'] },
    } as never);
    expect(apiErrorMessage(error)).toBe('Campo obrigatório');
  });

  it('usa a mensagem de um Error comum', () => {
    expect(apiErrorMessage(new Error('Algo correu mal'))).toBe('Algo correu mal');
  });

  it('usa o fallback para erros desconhecidos', () => {
    expect(apiErrorMessage(null)).toBe('Ocorreu um erro. Tente novamente.');
    expect(apiErrorMessage('string err')).toBe('Ocorreu um erro. Tente novamente.');
  });
});

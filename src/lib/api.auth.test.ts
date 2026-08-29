let mockedInstance: {
  get: jest.Mock;
  post: jest.Mock;
  patch: jest.Mock;
  put: jest.Mock;
  delete: jest.Mock;
  interceptors: { request: { use: jest.Mock }; response: { use: jest.Mock } };
};
let apiService: typeof import('./api').apiService;

jest.mock('axios', () => {
  const actual = jest.requireActual('axios');
  const instance = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
  };
  mockedInstance = instance;
  return {
    ...actual,
    create: jest.fn(() => instance),
  };
});

const tokens = {
  accessToken: 'at',
  refreshToken: 'rt',
  accessExpiresIn: '15m',
  refreshExpiresIn: '7d',
};

describe('apiService.auth (camada HTTP)', () => {
  beforeAll(() => {
    apiService = require('./api').apiService;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('login chama POST /auth/login com email e password e devolve os tokens', async () => {
    mockedInstance.post.mockResolvedValue({ data: tokens });
    const result = await apiService.auth.login('a@b.pt', 'secret');

    expect(mockedInstance.post).toHaveBeenCalledWith('/auth/login', {
      email: 'a@b.pt',
      password: 'secret',
    });
    expect(result).toEqual(tokens);
  });

  it('register chama POST /auth/register com os dados e devolve os tokens', async () => {
    mockedInstance.post.mockResolvedValue({ data: tokens });
    const payload = {
      name: 'Ana',
      email: 'a@b.pt',
      password: 'Admin123!',
      agencyName: 'Funerária X',
      agencySlug: 'funeraria-x',
      agencyAddress: 'Rua 1',
      agencyLocation: 'Lisboa',
    };
    const result = await apiService.auth.register(payload);

    expect(mockedInstance.post).toHaveBeenCalledWith('/auth/register', payload);
    expect(result).toEqual(tokens);
  });

  it('logout chama POST /auth/logout com o refresh token', async () => {
    mockedInstance.post.mockResolvedValue({ data: { success: true } });
    const result = await apiService.auth.logout('rt-1');

    expect(mockedInstance.post).toHaveBeenCalledWith('/auth/logout', { refreshToken: 'rt-1' });
    expect(result).toEqual({ success: true });
  });

  it('me chama GET /auth/me e devolve o perfil', async () => {
    const profile = { id: 'u1', name: 'Ana' };
    mockedInstance.get.mockResolvedValue({ data: profile });
    const result = await apiService.auth.me();

    expect(mockedInstance.get).toHaveBeenCalledWith('/auth/me');
    expect(result).toEqual(profile);
  });

  it('refresh chama POST /auth/refresh com o refresh token', async () => {
    mockedInstance.post.mockResolvedValue({ data: tokens });
    const result = await apiService.auth.refresh('rt-1');

    expect(mockedInstance.post).toHaveBeenCalledWith('/auth/refresh', { refreshToken: 'rt-1' });
    expect(result).toEqual(tokens);
  });
});

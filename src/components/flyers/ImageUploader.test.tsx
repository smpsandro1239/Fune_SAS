import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ImageUploader from './ImageUploader';
import { useDropzone } from 'react-dropzone';

jest.mock('react-dropzone', () => ({
  useDropzone: jest.fn(),
}));

const useDropzoneMock = useDropzone as jest.Mock;

interface DropzoneOptions {
  onDrop: (accepted: File[], rejected: unknown[]) => void;
}

describe('ImageUploader', () => {
  const onUpload = jest.fn();
  const onClear = jest.fn();
  let dropzoneOptions: DropzoneOptions;

  beforeEach(() => {
    onUpload.mockClear();
    onClear.mockClear();
    useDropzoneMock.mockImplementation((opts: DropzoneOptions) => {
      dropzoneOptions = opts;
      return {
        getRootProps: () => ({}),
        getInputProps: () => ({}),
        open: jest.fn(),
      };
    });
  });

  it('mostra a label e o estado vazio', () => {
    render(
      <ImageUploader id="photo" label="Fotografia" onUpload={onUpload} onClear={onClear} />
    );
    expect(screen.getByText('Fotografia')).toBeInTheDocument();
    expect(screen.getByText('Arraste & solte ou clique para carregar')).toBeInTheDocument();
    expect(screen.getByText(/JPG, PNG ou WebP • máx. 5MB/)).toBeInTheDocument();
  });

  it('mostra o estado com imagem e o botão de remover', () => {
    render(
      <ImageUploader
        id="photo"
        label="Fotografia"
        value="data:image/png;base64,aaaa"
        onUpload={onUpload}
        onClear={onClear}
      />
    );
    expect(screen.getByAltText('Pré-visualização carregada')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Remover'));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('mostra erro quando o ficheiro é demasiado grande', () => {
    render(<ImageUploader id="photo" label="Fotografia" onUpload={onUpload} />);
    const bigFile = new File(['x'.repeat(6 * 1024 * 1024)], 'big.png', { type: 'image/png' });
    act(() => {
      dropzoneOptions.onDrop([], [{ file: bigFile }]);
    });
    expect(screen.getByRole('alert')).toHaveTextContent('Ficheiro demasiado grande (máx. 5MB).');
  });

  it('mostra erro quando o formato é inválido', () => {
    render(<ImageUploader id="photo" label="Fotografia" onUpload={onUpload} />);
    const badFile = new File(['x'], 'a.gif', { type: 'image/gif' });
    act(() => {
      dropzoneOptions.onDrop([], [{ file: badFile }]);
    });
    expect(screen.getByRole('alert')).toHaveTextContent('Formato inválido. Use JPG, PNG ou WebP.');
  });

  it('carrega um ficheiro aceite e chama onUpload com data URL', async () => {
    render(<ImageUploader id="photo" label="Fotografia" onUpload={onUpload} />);
    const okFile = new File(['hello'], 'a.png', { type: 'image/png' });
    act(() => {
      dropzoneOptions.onDrop([okFile], []);
    });
    await waitFor(() => expect(onUpload).toHaveBeenCalled());
    expect(onUpload.mock.calls[0][0]).toMatch(/^data:/);
  });
});

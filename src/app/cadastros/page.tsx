import CadastroMenu from '../../components/CadastroMenu';
import Menu from '../../components/menu';

export default function CadastrosPage() {
  return (
    <div className="flex h-screen">
        <Menu />
        <div className="container mx-auto p-4">
        <h1 className="text-2xl font-semibold mb-6">Cadastros</h1>
        <CadastroMenu />
        </div>
    </div>
  );
}

const baseUrl = 'http://localhost:8080/api/v1';
const baseUrlRedes = 'http://localhost:8080/api/v1/redes';
const baseUrlEquipamentos = 'http://localhost:8080/api/v1/equipamentos';

export const environment = {
  production: false,
  api: {
    listarRedes: `${baseUrlRedes}/listar`,
    cadastrarRede: `${baseUrlRedes}/cadastrar`,
    mapearRede: `${baseUrlRedes}/mapear`,
    excluirRede: `${baseUrlRedes}/excluir`,
    listarEquipamentos: `${baseUrlEquipamentos}/listar`,
    cadastrarEquipamento: `${baseUrlEquipamentos}/cadastrar`,
    mapearEquipamento: `${baseUrlEquipamentos}/mapear`,
    editarEquipamento: `${baseUrlEquipamentos}/editar`,
  }
};

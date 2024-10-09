// import React, { useState, useEffect } from 'react';
// import { RecepcaoConvenioPlanoCreateForm } from './';
// import { RecepcaoEditForm } from './recepcaoedit';
// import { Snackbar } from '../snackbar';

// interface ConveniosPlanosProps {
//   // recepcaoId: number;
// }

// const ConveniosPlanos: React.FC<ConveniosPlanosProps> = ({ recepcaoId }) => {
//   const [conveniosPlanos, setConveniosPlanos] = useState<RecepcaoConvenioPlano[]>([]);
//   const [selectedItems, setSelectedItems] = useState<number[]>([]);
//   const [snackbarMessage, setSnackbarMessage] = useState('');

//   useEffect(() => {
//     fetchConveniosPlanos();
//   }, [recepcaoId]);

//   const fetchConveniosPlanos = async () => {
//     try {
//       const response = await fetch(`/api/recepcao/${recepcaoId}/convenios-planos`);
//       const data: RecepcaoConvenioPlano[] = await response.json();
//       setConveniosPlanos(data);
//       setSelectedItems(data.filter(item => item.id !== 0).map(item => item.id));
//     } catch (error) {
//       console.error('Erro ao buscar dados:', error);
//       setSnackbarMessage('Erro ao carregar convênios e planos');
//     }
//   };

//   const handleItemChange = (itemId: number) => {
//     setSelectedItems(prev =>
//       prev.includes(itemId)
//         ? prev.filter(id => id !== itemId)
//         : [...prev, itemId]
//     );
//   };

//   const handleSave = async () => {
//     try {
//       const itemsToSave = conveniosPlanos.filter(item => selectedItems.includes(item.id) || item.id === 0);
//       await fetch(`/api/recepcao/${recepcaoId}/convenios-planos`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(itemsToSave),
//       });
//       setSnackbarMessage('Convênios e planos salvos com sucesso');
//     } catch (error) {
//       console.error('Erro ao salvar dados:', error);
//       setSnackbarMessage('Erro ao salvar convênios e planos');
//     }
//   };

//   return (
//     <div>
//       <h2>Convênios e Planos</h2>
//       {conveniosPlanos.map(item => (
//         <div key={item.id}>
//           <input
//             type="checkbox"
//             id={`item-${item.id}`}
//             checked={selectedItems.includes(item.id)}
//             onChange={() => handleItemChange(item.id)}
//           />
//           <label htmlFor={`item-${item.id}`}>
//             {item.convenio?.nomeConvenio} - {item.plano?.nomePlano}
//           </label>
//         </div>
//       ))}
//       <button onClick={handleSave}>Salvar</button>
      
//       <Snackbar message={snackbarMessage} onClose={() => setSnackbarMessage('')} type={'success'} progress={0} />
//     </div>
//   );
// };

// export default ConveniosPlanos;
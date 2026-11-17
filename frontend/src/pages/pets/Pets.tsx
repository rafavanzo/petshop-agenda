import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { api, mensagemDeErro } from '../../api/cliente';
import { useDebounce } from '../../hooks/useDebounce';
import { ROTULO_ESPECIE, ROTULO_PORTE } from '../../rotulos';
import type { Especie, Pet } from '../../types';
import { PetFormModal } from './PetFormModal';
import estilos from './Pets.module.css';

const FILTROS: { valor: Especie | ''; rotulo: string }[] = [
  { valor: '', rotulo: 'Todos' },
  { valor: 'CACHORRO', rotulo: 'Cães' },
  { valor: 'GATO', rotulo: 'Gatos' },
];

interface Resultado {
  chave: string;
  pets: Pet[];
  erro: string | null;
}

export function Pets() {
  const navegar = useNavigate();

  const [busca, setBusca] = useState('');
  const [especie, setEspecie] = useState<Especie | ''>('');
  const [formAberto, setFormAberto] = useState(false);
  const buscaAtrasada = useDebounce(busca.trim());

  // Monta "?busca=meg&especie=CACHORRO" só com o que foi preenchido
  const parametros = new URLSearchParams();
  if (buscaAtrasada) parametros.set('busca', buscaAtrasada);
  if (especie) parametros.set('especie', especie);
  const query = parametros.toString();

  const [resultado, setResultado] = useState<Resultado>({ chave: '-', pets: [], erro: null });

  useEffect(() => {
    let ativo = true;
    api<Pet[]>(`/pets${query ? `?${query}` : ''}`)
      .then((pets) => ativo && setResultado({ chave: query, pets, erro: null }))
      .catch((e) => ativo && setResultado({ chave: query, pets: [], erro: mensagemDeErro(e) }));
    return () => {
      ativo = false;
    };
  }, [query]);

  const carregando = resultado.chave !== query;
  const filtrando = Boolean(buscaAtrasada || especie);

  function aoCadastrar(pet: Pet) {
    setFormAberto(false);
    navegar(`/pets/${pet.id}`); // já abre a ficha do pet novo
  }

  return (
    <div className={estilos.pagina}>
      <div className={estilos.topo}>
        <div>
          <h1>Pets</h1>
          <p className={estilos.contagem} aria-live="polite">
            {carregando
              ? 'Buscando…'
              : `${resultado.pets.length} ${resultado.pets.length === 1 ? 'pet' : 'pets'}${filtrando ? ' encontrados' : ' cadastrados'}`}
          </p>
        </div>
        <button type="button" className="botao botao-primario" onClick={() => setFormAberto(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Novo pet
        </button>
      </div>

      <div className={estilos.filtros}>
        <label className={`campo ${estilos.busca}`}>
          Buscar
          <input
            type="search"
            placeholder="Nome do pet, do tutor ou telefone"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </label>

        <div className={estilos.chips} role="group" aria-label="Filtrar por espécie">
          {FILTROS.map((filtro) => (
            <button
              key={filtro.rotulo}
              type="button"
              className={`${estilos.chip} ${especie === filtro.valor ? estilos.chipAtivo : ''}`}
              aria-pressed={especie === filtro.valor}
              onClick={() => setEspecie(filtro.valor)}
            >
              {filtro.rotulo}
            </button>
          ))}
        </div>
      </div>

      {resultado.erro && (
        <div className="alerta-erro" role="alert">
          {resultado.erro}
        </div>
      )}

      <div className={`cartao ${estilos.tabelaCaixa}`} aria-busy={carregando}>
        {resultado.pets.length === 0 && !carregando ? (
          <p className={estilos.vazio}>
            {filtrando
              ? 'Nenhum pet encontrado com esses filtros.'
              : 'Nenhum pet cadastrado ainda. Clique em "Novo pet" para começar.'}
          </p>
        ) : (
          <table className={estilos.tabela}>
            <thead>
              <tr>
                <th scope="col">Pet</th>
                <th scope="col">Porte</th>
                <th scope="col">Tutor(a)</th>
                <th scope="col">
                  <span className={estilos.somenteLeitor}>Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {resultado.pets.map((pet) => (
                <tr key={pet.id}>
                  <td>
                    <div className={estilos.pet}>
                      <span className={estilos.avatar} aria-hidden="true">
                        {pet.nome.charAt(0)}
                      </span>
                      <div>
                        <Link to={`/pets/${pet.id}`} className={estilos.nome}>
                          {pet.nome}
                        </Link>
                        <span className={estilos.sub}>
                          {ROTULO_ESPECIE[pet.especie]}
                          {pet.raca && ` · ${pet.raca}`}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>{pet.porte ? ROTULO_PORTE[pet.porte] : <span className={estilos.sub}>—</span>}</td>
                  <td>
                    <span className={estilos.tutor}>{pet.tutorNome}</span>
                    <span className={estilos.sub}>{pet.tutorTelefone}</span>
                  </td>
                  <td className={estilos.colunaAcao}>
                    <Link to={`/pets/${pet.id}`} className="botao botao-secundario botao-pequeno">
                      Ver ficha
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <PetFormModal aberto={formAberto} aoFechar={() => setFormAberto(false)} aoSalvar={aoCadastrar} />
    </div>
  );
}
const normalizeStatus = (value) => {
  if (!value) return "ativo";
  return String(value).toLowerCase();
};

const normalizePerfil = (value) => {
  if (!value) return null;
  return String(value).toLowerCase();
};

const normalizeMedicamento = (value) => {
  if (!value) return null;
  const v = String(value).toLowerCase();
  if (v === "não") return "nao";
  return v;
};

const pessoasMapPayload = (payload) => ({
  ...payload,
  perfil: normalizePerfil(payload.perfil ?? payload.cargo ?? null),
  data_ingresso: payload.data_ingresso ?? payload.dataIngresso ?? null,
  status: normalizeStatus(payload.status),
  usa_medicamento: normalizeMedicamento(payload.usa_medicamento),
});

const empresasMapPayload = (payload) => ({
  ...payload,
  nome_fantasia: payload.nome_fantasia ?? payload.nomeFantasia ?? null,
  razao_social: payload.razao_social ?? payload.razaoSocial ?? null,
  nome_responsavel_rh:
    payload.nome_responsavel_rh ?? payload.nomeResponsavelRh ?? payload.contato_rh_nome ?? null,
  telefone_responsavel_rh:
    payload.telefone_responsavel_rh ?? payload.telefoneResponsavelRh ?? payload.contato_rh_telefone ?? null,
  email_responsavel_rh:
    payload.email_responsavel_rh ?? payload.emailResponsavelRh ?? payload.contato_rh_email ?? payload.email ?? null,
  status: normalizeStatus(payload.status),
});

const usuariosMapPayload = (payload) => ({
  ...payload,
  senha_hash: payload.senha_hash ?? payload.senha ?? null,
  nivel_acesso: payload.nivel_acesso ?? payload.nivel ?? null,
});

const funcoesMapPayload = (payload) => ({
  ...payload,
  titulo_funcao: payload.titulo_funcao ?? payload.titulo ?? null,
  status: normalizeStatus(payload.status),
});

const itensMapPayload = (payload) => ({
  ...payload,
  itens: payload.itens ?? payload.criterios ?? payload.tipo ?? null,
  status: normalizeStatus(payload.status),
});

export const entities = [
  {
    key: "pessoas",
    path: "pessoas",
    aliases: [],
    table: "pessoas",
    columns: [
      "id",
      "nome",
      "email",
      "telefone",
      "cpf",
      "perfil",
      "data_ingresso",
      "data_nascimento",
      "nome_responsavel",
      "telefone_responsavel",
      "usa_medicamento",
      "info_medicamentos",
      "status",
    ],
    requiredCreate: ["nome", "email", "status"],
    requiredUpdate: ["nome", "email", "status"],
    mapPayload: pessoasMapPayload,
  },
  {
    key: "empresas",
    path: "empresas",
    aliases: [],
    table: "empresas",
    columns: [
      "id",
      "nome_fantasia",
      "razao_social",
      "cnpj",
      "endereco",
      "telefone",
      "nome_responsavel_rh",
      "telefone_responsavel_rh",
      "email_responsavel_rh",
      "status",
    ],
    requiredCreate: ["razao_social", "cnpj", "status"],
    requiredUpdate: ["razao_social", "cnpj", "status"],
    mapPayload: empresasMapPayload,
  },
  {
    key: "usuarios",
    path: "usuarios",
    aliases: ["usuariosSistema"],
    table: "usuarios",
    columns: [
      "id",
      "nome",
      "email",
      "senha_hash",
      "token_recuperacao",
      "validade_token",
      "nivel_acesso",
    ],
    requiredCreate: ["nome", "email", "senha_hash"],
    requiredUpdate: ["nome", "email"],
    mapPayload: usuariosMapPayload,
  },
  {
    key: "funcoes-cargos",
    path: "funcoes-cargos",
    aliases: ["funcoes"],
    table: "funcoes_cargos",
    columns: ["id", "titulo_funcao", "departamento", "nivel", "descricao", "status"],
    requiredCreate: ["titulo_funcao", "status"],
    requiredUpdate: ["titulo_funcao", "status"],
    mapPayload: funcoesMapPayload,
  },
  {
    key: "itens-avaliacao",
    path: "itens-avaliacao",
    aliases: ["avaliacao"],
    table: "itens_avaliacao",
    columns: ["id", "itens", "status"],
    requiredCreate: ["itens", "status"],
    requiredUpdate: ["itens", "status"],
    mapPayload: itensMapPayload,
  },
  {
    key: "ficha-avaliacao-aluno-professor",
    path: "ficha-avaliacao-aluno-professor",
    aliases: [],
    table: "ficha_avaliacao_aluno_professor",
    columns: [
      "id",
      "tipo_avaliacao",
      "id_pessoa_aluno",
      "data_entrada",
      "data_avaliacao",
      "id_pessoa_professor",
    ],
    requiredCreate: ["tipo_avaliacao", "id_pessoa_aluno", "data_avaliacao", "id_pessoa_professor"],
    requiredUpdate: ["tipo_avaliacao", "id_pessoa_aluno", "data_avaliacao", "id_pessoa_professor"],
  },
  {
    key: "ficha-avaliacao-questionario",
    path: "ficha-avaliacao-questionario",
    aliases: ["avaliacaoExperiencia1", "avaliacaoExperiencia2"],
    table: "ficha_avaliacao_questionario",
    columns: [
      "id",
      "id_item",
      "id_ficha_avaliacao_aluno_prof",
      "resultado",
      "campo_pergunta1",
      "campo_pergunta2",
    ],
    requiredCreate: ["id_item", "id_ficha_avaliacao_aluno_prof"],
    requiredUpdate: ["id_item", "id_ficha_avaliacao_aluno_prof"],
  },
  {
    key: "ficha-acompanhamento",
    path: "ficha-acompanhamento",
    aliases: ["fichaAcompanhamento"],
    table: "ficha_acompanhamento",
    columns: ["id", "id_pessoa_aluno", "data_admissao", "data_visita", "id_empresa", "parecer_geral"],
    requiredCreate: ["id_pessoa_aluno", "data_visita", "id_empresa"],
    requiredUpdate: ["id_pessoa_aluno", "data_visita", "id_empresa"],
  },
  {
    key: "controle-interno-avaliacao-usuarios",
    path: "controle-interno-avaliacao-usuarios",
    aliases: ["controleInterno"],
    table: "controle_interno_avaliacao_usuarios",
    columns: [
      "id",
      "id_pessoa_aluno",
      "data_entrada",
      "dt_1_avaliacao",
      "dt_2_avaliacao",
      "dt_1_entrevista_pais",
      "dt_2_entrevista_pais",
      "resultado",
    ],
    requiredCreate: ["id_pessoa_aluno"],
    requiredUpdate: ["id_pessoa_aluno"],
  },
  {
    key: "lista-encaminhados",
    path: "lista-encaminhados",
    aliases: ["listaUsuariosEncaminhados"],
    table: "lista_encaminhados",
    columns: [
      "id",
      "id_pessoa_aluno",
      "data_entrada",
      "id_empresa",
      "id_funcao",
      "provavel_data_desligamento_ieedf",
    ],
    requiredCreate: ["id_pessoa_aluno", "id_empresa"],
    requiredUpdate: ["id_pessoa_aluno", "id_empresa"],
  },
];

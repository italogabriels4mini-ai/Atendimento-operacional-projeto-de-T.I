USE atendimento_operacional;

INSERT IGNORE INTO setores (nome, descricao) VALUES
('Tecnologia da Informação', 'Sistemas, acessos e suporte técnico'),
('Facilities', 'Manutenção predial e infraestrutura'),
('Recursos Humanos', 'Pessoas, documentos e benefícios'),
('Financeiro', 'Pagamentos, notas e reembolsos');

INSERT IGNORE INTO categorias (nome) VALUES
('Problema técnico'), ('Solicitação de documento'), ('Manutenção'), ('Dúvida operacional'),
('Acesso ao sistema'), ('Financeiro'), ('Recursos humanos'), ('Outros');

INSERT IGNORE INTO usuarios (nome, email, senha_hash, perfil, setor_id) VALUES
('Marina Albuquerque', 'admin@atendops.com', '$2b$10$ezA1bAVLZLxjd1xwDR249enVpci0lFIMv1jDL3/M/iVvzGAJy8KD6', 'admin', (SELECT id FROM setores WHERE nome = 'Tecnologia da Informação')),
('Rafael Nunes', 'atendente@atendops.com', '$2b$10$83tVnssVaMZzjfJ7OtVES.k/HRkbALrvn8BupXhBCJaT3cjuRlmBS', 'atendente', (SELECT id FROM setores WHERE nome = 'Tecnologia da Informação')),
('Camila Duarte', 'cliente@atendops.com', '$2b$10$QdhHR6J4B4JiPl/XMSWdWuBazeLdlN6JqwpzSBDibEGUkIOe/Er4a', 'cliente', NULL);

INSERT IGNORE INTO chamados (numero, titulo, descricao, categoria_id, prioridade, status, usuario_id, atendente_id, setor_id, prazo_atendimento, criado_em, atualizado_em) VALUES
('CH-24080101', 'Acesso ao portal corporativo', 'O portal informa senha inválida mesmo após a redefinição. Preciso acessar os relatórios da equipe ainda hoje.', (SELECT id FROM categorias WHERE nome = 'Acesso ao sistema'), 'Alta', 'Em atendimento', (SELECT id FROM usuarios WHERE email = 'cliente@atendops.com'), (SELECT id FROM usuarios WHERE email = 'atendente@atendops.com'), (SELECT id FROM setores WHERE nome = 'Tecnologia da Informação'), DATE_ADD(NOW(), INTERVAL 8 HOUR), DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_SUB(NOW(), INTERVAL 35 MINUTE)),
('CH-24073142', 'Comprovante de vínculo empregatício', 'Solicito o comprovante atualizado para apresentar em uma instituição de ensino.', (SELECT id FROM categorias WHERE nome = 'Solicitação de documento'), 'Normal', 'Aguardando resposta', (SELECT id FROM usuarios WHERE email = 'cliente@atendops.com'), (SELECT id FROM usuarios WHERE email = 'atendente@atendops.com'), (SELECT id FROM setores WHERE nome = 'Recursos Humanos'), DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 4 HOUR)),
('CH-24072908', 'Ar-condicionado da sala 04', 'O equipamento não está resfriando e a sala fica muito quente no período da tarde.', (SELECT id FROM categorias WHERE nome = 'Manutenção'), 'Urgente', 'Resolvido', (SELECT id FROM usuarios WHERE email = 'cliente@atendops.com'), (SELECT id FROM usuarios WHERE email = 'atendente@atendops.com'), (SELECT id FROM setores WHERE nome = 'Facilities'), DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
('CH-24072517', 'Reembolso de deslocamento', 'Preciso acompanhar o status do reembolso referente à visita de campo do mês passado.', (SELECT id FROM categorias WHERE nome = 'Financeiro'), 'Baixa', 'Encerrado', (SELECT id FROM usuarios WHERE email = 'cliente@atendops.com'), NULL, (SELECT id FROM setores WHERE nome = 'Financeiro'), DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY));

INSERT IGNORE INTO mensagens (chamado_id, usuario_id, conteudo, interna) SELECT c.id, u.id, 'Olá, já validei seu cadastro. Vou verificar o bloqueio no diretório e retorno em seguida.', 0 FROM chamados c JOIN usuarios u ON u.email = 'atendente@atendops.com' WHERE c.numero = 'CH-24080101';
INSERT IGNORE INTO mensagens (chamado_id, usuario_id, conteudo, interna) SELECT c.id, u.id, 'Aguardo o retorno. Obrigada!', 0 FROM chamados c JOIN usuarios u ON u.email = 'cliente@atendops.com' WHERE c.numero = 'CH-24080101';
INSERT IGNORE INTO mensagens (chamado_id, usuario_id, conteudo, interna) SELECT c.id, u.id, 'Chamado encerrado após confirmação do solicitante.', 0 FROM chamados c JOIN usuarios u ON u.email = 'atendente@atendops.com' WHERE c.numero = 'CH-24072517';

INSERT IGNORE INTO historico_chamados (chamado_id, usuario_id, status_anterior, status_novo, observacao) SELECT c.id, u.id, NULL, 'Aberto', 'Chamado criado pelo solicitante' FROM chamados c JOIN usuarios u ON u.email = 'cliente@atendops.com' WHERE c.numero IN ('CH-24080101', 'CH-24073142', 'CH-24072908', 'CH-24072517');
INSERT IGNORE INTO avaliacoes (chamado_id, usuario_id, nota, comentario) SELECT c.id, u.id, 5, 'Atendimento rápido e resolveu a situação.' FROM chamados c JOIN usuarios u ON u.email = 'cliente@atendops.com' WHERE c.numero = 'CH-24072517';

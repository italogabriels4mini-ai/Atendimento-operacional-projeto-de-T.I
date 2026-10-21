CREATE DATABASE IF NOT EXISTS atendimento_operacional CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE atendimento_operacional;

CREATE TABLE IF NOT EXISTS setores (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE,
  descricao VARCHAR(300) NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categorias (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(140) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  perfil ENUM('cliente', 'atendente', 'admin') NOT NULL DEFAULT 'cliente',
  setor_id INT UNSIGNED NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuarios_setor FOREIGN KEY (setor_id) REFERENCES setores(id) ON DELETE SET NULL,
  INDEX idx_usuarios_perfil (perfil),
  INDEX idx_usuarios_setor (setor_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS chamados (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  numero VARCHAR(30) NOT NULL UNIQUE,
  titulo VARCHAR(180) NOT NULL,
  descricao TEXT NOT NULL,
  categoria_id INT UNSIGNED NOT NULL,
  prioridade ENUM('Baixa', 'Normal', 'Alta', 'Urgente') NOT NULL DEFAULT 'Normal',
  status ENUM('Aberto', 'Em análise', 'Em atendimento', 'Aguardando resposta', 'Resolvido', 'Encerrado', 'Cancelado') NOT NULL DEFAULT 'Aberto',
  usuario_id INT UNSIGNED NOT NULL,
  atendente_id INT UNSIGNED NULL,
  setor_id INT UNSIGNED NULL,
  prazo_atendimento DATETIME NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  resolvido_em DATETIME NULL,
  encerrado_em DATETIME NULL,
  CONSTRAINT fk_chamados_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id),
  CONSTRAINT fk_chamados_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT fk_chamados_atendente FOREIGN KEY (atendente_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  CONSTRAINT fk_chamados_setor FOREIGN KEY (setor_id) REFERENCES setores(id) ON DELETE SET NULL,
  INDEX idx_chamados_status (status),
  INDEX idx_chamados_prioridade (prioridade),
  INDEX idx_chamados_usuario (usuario_id),
  INDEX idx_chamados_atendente (atendente_id),
  INDEX idx_chamados_prazo (prazo_atendimento)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS mensagens (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  chamado_id INT UNSIGNED NOT NULL,
  usuario_id INT UNSIGNED NOT NULL,
  conteudo TEXT NOT NULL,
  interna TINYINT(1) NOT NULL DEFAULT 0,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_mensagens_chamado FOREIGN KEY (chamado_id) REFERENCES chamados(id) ON DELETE CASCADE,
  CONSTRAINT fk_mensagens_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  INDEX idx_mensagens_chamado_data (chamado_id, criado_em)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS historico_chamados (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  chamado_id INT UNSIGNED NOT NULL,
  usuario_id INT UNSIGNED NOT NULL,
  status_anterior VARCHAR(40) NULL,
  status_novo VARCHAR(40) NOT NULL,
  observacao VARCHAR(500) NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_historico_chamado FOREIGN KEY (chamado_id) REFERENCES chamados(id) ON DELETE CASCADE,
  CONSTRAINT fk_historico_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  INDEX idx_historico_chamado_data (chamado_id, criado_em)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS avaliacoes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  chamado_id INT UNSIGNED NOT NULL UNIQUE,
  usuario_id INT UNSIGNED NOT NULL,
  nota TINYINT UNSIGNED NOT NULL,
  comentario VARCHAR(500) NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_avaliacoes_nota CHECK (nota BETWEEN 1 AND 5),
  CONSTRAINT fk_avaliacoes_chamado FOREIGN KEY (chamado_id) REFERENCES chamados(id) ON DELETE CASCADE,
  CONSTRAINT fk_avaliacoes_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  INDEX idx_avaliacoes_nota (nota)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notificacoes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  chamado_id INT UNSIGNED NULL,
  titulo VARCHAR(160) NOT NULL,
  mensagem VARCHAR(500) NOT NULL,
  lida TINYINT(1) NOT NULL DEFAULT 0,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notificacoes_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_notificacoes_chamado FOREIGN KEY (chamado_id) REFERENCES chamados(id) ON DELETE SET NULL,
  INDEX idx_notificacoes_usuario_lida (usuario_id, lida, criado_em)
) ENGINE=InnoDB;

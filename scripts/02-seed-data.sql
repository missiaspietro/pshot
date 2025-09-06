-- Dados iniciais para o sistema

-- Inserir usuário admin padrão
-- IMPORTANTE: Altere as senhas padrão em produção!
-- Use senhas seguras e criptografadas em ambiente de produção
INSERT INTO users (name, email, password, access_level, store_id) VALUES
('Administrador', 'admin@[your-domain].com', '[CHANGE-THIS-PASSWORD]', 'admin', 1),
('João Silva', 'joao@[your-domain].com', '[CHANGE-THIS-PASSWORD]', 'gerente', 1),
('Maria Santos', 'maria@[your-domain].com', '[CHANGE-THIS-PASSWORD]', 'vendedor', 2);

-- Inserir algumas pesquisas de exemplo
INSERT INTO surveys (title, description, questions, created_by) VALUES
('Pesquisa de Satisfação', 'Avaliação do atendimento ao cliente', 
 '[{"question": "Como foi o atendimento?", "options": ["Ótimo", "Bom", "Regular", "Ruim"]}, {"question": "Recomendaria nossa loja?", "options": ["Sim", "Não", "Talvez", "Não sei"]}]',
 (SELECT id FROM users WHERE email = 'admin@sistema.com' LIMIT 1));

-- Inserir algumas promoções de exemplo
INSERT INTO promotions (title, description, image_url, store_id, created_by) VALUES
('Promoção de Verão', 'Descontos especiais para o verão', '/placeholder.svg?height=200&width=300', 1,
 (SELECT id FROM users WHERE email = 'admin@sistema.com' LIMIT 1)),
('Black Friday', 'Ofertas imperdíveis da Black Friday', '/placeholder.svg?height=200&width=300', 2,
 (SELECT id FROM users WHERE email = 'admin@sistema.com' LIMIT 1));

-- Inserir alguns aniversariantes
INSERT INTO birthdays (name, birth_date, store_id) VALUES
('Carlos Oliveira', '1990-03-15', 1),
('Ana Costa', '1985-07-22', 2),
('Pedro Almeida', '1992-11-08', 1);

-- Inserir alguns robôs
INSERT INTO robots (name, status, store_id) VALUES
('Robô Loja 1', 'connected', 1),
('Robô Loja 2', 'disconnected', 2),
('Robô Loja 3', 'connected', 3);

-- Inserir algumas respostas de pesquisa
INSERT INTO survey_responses (survey_id, customer_name, customer_phone, store_id, question_step, question, answer, salesperson, cashier) VALUES
((SELECT id FROM surveys LIMIT 1), 'Cliente Teste', '(11) 99999-9999', 1, 1, 'Como foi o atendimento?', 'Ótimo', 'João Silva', 'Maria Santos'),
((SELECT id FROM surveys LIMIT 1), 'Cliente Teste 2', '(11) 88888-8888', 2, 1, 'Como foi o atendimento?', 'Bom', 'Ana Costa', 'Pedro Almeida');

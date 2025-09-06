-- Script para inserir dados de teste na tabela relatorio_niver_decor_fabril

INSERT INTO public.relatorio_niver_decor_fabril 
(criado_em, cliente, "whatsApp", mensagem_entrege, mensagem_perdida, rede, loja, obs, "Sub_Rede")
VALUES 
('2024-01-15', 'João Silva', '11999999999', 'Parabéns pelo seu aniversário!', null, 'rede_teste', 'Loja 1', 'Cliente VIP', 'Sub-rede A'),
('2024-01-16', 'Maria Santos', '11888888888', 'Feliz aniversário!', null, 'rede_teste', 'Loja 2', null, 'Sub-rede B'),
('2024-01-17', 'Pedro Costa', '11777777777', null, 'Mensagem não entregue', 'rede_teste', 'Loja 1', 'Número inválido', 'Sub-rede A'),
('2024-01-18', 'Ana Oliveira', '11666666666', 'Parabéns!', null, 'rede_teste', 'Loja 3', null, 'Sub-rede C'),
('2024-01-19', 'Carlos Ferreira', '11555555555', 'Feliz aniversário!', null, 'rede_teste', 'Loja 2', 'Cliente especial', 'Sub-rede B'),
('2024-02-01', 'Lucia Mendes', '11444444444', 'Parabéns pelo seu dia!', null, 'rede_teste', 'Loja 1', null, 'Sub-rede A'),
('2024-02-02', 'Roberto Lima', '11333333333', null, 'Bot desconectado', 'rede_teste', 'Loja 3', 'Falha técnica', 'Sub-rede C'),
('2024-02-03', 'Fernanda Rocha', '11222222222', 'Feliz aniversário!', null, 'rede_teste', 'Loja 2', null, 'Sub-rede B'),
('2024-02-04', 'Marcos Alves', '11111111111', 'Parabéns!', null, 'rede_teste', 'Loja 1', 'Cliente fidelizado', 'Sub-rede A'),
('2024-02-05', 'Patricia Souza', '11000000000', 'Feliz aniversário!', null, 'rede_teste', 'Loja 3', null, 'Sub-rede C');

-- Inserir alguns dados com datas mais recentes
INSERT INTO public.relatorio_niver_decor_fabril 
(criado_em, cliente, "whatsApp", mensagem_entrege, mensagem_perdida, rede, loja, obs, "Sub_Rede")
VALUES 
(CURRENT_DATE - INTERVAL '5 days', 'Cliente Recente 1', '11999000001', 'Mensagem enviada', null, 'rede_teste', 'Loja 1', 'Teste recente', 'Sub-rede A'),
(CURRENT_DATE - INTERVAL '4 days', 'Cliente Recente 2', '11999000002', 'Mensagem enviada', null, 'rede_teste', 'Loja 2', 'Teste recente', 'Sub-rede B'),
(CURRENT_DATE - INTERVAL '3 days', 'Cliente Recente 3', '11999000003', null, 'Falha na entrega', 'rede_teste', 'Loja 3', 'Teste recente', 'Sub-rede C'),
(CURRENT_DATE - INTERVAL '2 days', 'Cliente Recente 4', '11999000004', 'Mensagem enviada', null, 'rede_teste', 'Loja 1', 'Teste recente', 'Sub-rede A'),
(CURRENT_DATE - INTERVAL '1 day', 'Cliente Recente 5', '11999000005', 'Mensagem enviada', null, 'rede_teste', 'Loja 2', 'Teste recente', 'Sub-rede B');
-- Criar tabelas faltantes para o dashboard profissional

-- Tabela de sessões de psicologia
CREATE TABLE public.psychology_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  professional_id UUID NOT NULL,
  session_date DATE NOT NULL,
  session_notes TEXT,
  mood_before INTEGER CHECK (mood_before >= 1 AND mood_before <= 5),
  mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de metas psicológicas
CREATE TABLE public.psychology_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  professional_id UUID NOT NULL,
  goal_title TEXT NOT NULL,
  goal_description TEXT,
  target_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de frases motivacionais
CREATE TABLE public.motivational_phrases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phrase TEXT NOT NULL,
  author TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de relatórios dos clientes
CREATE TABLE public.client_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  professional_id UUID NOT NULL,
  report_type TEXT NOT NULL,
  report_data JSONB,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.psychology_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychology_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motivational_phrases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_reports ENABLE ROW LEVEL SECURITY;

-- Políticas para psychology_sessions
CREATE POLICY "Clients can view their own psychology sessions" 
ON public.psychology_sessions 
FOR SELECT 
USING (auth.uid() = client_id);

CREATE POLICY "Professionals can view their client psychology sessions" 
ON public.psychology_sessions 
FOR SELECT 
USING (auth.uid() = professional_id);

CREATE POLICY "Professionals can create psychology sessions" 
ON public.psychology_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Professionals can update psychology sessions" 
ON public.psychology_sessions 
FOR UPDATE 
USING (auth.uid() = professional_id);

-- Políticas para psychology_goals
CREATE POLICY "Clients can view their own psychology goals" 
ON public.psychology_goals 
FOR SELECT 
USING (auth.uid() = client_id);

CREATE POLICY "Professionals can view their client psychology goals" 
ON public.psychology_goals 
FOR SELECT 
USING (auth.uid() = professional_id);

CREATE POLICY "Professionals can create psychology goals" 
ON public.psychology_goals 
FOR INSERT 
WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Professionals can update psychology goals" 
ON public.psychology_goals 
FOR UPDATE 
USING (auth.uid() = professional_id);

-- Políticas para motivational_phrases (leitura pública)
CREATE POLICY "Everyone can view motivational phrases" 
ON public.motivational_phrases 
FOR SELECT 
USING (true);

-- Políticas para client_reports
CREATE POLICY "Clients can view their own reports" 
ON public.client_reports 
FOR SELECT 
USING (auth.uid() = client_id);

CREATE POLICY "Professionals can view their client reports" 
ON public.client_reports 
FOR SELECT 
USING (auth.uid() = professional_id);

CREATE POLICY "Professionals can create client reports" 
ON public.client_reports 
FOR INSERT 
WITH CHECK (auth.uid() = professional_id);

-- Triggers para updated_at
CREATE TRIGGER update_psychology_sessions_updated_at
BEFORE UPDATE ON public.psychology_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_psychology_goals_updated_at
BEFORE UPDATE ON public.psychology_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir algumas frases motivacionais iniciais
INSERT INTO public.motivational_phrases (phrase, author, category) VALUES
('O sucesso é a soma de pequenos esforços repetidos dia após dia.', 'Robert Collier', 'motivação'),
('Você é mais corajoso do que acredita, mais forte do que parece e mais inteligente do que pensa.', 'A.A. Milne', 'autoestima'),
('A disciplina é a ponte entre metas e conquistas.', 'Jim Rohn', 'disciplina'),
('Não espere por oportunidades extraordinárias. Agarre ocasiões comuns e as torne grandes.', 'Orison Swett Marden', 'oportunidade'),
('O corpo consegue. É a mente que você tem que convencer.', 'Desconhecido', 'fitness');
-- Create questionnaire questions table
CREATE TABLE IF NOT EXISTS public.questionnaire_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Accountability', 'Decision-making', 'Process efficiency', 'Communication', 'Role-specific KPIs')),
  role TEXT NOT NULL CHECK (role IN ('Admin', 'HR', 'Team_Lead', 'Team_Member')),
  is_predefined BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questionnaire responses table
CREATE TABLE IF NOT EXISTS public.questionnaire_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questionnaire_questions(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questionnaire_questions_role ON public.questionnaire_questions(role);
CREATE INDEX IF NOT EXISTS idx_questionnaire_questions_category ON public.questionnaire_questions(category);
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_user_id ON public.questionnaire_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_question_id ON public.questionnaire_responses(question_id);

-- Enable RLS
ALTER TABLE public.questionnaire_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for questionnaire_questions
CREATE POLICY "Users can view questions for their role" ON public.questionnaire_questions
  FOR SELECT USING (
    role = (SELECT get_user_role(auth.uid()))
  );

CREATE POLICY "Admins can view all questions" ON public.questionnaire_questions
  FOR SELECT USING (
    is_admin(auth.uid())
  );

CREATE POLICY "Users can create custom questions" ON public.questionnaire_questions
  FOR INSERT WITH CHECK (
    created_by = auth.uid() AND is_predefined = false
  );

-- RLS Policies for questionnaire_responses
CREATE POLICY "Users can view their own responses" ON public.questionnaire_responses
  FOR SELECT USING (
    user_id = auth.uid()
  );

CREATE POLICY "Admins can view all responses" ON public.questionnaire_responses
  FOR SELECT USING (
    is_admin(auth.uid())
  );

CREATE POLICY "Users can insert their own responses" ON public.questionnaire_responses
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
  );

CREATE POLICY "Users can update their own responses" ON public.questionnaire_responses
  FOR UPDATE USING (
    user_id = auth.uid()
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_questionnaire_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_questionnaire_questions_updated_at
  BEFORE UPDATE ON public.questionnaire_questions
  FOR EACH ROW EXECUTE FUNCTION update_questionnaire_updated_at();

CREATE TRIGGER update_questionnaire_responses_updated_at
  BEFORE UPDATE ON public.questionnaire_responses
  FOR EACH ROW EXECUTE FUNCTION update_questionnaire_updated_at(); 
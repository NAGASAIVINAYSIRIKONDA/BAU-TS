-- Create table to track user-specific question stats
CREATE TABLE IF NOT EXISTS public.user_question_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  last_asked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, question)
);

-- Create a function to increment or insert question count
CREATE OR REPLACE FUNCTION public.increment_user_question_count(user_id UUID, question TEXT)
RETURNS VOID AS $$
BEGIN
  LOOP
    -- Try to update the count
    UPDATE public.user_question_stats
    SET count = count + 1, last_asked_at = NOW()
    WHERE user_id = increment_user_question_count.user_id
      AND question = increment_user_question_count.question;
    IF FOUND THEN
      RETURN;
    END IF;
    -- Not found, try to insert
    BEGIN
      INSERT INTO public.user_question_stats(user_id, question, count, last_asked_at)
      VALUES (user_id, question, 1, NOW());
      RETURN;
    EXCEPTION WHEN unique_violation THEN
      -- Do nothing, will retry
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
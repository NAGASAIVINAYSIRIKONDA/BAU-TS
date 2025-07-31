import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { QuestionnaireService } from '@/hooks/questionnaire/questionnaireService';
import { Question, QuestionnaireResponse } from '@/types/questionnaire';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

const questionnaireService = new QuestionnaireService();

export default function Questionnaire() {
  const { user } = useAuth();
  const { role } = useUserRole();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCustomQuestionForm, setShowCustomQuestionForm] = useState(false);
  const [customQuestion, setCustomQuestion] = useState({
    text: '',
    category: 'Accountability' as const
  });

  useEffect(() => {
    if (user && role) {
      loadQuestions();
    }
  }, [user, role]);

  const loadQuestions = async () => {
    try {
      const allQuestions = await questionnaireService.getAllQuestionsForRole(role!, user!.id);
      setQuestions(allQuestions);
      
      // Load existing responses
      const existingResponses = await questionnaireService.getUserResponses(user!.id);
      const responseMap: Record<string, string> = {};
      existingResponses.forEach(response => {
        responseMap[response.questionId] = response.answer;
      });
      setResponses(responseMap);
    } catch (error) {
      console.error('Error loading questions:', error);
      toast({
        title: "Error",
        description: "Failed to load questions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId: string, answer: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    setSubmitting(true);
    try {
      const responsePromises = Object.entries(responses).map(([questionId, answer]) =>
        questionnaireService.submitResponse({
          userId: user.id,
          questionId,
          answer
        })
      );

      await Promise.all(responsePromises);
      
      toast({
        title: "Success",
        description: "Your responses have been saved successfully!"
      });
    } catch (error) {
      console.error('Error submitting responses:', error);
      toast({
        title: "Error",
        description: "Failed to save responses",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddCustomQuestion = async () => {
    if (!user || !role || !customQuestion.text.trim()) return;

    try {
      const newQuestion = await questionnaireService.addCustomQuestion({
        text: customQuestion.text,
        category: customQuestion.category,
        role: role as any,
        isPredefined: false,
        createdBy: user.id
      });

      setQuestions(prev => [newQuestion, ...prev]);
      setCustomQuestion({ text: '', category: 'Accountability' });
      setShowCustomQuestionForm(false);
      
      toast({
        title: "Success",
        description: "Custom question added successfully!"
      });
    } catch (error) {
      console.error('Error adding custom question:', error);
      toast({
        title: "Error",
        description: "Failed to add custom question",
        variant: "destructive"
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Accountability': 'bg-blue-100 text-blue-800',
      'Decision-making': 'bg-green-100 text-green-800',
      'Process efficiency': 'bg-purple-100 text-purple-800',
      'Communication': 'bg-orange-100 text-orange-800',
      'Role-specific KPIs': 'bg-red-100 text-red-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Role-Based Questionnaire</h1>
        <p className="text-muted-foreground">
          Complete the questionnaire for your role: <Badge variant="secondary">{role}</Badge>
        </p>
      </div>

      {/* Custom Question Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Add Custom Question
            <Button
              variant="outline"
              onClick={() => setShowCustomQuestionForm(!showCustomQuestionForm)}
            >
              {showCustomQuestionForm ? 'Cancel' : 'Add Question'}
            </Button>
          </CardTitle>
        </CardHeader>
        {showCustomQuestionForm && (
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Question Text</label>
              <Textarea
                placeholder="Enter your custom question..."
                value={customQuestion.text}
                onChange={(e) => setCustomQuestion(prev => ({ ...prev, text: e.target.value }))}
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Select
                value={customQuestion.category}
                onValueChange={(value: any) => setCustomQuestion(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Accountability">Accountability</SelectItem>
                  <SelectItem value="Decision-making">Decision-making</SelectItem>
                  <SelectItem value="Process efficiency">Process efficiency</SelectItem>
                  <SelectItem value="Communication">Communication</SelectItem>
                  <SelectItem value="Role-specific KPIs">Role-specific KPIs</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddCustomQuestion} disabled={!customQuestion.text.trim()}>
              Add Question
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((question) => (
          <Card key={question.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{question.text}</CardTitle>
                  <div className="flex gap-2">
                    <Badge className={getCategoryColor(question.category)}>
                      {question.category}
                    </Badge>
                    {question.isPredefined ? (
                      <Badge variant="outline">Predefined</Badge>
                    ) : (
                      <Badge variant="secondary">Custom</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter your response..."
                value={responses[question.id] || ''}
                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                rows={4}
                className="w-full"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submit Button */}
      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={submitting || Object.keys(responses).length === 0}
          size="lg"
        >
          {submitting ? 'Saving...' : 'Save Responses'}
        </Button>
      </div>
    </div>
  );
} 
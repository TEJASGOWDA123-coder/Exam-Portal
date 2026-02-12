import { Question } from "@/hooks/contexts/ExamContext";
import { Label } from "@/components/ui/label";

interface QuestionCardProps {
  question: Question;
  index: number;
  total: number;
  selectedAnswer: number | number[] | string | null;
  onSelect: (answer: number | string) => void;
}

export default function QuestionCard({
  question,
  index,
  total,
  selectedAnswer,
  onSelect,
}: QuestionCardProps) {
  const isMulti = Array.isArray(question.correctAnswer);

  const isSelected = (i: number) => {
    if (selectedAnswer === null || selectedAnswer === undefined) return false;
    if (Array.isArray(selectedAnswer)) return selectedAnswer.includes(i);
    return selectedAnswer === i;
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-medium text-muted-foreground">
          Question {index + 1} of {total}
          {isMulti && (
            <span className="ml-2 text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
              Select multiple
            </span>
          )}
        </span>
        <div className="h-1.5 flex-1 mx-4 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full gradient-primary rounded-full transition-all duration-500"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-4">
        {question.question}
      </h2>

      {question.questionImage && (
        <div className="mb-6 rounded-xl overflow-hidden border border-border bg-muted/20">
          <img src={question.questionImage} alt="Question" className="w-full object-contain max-h-[350px]" />
        </div>
      )}

      {question.type !== "text" ? (
        <div className="space-y-3">
          {question.options?.map((opt, i) => (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 font-medium ${isSelected(i)
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted"
                }`}
            >
              <div className="flex items-start gap-4">
                <span className="inline-flex items-center justify-center min-w-[32px] h-8 rounded-full bg-muted text-sm font-bold">
                  {i + 1}
                </span>
                <div className="flex-1">
                  {opt.text && <div className="mb-2">{opt.text}</div>}
                  {opt.image && (
                    <div className="rounded-lg overflow-hidden border border-border/50 max-w-[250px] bg-white">
                      <img src={opt.image} alt={`Option ${i + 1}`} className="w-full object-contain" />
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <Label className="text-sm font-medium text-muted-foreground">Your Answer</Label>
          <textarea
            className="w-full min-h-[120px] p-4 rounded-xl border-2 border-border bg-background focus:border-primary focus:ring-0 outline-none transition-all"
            placeholder="Type your answer here..."
            value={selectedAnswer !== undefined && selectedAnswer !== null ? String(selectedAnswer) : ""} // Changed currentSelections to selectedAnswer
            onChange={(e) => onSelect(e.target.value)} // Removed 'as any' and passed string directly
          />
          <p className="text-[10px] text-muted-foreground italic">Note: Your answer will be validated against the correct response set by the admin.</p>
        </div>
      )}
    </div>
  );
}

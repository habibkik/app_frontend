import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/features/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Wrench, Puzzle, CheckCircle2, XCircle, MinusCircle, Lightbulb } from "lucide-react";

type Answer = "yes" | "no" | "na";

interface CheckItem {
  id: string;
  questionKey: string;
}

const DFM_ITEMS: CheckItem[] = [
  { id: "dfm-1", questionKey: "dfm1" },
  { id: "dfm-2", questionKey: "dfm2" },
  { id: "dfm-3", questionKey: "dfm3" },
  { id: "dfm-4", questionKey: "dfm4" },
  { id: "dfm-5", questionKey: "dfm5" },
  { id: "dfm-6", questionKey: "dfm6" },
  { id: "dfm-7", questionKey: "dfm7" },
  { id: "dfm-8", questionKey: "dfm8" },
];

const DFA_ITEMS: CheckItem[] = [
  { id: "dfa-1", questionKey: "dfa1" },
  { id: "dfa-2", questionKey: "dfa2" },
  { id: "dfa-3", questionKey: "dfa3" },
  { id: "dfa-4", questionKey: "dfa4" },
  { id: "dfa-5", questionKey: "dfa5" },
  { id: "dfa-6", questionKey: "dfa6" },
  { id: "dfa-7", questionKey: "dfa7" },
];

const STD_KEYS = ["std1", "std2", "std3", "std4", "std5"];

function AnswerButton({ current, value, onClick }: { current: Answer | undefined; value: Answer; onClick: () => void }) {
  const config: Record<Answer, { icon: React.ReactNode; color: string }> = {
    yes: { icon: <CheckCircle2 className="h-4 w-4" />, color: current === "yes" ? "bg-chart-3/10 text-chart-3 border-chart-3/40" : "text-muted-foreground border-border hover:border-chart-3/40" },
    no: { icon: <XCircle className="h-4 w-4" />, color: current === "no" ? "bg-destructive/10 text-destructive border-destructive/40" : "text-muted-foreground border-border hover:border-destructive/40" },
    na: { icon: <MinusCircle className="h-4 w-4" />, color: current === "na" ? "bg-muted text-muted-foreground border-border" : "text-muted-foreground border-border hover:bg-muted/50" },
  };
  const c = config[value];
  return (
    <button onClick={onClick} className={`p-1.5 rounded-md border transition-colors ${c.color}`}>
      {c.icon}
    </button>
  );
}

function calcScore(answers: Record<string, Answer>, items: CheckItem[]) {
  const answered = items.filter((i) => answers[i.id] && answers[i.id] !== "na");
  if (answered.length === 0) return 0;
  const yesCount = answered.filter((i) => answers[i.id] === "yes").length;
  return Math.round((yesCount / answered.length) * 100);
}

export default function DFMReview() {
  const { t } = useTranslation();
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  const setAnswer = (id: string, val: Answer) =>
    setAnswers((p) => ({ ...p, [id]: p[id] === val ? undefined as any : val }));

  const dfmScore = calcScore(answers, DFM_ITEMS);
  const dfaScore = calcScore(answers, DFA_ITEMS);

  const renderSection = (title: string, icon: React.ReactNode, items: CheckItem[], score: number) => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Progress value={score} className="w-20 h-2" />
            <Badge variant={score >= 75 ? "default" : score >= 50 ? "secondary" : "destructive"} className="text-xs">
              {score}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
            <div className="flex gap-1 mt-0.5">
              <AnswerButton current={answers[item.id]} value="yes" onClick={() => setAnswer(item.id, "yes")} />
              <AnswerButton current={answers[item.id]} value="no" onClick={() => setAnswer(item.id, "no")} />
              <AnswerButton current={answers[item.id]} value="na" onClick={() => setAnswer(item.id, "na")} />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm text-foreground">{t(`pages.dfmReview.${item.questionKey}`)}</p>
              <Textarea
                placeholder={t("pages.dfmReview.notes")}
                value={notes[item.id] || ""}
                onChange={(e) => setNotes((p) => ({ ...p, [item.id]: e.target.value }))}
                className="min-h-[32px] h-8 text-xs resize-none"
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Wrench className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("pages.dfmReview.title")}</h1>
            <p className="text-muted-foreground">{t("pages.dfmReview.subtitle")}</p>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {renderSection(t("pages.dfmReview.dfmTitle"), <Wrench className="h-4 w-4 text-primary" />, DFM_ITEMS, dfmScore)}
          {renderSection(t("pages.dfmReview.dfaTitle"), <Puzzle className="h-4 w-4 text-chart-2" />, DFA_ITEMS, dfaScore)}
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-chart-4" />
              {t("pages.dfmReview.standardization")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {STD_KEYS.map((key, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-md bg-chart-4/5 border border-chart-4/20">
                  <Lightbulb className="h-3.5 w-3.5 text-chart-4 flex-shrink-0" />
                  <span className="text-sm text-foreground">{t(`pages.dfmReview.${key}`)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
